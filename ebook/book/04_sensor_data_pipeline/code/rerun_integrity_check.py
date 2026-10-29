"""Rerun으로 생성 시계열의 drop과 joint spike를 기록하는 교육 예제."""

from __future__ import annotations

import math

import numpy as np
import rerun as rr


def main() -> None:
    rr.init("physical_ai_episode_quality", spawn=True)
    previous_time = 0.0
    previous_q = 0.0
    for frame in range(320):
        # frame 184부터 한 프레임 간격을 더해 누락을 모사한다.
        time_s = frame / 30.0 + (1.0 / 30.0 if frame >= 184 else 0.0)
        if frame == 291:
            time_s = previous_time - 0.012  # timestamp 역전 모사
        elif frame > 291:
            time_s = previous_time + 1.0 / 30.0
        q = 0.5 * math.sin(time_s)
        if frame == 250:
            q += 0.8  # joint spike 모사

        delta_ms = 1_000.0 * (time_s - previous_time) if frame else 0.0
        velocity = (q - previous_q) / (time_s - previous_time) if frame else 0.0
        dropped = frame > 0 and delta_ms > 50.0
        reversed_time = frame > 0 and delta_ms <= 0.0
        velocity_exceeded = abs(velocity) > 8.0

        rr.set_time("episode_time", duration=time_s)
        rr.log("robot/joints/joint_3/position", rr.Scalars(q))
        rr.log("quality/image_interval_ms", rr.Scalars(delta_ms))
        rr.log("quality/joint_velocity", rr.Scalars(velocity))
        rr.log("quality/probable_frame_drop", rr.Scalars(float(dropped)))
        rr.log("quality/timestamp_reversal", rr.Scalars(float(reversed_time)))
        rr.log("quality/joint_velocity_exceeded", rr.Scalars(float(velocity_exceeded)))

        if dropped:
            print(f"frame {frame}: image interval {delta_ms:.0f} ms -> one probable drop")
        if reversed_time:
            print(f"frame {frame}: joint timestamp decreased by {-delta_ms:.0f} ms")
        if frame == 250 and velocity_exceeded:
            print(f"frame {frame}: joint_3 velocity threshold exceeded")

        # 작은 synthetic image: API 사용 예를 위한 것이며 실제 카메라가 아니다.
        image = np.full((48, 64, 3), frame % 255, dtype=np.uint8)
        rr.log("world/camera/image", rr.Image(image))
        previous_time, previous_q = time_s, q


if __name__ == "__main__":
    main()

