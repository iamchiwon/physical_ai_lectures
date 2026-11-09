"""P2: discrete map delivery with explicit observation/TF/clock contracts."""
from __future__ import annotations

import argparse
from collections import Counter, deque
import copy
import hashlib
import json
import math
from pathlib import Path
import platform
import sys

VERSION = "P2-1"
CONFIG = {"ttl_ms": 100, "max_no_path": 3, "max_steps": 30, "step_ms": 100}
DIRECTIONS = ((1, 0), (0, 1), (-1, 0), (0, -1))
TERMINAL = {"SUCCEEDED", "BLOCKED", "INVALID", "TIMEOUT"}


def integer(value):
    return type(value) is int


def finite(value):
    return (not isinstance(value, bool) and isinstance(value, (int, float))
            and math.isfinite(value))


def pair(value):
    return isinstance(value, list) and len(value) == 2 and all(finite(v) for v in value)


def cell(value, grid):
    return (isinstance(value, (list, tuple)) and len(value) == 2
            and all(integer(v) for v in value)
            and 0 <= value[0] < grid["width"] and 0 <= value[1] < grid["height"])


def validate_setup(book, config):
    if not isinstance(config, dict) or set(config) != set(CONFIG):
        raise ValueError("configuration keys must match config.json")
    for name, lo, hi in (("ttl_ms", 0, 1000), ("max_no_path", 1, 100),
                          ("max_steps", 1, 1000), ("step_ms", 1, 1000)):
        if not integer(config[name]) or not lo <= config[name] <= hi:
            raise ValueError(f"invalid configuration: {name}")
    if (not isinstance(book, dict) or not integer(book.get("schema_version"))
            or book["schema_version"] != 1):
        raise ValueError("unsupported casebook schema")
    grid = book["map"]
    if (not isinstance(grid, dict) or grid.get("frame_id") != "map"
            or not all(integer(grid.get(k)) and 1 <= grid[k] <= 128 for k in ("width", "height"))
            or grid.get("cell_size_m") != 1 or isinstance(grid.get("cell_size_m"), bool)):
        raise ValueError("map must be a bounded one-metre grid in map frame")
    for key in ("revision", "world_revision"):
        if not isinstance(grid.get(key), str) or not grid[key]:
            raise ValueError("missing map/world revision")
    for key in ("clock_id", "transform_revision"):
        if not isinstance(book.get(key), str) or not book[key]:
            raise ValueError(f"invalid {key}")
    if not pair(book.get("translation_m")):
        raise ValueError("invalid transform translation")
    if not isinstance(grid.get("occupied"), list) or not all(cell(c, grid) for c in grid["occupied"]):
        raise ValueError("invalid static occupancy")
    static = {tuple(c) for c in grid["occupied"]}
    if not cell(book.get("start_cell"), grid) or tuple(book["start_cell"]) in static:
        raise ValueError("invalid start cell")
    if (not isinstance(book.get("waypoints"), list) or not 1 <= len(book["waypoints"]) <= 100
            or not all(cell(c, grid) and tuple(c) not in static for c in book["waypoints"])):
        raise ValueError("invalid waypoints")
    if not isinstance(book.get("scenarios"), dict) or not book["scenarios"]:
        raise ValueError("missing scenarios")
    for name, scenario in book["scenarios"].items():
        if not isinstance(name, str) or not isinstance(scenario, dict) or set(scenario) != {"events", "fault"}:
            raise ValueError("invalid scenario")
        if not isinstance(scenario["events"], list):
            raise ValueError("invalid events")
        ticks = []
        for event in scenario["events"]:
            if (not isinstance(event, dict) or set(event) != {"tick", "occupied"}
                    or not integer(event["tick"]) or not 0 <= event["tick"] < config["max_steps"]
                    or not isinstance(event["occupied"], list)
                    or not all(cell(c, grid) for c in event["occupied"])):
                raise ValueError("invalid occupancy event")
            ticks.append(event["tick"])
        if ticks != sorted(set(ticks)):
            raise ValueError("events must have unique increasing ticks")
        fault = scenario["fault"]
        if fault is not None and (not isinstance(fault, dict) or set(fault) != {"tick", "kind"}
                                  or not integer(fault["tick"]) or not 0 <= fault["tick"] < config["max_steps"]
                                  or fault["kind"] not in {"missing-tf", "stale", "wrong-map"}):
            raise ValueError("invalid fault")


