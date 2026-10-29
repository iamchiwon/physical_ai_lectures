### 실습 6-3: ROS 2 Cartesian Workspace Guard {#lab-6-3}

#### 목표

- 정책 목표와 로봇 현재 pose를 별도 토픽으로 관리한다.
- workspace, 최대 step, current-state watchdog을 시험한다.
- guard 출력이 모터 명령이 아니라 검증된 중간 표현임을 이해한다.

#### 빌드

```bash
cd ebook/book/06_sim2real_deployment/code/ros2_ws
source /opt/ros/jazzy/setup.bash
colcon build --symlink-install
source install/setup.bash
ros2 run sim2real_safety workspace_guard
```

#### 정상 입력

터미널 B에서 live timestamp를 가진 현재 pose를 20 Hz로 발행한다. `ros2 topic pub`의 고정 YAML timestamp는 곧 stale해지므로 실습용 publisher를 사용한다.

```bash
ros2 run sim2real_safety stamped_pose_publisher --ros-args \
  -p topic:=/robot/ee_pose -p rate_hz:=20.0 \
  -p frame_id:=base_link -p xyz:="[0.20, 0.00, 0.12]"
```

터미널 C에서 2 cm 이내 목표를 2 Hz로 발행한다.

```bash
ros2 run sim2real_safety stamped_pose_publisher --ros-args \
  -p topic:=/policy/ee_target -p rate_hz:=2.0 \
  -p frame_id:=base_link -p xyz:="[0.21, 0.00, 0.12]"
```

터미널 D에서 상태를 본다.

```bash
ros2 topic echo /safety/state --qos-durability transient_local
```

#### 실패 주입

1. `x=0.9`인 목표를 보내 workspace fault를 발생시킨다.
2. 노드를 재시작하고 5 cm step을 보내 `target step too large`를 확인한다.
3. current pose 발행을 중단해 watchdog fault를 확인한다.
4. target publisher의 `frame_id:=camera_link`로 바꾸고 frame mismatch가 latched FAULT가 되는지 확인한다. 좌표 숫자를 `base_link`로 재표기해서는 안 된다.
5. `quaternion_xyzw:="[0.0, 0.0, 0.0, 0.0]"`와 NaN 성분을 각각 보내 quaternion/finite 검사를 확인한다.
6. `ros2 topic pub --once`로 stamp가 0인 메시지를 보내 `timestamp missing`을 확인한다.
7. fault 뒤 정상 목표가 자동으로 통과하지 않는지 확인한다.

#### 실물 연결 전 추가 항목

- orientation 유효성, quaternion normalization
- source timestamp freshness와 future timestamp tolerance
- frame mismatch 거부 또는 timestamped TF2 변환
- FK 기반 joint limit과 self-collision
- command/feedback sequence ID
- driver HOLD/torque-off acknowledgment
- 물리 E-stop 입력과 재승인 절차
- ROS 노드가 멈춰도 작동하는 독립 안전 회로

#### QoS 계약

- current pose는 sensor-data QoS로 최신값을 우선한다.
- policy target과 accepted target은 reliable depth 1을 사용한다.
- fault state는 transient-local reliable QoS로 late subscriber도 마지막 latched fault를 읽게 한다.
- 실제 driver 연결에서는 accepted target 수신만으로 실행 성공을 가정하지 말고 HOLD/torque-off acknowledgement를 별도 확인한다.

