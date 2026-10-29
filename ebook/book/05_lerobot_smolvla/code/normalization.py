"""로봇 상태/행동 정규화의 범용 NumPy 구현.

학습 데이터로 fit한 통계만 저장하고 validation/test에는 transform만 적용한다.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from numpy.typing import NDArray

Array = NDArray[np.float64]


@dataclass(frozen=True)
class NormalizationStats:
    mean: Array
    std: Array
    minimum: Array
    maximum: Array

    @classmethod
    def fit(cls, values: Array) -> "NormalizationStats":
        x = np.asarray(values, dtype=np.float64)
        if x.ndim != 2 or x.shape[0] < 2:
            raise ValueError("values는 [samples, features]이며 sample이 2개 이상이어야 합니다.")
        return cls(
            mean=x.mean(axis=0),
            std=x.std(axis=0),
            minimum=x.min(axis=0),
            maximum=x.max(axis=0),
        )

    def zscore(self, values: Array, eps: float = 1e-6) -> Array:
        return (np.asarray(values) - self.mean) / np.maximum(self.std, eps)

    def inverse_zscore(self, values: Array, eps: float = 1e-6) -> Array:
        return np.asarray(values) * np.maximum(self.std, eps) + self.mean

    def minmax(self, values: Array, eps: float = 1e-6) -> Array:
        scale = np.maximum(self.maximum - self.minimum, eps)
        return 2.0 * (np.asarray(values) - self.minimum) / scale - 1.0

    def inverse_minmax(self, values: Array, eps: float = 1e-6) -> Array:
        scale = np.maximum(self.maximum - self.minimum, eps)
        return (np.asarray(values) + 1.0) * 0.5 * scale + self.minimum


def split_by_episode(
    episode_ids: Array, train_ratio: float = 0.8, seed: int = 7
) -> tuple[Array, Array]:
    """frame이 아니라 episode 단위로 재현 가능한 무작위 mask를 만든다.

    실제 프로젝트에서는 task variation, 작업자, 날짜를 group으로 묶은 stratified
    split이 이 단순 함수보다 우선한다.
    """
    ids = np.asarray(episode_ids)
    unique = np.unique(ids)
    unique = np.random.default_rng(seed).permutation(unique)
    cut = max(1, min(len(unique) - 1, round(len(unique) * train_ratio)))
    train_ids = set(unique[:cut].tolist())
    train_mask = np.array([item in train_ids for item in ids], dtype=bool)
    return train_mask, ~train_mask


def main() -> None:
    rng = np.random.default_rng(7)
    episode_ids = np.repeat(np.arange(10), 40)
    actions = rng.normal(
        loc=np.array([0.0, 0.4, -0.2]),
        scale=np.array([0.5, 0.1, 0.3]),
        size=(len(episode_ids), 3),
    )
    train_mask, validation_mask = split_by_episode(episode_ids)
    stats = NormalizationStats.fit(actions[train_mask])
    normalized = stats.zscore(actions[validation_mask])
    restored = stats.inverse_zscore(normalized)

    print("train episodes:", np.unique(episode_ids[train_mask]).tolist())
    print("validation episodes:", np.unique(episode_ids[validation_mask]).tolist())
    print("train mean:", np.round(stats.mean, 4))
    print("validation normalized mean:", np.round(normalized.mean(axis=0), 4))
    print("round-trip max error:", float(np.max(np.abs(restored - actions[validation_mask]))))


if __name__ == "__main__":
    main()

