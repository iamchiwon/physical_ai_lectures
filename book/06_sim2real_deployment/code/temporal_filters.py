#!/usr/bin/env python3
"""EMA와 겹치는 action chunk의 시간 앙상블 예제."""

from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Sequence


Vector = tuple[float, ...]


@dataclass
class EMA:
    alpha: float
    value: Vector | None = None

    def update(self, sample: Sequence[float]) -> Vector:
        if not 0.0 < self.alpha <= 1.0:
            raise ValueError("alpha must be in (0, 1]")
        sample_tuple = tuple(float(value) for value in sample)
        if self.value is None:
            self.value = sample_tuple
        elif len(sample_tuple) != len(self.value):
            raise ValueError("dimension changed")
        else:
            self.value = tuple(
                self.alpha * new + (1.0 - self.alpha) * old
                for new, old in zip(sample_tuple, self.value, strict=True)
            )
        return self.value


class TemporalEnsembler:
    """각 추론 시점의 미래 action chunk를 보관하고 현재 action을 합성한다."""

    def __init__(self, decay: float = 0.25, max_history: int = 16) -> None:
        if decay < 0.0 or max_history <= 0:
            raise ValueError("invalid ensemble configuration")
        self.decay = decay
        self.max_history = max_history
        self._chunks: list[tuple[int, list[Vector]]] = []

    def add_chunk(self, start_step: int, actions: Sequence[Sequence[float]]) -> None:
        chunk = [tuple(float(value) for value in action) for action in actions]
        if not chunk or len({len(action) for action in chunk}) != 1:
            raise ValueError("chunk must be non-empty with a fixed action dimension")
        self._chunks.append((start_step, chunk))
        self._chunks = self._chunks[-self.max_history :]

    def action_at(self, step: int) -> Vector:
        proposals: list[tuple[int, Vector]] = []
        for start, chunk in self._chunks:
            offset = step - start
            if 0 <= offset < len(chunk):
                proposals.append((start, chunk[offset]))
        if not proposals:
            raise LookupError(f"no action proposal for step {step}")

        # 최신 추론에 더 큰 가중치를 준다.
        newest_start = max(start for start, _ in proposals)
        weighted = [
            (math.exp(-self.decay * (newest_start - start)), action)
            for start, action in proposals
        ]
        denominator = sum(weight for weight, _ in weighted)
        dimension = len(weighted[0][1])
        return tuple(
            sum(weight * action[index] for weight, action in weighted) / denominator
            for index in range(dimension)
        )


def main() -> None:
    ema = EMA(alpha=0.3)
    for sample in ([0.0, 0.0], [1.0, -1.0], [1.1, -0.9]):
        print("ema", tuple(round(value, 3) for value in ema.update(sample)))

    ensemble = TemporalEnsembler(decay=0.4)
    ensemble.add_chunk(0, [[0.0], [0.2], [0.4], [0.6]])
    ensemble.add_chunk(1, [[0.1], [0.35], [0.55], [0.7]])
    ensemble.add_chunk(2, [[0.3], [0.5], [0.65], [0.8]])
    print("ensemble step=2", tuple(round(value, 3) for value in ensemble.action_at(2)))


if __name__ == "__main__":
    main()

