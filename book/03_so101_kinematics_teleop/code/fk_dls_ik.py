#!/usr/bin/env python3
"""교육용 5축 직렬 팔 FK와 위치 우선 DLS IK.

주의: 아래 DH 값은 알고리즘 학습용 근사 모델이며 SO-101의 제조/URDF
치수를 주장하지 않는다. 실물 제어에는 버전을 고정한 URDF에서 추출한
변환과 실제 캘리브레이션/관절 한계를 사용해야 한다.
"""

from __future__ import annotations

from dataclasses import dataclass
import math

import numpy as np
from numpy.typing import NDArray

FloatArray = NDArray[np.float64]


@dataclass(frozen=True)
class IKResult:
    q: FloatArray
    converged: bool
    iterations: int
    position_error_m: float


# (a [m], alpha [rad], d [m], theta_offset [rad])
# 교육용 5축 모델: 실제 장비에서는 URDF 기반 값으로 교체한다.
DH: tuple[tuple[float, float, float, float], ...] = (
    (0.000, math.pi / 2, 0.070, 0.0),
    (0.120, 0.0, 0.000, 0.0),
    (0.110, 0.0, 0.000, 0.0),
    (0.060, math.pi / 2, 0.000, 0.0),
    (0.000, 0.0, 0.055, 0.0),
)

Q_MIN = np.deg2rad(np.array([-100.0, -95.0, -110.0, -100.0, -170.0]))
Q_MAX = np.deg2rad(np.array([100.0, 95.0, 110.0, 100.0, 170.0]))


def dh_transform(a: float, alpha: float, d: float, theta: float) -> FloatArray:
    """표준 DH 변환 Rz(theta) Tz(d) Tx(a) Rx(alpha)."""
    ct, st = math.cos(theta), math.sin(theta)
    ca, sa = math.cos(alpha), math.sin(alpha)
    return np.array(
        [
            [ct, -st * ca, st * sa, a * ct],
            [st, ct * ca, -ct * sa, a * st],
            [0.0, sa, ca, d],
            [0.0, 0.0, 0.0, 1.0],
        ],
        dtype=np.float64,
    )


def forward_kinematics(q: FloatArray) -> tuple[FloatArray, list[FloatArray]]:
    """베이스에서 엔드이펙터까지의 변환과 각 관절 직전 변환을 반환한다."""
    if q.shape != (len(DH),):
        raise ValueError(f"q shape must be {(len(DH),)}, got {q.shape}")
    if not np.all(np.isfinite(q)):
        raise ValueError("q contains NaN or Inf")

    transform = np.eye(4, dtype=np.float64)
    frames_before_joint: list[FloatArray] = []
    for angle, (a, alpha, d, offset) in zip(q, DH, strict=True):
        frames_before_joint.append(transform.copy())
        transform = transform @ dh_transform(a, alpha, d, angle + offset)
    return transform, frames_before_joint


def position_jacobian(q: FloatArray) -> FloatArray:
    """회전 관절 5개의 3x5 위치 자코비안을 계산한다."""
    end_transform, frames = forward_kinematics(q)
    end_origin = end_transform[:3, 3]
    jacobian = np.zeros((3, len(DH)), dtype=np.float64)
    for index, frame in enumerate(frames):
        axis_z = frame[:3, 2]
        joint_origin = frame[:3, 3]
        jacobian[:, index] = np.cross(axis_z, end_origin - joint_origin)
    return jacobian


def solve_position_ik(
    target_m: FloatArray,
    q0: FloatArray,
    *,
    damping: float = 0.04,
    tolerance_m: float = 1e-3,
    max_iterations: int = 200,
    max_step_rad: float = 0.08,
) -> IKResult:
    """관절 제한과 스텝 제한을 적용한 위치 우선 DLS IK."""
    if target_m.shape != (3,) or not np.all(np.isfinite(target_m)):
        raise ValueError("target_m must be a finite 3-vector")
    if damping <= 0.0 or max_step_rad <= 0.0:
        raise ValueError("damping and max_step_rad must be positive")

    q = np.clip(np.asarray(q0, dtype=np.float64), Q_MIN, Q_MAX)
    previous_error = math.inf
    stalled_steps = 0

    for iteration in range(1, max_iterations + 1):
        transform, _ = forward_kinematics(q)
        error = target_m - transform[:3, 3]
        error_norm = float(np.linalg.norm(error))
        if error_norm <= tolerance_m:
            return IKResult(q, True, iteration - 1, error_norm)

        jacobian = position_jacobian(q)
        lhs = jacobian @ jacobian.T + (damping**2) * np.eye(3)
        delta_q = jacobian.T @ np.linalg.solve(lhs, error)
        delta_q = np.clip(delta_q, -max_step_rad, max_step_rad)
        q = np.clip(q + delta_q, Q_MIN, Q_MAX)

        if previous_error - error_norm < 1e-8:
            stalled_steps += 1
        else:
            stalled_steps = 0
        if stalled_steps >= 20:
            break
        previous_error = error_norm

    transform, _ = forward_kinematics(q)
    final_error = float(np.linalg.norm(target_m - transform[:3, 3]))
    return IKResult(q, False, iteration, final_error)


def main() -> None:
    target = np.array([0.220, 0.060, 0.180], dtype=np.float64)
    initial = np.deg2rad(np.array([0.0, -15.0, 35.0, -15.0, 0.0]))
    result = solve_position_ik(target, initial)

    print(f"target position [m] : {np.array2string(target, precision=4)}")
    print(f"converged           : {result.converged}")
    print(f"iterations          : {result.iterations}")
    print(f"position error [m]  : {result.position_error_m:.6f}")
    print(
        "solution [deg]      : "
        + np.array2string(np.rad2deg(result.q), precision=2)
    )


if __name__ == "__main__":
    main()

