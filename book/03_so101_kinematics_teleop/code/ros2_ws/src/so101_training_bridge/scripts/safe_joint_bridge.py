#!/usr/bin/env python3
"""교육용 JointState 안전 릴레이.

이 노드는 실물 모터 드라이버가 아니다. 실제 시스템에서는 출력 토픽을
검증된 ros2_control 또는 LeRobot 드라이버 어댑터에 연결해야 한다.
"""

from __future__ import annotations

import math
import time

import rclpy
from rclpy.node import Node
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy
from sensor_msgs.msg import JointState


JOINTS = [
    "shoulder_pan",
    "shoulder_lift",
    "elbow_flex",
    "wrist_flex",
    "wrist_roll",
    "gripper",
]

# 교육용 보수적 범위. 실제 캘리브레이션으로 교체한다.
LOWER = [-1.5, -1.3, -1.6, -1.4, -2.6, 5.0]
UPPER = [1.5, 1.3, 1.6, 1.4, 2.6, 95.0]
MAX_RATE = [0.5, 0.5, 0.6, 0.7, 1.0, 100.0]


class SafeJointBridge(Node):
    def __init__(self) -> None:
        super().__init__("safe_joint_bridge")
        self.declare_parameter("timeout_s", 0.25)
        self.declare_parameter("control_period_s", 0.02)
        self._timeout_s = float(self.get_parameter("timeout_s").value)
        self._period_s = float(self.get_parameter("control_period_s").value)

        qos = QoSProfile(
            history=HistoryPolicy.KEEP_LAST,
            depth=1,
            reliability=ReliabilityPolicy.BEST_EFFORT,
        )
        self._publisher = self.create_publisher(
            JointState, "/follower/joint_command", qos
        )
        self._subscription = self.create_subscription(
            JointState, "/leader/joint_states", self._on_state, qos
        )
        self._watchdog = self.create_timer(self._period_s, self._on_watchdog)
        self._last_rx_monotonic: float | None = None
        self._last_command: list[float] | None = None
        self._timeout_reported = False

    def _on_state(self, message: JointState) -> None:
        if len(message.name) != len(message.position):
            self.get_logger().error("name/position length mismatch; frame rejected")
            return
        by_name = dict(zip(message.name, message.position, strict=True))
        if set(by_name) != set(JOINTS):
            self.get_logger().error("joint set mismatch; frame rejected")
            return
        target = [float(by_name[name]) for name in JOINTS]
        if not all(math.isfinite(value) for value in target):
            self.get_logger().error("NaN/Inf in input; frame rejected")
            return

        if self._last_command is None:
            # 실제 장비에서는 Follower 실측값을 초기값으로 사용해야 한다.
            self._last_command = [0.0] * len(JOINTS)
            self.get_logger().warning(
                "using zero as educational initial pose; use measured follower pose on hardware"
            )

        limited: list[float] = []
        for value, previous, lower, upper, max_rate in zip(
            target, self._last_command, LOWER, UPPER, MAX_RATE, strict=True
        ):
            clamped = min(max(value, lower), upper)
            max_delta = max_rate * self._period_s
            delta = min(max(clamped - previous, -max_delta), max_delta)
            limited.append(previous + delta)

        output = JointState()
        output.header.stamp = self.get_clock().now().to_msg()
        output.header.frame_id = "follower_command"
        output.name = JOINTS
        output.position = limited
        self._publisher.publish(output)
        self._last_command = limited
        self._last_rx_monotonic = time.monotonic()
        self._timeout_reported = False

    def _on_watchdog(self) -> None:
        if self._last_rx_monotonic is None:
            return
        if time.monotonic() - self._last_rx_monotonic > self._timeout_s:
            # 새 명령 발행을 중단한다. 실제 드라이버에는 별도 HOLD/torque-off 계약이 필요하다.
            if not self._timeout_reported:
                self.get_logger().error(
                    "input timeout: command publishing stopped; request driver HOLD"
                )
                self._timeout_reported = True


def main() -> None:
    rclpy.init()
    node = SafeJointBridge()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()

