"""P1: deterministic RGB marker observation and virtual command experiment."""
from __future__ import annotations

import argparse
from collections import Counter
import hashlib
import json
import math
from pathlib import Path
import platform
import sys

VERSION = "P1-1"
CONFIG = {"ttl_ms": 100, "reacquire": 2, "gain": 0.6,
          "max_command": 0.25, "deadband": 0.1}


def integer(value):
    return type(value) is int


def image_at(xs, width=7, height=3):
    pixels = [[[0, 0, 0] for _ in range(width)] for _ in range(height)]
    for x in xs:
        if 0 <= x < width:
            pixels[min(1, height-1)][x] = [255, 0, 0]
    return {"width": width, "height": height, "pixels": pixels}


def detect(image):
    if not isinstance(image, dict):
        raise ValueError("image must be an object")
    width, height, pixels = (image.get(k) for k in ("width", "height", "pixels"))
    if not integer(width) or not integer(height) or width < 3 or height < 1:
        raise ValueError("invalid image dimensions")
    if not isinstance(pixels, list) or len(pixels) != height:
        raise ValueError("image must have H rows")
    mask = set()
    for y, row in enumerate(pixels):
        if not isinstance(row, list) or len(row) != width:
            raise ValueError("row width violates HWC layout")
        for x, pixel in enumerate(row):
            if (not isinstance(pixel, list) or len(pixel) != 3
                    or any(not integer(v) or not 0 <= v <= 255 for v in pixel)):
                raise ValueError("pixels must be RGB8 integer triples")
            red, green, blue = pixel
            if red >= 200 and green <= 80 and blue <= 80:
                mask.add((x, y))
    if not mask:
        return "LOST", None
    groups = []
    while mask:
        stack = [mask.pop()]
        group = []
        while stack:
            x, y = stack.pop()
            group.append((x, y))
            for p in ((x-1, y), (x+1, y), (x, y-1), (x, y+1)):
                if p in mask:
                    mask.remove(p)
                    stack.append(p)
        groups.append(group)
    if len(groups) != 1:
        return "AMBIGUOUS", None
    group = groups[0]
    return "FOUND", [sum(p[0] for p in group)/len(group),
                     sum(p[1] for p in group)/len(group)]


class Controller:
    def __init__(self, config=None):
        self.config = dict(CONFIG if config is None else config)
        if set(self.config) != set(CONFIG):
            raise ValueError("configuration keys must match config.json")
        for name, low, high in (("ttl_ms", 0, 1000), ("reacquire", 1, 10)):
            value = self.config[name]
            if not integer(value) or not low <= value <= high:
                raise ValueError(f"invalid configuration: {name}")
        for name, low, high in (("gain", 0, 1), ("max_command", 0, 1),
                                ("deadband", 0, 1)):
            value = self.config[name]
            if (isinstance(value, bool) or not isinstance(value, (float, int))
                    or not math.isfinite(value) or not low <= value <= high
                    or (name == "max_command" and value == 0)):
                raise ValueError(f"invalid configuration: {name}")
        self.streak = 0
        self.last_id = -1
        self.last_time = -1

    def step(self, frame):
        out = {"frame_id": None, "t_ms": None, "age_ms": None,
               "state": "INVALID", "reason": "", "centroid": None,
               "normalized_error": None, "command_px_per_step": 0.0}
        try:
            if not isinstance(frame, dict):
                raise ValueError("frame must be an object")
            fid, now, captured = (frame.get(k) for k in ("frame_id", "t_ms", "captured_ms"))
            # Only valid scalar IDs enter the report; malformed values stay null.
            if integer(fid):
                out["frame_id"] = fid
            if integer(now):
                out["t_ms"] = now
            if any(not integer(v) or v < 0 for v in (fid, now, captured)):
                raise ValueError("frame_id and times must be nonnegative integers")
            out["age_ms"] = now-captured
            if fid <= self.last_id or now <= self.last_time:
                raise ValueError("duplicate or reversed frame/time")
            self.last_id, self.last_time = fid, now
            if captured > now:
                raise ValueError("observation is from the future")
            state, centroid = detect(frame.get("image"))
            if out["age_ms"] > self.config["ttl_ms"]:
                out.update(state="STALE", reason="observation expired")
                self.streak = 0
                return out
            if state != "FOUND":
                out.update(state=state, reason="no marker" if state == "LOST" else "multiple components")
                self.streak = 0
                return out
            center = (frame["image"]["width"]-1)/2
            error = (centroid[0]-center)/center
            out.update(centroid=centroid, normalized_error=error)
            self.streak += 1
            if self.streak < self.config["reacquire"]:
                out.update(state="ACQUIRING", reason="waiting for consecutive valid observations")
                return out
            command = 0.0 if abs(error) <= self.config["deadband"] else self.config["gain"]*error
            limit = self.config["max_command"]
            out.update(state="TRACKING", reason="valid marker",
                       command_px_per_step=max(-limit, min(limit, command)))
            return out
        except ValueError as error:
            self.streak = 0
            out["reason"] = str(error)
            return out


