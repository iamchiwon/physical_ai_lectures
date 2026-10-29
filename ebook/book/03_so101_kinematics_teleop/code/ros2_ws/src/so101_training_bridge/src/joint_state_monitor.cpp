#include <algorithm>
#include <chrono>
#include <cmath>
#include <memory>
#include <optional>
#include <set>
#include <string>
#include <vector>

#include "rclcpp/rclcpp.hpp"
#include "sensor_msgs/msg/joint_state.hpp"

using namespace std::chrono_literals;

class JointStateMonitor : public rclcpp::Node {
 public:
  JointStateMonitor() : Node("joint_state_monitor") {
    expected_ = {"shoulder_pan", "shoulder_lift", "elbow_flex",
                 "wrist_flex", "wrist_roll", "gripper"};
    subscription_ = create_subscription<sensor_msgs::msg::JointState>(
        "/follower/joint_states", rclcpp::SensorDataQoS(),
        [this](sensor_msgs::msg::JointState::ConstSharedPtr msg) { Validate(*msg); });
    timer_ = create_wall_timer(100ms, [this]() { CheckTimeout(); });
  }

 private:
  void Validate(const sensor_msgs::msg::JointState &msg) {
    if (msg.name.size() != msg.position.size()) {
      RCLCPP_ERROR(get_logger(), "name/position length mismatch");
      return;
    }
    const std::set<std::string> received(msg.name.begin(), msg.name.end());
    if (received != expected_) {
      RCLCPP_ERROR(get_logger(), "joint set mismatch");
      return;
    }
    if (!std::all_of(msg.position.begin(), msg.position.end(),
                     [](double value) { return std::isfinite(value); })) {
      RCLCPP_ERROR(get_logger(), "NaN/Inf in joint position");
      return;
    }
    last_valid_ = std::chrono::steady_clock::now();
    stale_reported_ = false;
    RCLCPP_INFO_THROTTLE(get_logger(), *get_clock(), 2000,
                         "valid follower state received");
  }

  void CheckTimeout() {
    if (!last_valid_.has_value()) return;
    const auto age = std::chrono::steady_clock::now() - *last_valid_;
    if (age > 300ms && !stale_reported_) {
      RCLCPP_ERROR(get_logger(), "follower state stale for more than 300 ms");
      stale_reported_ = true;
    }
  }

  std::set<std::string> expected_;
  std::optional<std::chrono::steady_clock::time_point> last_valid_;
  bool stale_reported_{false};
  rclcpp::Subscription<sensor_msgs::msg::JointState>::SharedPtr subscription_;
  rclcpp::TimerBase::SharedPtr timer_;
};

int main(int argc, char **argv) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<JointStateMonitor>());
  rclcpp::shutdown();
  return 0;
}

