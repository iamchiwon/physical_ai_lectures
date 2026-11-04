#!/usr/bin/env python3
"""하드웨어와 분리된 Leader-Follower 안전 필터 예제.

실제 모터 송신 코드는 포함하지 않는다. 위치 값은 팔 관절은 radian,
그리퍼는 교육용 정규화 값 0..100으로 가정한다.
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum, auto
import math
import time
from typing import Mapping


JOINTS = (
    "shoulder_pan",
    "shoulder_lift",
    "elbow_flex",
    "wrist_flex",
    "wrist_roll",
    "gripper",
)


class ControlState(Enum):
    ALIGNING = auto()
    TRACKING = auto()
    HOLD = auto()
    FAULT = auto()


@dataclass(frozen=True)
class JointLimit:
    minimum: float
    maximum: float
    max_rate_per_s: float


@dataclass(frozen=True)
class FilterOutput:
    state: ControlState
    command: dict[str, float]
    reason: str = ""


# 교육용 보수적 범위. 실제 캘리브레이션 범위보다 안쪽으로 다시 설정한다.
LIMITS: dict[str, JointLimit] = {
    "shoulder_pan": JointLimit(-1.5, 1.5, 0.5),
    "shoulder_lift": JointLimit(-1.3, 1.3, 0.5),
    "elbow_flex": JointLimit(-1.6, 1.6, 0.6),
    "wrist_flex": JointLimit(-1.4, 1.4, 0.7),
    "wrist_roll": JointLimit(-2.6, 2.6, 1.0),
    "gripper": JointLimit(5.0, 95.0, 100.0),
}


class JointSafetyFilter:
    def __init__(self, timeout_s: float = 0.25) -> None:
        if not math.isfinite(timeout_s) or timeout_s <= 0:
            raise ValueError("timeout_s must be finite and positive")
        self.timeout_s = timeout_s
        self.state = ControlState.ALIGNING
        self._last_input_time: float | None = None
        self._last_clock_time: float | None = None
        self._last_command: dict[str, float] | None = None

    @staticmethod
    def _validate(frame: Mapping[str, float]) -> None:
        missing = set(JOINTS) - set(frame)
        extra = set(frame) - set(JOINTS)
        if missing or extra:
            raise ValueError(f"joint mismatch: missing={sorted(missing)}, extra={sorted(extra)}")
        if not all(math.isfinite(frame[name]) for name in JOINTS):
            raise ValueError("joint frame contains NaN or Inf")

    def _fault(self, reason: str) -> FilterOutput:
        self.state = ControlState.FAULT
        self._last_input_time = None
        self._last_command = None
        return FilterOutput(self.state, {}, reason)

    def _validate_clock(self, now: float) -> None:
        if not math.isfinite(now) or (
            self._last_clock_time is not None and now < self._last_clock_time
        ):
            raise ValueError("invalid or reversed monotonic clock")
        self._last_clock_time = now

    @classmethod
    def _validate_measured(cls, frame: Mapping[str, float]) -> None:
        cls._validate(frame)
        if any(not LIMITS[name].minimum <= frame[name] <= LIMITS[name].maximum for name in JOINTS):
            raise ValueError("measured follower outside soft limits; separate recovery required")

    def update(
        self,
        leader: Mapping[str, float],
        measured_follower: Mapping[str, float],
        *,
        deadman: bool,
        now: float | None = None,
        dt: float = 0.02,
    ) -> FilterOutput:
        now = time.monotonic() if now is None else now
        if not math.isfinite(dt) or not 0.0 < dt <= 0.2:
            return self._fault("invalid control period")

        try:
            self._validate_clock(now)
            self._validate(leader)
            self._validate_measured(measured_follower)
        except ValueError as exc:
            return self._fault(str(exc))

        self._last_input_time = now
        if not deadman:
            self.state = ControlState.HOLD
            self._last_command = dict(measured_follower)
            return FilterOutput(self.state, dict(measured_follower), "deadman released")

        base = self._last_command or dict(measured_follower)
        command: dict[str, float] = {}
        for name in JOINTS:
            limit = LIMITS[name]
            target = min(max(leader[name], limit.minimum), limit.maximum)
            max_delta = limit.max_rate_per_s * dt
            delta = min(max(target - base[name], -max_delta), max_delta)
            command[name] = base[name] + delta

        max_alignment_error = max(abs(command[n] - leader[n]) for n in JOINTS)
        self.state = (
            ControlState.TRACKING if max_alignment_error < 0.05 else ControlState.ALIGNING
        )
        self._last_command = command
        return FilterOutput(self.state, command)

    def check_watchdog(
        self, measured_follower: Mapping[str, float], *, now: float | None = None
    ) -> FilterOutput:
        now = time.monotonic() if now is None else now
        try:
            self._validate_clock(now)
            self._validate_measured(measured_follower)
        except ValueError as exc:
            return self._fault(str(exc))
        if self._last_input_time is None or now - self._last_input_time > self.timeout_s:
            self.state = ControlState.HOLD
            self._last_command = dict(measured_follower)
            return FilterOutput(self.state, dict(measured_follower), "leader stream stale")
        return FilterOutput(self.state, dict(self._last_command or measured_follower))


def _vector(frame: Mapping[str, float]) -> str:
    return "[" + ", ".join(f"{frame[name]:.2f}" for name in JOINTS) + "]"


def main() -> None:
    follower = dict.fromkeys(JOINTS, 0.0)
    follower["gripper"] = 5.0  # 측정 시작값도 교육용 soft limit 안이어야 한다.
    leader = {
        "shoulder_pan": 0.4,
        "shoulder_lift": -0.3,
        "elbow_flex": 0.5,
        "wrist_flex": -0.1,
        "wrist_roll": 0.2,
        "gripper": 50.0,
    }
    safety = JointSafetyFilter(timeout_s=0.25)
    start = time.monotonic()

    for frame_index in range(4):
        output = safety.update(
            leader, follower, deadman=True, now=start + frame_index * 0.02, dt=0.02
        )
        follower = output.command
        print(
            f"frame={frame_index} status={output.state.name} "
            f"command={_vector(output.command)}"
        )

    timeout = safety.check_watchdog(follower, now=start + 1.0)
    print(f"watchdog status={timeout.state.name} reason={timeout.reason}")


if __name__ == "__main__":
    main()

