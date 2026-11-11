"""P3: replay-only multi-robot resource and manipulation-readiness supervisor."""
from __future__ import annotations

import argparse
from collections import Counter
import copy
import hashlib
import json
from pathlib import Path
import platform
import sys

VERSION = "P3-1"
KINDS = {"reserve", "enter", "exit", "nav_result", "base_stopped", "request_arm",
         "arm_result", "cancel_request", "cancel_ack", "stowed", "request_depart"}
ARM_KINDS = {"request_arm", "arm_result", "cancel_request", "cancel_ack", "stowed"}


def integer(value):
    return type(value) is int


def validate_config(config):
    required = {"schema_version", "lease_ms", "event_ttl_ms", "state_ttl_ms", "clock_id",
                "world_revision", "map_revision", "resource_id", "robots"}
    if (not isinstance(config, dict) or set(config) != required
            or not integer(config["schema_version"]) or config["schema_version"] != 1):
        raise ValueError("invalid configuration schema")
    for name in ("lease_ms", "event_ttl_ms", "state_ttl_ms"):
        if not integer(config[name]) or not 1 <= config[name] <= 10000:
            raise ValueError(f"invalid {name}")
    for name in ("clock_id", "world_revision", "map_revision", "resource_id"):
        if not isinstance(config[name], str) or not config[name]:
            raise ValueError(f"invalid {name}")
    robots = config["robots"]
    if not isinstance(robots, dict) or set(robots) != {"r1", "r2"}:
        raise ValueError("configuration requires distinct r1/r2 identities")
    fields = {"namespace", "base_frame", "job_id", "nav_goal_id", "arm_goal_id"}
    for robot in robots.values():
        if (not isinstance(robot, dict) or set(robot) != fields
                or not all(isinstance(v, str) and v for v in robot.values())):
            raise ValueError("invalid robot identity")
    for key in fields:
        if robots["r1"][key] == robots["r2"][key]:
            raise ValueError(f"robot identities overlap: {key}")
    goals = [r[k] for r in robots.values() for k in ("nav_goal_id", "arm_goal_id")]
    if len(set(goals)) != len(goals):
        raise ValueError("goal identities must be distinct")


