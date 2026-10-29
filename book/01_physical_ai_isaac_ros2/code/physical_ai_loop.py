"""교육용 1-DoF Physical AI 폐루프와 독립 안전 게이트."""

from __future__ import annotations

from dataclasses import dataclass
from time import monotonic


@dataclass(frozen=True)
class Observation:
    position: float
    measured_at: float


@dataclass(frozen=True)
class Command:
    target: float
    created_at: float


class ConstantPolicy:
    def __init__(self, target: float) -> None:
        self.target = target

    def infer(self, observation: Observation) -> Command:
        del observation
        return Command(target=self.target, created_at=monotonic())


class SafetyGate:
    def __init__(self, lower: float, upper: float, ttl_s: float) -> None:
        if lower >= upper or ttl_s <= 0:
            raise ValueError("invalid safety configuration")
        self.lower = lower
        self.upper = upper
        self.ttl_s = ttl_s

    def filter(self, command: Command, now: float) -> Command:
        if now - command.created_at > self.ttl_s:
            raise TimeoutError("stale command rejected")
        target = min(self.upper, max(self.lower, command.target))
        return Command(target=target, created_at=command.created_at)


class FirstOrderJoint:
    def __init__(self, position: float = 0.0, response: float = 0.12) -> None:
        self.position = position
        self.response = response

    def observe(self) -> Observation:
        return Observation(self.position, monotonic())

    def step(self, command: Command) -> None:
        self.position += self.response * (command.target - self.position)


def main() -> None:
    joint = FirstOrderJoint()
    policy = ConstantPolicy(target=0.7)
    gate = SafetyGate(lower=-1.0, upper=1.0, ttl_s=0.050)

    for step in range(20):
        observation = joint.observe()
        proposed = policy.infer(observation)
        now = monotonic()
        safe = gate.filter(proposed, now)
        joint.step(safe)
        if step % 5 == 0:
            age_ms = 1_000.0 * (now - proposed.created_at)
            print(
                f"step={step:02d} q={observation.position:+.3f} "
                f"proposed={proposed.target:+.3f} safe={safe.target:+.3f} "
                f"age_ms={age_ms:.1f}"
            )

    stale = Command(target=0.2, created_at=monotonic() - 1.0)
    try:
        gate.filter(stale, monotonic())
    except TimeoutError as error:
        print(f"watchdog: {error}")


if __name__ == "__main__":
    main()

