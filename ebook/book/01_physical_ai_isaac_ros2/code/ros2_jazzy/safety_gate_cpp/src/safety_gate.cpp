#include <algorithm>
#include <chrono>
#include <memory>
#include <string>

#include "rclcpp/rclcpp.hpp"
#include "sensor_msgs/msg/joint_state.hpp"

class SafetyGate : public rclcpp::Node {
 public:
  SafetyGate() : Node("safety_gate") {
    lower_ = declare_parameter("lower", -1.0);
    upper_ = declare_parameter("upper", 1.0);
    max_age_ms_ = declare_parameter("max_age_ms", 100.0);
    publisher_ = create_publisher<sensor_msgs::msg::JointState>(
        "/demo/safe_command", rclcpp::QoS(1).reliable());
    subscription_ = create_subscription<sensor_msgs::msg::JointState>(
        "/demo/proposed_command", rclcpp::QoS(1).reliable(),
        [this](sensor_msgs::msg::JointState::ConstSharedPtr message) {
          filter_and_publish(*message);
        });
  }

 private:
  void filter_and_publish(const sensor_msgs::msg::JointState& input) {
    if (input.name.size() != input.position.size() || input.position.empty()) {
      RCLCPP_WARN(get_logger(), "invalid command shape; rejected");
      return;
    }
    const auto stamp = rclcpp::Time(input.header.stamp);
    const double age_ms = (now() - stamp).seconds() * 1000.0;
    if (stamp.nanoseconds() == 0 || age_ms < 0.0 || age_ms > max_age_ms_) {
      RCLCPP_WARN(get_logger(), "stale/future command age=%.1f ms; rejected", age_ms);
      return;
    }
    auto output = input;
    for (double& position : output.position) {
      position = std::clamp(position, lower_, upper_);
    }
    publisher_->publish(output);
  }

  double lower_;
  double upper_;
  double max_age_ms_;
  rclcpp::Publisher<sensor_msgs::msg::JointState>::SharedPtr publisher_;
  rclcpp::Subscription<sensor_msgs::msg::JointState>::SharedPtr subscription_;
};

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<SafetyGate>());
  rclcpp::shutdown();
  return 0;
}

