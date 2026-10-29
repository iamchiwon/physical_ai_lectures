"""교육용 tool0 -> camera_link -> camera_optical_frame static TF."""

import rclpy
from geometry_msgs.msg import TransformStamped
from rclpy.node import Node
from tf2_ros.static_transform_broadcaster import StaticTransformBroadcaster


class StaticCameraTf(Node):
    def __init__(self) -> None:
        super().__init__("static_camera_tf")
        self.broadcaster = StaticTransformBroadcaster(self)
        now = self.get_clock().now().to_msg()

        mount = TransformStamped()
        mount.header.stamp = now
        mount.header.frame_id = "tool0"
        mount.child_frame_id = "camera_link"
        mount.transform.translation.x = 0.083
        mount.transform.translation.y = -0.012
        mount.transform.translation.z = 0.115
        mount.transform.rotation.w = 1.0

        # camera_link (x forward, y left, z up) -> optical (z forward, x right, y down)
        optical = TransformStamped()
        optical.header.stamp = now
        optical.header.frame_id = "camera_link"
        optical.child_frame_id = "camera_optical_frame"
        optical.transform.rotation.x = 0.5
        optical.transform.rotation.y = -0.5
        optical.transform.rotation.z = 0.5
        optical.transform.rotation.w = -0.5
        self.broadcaster.sendTransform([mount, optical])


def main(args: list[str] | None = None) -> None:
    rclpy.init(args=args)
    node = StaticCameraTf()
    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        pass
    finally:
        node.destroy_node()
        rclpy.shutdown()

