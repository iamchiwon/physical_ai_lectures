"""30 Hz Image와 50 Hz JointState를 만드는 결정론적 교육용 publisher."""

from __future__ import annotations

import math

import rclpy
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data
from rclpy.time import Time
from sensor_msgs.msg import Image, JointState


class SyntheticSensors(Node):
    def __init__(self) -> None:
        super().__init__("synthetic_sensors")
        self.image_offset_ms = float(
            self.declare_parameter("image_offset_ms", 7.0).value
        )
        self.jitter_ms = float(self.declare_parameter("jitter_ms", 3.0).value)
        self.image_pub = self.create_publisher(
            Image, "/camera/color/image_raw", qos_profile_sensor_data
        )
        self.joint_pub = self.create_publisher(
            JointState, "/joint_states", qos_profile_sensor_data
        )
        self.image_index = 0
        self.joint_index = 0
        self.create_timer(1.0 / 30.0, self.publish_image)
        self.create_timer(1.0 / 50.0, self.publish_joint)

    def _stamp(self, offset_ms: float, index: int) -> Time:
        pattern = (-1.0, 0.0, 1.0)
        jitter = pattern[index % len(pattern)] * self.jitter_ms
        nanoseconds = self.get_clock().now().nanoseconds + int(
            (offset_ms + jitter) * 1_000_000.0
        )
        return Time(nanoseconds=nanoseconds, clock_type=self.get_clock().clock_type)

    def publish_image(self) -> None:
        message = Image()
        message.header.stamp = self._stamp(
            self.image_offset_ms, self.image_index
        ).to_msg()
        message.header.frame_id = "camera_optical_frame"
        message.height = 48
        message.width = 64
        message.encoding = "rgb8"
        message.step = message.width * 3
        value = self.image_index % 256
        message.data = bytes([value]) * (message.height * message.step)
        self.image_pub.publish(message)
        self.image_index += 1

    def publish_joint(self) -> None:
        message = JointState()
        message.header.stamp = self._stamp(0.0, self.joint_index).to_msg()
        message.name = ["joint_1"]
        phase = self.joint_index / 50.0
        message.position = [0.5 * math.sin(phase)]
        message.velocity = [0.5 * math.cos(phase)]
        self.joint_pub.publish(message)
        self.joint_index += 1


def main(args: list[str] | None = None) -> None:
    rclpy.init(args=args)
    node = SyntheticSensors()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
