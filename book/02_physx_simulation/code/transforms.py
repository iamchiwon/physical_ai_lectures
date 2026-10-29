"""좌표계 변환 예제: Euler, quaternion, homogeneous transform.

의존성: numpy
쿼터니언 순서: (x, y, z, w)
Euler convention: 고정된 world 축에 대한 Z-Y-X 합성, R = Rz(yaw) Ry(pitch) Rx(roll)
"""

from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np
from numpy.typing import NDArray

Array = NDArray[np.float64]


def _normalize_quaternion(q_xyzw: Array) -> Array:
    norm = float(np.linalg.norm(q_xyzw))
    if norm < 1e-12:
        raise ValueError("영(0) 쿼터니언은 회전을 나타낼 수 없습니다.")
    return q_xyzw / norm


def euler_zyx_to_matrix(roll: float, pitch: float, yaw: float) -> Array:
    """roll, pitch, yaw [rad]를 3x3 회전행렬로 변환한다."""
    cr, sr = math.cos(roll), math.sin(roll)
    cp, sp = math.cos(pitch), math.sin(pitch)
    cy, sy = math.cos(yaw), math.sin(yaw)

    rx = np.array([[1, 0, 0], [0, cr, -sr], [0, sr, cr]], dtype=float)
    ry = np.array([[cp, 0, sp], [0, 1, 0], [-sp, 0, cp]], dtype=float)
    rz = np.array([[cy, -sy, 0], [sy, cy, 0], [0, 0, 1]], dtype=float)
    return rz @ ry @ rx


def matrix_to_quaternion_xyzw(rotation: Array) -> Array:
    """정규 직교 3x3 회전행렬을 (x, y, z, w) 쿼터니언으로 변환한다."""
    if rotation.shape != (3, 3):
        raise ValueError("rotation은 3x3 행렬이어야 합니다.")
    if not np.allclose(rotation.T @ rotation, np.eye(3), atol=1e-8):
        raise ValueError("rotation이 정규 직교 행렬이 아닙니다.")
    if not math.isclose(float(np.linalg.det(rotation)), 1.0, abs_tol=1e-8):
        raise ValueError("rotation의 determinant는 +1이어야 합니다.")

    trace = float(np.trace(rotation))
    if trace > 0.0:
        s = math.sqrt(trace + 1.0) * 2.0
        w = 0.25 * s
        x = (rotation[2, 1] - rotation[1, 2]) / s
        y = (rotation[0, 2] - rotation[2, 0]) / s
        z = (rotation[1, 0] - rotation[0, 1]) / s
    else:
        i = int(np.argmax(np.diag(rotation)))
        if i == 0:
            s = math.sqrt(1.0 + rotation[0, 0] - rotation[1, 1] - rotation[2, 2]) * 2.0
            w = (rotation[2, 1] - rotation[1, 2]) / s
            x = 0.25 * s
            y = (rotation[0, 1] + rotation[1, 0]) / s
            z = (rotation[0, 2] + rotation[2, 0]) / s
        elif i == 1:
            s = math.sqrt(1.0 + rotation[1, 1] - rotation[0, 0] - rotation[2, 2]) * 2.0
            w = (rotation[0, 2] - rotation[2, 0]) / s
            x = (rotation[0, 1] + rotation[1, 0]) / s
            y = 0.25 * s
            z = (rotation[1, 2] + rotation[2, 1]) / s
        else:
            s = math.sqrt(1.0 + rotation[2, 2] - rotation[0, 0] - rotation[1, 1]) * 2.0
            w = (rotation[1, 0] - rotation[0, 1]) / s
            x = (rotation[0, 2] + rotation[2, 0]) / s
            y = (rotation[1, 2] + rotation[2, 1]) / s
            z = 0.25 * s
    return _normalize_quaternion(np.array([x, y, z, w], dtype=float))


def quaternion_xyzw_to_matrix(q_xyzw: Array) -> Array:
    """(x, y, z, w) 쿼터니언을 3x3 회전행렬로 변환한다."""
    x, y, z, w = _normalize_quaternion(np.asarray(q_xyzw, dtype=float))
    return np.array(
        [
            [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
            [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
            [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)],
        ],
        dtype=float,
    )


@dataclass(frozen=True)
class Transform:
    """parent 좌표계에서 표현한 child 좌표계의 pose."""

    rotation: Array
    translation: Array

    def matrix(self) -> Array:
        result = np.eye(4, dtype=float)
        result[:3, :3] = self.rotation
        result[:3, 3] = self.translation
        return result

    def inverse(self) -> "Transform":
        r_inv = self.rotation.T
        return Transform(r_inv, -(r_inv @ self.translation))

    def compose(self, child: "Transform") -> "Transform":
        composed = self.matrix() @ child.matrix()
        return Transform(composed[:3, :3], composed[:3, 3])

    def apply(self, points: Array) -> Array:
        points = np.asarray(points, dtype=float)
        return (self.rotation @ points.T).T + self.translation


def main() -> None:
    world_from_table = Transform(
        euler_zyx_to_matrix(0.0, 0.0, math.radians(30.0)),
        np.array([0.8, -0.2, 0.75]),
    )
    table_from_object = Transform(
        euler_zyx_to_matrix(0.0, math.radians(10.0), 0.0),
        np.array([0.25, 0.10, 0.04]),
    )
    world_from_object = world_from_table.compose(table_from_object)
    q = matrix_to_quaternion_xyzw(world_from_object.rotation)

    print("world_from_object =")
    print(np.array2string(world_from_object.matrix(), precision=4, suppress_small=True))
    print("quaternion xyzw =", np.round(q, 6))
    recovered = quaternion_xyzw_to_matrix(q)
    print("round-trip max error =", np.max(np.abs(recovered - world_from_object.rotation)))


if __name__ == "__main__":
    main()

