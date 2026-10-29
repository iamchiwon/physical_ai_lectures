"""핀홀 투영, 역투영, ROS body-to-optical 회전의 순수 NumPy 예제."""

from __future__ import annotations

import numpy as np
from numpy.typing import NDArray

FloatArray = NDArray[np.float64]


def project(point_camera: FloatArray, intrinsic: FloatArray) -> FloatArray:
    """카메라 점을 픽셀로 투영한다. depth는 optical Z다."""
    if point_camera.shape != (3,) or intrinsic.shape != (3, 3):
        raise ValueError("expected point (3,) and intrinsic (3,3)")
    if point_camera[2] <= 0.0:
        raise ValueError("point must be in front of the camera")
    homogeneous = intrinsic @ (point_camera / point_camera[2])
    return homogeneous[:2]


def unproject(pixel: FloatArray, depth_z: float, intrinsic: FloatArray) -> FloatArray:
    """픽셀과 optical-axis depth Z로 카메라 점을 복원한다."""
    if pixel.shape != (2,) or depth_z <= 0.0:
        raise ValueError("invalid pixel or depth")
    ray = np.linalg.solve(intrinsic, np.array([pixel[0], pixel[1], 1.0]))
    return depth_z * ray


def transform_point(T_target_source: FloatArray, point_source: FloatArray) -> FloatArray:
    """source 프레임 점을 target 프레임으로 변환한다."""
    if T_target_source.shape != (4, 4) or point_source.shape != (3,):
        raise ValueError("invalid transform or point shape")
    result = T_target_source @ np.append(point_source, 1.0)
    return result[:3] / result[3]


def main() -> None:
    K = np.array([[500.0, 0.0, 320.0], [0.0, 500.0, 240.0], [0.0, 0.0, 1.0]])
    point = np.array([0.2, 0.1, 1.0])
    pixel = project(point, K)
    reconstructed = unproject(pixel, depth_z=point[2], intrinsic=K)

    R_opt_body = np.array([[0.0, -1.0, 0.0], [0.0, 0.0, -1.0], [1.0, 0.0, 0.0]])
    orthogonality_error = np.linalg.norm(R_opt_body.T @ R_opt_body - np.eye(3))
    if orthogonality_error > 1e-12 or np.linalg.det(R_opt_body) < 0.0:
        raise RuntimeError("body-to-optical matrix is not a proper rotation")

    print(f"pixel: {pixel.round(3).tolist()}")
    print(f"reconstructed camera point: {reconstructed.round(3).tolist()}")
    print(f"round-trip error: {np.linalg.norm(point - reconstructed):.6f}")
    print(f"det(R_opt_body): {np.linalg.det(R_opt_body):.3f}")


if __name__ == "__main__":
    main()

