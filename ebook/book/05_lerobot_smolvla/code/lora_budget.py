"""LoRA rank에 따른 trainable parameter 수의 단순 계산기."""

from __future__ import annotations

import argparse


def lora_parameters(in_features: int, out_features: int, rank: int) -> int:
    if min(in_features, out_features, rank) <= 0:
        raise ValueError("dimension과 rank는 양수여야 합니다.")
    return rank * (in_features + out_features)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--hidden", type=int, default=1024)
    parser.add_argument("--rank", type=int, default=16)
    parser.add_argument("--layers", type=int, default=16)
    parser.add_argument("--projections-per-layer", type=int, default=2)
    args = parser.parse_args()

    per_projection = lora_parameters(args.hidden, args.hidden, args.rank)
    total = per_projection * args.layers * args.projections_per_layer
    full = args.hidden * args.hidden * args.layers * args.projections_per_layer
    print(f"Simplified LoRA estimate: {total:,}")
    print(f"corresponding full matrices: {full:,}")
    print(f"ratio: {100.0 * total / full:.3f}%")
    print("scaling example (alpha=32):", 32 / args.rank)
    print("Use the framework's trainable-parameter report as the authoritative count.")


if __name__ == "__main__":
    main()

