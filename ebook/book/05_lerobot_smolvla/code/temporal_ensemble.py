"""겹치는 action chunk의 시간 앙상블(temporal ensembling) 예제."""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
from numpy.typing import NDArray

Array = NDArray[np.float64]


@dataclass
class TemporalEnsembler:
    action_dim: int
    decay: float = 0.25
    predictions: dict[int, list[tuple[int, Array]]] = field(default_factory=dict)

    def add_chunk(self, predicted_at: int, chunk: Array) -> None:
        values = np.asarray(chunk, dtype=np.float64)
        if values.ndim != 2 or values.shape[1] != self.action_dim:
            raise ValueError("chunk shape은 [horizon, action_dim]이어야 합니다.")
        for offset, action in enumerate(values):
            execution_step = predicted_at + offset
            self.predictions.setdefault(execution_step, []).append((predicted_at, action.copy()))

    def action_at(self, execution_step: int) -> Array:
        candidates = self.predictions.get(execution_step, [])
        if not candidates:
            raise KeyError(f"step {execution_step}에 실행할 action 예측이 없습니다.")

        # 최신 예측일수록 높은 가중치. age=0인 예측의 weight가 1이다.
        ages = np.array([execution_step - predicted_at for predicted_at, _ in candidates])
        weights = np.exp(-self.decay * ages)
        weights /= weights.sum()
        stacked = np.stack([action for _, action in candidates])
        return np.sum(stacked * weights[:, None], axis=0)

    def discard_before(self, execution_step: int) -> None:
        self.predictions = {
            step: values for step, values in self.predictions.items() if step >= execution_step
        }


def main() -> None:
    ensemble = TemporalEnsembler(action_dim=2, decay=0.4)
    ensemble.add_chunk(0, np.array([[0.0, 0.0], [0.4, 0.2], [0.8, 0.4], [1.2, 0.6]]))
    ensemble.add_chunk(1, np.array([[0.3, 0.1], [0.7, 0.3], [1.1, 0.5], [1.5, 0.7]]))
    ensemble.add_chunk(2, np.array([[0.6, 0.2], [1.0, 0.4], [1.4, 0.6], [1.8, 0.8]]))
    for step in range(4):
        print(f"step={step}: action={np.round(ensemble.action_at(step), 4)}")


if __name__ == "__main__":
    main()