def route(start, goal, occupied, grid):
    if start in occupied or goal in occupied:
        return None
    queue, previous = deque([start]), {start: None}
    while queue:
        here = queue.popleft()
        if here == goal:
            path = []
            while here is not None:
                path.append(list(here))
                here = previous[here]
            return path[::-1]
        for dx, dy in DIRECTIONS:
            nxt = (here[0] + dx, here[1] + dy)
            if cell(nxt, grid) and nxt not in occupied and nxt not in previous:
                previous[nxt] = here
                queue.append(nxt)
    return None


class Controller:
    def __init__(self, book, config=None):
        self.book, self.config = copy.deepcopy(book), dict(CONFIG if config is None else config)
        validate_setup(self.book, self.config)
        self.index, self.no_path, self.steps = 0, 0, 0
        self.last_id = self.last_stamp = self.last_now = -1
        self.terminal = False

    def step(self, observation):
        if self.terminal:
            raise ValueError("observation after terminal decision")
        self.steps += 1
        row = {"input_id": observation.get("id") if isinstance(observation, dict) else None,
               "state": "INVALID", "reason": "observation_format", "map_cell": None,
               "age_ms": None, "waypoint_index": self.index,
               "goal_cell": self.book["waypoints"][self.index],
               "reached_waypoints": self.index, "path": [], "delta_cell": [0, 0],
               "no_path_streak": self.no_path}
        grid = self.book["map"]
        try:
            if not isinstance(observation, dict):
                raise ValueError("observation_format")
            for key in ("id", "now_ms", "stamp_ms"):
                if not integer(observation.get(key)) or observation[key] < 0:
                    raise ValueError("timestamp_format" if key != "id" else "id_format")
            now, stamp = observation["now_ms"], observation["stamp_ms"]
            if observation.get("clock_id") != self.book["clock_id"]:
                raise ValueError("clock_mismatch")
            age = now - stamp
            row["age_ms"] = age
            if age < 0:
                raise ValueError("future_observation")
            if age > self.config["ttl_ms"]:
                raise ValueError("stale_observation")
            if (observation["id"] <= self.last_id or stamp <= self.last_stamp or now <= self.last_now):
                raise ValueError("nonmonotonic_observation")
            if observation.get("map_loaded") is not True:
                raise ValueError("map_unavailable")
            if (observation.get("map_revision") != grid["revision"]
                    or observation.get("world_revision") != grid["world_revision"]):
                raise ValueError("map_revision_mismatch")
            if observation.get("localization_valid") is not True:
                raise ValueError("localization_unavailable")
            pose, tf = observation.get("pose"), observation.get("transform")
            if not isinstance(pose, dict) or pose.get("frame_id") != "odom" or not pair(pose.get("xy_m")):
                raise ValueError("pose_frame_or_value")
            if not isinstance(tf, dict):
                raise ValueError("transform_unavailable")
            if (tf.get("source_frame") != "odom" or tf.get("target_frame") != "map"
                    or tf.get("revision") != self.book["transform_revision"]
                    or tf.get("clock_id") != self.book["clock_id"]):
                raise ValueError("transform_contract")
            if not integer(tf.get("stamp_ms")) or tf["stamp_ms"] != stamp:
                raise ValueError("transform_time")
            if (not pair(tf.get("translation_m")) or tf["translation_m"] != self.book["translation_m"]
                    or not finite(tf.get("yaw_rad")) or tf["yaw_rad"] != 0):
                raise ValueError("transform_calibration")
            xy = [pose["xy_m"][i] + tf["translation_m"][i] for i in range(2)]
            if not all(finite(v) and float(v).is_integer() for v in xy):
                raise ValueError("pose_not_grid_aligned")
            here = tuple(int(v) for v in xy)
            if not cell(here, grid):
                raise ValueError("pose_outside_map")
            dynamic = observation.get("dynamic_occupied")
            if not isinstance(dynamic, list) or not all(cell(c, grid) for c in dynamic):
                raise ValueError("occupancy_unavailable")
            occupied = {tuple(c) for c in grid["occupied"] + dynamic}
            if here in occupied:
                raise ValueError("pose_in_occupied_cell")
            self.last_id, self.last_stamp, self.last_now = observation["id"], stamp, now
            row["map_cell"] = list(here)
            goal = tuple(self.book["waypoints"][self.index])
            if here == goal:
                self.index += 1
                self.no_path = 0
                row.update(state="SUCCEEDED" if self.index == len(self.book["waypoints"]) else "GOAL_REACHED",
                           reason="observed_waypoint", reached_waypoints=self.index, no_path_streak=0)
            elif self.steps >= self.config["max_steps"]:
                row.update(state="TIMEOUT", reason="step_budget")
            else:
                path = route(here, goal, occupied, grid)
                if path is None:
                    self.no_path += 1
                    row.update(state="BLOCKED" if self.no_path >= self.config["max_no_path"] else "WAITING",
                               reason="no_path_limit" if self.no_path >= self.config["max_no_path"] else "no_path",
                               no_path_streak=self.no_path)
                else:
                    self.no_path = 0
                    row.update(state="MOVING", reason="next_free_cell", path=path, no_path_streak=0,
                               delta_cell=[path[1][0] - here[0], path[1][1] - here[1]])
        except ValueError as error:
            row["reason"] = str(error)
        if self.steps >= self.config["max_steps"] and row["state"] not in TERMINAL:
            row.update(state="TIMEOUT", reason="step_budget", delta_cell=[0, 0], path=[])
        self.terminal = row["state"] in TERMINAL
        return row


