#!/usr/bin/env python3
"""실습용 live-stamped PoseStamped publisher.

실물 드라이버가 아니며 workspace_guard의 frame/timestamp 검증을 시험하기 위한 도구다.
"""

from __future__ import annotations

from geometry_msgs.msg import PoseStamped
import rclpy
from rclpy.node import Node


class StampedPosePublisher(Node):
    def __init__(self) -> None:
        super().__init__("stamped_pose_publisher")
        self.declare_parameter("topic", "/robot/ee_pose")
        self.declare_parameter("frame_id", "base_link")
        self.declare_parameter("rate_hz", 20.0)
        self.declare_parameter("xyz", [0.20, 0.0, 0.12])
        self.declare_parameter("quaternion_xyzw", [0.0, 0.0, 0.0, 1.0])
        topic = str(self.get_parameter("topic").value)
        rate_hz = float(self.get_parameter("rate_hz").value)
        if rate_hz <= 0.0:
            raise ValueError("rate_hz must be positive")
        self._publisher = self.create_publisher(PoseStamped, topic, 1)
        self.create_timer(1.0 / rate_hz, self._publish)

    def _publish(self) -> None:
        xyz = [float(value) for value in self.get_parameter("xyz").value]
        quat = [float(value) for value in self.get_parameter("quaternion_xyzw").value]
        if len(xyz) != 3 or len(quat) != 4:
            raise ValueError("xyz needs 3 values and quaternion_xyzw needs 4")
        message = PoseStamped()
        message.header.stamp = self.get_clock().now().to_msg()
        message.header.frame_id = str(self.get_parameter("frame_id").value)
        message.pose.position.x, message.pose.position.y, message.pose.position.z = xyz
        (
            message.pose.orientation.x,
            message.pose.orientation.y,
            message.pose.orientation.z,
            message.pose.orientation.w,
        ) = quat
        self._publisher.publish(message)


def main() -> None:
    rclpy.init()
    node = StampedPosePublisher()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
