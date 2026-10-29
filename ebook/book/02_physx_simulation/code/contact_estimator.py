"""마찰과 반발계수의 1차 추정 도구.

이 코드는 PhysX 솔버를 대체하지 않는다. 실험 설계와 파라미터 초기값 산정을 위한
단순 Coulomb/impact 모델이다.
"""

from __future__ import annotations

import argparse
import math


def friction_from_tilt_angle(angle_deg: float) -> float:
    """기울인 평면에서 미끄러지기 시작한 각도로 정마찰계수를 추정한다."""
    if not 0.0 < angle_deg < 90.0:
        raise ValueError("각도는 0도보다 크고 90도보다 작아야 합니다.")
    return math.tan(math.radians(angle_deg))


def restitution_from_drop(drop_height_m: float, rebound_height_m: float) -> float:
    """낙하/반동 높이로 반발계수를 추정한다: e=sqrt(h_rebound/h_drop)."""
    if drop_height_m <= 0 or not 0 <= rebound_height_m <= drop_height_m:
        raise ValueError("높이 입력 범위를 확인하세요.")
    return math.sqrt(rebound_height_m / drop_height_m)


def required_grip_force(mass_kg: float, mu: float, safety_factor: float = 2.0) -> float:
    """양쪽 손가락이 동일한 법선력을 내는 평행 그리퍼의 손가락당 최소 힘."""
    if mass_kg <= 0 or mu <= 0 or safety_factor < 1:
        raise ValueError("질량/마찰은 양수, 안전계수는 1 이상이어야 합니다.")
    return safety_factor * mass_kg * 9.80665 / (2.0 * mu)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tilt-deg", type=float, default=32.0)
    parser.add_argument("--drop-m", type=float, default=0.30)
    parser.add_argument("--rebound-m", type=float, default=0.003)
    parser.add_argument("--mass-kg", type=float, default=0.25)
    args = parser.parse_args()

    mu_s = friction_from_tilt_angle(args.tilt_deg)
    restitution = restitution_from_drop(args.drop_m, args.rebound_m)
    force = required_grip_force(args.mass_kg, mu_s)
    print(f"estimated static friction: {mu_s:.3f}")
    print(f"estimated restitution: {restitution:.3f}")
    print(f"minimum normal force per finger (SF=2): {force:.3f} N")


if __name__ == "__main__":
    main()