def make_observation(book, tick, position, dynamic, config):
    stamp = 1000 + tick * config["step_ms"]
    return {"id": tick, "clock_id": book["clock_id"], "now_ms": stamp, "stamp_ms": stamp,
            "map_loaded": True, "localization_valid": True,
            "map_revision": book["map"]["revision"], "world_revision": book["map"]["world_revision"],
            "pose": {"frame_id": "odom", "xy_m": [position[i] - book["translation_m"][i] for i in range(2)]},
            "transform": {"revision": book["transform_revision"], "source_frame": "odom", "target_frame": "map",
                          "clock_id": book["clock_id"], "stamp_ms": stamp,
                          "translation_m": list(book["translation_m"]), "yaw_rad": 0},
            "dynamic_occupied": copy.deepcopy(dynamic)}


def simulate(book, config, scenario):
    controller = Controller(book, config)
    if scenario not in book["scenarios"]:
        raise ValueError("unknown scenario")
    spec = book["scenarios"][scenario]
    events = {e["tick"]: e["occupied"] for e in spec["events"]}
    position, dynamic, observations, decisions = list(book["start_cell"]), [], [], []
    for tick in range(config["max_steps"]):
        dynamic = copy.deepcopy(events.get(tick, dynamic))
        observation = make_observation(book, tick, position, dynamic, config)
        fault = spec["fault"]
        if fault is not None and tick == fault["tick"]:
            if fault["kind"] == "missing-tf":
                observation["transform"] = None
            elif fault["kind"] == "stale":
                observation["stamp_ms"] = observation["now_ms"] - config["ttl_ms"] - 1
                observation["transform"]["stamp_ms"] = observation["stamp_ms"]
            elif fault["kind"] == "wrong-map":
                observation["map_revision"] = "map-demo-0"
        observations.append(copy.deepcopy(observation))
        row = controller.step(observation)
        decisions.append(row)
        dx, dy = row["delta_cell"]
        if dx or dy:
            nxt = [position[0] + dx, position[1] + dy]
            if (abs(dx) + abs(dy) != 1 or not cell(nxt, book["map"])
                    or nxt in book["map"]["occupied"] + dynamic):
                raise ValueError("model transition would enter invalid cell")
            position = nxt
        if controller.terminal:
            break
    if not controller.terminal:
        raise ValueError("simulation exhausted without terminal decision")
    return observations, decisions


