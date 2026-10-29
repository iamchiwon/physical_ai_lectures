"""Image와 JointState의 ApproximateTime delta를 발행한다."""

import message_filters
import rclpy
from rclpy.node import Node
from rclpy.qos import qos_profile_sensor_data
from sensor_msgs.msg import Image, JointState
from std_msgs.msg import Float64


def stamp_seconds(message: Image | JointState) -> float:
    stamp = message.header.stamp
    return float(stamp.sec) + float(stamp.nanosec) * 1e-9


class ApproxSync(Node):
    def __init__(self) -> None:
        super().__init__("approx_sync")
        queue_size = self.declare_parameter("queue_size", 20).value
        slop_s = self.declare_parameter("slop_s", 0.02).value
        self.delta_pub = self.create_publisher(Float64, "/quality/image_joint_delta_ms", 10)

        self.image_sub = message_filters.Subscriber(
            self, Image, "/camera/color/image_raw", qos_profile=qos_profile_sensor_data
        )
        self.joint_sub = message_filters.Subscriber(
            self, JointState, "/joint_states", qos_profile=qos_profile_sensor_data
        )
        self.sync = message_filters.ApproximateTimeSynchronizer(
            [self.image_sub, self.joint_sub], queue_size=queue_size, slop=slop_s
        )
        self.sync.registerCallback(self.on_pair)

    def on_pair(self, image: Image, joints: JointState) -> None:
        delta_ms = 1_000.0 * (stamp_seconds(image) - stamp_seconds(joints))
        message = Float64()
        message.data = delta_ms
        self.delta_pub.publish(message)
        if abs(delta_ms) > 15.0:
            self.get_logger().warn(f"large image-joint delta: {delta_ms:.1f} ms")


def main(args: list[str] | None = None) -> None:
    rclpy.init(args=args)
    node = ApproxSync()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

