"""현재 timestamp가 있는 교육용 관절 목표를 10 Hz로 발행한다."""

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState


class ProposedCommandSource(Node):
    def __init__(self) -> None:
        super().__init__("proposed_command_source")
        self.target = float(self.declare_parameter("target", 0.8).value)
        self.publisher = self.create_publisher(
            JointState, "/demo/proposed_command", 1
        )
        self.timer = self.create_timer(0.1, self.publish_command)

    def publish_command(self) -> None:
        message = JointState()
        message.header.stamp = self.get_clock().now().to_msg()
        message.name = ["joint_1"]
        message.position = [self.target]
        self.publisher.publish(message)


def main(args: list[str] | None = None) -> None:
    rclpy.init(args=args)
    node = ProposedCommandSource()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()


if __name__ == "__main__":
    main()
