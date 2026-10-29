"""환경 의존 예제: LeRobotDataset v3의 schema와 episode를 점검한다.

실행:
  python inspect_lerobot_v3.py --repo-id USER/DATASET --revision COMMIT_SHA
"""

from __future__ import annotations

import argparse

import numpy as np
from lerobot.datasets.lerobot_dataset import LeRobotDataset


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-id", required=True)
    parser.add_argument(
        "--revision",
        required=True,
        help="재현성을 위해 branch 이름이 아닌 dataset commit SHA를 권장합니다.",
    )
    parser.add_argument("--episode", type=int, default=0)
    args = parser.parse_args()

    dataset = LeRobotDataset(
        args.repo_id, episodes=[args.episode], revision=args.revision
    )
    print("repo_id:", args.repo_id)
    print("requested revision:", args.revision)
    print("fps:", dataset.fps)
    print("features:")
    for name, spec in dataset.features.items():
        print(f"  - {name}: {spec}")
    print("stats keys:", sorted(dataset.meta.stats.keys()))
    print("selected frames:", len(dataset))

    sample = dataset[0]
    for key, value in sample.items():
        shape = tuple(value.shape) if hasattr(value, "shape") else None
        finite = bool(np.isfinite(np.asarray(value)).all()) if shape and "image" not in key else "n/a"
        print(f"{key}: shape={shape}, finite={finite}")


if __name__ == "__main__":
    main()