def replay(frames, config=None):
    if not isinstance(frames, list) or not frames:
        raise ValueError("frames must be a nonempty list")
    controller = Controller(config)
    return [controller.step(frame) for frame in frames]


def closed_loop(steps=20, config=None):
    if not integer(steps) or not 1 <= steps <= 1000:
        raise ValueError("steps must be between 1 and 1000")
    controller, offset, rows = Controller(config), 0.0, []
    for index in range(steps):
        x = round(5-offset)
        frame = {"frame_id": index, "t_ms": index*50,
                 "captured_ms": index*50, "image": image_at([x])}
        row = controller.step(frame)
        row["offset_before_px"] = offset
        offset += row["command_px_per_step"]
        row["offset_after_px"] = offset
        rows.append(row)
    return rows


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def read_json(path):
    def reject(value):
        raise ValueError(f"non-JSON numeric value: {value}")
    return json.loads(Path(path).read_text(encoding="utf-8"), parse_constant=reject)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mode", choices=("replay", "closed-loop"), default="replay")
    parser.add_argument("--input", type=Path)
    parser.add_argument("--config", type=Path, default=Path(__file__).with_name("config.json"))
    parser.add_argument("--output", type=Path)
    parser.add_argument("--steps", type=int, default=20)
    args = parser.parse_args()
    try:
        source = args.input or Path(__file__).with_name("frames.json")
        protected = [Path(__file__).resolve(), args.config.resolve()]
        if args.mode == "replay":
            protected.append(source.resolve())
        elif args.input is not None:
            raise ValueError("closed-loop generates observations; do not pass --input")
        if args.output and args.output.resolve() in protected:
            raise ValueError("output must not overwrite input, configuration or source")
        config = read_json(args.config)
        rows = (replay(read_json(source)["frames"], config) if args.mode == "replay"
                else closed_loop(args.steps, config))
        report = {"version": VERSION, "mode": args.mode, "python": platform.python_version(),
                  "platform": platform.system(), "source_sha256": digest(__file__),
                  "config_sha256": digest(args.config),
                  "input_sha256": digest(source) if args.mode == "replay" else None,
                  "config": config, "units": "virtual pixels per step",
                  "limitation": "synthetic input/toy feedback; no ROS, camera, motor or physical safety validation",
                  "counts": dict(Counter(row["state"] for row in rows)), "rows": rows}
        text = json.dumps(report, ensure_ascii=False, indent=2, allow_nan=False)+"\n"
        if args.output:
            # Exclusive creation also preserves earlier reports on repeated runs.
            with args.output.open("x", encoding="utf-8") as stream:
                stream.write(text)
        else:
            print(text, end="")
        return 0
    except (ValueError, OSError, KeyError, TypeError) as error:
        print(f"P1 error: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
