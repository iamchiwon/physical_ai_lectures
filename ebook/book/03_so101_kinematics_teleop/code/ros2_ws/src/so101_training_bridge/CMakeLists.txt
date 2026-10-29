cmake_minimum_required(VERSION 3.8)
project(so101_training_bridge)

if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(sensor_msgs REQUIRED)

add_executable(joint_state_monitor src/joint_state_monitor.cpp)
ament_target_dependencies(joint_state_monitor rclcpp sensor_msgs)
target_compile_features(joint_state_monitor PUBLIC cxx_std_17)

install(TARGETS joint_state_monitor DESTINATION lib/${PROJECT_NAME})
install(PROGRAMS scripts/safe_joint_bridge.py
  DESTINATION lib/${PROJECT_NAME}
  RENAME safe_joint_bridge)

ament_package()

