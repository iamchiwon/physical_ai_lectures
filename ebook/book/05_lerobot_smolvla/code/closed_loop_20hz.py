"""20 Hz 폐루프 추론 구조를 하드웨어 없이 보여 주는 예제.

실제 로봇에서는 monotonic deadline, 별도 watchdog, 하드웨어 E-stop을 추가해야 한다.
"""

from __future__ import annotations

import time
from dataclasses import dataclass

import numpy as np
from numpy.typing import NDArray

Array = NDArray[np.float64]


@dataclass(frozen=True)
class SafetyLimits:
    lower: Array
    upper: Array
    max_delta: Array

    def filter(self, previous: Array, proposed: Array) -> Array:
        previous, proposed = np.asarray(previous, dtype=float), np.asarray(proposed, dtype=float)
        lower, upper, max_delta = (np.asarray(x, dtype=float) for x in (self.lower, self.upper, self.max_delta))
        values = (previous, proposed, lower, upper, max_delta)
        if lower.ndim != 1 or lower.size == 0 or any(x.shape != lower.shape for x in values):
            raise ValueError("action and limit shapes must be the same nonempty vector")
        if not all(np.all(np.isfinite(x)) for x in values):
            raise ValueError("NaN/Inf action, previous command, or limit: reject before clipping")
        if np.any(lower > upper) or np.any(max_delta < 0):
            raise ValueError("invalid position or per-cycle delta limits")
        if np.any(previous < lower) or np.any(previous > upper):
            raise ValueError("previous command outside limits; separate recovery required")
        bounded = np.clip(proposed, lower, upper)
        delta = np.clip(bounded - previous, -max_delta, max_delta)
        return previous + delta


class MockRobot:
    def __init__(self, dof: int) -> None:
        self.state = np.zeros(dof, dtype=float)

    def observe(self) -> dict[str, Array]:
        return {"observation.state": self.state.copy()}

    def send(self, target: Array) -> None:
        self.state += 0.35 * (target - self.state)


def mock_policy(observation: dict[str, Array], horizon: int = 8) -> Array:
    current = observation["observation.state"]
    goal = np.array([0.5, -0.3, 0.2])
    return np.stack(
        [current + (goal - current) * ((i + 1) / horizon) for i in range(horizon)]
    )


def run(cycles: int = 20, period_s: float = 0.05) -> None:
    robot = MockRobot(dof=3)
    limits = SafetyLimits(
        lower=np.array([-1.0, -1.0, -1.0]),
        upper=np.array([1.0, 1.0, 1.0]),
        max_delta=np.array([0.08, 0.08, 0.08]),
    )
    previous_command = robot.state.copy()
    missed = 0

    for cycle in range(cycles):
        deadline = time.monotonic() + period_s
        observation = robot.observe()
        chunk = mock_policy(observation)
        proposed = chunk[0]  # receding horizon: 첫 action만 실행하고 다시 관찰
        command = limits.filter(previous_command, proposed)
        if not np.all(np.isfinite(command)):
            raise RuntimeError("NaN/Inf action 감지: 안전 정지 필요")
        robot.send(command)
        previous_command = command

        remaining = deadline - time.monotonic()
        if remaining > 0:
            time.sleep(remaining)
        else:
            missed += 1
        print(f"cycle={cycle:02d} state={np.round(robot.state, 3)} missed={missed}")


if __name__ == "__main__":
    run()