def replay(book, config, payload):
    if not isinstance(payload, dict) or not isinstance(payload.get("observations"), list) or not payload["observations"]:
        raise ValueError("replay requires non-empty observations")
    if len(payload["observations"]) > config["max_steps"]:
        raise ValueError("replay exceeds step budget")
    controller, rows = Controller(book, config), []
    for observation in payload["observations"]:
        rows.append(controller.step(observation))
    if not controller.terminal:
        raise ValueError("incomplete replay: terminal observation required")
    return copy.deepcopy(payload["observations"]), rows


def read_json(path):
    def reject(value):
        raise ValueError(f"non-JSON numeric value: {value}")
    return json.loads(Path(path).read_text(encoding="utf-8"), parse_constant=reject)


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=("simulate", "replay"), default="simulate")
    parser.add_argument("--scenario", default="nominal")
    parser.add_argument("--input", type=Path)
    parser.add_argument("--cases", type=Path, default=Path(__file__).with_name("cases.json"))
    parser.add_argument("--config", type=Path, default=Path(__file__).with_name("config.json"))
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    try:
        protected = [Path(__file__).resolve(), args.cases.resolve(), args.config.resolve()]
        if args.mode == "replay":
            if args.input is None:
                raise ValueError("replay requires --input with original observations")
            protected.append(args.input.resolve())
        elif args.input is not None:
            raise ValueError("simulate generates observations; do not pass --input")
        if args.output and args.output.resolve() in protected:
            raise ValueError("output must not overwrite source, configuration or input")
        book, config = read_json(args.cases), read_json(args.config)
        validate_setup(book, config)
        if args.mode == "simulate":
            observations, decisions = simulate(book, config, args.scenario)
            input_sha, scenario = None, args.scenario
        else:
            payload = read_json(args.input)
            if (payload.get("casebook_sha256") != digest(args.cases)
                    or payload.get("config_sha256") != digest(args.config)):
                raise ValueError("replay source report has different casebook/configuration")
            observations, decisions = replay(book, config, payload)
            input_sha, scenario = digest(args.input), payload.get("scenario")
        last = decisions[-1]
        report = {"version": VERSION, "mode": args.mode, "scenario": scenario,
                  "python": platform.python_version(), "platform": platform.system(),
                  "source_sha256": digest(__file__), "casebook_sha256": digest(args.cases),
                  "config_sha256": digest(args.config), "input_sha256": input_sha,
                  "units": "one-metre grid; abstract cell transitions, not physical velocity commands",
                  "limitation": "provided model pose and occupancy; no ROS/Nav2/SLAM, dynamics or physical safety validation",
                  "counts": dict(Counter(row["state"] for row in decisions)),
                  "terminal_state": last["state"], "success": last["state"] == "SUCCEEDED",
                  "reached_waypoints": last["reached_waypoints"],
                  "moves": sum(row["state"] == "MOVING" for row in decisions),
                  "observations": observations, "decisions": decisions}
        text = json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
        if args.output:
            with args.output.open("x", encoding="utf-8") as stream:
                stream.write(text)
        else:
            print(text, end="")
        return 0
    except (ValueError, OSError, KeyError, TypeError, AttributeError, OverflowError) as error:
        print(f"P2 error: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
