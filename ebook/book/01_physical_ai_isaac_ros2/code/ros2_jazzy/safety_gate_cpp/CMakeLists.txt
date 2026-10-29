cmake_minimum_required(VERSION 3.8)
project(safety_gate_cpp)

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(sensor_msgs REQUIRED)

add_executable(safety_gate src/safety_gate.cpp)
ament_target_dependencies(safety_gate rclcpp sensor_msgs)
target_compile_features(safety_gate PUBLIC cxx_std_17)
install(TARGETS safety_gate DESTINATION lib/${PROJECT_NAME})
ament_package()

