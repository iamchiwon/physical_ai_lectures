"""단순 형상의 관성 텐서와 평행축 정리를 계산한다."""

from __future__ import annotations

import numpy as np
from numpy.typing import NDArray

Array = NDArray[np.float64]


def box_inertia(mass: float, size_xyz: tuple[float, float, float]) -> Array:
    """중심을 지나는 주축 기준 직육면체 관성 텐서 [kg m^2]."""
    if mass <= 0 or any(length <= 0 for length in size_xyz):
        raise ValueError("질량과 길이는 양수여야 합니다.")
    x, y, z = size_xyz
    return np.diag(
        [
            mass * (y * y + z * z) / 12.0,
            mass * (x * x + z * z) / 12.0,
            mass * (x * x + y * y) / 12.0,
        ]
    )


def shift_inertia(inertia_at_com: Array, mass: float, offset: Array) -> Array:
    """평행축 정리로 COM에서 offset만큼 떨어진 점의 관성 텐서를 구한다."""
    d = np.asarray(offset, dtype=float).reshape(3)
    return inertia_at_com + mass * ((d @ d) * np.eye(3) - np.outer(d, d))


def kinetic_energy(mass: float, velocity: Array, inertia: Array, omega: Array) -> float:
    v = np.asarray(velocity, dtype=float).reshape(3)
    w = np.asarray(omega, dtype=float).reshape(3)
    return float(0.5 * mass * (v @ v) + 0.5 * w @ inertia @ w)


def main() -> None:
    mass = 0.35
    size = (0.08, 0.05, 0.12)
    inertia_com = box_inertia(mass, size)
    inertia_grasp = shift_inertia(inertia_com, mass, np.array([0.0, 0.0, 0.06]))
    energy = kinetic_energy(
        mass,
        velocity=np.array([0.2, 0.0, 0.0]),
        inertia=inertia_com,
        omega=np.array([0.0, 2.0, 0.0]),
    )

    print("COM inertia [kg m^2]:\n", np.array2string(inertia_com, precision=7))
    print("grasp-point inertia [kg m^2]:\n", np.array2string(inertia_grasp, precision=7))
    print(f"kinetic energy: {energy:.6f} J")


if __name__ == "__main__":
    main()

