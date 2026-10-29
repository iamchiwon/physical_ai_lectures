"""50 Hz 가상 JointState 발행기."""

from math import sin

import rclpy
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data
from sensor_msgs.msg import JointState


class JointStateSource(Node):
    def __init__(self) -> None:
        super().__init__("joint_state_source")
        self.publisher = self.create_publisher(
            JointState, "/demo/joint_states", qos_profile_sensor_data
        )
        self.start_ns = self.get_clock().now().nanoseconds
        self.timer = self.create_timer(0.02, self.publish_state)

    def publish_state(self) -> None:
        now = self.get_clock().now()
        elapsed = (now.nanoseconds - self.start_ns) * 1e-9
        message = JointState()
        message.header.stamp = now.to_msg()
        message.name = ["joint_1"]
        message.position = [0.5 * sin(elapsed)]
        message.velocity = [0.5 * __import__("math").cos(elapsed)]
        self.publisher.publish(message)


def main(args: list[str] | None = None) -> None:
    rclpy.init(args=args)
    node = JointStateSource()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()

