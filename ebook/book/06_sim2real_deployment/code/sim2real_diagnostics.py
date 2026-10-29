#!/usr/bin/env python3
"""Sim2Real episode CSV의 성공률과 latency를 요약한다.

CSV 열:
episode_id,condition,success,capture_ns,receive_ns,infer_start_ns,
infer_end_ns,send_ns,motion_ns
"""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
import math
from pathlib import Path
import random
from typing import Iterable


TRUE_LITERALS = {"1", "true", "yes"}
FALSE_LITERALS = {"0", "false", "no"}


@dataclass(frozen=True)
class Episode:
    episode_id: str
    condition: str
    success: bool
    capture_ns: int
    receive_ns: int
    infer_start_ns: int
    infer_end_ns: int
    send_ns: int
    motion_ns: int

    @property
    def infer_ms(self) -> float:
        return (self.infer_end_ns - self.infer_start_ns) / 1e6

    @property
    def e2e_ms(self) -> float:
        return (self.motion_ns - self.capture_ns) / 1e6

    def validate(self) -> None:
        times = [
            self.capture_ns,
            self.receive_ns,
            self.infer_start_ns,
            self.infer_end_ns,
            self.send_ns,
            self.motion_ns,
        ]
        if any(b < a for a, b in zip(times, times[1:])):
            raise ValueError(f"episode {self.episode_id}: timestamp inversion")


def wilson_interval(successes: int, trials: int, z: float = 1.95996398454) -> tuple[float, float]:
    if trials <= 0 or not 0 <= successes <= trials:
        raise ValueError("require 0 <= successes <= trials and trials > 0")
    p = successes / trials
    z2 = z * z
    denominator = 1.0 + z2 / trials
    center = (p + z2 / (2.0 * trials)) / denominator
    radius = z * math.sqrt(p * (1.0 - p) / trials + z2 / (4.0 * trials**2)) / denominator
    return max(0.0, center - radius), min(1.0, center + radius)


def percentile(values: Iterable[float], probability: float) -> float:
    ordered = sorted(values)
    if not ordered:
        raise ValueError("percentile requires at least one value")
    position = (len(ordered) - 1) * probability
    lower = math.floor(position)
    upper = math.ceil(position)
    if lower == upper:
        return ordered[lower]
    weight = position - lower
    return ordered[lower] * (1.0 - weight) + ordered[upper] * weight


def parse_success(value: str, *, row_number: int) -> bool:
    normalized = value.strip().lower()
    if normalized in TRUE_LITERALS:
        return True
    if normalized in FALSE_LITERALS:
        return False
    raise ValueError(
        f"row {row_number}: success must be one of "
        f"{sorted(TRUE_LITERALS | FALSE_LITERALS)}, got {value!r}"
    )


def load_csv(path: Path) -> list[Episode]:
    episodes: list[Episode] = []
    seen_ids: set[str] = set()
    with path.open(newline="", encoding="utf-8") as stream:
        for row_number, row in enumerate(csv.DictReader(stream), start=2):
            episode_id = row["episode_id"].strip()
            condition = row["condition"].strip()
            if not episode_id or episode_id in seen_ids:
                raise ValueError(f"row {row_number}: empty or duplicate episode_id {episode_id!r}")
            if not condition:
                raise ValueError(f"row {row_number}: condition must not be empty")
            seen_ids.add(episode_id)
            episode = Episode(
                episode_id=episode_id,
                condition=condition,
                success=parse_success(row["success"], row_number=row_number),
                capture_ns=int(row["capture_ns"]),
                receive_ns=int(row["receive_ns"]),
                infer_start_ns=int(row["infer_start_ns"]),
                infer_end_ns=int(row["infer_end_ns"]),
                send_ns=int(row["send_ns"]),
                motion_ns=int(row["motion_ns"]),
            )
            episode.validate()
            episodes.append(episode)
    if not episodes:
        raise ValueError("CSV contains no episodes")
    return episodes


def demo_episodes() -> list[Episode]:
    rng = random.Random(42)
    episodes: list[Episode] = []
    for index in range(20):
        capture = index * 2_000_000_000
        sense = int(rng.uniform(8, 17) * 1e6)
        infer = int(rng.uniform(18, 43) * 1e6)
        transport = int(rng.uniform(5, 14) * 1e6)
        motion = int(rng.uniform(18, 55) * 1e6)
        receive = capture + sense
        infer_start = receive + int(1e6)
        infer_end = infer_start + infer
        send = infer_end + transport
        episodes.append(
            Episode(
                str(index),
                "baseline" if index < 10 else "side_light",
                index not in {2, 7, 11, 14, 18},
                capture,
                receive,
                infer_start,
                infer_end,
                send,
                send + motion,
            )
        )
    return episodes


def summarize(episodes: list[Episode]) -> None:
    successes = sum(item.success for item in episodes)
    low, high = wilson_interval(successes, len(episodes))
    print(
        f"episodes={len(episodes)} success={successes} "
        f"rate={successes / len(episodes):.3f} wilson95=[{low:.3f}, {high:.3f}]"
    )
    for label, values in (
        ("infer_ms", [item.infer_ms for item in episodes]),
        ("e2e_ms", [item.e2e_ms for item in episodes]),
    ):
        tail = (
            f"p99={percentile(values, 0.99):.1f}"
            if len(values) >= 100
            else "p99=n/a(n<100)"
        )
        print(
            f"{label:<9} n={len(values)} p50={percentile(values, 0.50):.1f} "
            f"p95={percentile(values, 0.95):.1f} {tail} max={max(values):.1f}"
        )

    for condition in sorted({item.condition for item in episodes}):
        subset = [item for item in episodes if item.condition == condition]
        count = sum(item.success for item in subset)
        low, high = wilson_interval(count, len(subset))
        print(
            f"condition={condition:<12} n={len(subset):>2} success={count:>2} "
            f"rate={count / len(subset):.3f} ci95=[{low:.3f}, {high:.3f}]"
        )


def main() -> None:
    parser = argparse.ArgumentParser()
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--csv", type=Path)
    source.add_argument("--demo", action="store_true")
    args = parser.parse_args()
    summarize(demo_episodes() if args.demo else load_csv(args.csv))


if __name__ == "__main__":
    main()

