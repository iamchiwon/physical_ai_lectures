### [SIM] 실습 4-2: TF2와 ApproximateTime {#lab-4-2}

```bash
cd book/04_sensor_data_pipeline
source /opt/ros/jazzy/setup.bash
cd code/ros2_jazzy
colcon build --symlink-install --packages-select sensor_pipeline
source install/setup.bash
```

새 터미널마다 위의 ROS 환경과 `install/setup.bash`를 source한 뒤 다음을 실행한다.

```bash
# 터미널 A: 30 Hz Image + 50 Hz JointState
ros2 run sensor_pipeline synthetic_sensors

# 터미널 B: 고정 카메라 TF
ros2 run sensor_pipeline static_camera_tf

# 터미널 C: 근사 동기화
ros2 run sensor_pipeline approx_sync --ros-args -p slop_s:=0.015
```

#### 목표

카메라 TF 트리를 확인하고 image-joint timestamp 차이를 측정한다.

#### 절차

1. `ros2 run sensor_pipeline synthetic_sensors`로 30 Hz Image와 50 Hz JointState를 생성한다.
2. `static_camera_tf`를 실행하고 `tf2_echo`로 변환을 확인한다.
3. 별도 터미널에서 `approx_sync`의 `slop_s`를 0.005, 0.015, 0.050으로 바꾼다.
4. 각 설정의 pair 수, delta p95, 최대 delta를 기록한다.
5. `synthetic_sensors`의 `image_offset_ms`와 `jitter_ms`를 바꾸고 callback 비율을 비교한다.
6. publisher와 subscriber QoS를 일부러 다르게 하고 `ros2 topic info -v`로 진단한다.

#### 제출물

- TF tree 그림
- slop별 품질 표
- 선택한 운영 slop과 근거

