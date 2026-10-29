#!/usr/bin/env python3
"""실물 배포 단계 승격과 latched FAULT를 보여주는 교육용 감독기."""

from __future__ import annotations

from dataclasses import dataclass
from enum import IntEnum
import math
import time
from typing import Sequence


class Mode(IntEnum):
    OFFLINE = 0
    DRY_RUN = 1
    LOW_SPEED = 2
    BOUNDED = 3
    NOMINAL = 4
    FAULT = 99


@dataclass(frozen=True)
class Decision:
    accepted: bool
    send_to_hardware: bool
    mode: Mode
    reason: str
    target_xyz: tuple[float, float, float] | None = None


class SafetySupervisor:
    def __init__(self, timeout_s: float = 0.25) -> None:
        self.mode = Mode.OFFLINE
        self.timeout_s = timeout_s
        self._last_observation_s: float | None = None
        self._human_approval = False
        self._pose_aligned = False

    @property
    def bounds(self) -> tuple[tuple[float, float, float], tuple[float, float, float]]:
        if self.mode <= Mode.LOW_SPEED:
            return (0.14, -0.12, 0.04), (0.28, 0.12, 0.24)
        return (0.10, -0.18, 0.02), (0.34, 0.18, 0.30)

    def record_observation(self, now_s: float | None = None) -> None:
        self._last_observation_s = time.monotonic() if now_s is None else now_s

    def authorize_reset(self, *, human_approval: bool, pose_aligned: bool) -> None:
        self._human_approval = human_approval
        self._pose_aligned = pose_aligned

    def reset_fault(self) -> bool:
        if self.mode != Mode.FAULT:
            return False
        if not (self._human_approval and self._pose_aligned):
            return False
        self.mode = Mode.DRY_RUN
        self._human_approval = False
        self._pose_aligned = False
        return True

    def promote(self, target: Mode, *, approved: bool, checklist_passed: bool) -> bool:
        if self.mode == Mode.FAULT or target != self.mode + 1:
            return False
        if not (approved and checklist_passed):
            return False
        self.mode = target
        return True

    def trip(self, reason: str) -> Decision:
        self.mode = Mode.FAULT
        return Decision(False, False, self.mode, reason)

    def evaluate_target(
        self, xyz: Sequence[float], *, now_s: float | None = None
    ) -> Decision:
        now_s = time.monotonic() if now_s is None else now_s
        if self.mode in {Mode.OFFLINE, Mode.FAULT}:
            return Decision(False, False, self.mode, "mode does not accept live targets")
        if len(xyz) != 3 or not all(math.isfinite(value) for value in xyz):
            return self.trip("invalid target")
        if (
            self._last_observation_s is None
            or now_s - self._last_observation_s > self.timeout_s
        ):
            return self.trip("observation watchdog timeout")
        lower, upper = self.bounds
        if any(value < lo or value > hi for value, lo, hi in zip(xyz, lower, upper, strict=True)):
            return self.trip("workspace violation")
        target = tuple(float(value) for value in xyz)
        return Decision(
            True,
            self.mode >= Mode.LOW_SPEED,
            self.mode,
            "accepted",
            target,
        )


def main() -> None:
    supervisor = SafetySupervisor()
    supervisor.promote(Mode.DRY_RUN, approved=True, checklist_passed=True)
    now = time.monotonic()
    supervisor.record_observation(now)
    dry = supervisor.evaluate_target((0.20, 0.00, 0.12), now_s=now + 0.01)
    print(
        f"mode={dry.mode.name} accepted={dry.accepted} "
        f"send_to_hardware={dry.send_to_hardware}"
    )
    promoted = supervisor.promote(Mode.LOW_SPEED, approved=True, checklist_passed=True)
    print(f"promotion DRY_RUN -> LOW_SPEED: {'approved' if promoted else 'denied'}")
    fault = supervisor.evaluate_target((0.90, 0.0, -0.2), now_s=now + 0.02)
    print(f"{fault.reason}: latched {fault.mode.name}")
    print(
        "reset",
        "approved" if supervisor.reset_fault() else "denied: human approval and pose alignment required",
    )


if __name__ == "__main__":
    main()

