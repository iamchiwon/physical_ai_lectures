#!/usr/bin/env python3
"""정책 Cartesian target을 검사하는 교육용 ROS 2 guard.

출력 `/safety/accepted_target`은 검증된 중간 표현일 뿐 모터 명령이 아니다.
실물 드라이버에는 관절 제한, 충돌 검사, 워치독과 독립 E-stop이 추가로 필요하다.
"""

from __future__ import annotations

import math
import time

from geometry_msgs.msg import PoseStamped
import rclpy
from rclpy.node import Node
from rclpy.qos import DurabilityPolicy, QoSProfile, ReliabilityPolicy, qos_profile_sensor_data
from std_msgs.msg import String


class WorkspaceGuard(Node):
    def __init__(self) -> None:
        super().__init__("workspace_guard")
        self.declare_parameter("min_xyz", [0.14, -0.12, 0.04])
        self.declare_parameter("max_xyz", [0.28, 0.12, 0.24])
        self.declare_parameter("max_step_m", 0.02)
        self.declare_parameter("timeout_s", 0.25)
        self.declare_parameter("base_frame", "base_link")
        self.declare_parameter("max_source_age_s", 0.25)
        self.declare_parameter("future_tolerance_s", 0.05)
        self.declare_parameter("quaternion_norm_tolerance", 0.02)
        self._lower = tuple(float(v) for v in self.get_parameter("min_xyz").value)
        self._upper = tuple(float(v) for v in self.get_parameter("max_xyz").value)
        self._max_step = float(self.get_parameter("max_step_m").value)
        self._timeout = float(self.get_parameter("timeout_s").value)
        self._base_frame = str(self.get_parameter("base_frame").value)
        self._max_source_age = float(self.get_parameter("max_source_age_s").value)
        self._future_tolerance = float(self.get_parameter("future_tolerance_s").value)
        self._quaternion_norm_tolerance = float(
            self.get_parameter("quaternion_norm_tolerance").value
        )
        self._current: tuple[float, float, float] | None = None
        self._last_current_s: float | None = None
        self._fault_latched = False

        command_qos = QoSProfile(depth=1, reliability=ReliabilityPolicy.RELIABLE)
        fault_qos = QoSProfile(
            depth=1,
            reliability=ReliabilityPolicy.RELIABLE,
            durability=DurabilityPolicy.TRANSIENT_LOCAL,
        )
        self._accepted = self.create_publisher(
            PoseStamped, "/safety/accepted_target", command_qos
        )
        self._state = self.create_publisher(String, "/safety/state", fault_qos)
        self.create_subscription(
            PoseStamped, "/robot/ee_pose", self._on_current, qos_profile_sensor_data
        )
        self.create_subscription(
            PoseStamped, "/policy/ee_target", self._on_target, command_qos
        )
        self.create_timer(0.05, self._watchdog)

    def _publish_state(self, text: str) -> None:
        message = String()
        message.data = text
        self._state.publish(message)

    def _trip(self, reason: str) -> None:
        if not self._fault_latched:
            self.get_logger().error(f"latched FAULT: {reason}")
        self._fault_latched = True
        self._publish_state("FAULT:" + reason)

    def _validate_frame_and_stamp(self, message: PoseStamped, label: str) -> bool:
        if message.header.frame_id != self._base_frame:
            self._trip(
                f"{label} frame mismatch: expected {self._base_frame}, "
                f"got {message.header.frame_id or '<empty>'}"
            )
            return False
        stamp_ns = (
            int(message.header.stamp.sec) * 1_000_000_000
            + int(message.header.stamp.nanosec)
        )
        if stamp_ns <= 0:
            self._trip(f"{label} timestamp missing")
            return False
        age_s = (self.get_clock().now().nanoseconds - stamp_ns) / 1e9
        if age_s > self._max_source_age:
            self._trip(f"{label} source timestamp stale")
            return False
        if age_s < -self._future_tolerance:
            self._trip(f"{label} source timestamp is in the future")
            return False
        return True

    def _validate_pose(self, message: PoseStamped, label: str) -> bool:
        if not self._validate_frame_and_stamp(message, label):
            return False
        position = (
            message.pose.position.x,
            message.pose.position.y,
            message.pose.position.z,
        )
        orientation = (
            message.pose.orientation.x,
            message.pose.orientation.y,
            message.pose.orientation.z,
            message.pose.orientation.w,
        )
        if not all(math.isfinite(value) for value in position + orientation):
            self._trip(f"invalid {label} pose")
            return False
        norm = math.sqrt(sum(value * value for value in orientation))
        if abs(norm - 1.0) > self._quaternion_norm_tolerance:
            self._trip(f"invalid {label} quaternion norm")
            return False
        return True

    def _on_current(self, message: PoseStamped) -> None:
        if self._fault_latched or not self._validate_pose(message, "current"):
            return
        values = (message.pose.position.x, message.pose.position.y, message.pose.position.z)
        self._current = values
        self._last_current_s = time.monotonic()

    def _on_target(self, message: PoseStamped) -> None:
        if self._fault_latched:
            return
        if self._current is None or self._last_current_s is None:
            self._trip("no current pose")
            return
        if not self._validate_pose(message, "target"):
            return
        target = (message.pose.position.x, message.pose.position.y, message.pose.position.z)
        if any(value < lo or value > hi for value, lo, hi in zip(target, self._lower, self._upper, strict=True)):
            self._trip("workspace violation")
            return
        distance = math.sqrt(sum((a - b) ** 2 for a, b in zip(target, self._current, strict=True)))
        if distance > self._max_step:
            self._trip("target step too large")
            return
        output = PoseStamped()
        # 입력이 이미 base_frame에서 검증되었으므로 frame과 source timestamp를 보존한다.
        # 다른 frame을 base_frame으로 단순 재표기하는 것은 좌표 변환이 아니다.
        output.header = message.header
        output.pose = message.pose
        self._accepted.publish(output)
        self._publish_state("TARGET_VALIDATED")

    def _watchdog(self) -> None:
        if self._last_current_s is not None and time.monotonic() - self._last_current_s > self._timeout:
            self._trip("current pose timeout")


def main() -> None:
    rclpy.init()
    node = WorkspaceGuard()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()