class Supervisor:
    def __init__(self, config):
        validate_config(config)
        self.config = copy.deepcopy(config)
        self.resource = {"holder": None, "lease_until_ms": None, "occupant": None, "unknown": False}
        self.robots = {name: {"navigation_succeeded": False, "base_stopped": False,
                              "base_stamp_ms": None, "arm_requested": False, "arm_terminal": False,
                              "task_verified": False, "arm_stowed": True, "stow_stamp_ms": None,
                              "cancel_requested": False, "cancel_accepted": False,
                              "departure_allowed_at_ms": None}
                       for name in config["robots"]}
        self.last_seq = self.last_now = -1
        self.halted = False

    def fresh(self, stamp, now):
        return integer(stamp) and 0 <= now - stamp <= self.config["state_ttl_ms"]

    def departure_reason(self, robot, now):
        r = self.robots[robot]
        if self.resource["unknown"]:
            return "DENIED_RESOURCE_UNKNOWN"
        if r["cancel_requested"]:
            return "DENIED_CANCEL_PENDING"
        if not r["navigation_succeeded"]:
            return "DENIED_NAVIGATION"
        if not r["base_stopped"] or not self.fresh(r["base_stamp_ms"], now):
            return "DENIED_BASE_STATE"
        if not r["task_verified"]:
            return "DENIED_TASK_UNVERIFIED"
        if not r["arm_stowed"] or not self.fresh(r["stow_stamp_ms"], now):
            return "DENIED_NOT_STOWED"
        if self.resource["occupant"] == robot:
            return "DENIED_STILL_IN_RESOURCE"
        return "DEPART_ALLOWED"

    def snapshot(self):
        robots = copy.deepcopy(self.robots)
        for name, state in robots.items():
            state["ready_to_depart"] = (state["departure_allowed_at_ms"] is not None
                                          and self.departure_reason(name, self.last_now) == "DEPART_ALLOWED")
        return {"resource": copy.deepcopy(self.resource), "robots": robots}

    def step(self, event):
        if self.halted:
            raise ValueError("supervisor halted after invalid input")
        outcome, expired = "INVALID", False
        robot, kind = None, None
        try:
            if not isinstance(event, dict):
                raise ValueError("event_format")
            seq, now, stamp = (event.get(key) for key in ("seq", "now_ms", "stamp_ms"))
            if not all(integer(v) and v >= 0 for v in (seq, now, stamp)):
                raise ValueError("timestamp_or_sequence_format")
            if event.get("clock_id") != self.config["clock_id"]:
                raise ValueError("clock_mismatch")
            if now - stamp < 0:
                raise ValueError("future_event")
            if now - stamp > self.config["event_ttl_ms"]:
                raise ValueError("stale_event")
            if seq <= self.last_seq or now <= self.last_now:
                raise ValueError("nonmonotonic_event")
            for key in ("world_revision", "map_revision", "resource_id"):
                if event.get(key) != self.config[key]:
                    raise ValueError("scene_or_resource_mismatch")
            robot = event.get("robot_id")
            if robot not in self.robots:
                raise ValueError("unknown_robot")
            identity = self.config["robots"][robot]
            if any(event.get(key) != identity[key] for key in ("namespace", "base_frame", "job_id")):
                raise ValueError("identity_or_job_mismatch")
            kind, payload = event.get("kind"), event.get("payload")
            if kind not in KINDS or not isinstance(payload, dict):
                raise ValueError("event_kind_or_payload")
            if kind == "nav_result" and payload.get("goal_id") != identity["nav_goal_id"]:
                raise ValueError("navigation_goal_mismatch")
            if kind in ARM_KINDS and payload.get("goal_id") != identity["arm_goal_id"]:
                raise ValueError("arm_goal_mismatch")
            self.last_seq, self.last_now = seq, now
            resource, r = self.resource, self.robots[robot]
            if resource["holder"] is not None and now >= resource["lease_until_ms"]:
                resource["holder"], resource["lease_until_ms"], expired = None, None, True
            if kind == "reserve":
                if resource["unknown"]:
                    outcome = "WAIT_UNKNOWN"
                elif resource["occupant"] is not None:
                    outcome = "WAIT_OCCUPIED"
                elif resource["holder"] not in (None, robot):
                    outcome = "WAIT_RESERVED"
                else:
                    resource.update(holder=robot, lease_until_ms=now + self.config["lease_ms"])
                    outcome = "GRANTED"
            elif kind == "enter":
                if (resource["unknown"] or resource["holder"] != robot
                        or resource["occupant"] not in (None, robot)):
                    resource["unknown"] = True
                    if resource["occupant"] is None:
                        resource["occupant"] = robot
                    outcome = "UNEXPECTED_ENTRY_UNKNOWN"
                else:
                    resource["occupant"] = robot
                    outcome = "ENTER_CONFIRMED"
            elif kind == "exit":
                if resource["occupant"] != robot:
                    resource["unknown"] = True
                    outcome = "UNEXPECTED_EXIT_UNKNOWN"
                else:
                    resource["occupant"] = None
                    if resource["holder"] == robot:
                        resource.update(holder=None, lease_until_ms=None)
                    outcome = "EXIT_CONFIRMED"
            elif kind == "nav_result":
                if payload.get("status") not in {"SUCCEEDED", "ABORTED", "CANCELED"}:
                    raise ValueError("navigation_result_status")
                r["navigation_succeeded"] = payload["status"] == "SUCCEEDED"
                outcome = "NAVIGATION_RESULT_RECORDED"
            elif kind == "base_stopped":
                if type(payload.get("stationary")) is not bool:
                    raise ValueError("base_observation_format")
                r["base_stopped"], r["base_stamp_ms"] = payload["stationary"], stamp
                outcome = "BASE_STOP_CONFIRMED" if r["base_stopped"] else "BASE_NOT_STOPPED"
            elif kind == "request_arm":
                if resource["unknown"] or resource["occupant"] == robot:
                    outcome = "DENIED_RESOURCE_STATE"
                elif r["cancel_requested"]:
                    outcome = "DENIED_CANCEL_PENDING"
                elif not r["navigation_succeeded"]:
                    outcome = "DENIED_NAVIGATION"
                elif not r["base_stopped"] or not self.fresh(r["base_stamp_ms"], now):
                    outcome = "DENIED_BASE_STATE"
                elif r["arm_requested"]:
                    outcome = "DUPLICATE_ARM_REQUEST"
                else:
                    r.update(arm_requested=True, arm_stowed=False, stow_stamp_ms=None)
                    outcome = "ARM_ALLOWED"
            elif kind == "arm_result":
                if not r["arm_requested"] or payload.get("status") not in {"SUCCEEDED", "ABORTED", "CANCELED"}:
                    raise ValueError("unexpected_arm_result")
                if type(payload.get("object_verified")) is not bool:
                    raise ValueError("object_verification_format")
                r["arm_terminal"] = True
                r["task_verified"] = payload["status"] == "SUCCEEDED" and payload["object_verified"]
                outcome = "TASK_CONFIRMED" if r["task_verified"] else "TASK_UNVERIFIED"
            elif kind == "cancel_request":
                if not r["arm_requested"] or r["arm_terminal"]:
                    outcome = "DENIED_CANCEL_NOT_RUNNING"
                else:
                    r["cancel_requested"] = True
                    outcome = "CANCEL_REQUESTED"
            elif kind == "cancel_ack":
                if not r["cancel_requested"]:
                    raise ValueError("cancel_without_request")
                r["cancel_accepted"] = True
                outcome = "CANCEL_ACCEPTED_NOT_STOP_CONFIRMED"
            elif kind == "stowed":
                if not r["arm_requested"] or type(payload.get("verified")) is not bool:
                    raise ValueError("stow_observation_format")
                r["arm_stowed"], r["stow_stamp_ms"] = payload["verified"], stamp
                outcome = "STOW_CONFIRMED" if r["arm_stowed"] else "STOW_NOT_CONFIRMED"
            elif kind == "request_depart":
                outcome = self.departure_reason(robot, now)
                if outcome == "DEPART_ALLOWED":
                    r["departure_allowed_at_ms"] = now
            reason = outcome.lower()
        except (ValueError, TypeError) as error:
            self.resource["unknown"], self.halted = True, True
            outcome, reason = "INVALID", str(error)
        return {"seq": event.get("seq") if isinstance(event, dict) else None,
                "robot_id": robot, "kind": kind, "outcome": outcome, "reason": reason,
                "expired_lease": expired, **self.snapshot()}


def replay(config, events):
    if not isinstance(events, list) or not 1 <= len(events) <= 1000:
        raise ValueError("events must contain 1..1000 entries")
    supervisor, decisions = Supervisor(config), []
    for event in events:
        if supervisor.halted:
            break
        decisions.append(supervisor.step(event))
    snapshot = supervisor.snapshot()
    ready = [name for name, state in snapshot["robots"].items() if state["ready_to_depart"]]
    all_ready = (len(ready) == len(config["robots"]) and not snapshot["resource"]["unknown"]
                 and snapshot["resource"]["occupant"] is None and snapshot["resource"]["holder"] is None)
    return {"terminal_state": "INVALID_STOP" if supervisor.halted else "READINESS_CONFIRMED" if all_ready else "INCOMPLETE_READINESS",
            "all_ready_to_depart": all_ready, "ready_robots": ready,
            "processed_count": len(decisions), "unprocessed_count": len(events) - len(decisions),
            "counts": dict(Counter(row["outcome"] for row in decisions)),
            "decisions": decisions, "events": copy.deepcopy(events), **snapshot}


def read_json(path):
    def reject(value):
        raise ValueError(f"non-JSON numeric value: {value}")
    return json.loads(Path(path).read_text(encoding="utf-8"), parse_constant=reject)


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scenario", default="nominal")
    parser.add_argument("--config", type=Path, default=Path(__file__).with_name("config.json"))
    parser.add_argument("--input", type=Path, default=Path(__file__).with_name("cases.json"))
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    try:
        if args.output and args.output.resolve() in (Path(__file__).resolve(), args.config.resolve(), args.input.resolve()):
            raise ValueError("output must not overwrite source, configuration or input")
        config, book = read_json(args.config), read_json(args.input)
        validate_config(config)
        if (not isinstance(book, dict) or not integer(book.get("schema_version"))
                or book["schema_version"] != 1 or not isinstance(book.get("scenarios"), dict)):
            raise ValueError("invalid input schema")
        scenario = book["scenarios"].get(args.scenario)
        if not isinstance(scenario, dict) or set(scenario) != {"events"}:
            raise ValueError("unknown or invalid scenario")
        report = {"version": VERSION, "mode": "event-replay", "scenario": args.scenario,
                  "python": platform.python_version(), "platform": platform.system(),
                  "source_sha256": digest(__file__), "config_sha256": digest(args.config),
                  "input_sha256": digest(args.input),
                  "limitation": "synthetic event supervisor; departure authorization is not physical departure/task or safety validation",
                  **replay(config, scenario["events"])}
        text = json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
        if args.output:
            with args.output.open("x", encoding="utf-8") as stream:
                stream.write(text)
        else:
            print(text, end="")
        return 0
    except (ValueError, OSError, KeyError, TypeError, AttributeError, OverflowError) as error:
        print(f"P3 error: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
