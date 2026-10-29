### [SIM→HW] [SAFETY] 실습 3-3: ROS 2 JointState 안전 브리지 {#lab-3-3}

#### 목표

- ROS 2 Jazzy 패키지를 빌드하고 이름 기반 `JointState` 릴레이를 관찰한다.
- 잘못된 관절 집합, NaN, timeout을 주입해 실패 경로를 확인한다.

#### 빌드

```bash
cd book/03_so101_kinematics_teleop
cd code/ros2_ws
source /opt/ros/jazzy/setup.bash
colcon build --symlink-install
source install/setup.bash
```

#### 정상 입력

터미널 A:

```bash
ros2 run so101_training_bridge safe_joint_bridge
```

터미널 B:

```bash
source /opt/ros/jazzy/setup.bash
ros2 topic echo /follower/joint_command
```

터미널 C:

```bash
source /opt/ros/jazzy/setup.bash
ros2 topic pub -r 20 /leader/joint_states sensor_msgs/msg/JointState \
"{name: ['wrist_roll','elbow_flex','gripper','shoulder_pan','wrist_flex','shoulder_lift'], position: [0.1,0.4,50.0,0.2,-0.1,-0.3]}"
```

출력 배열은 입력 순서가 아니라 `JOINTS`의 계약 순서로 재정렬되어야 한다.

#### 실패 주입

1. `gripper`를 이름 배열에서 제거한다.
2. 이름은 6개, 위치는 5개만 보낸다.
3. 정상 발행을 중단하고 0.25 s 이후 timeout 로그를 확인한다.
4. `control_period_s`와 입력 발행률을 다르게 설정하고 추종 지연을 관찰한다.

#### 모니터

```bash
ros2 run so101_training_bridge joint_state_monitor
```

`/follower/joint_states`에 fake 상태를 발행해 유효 프레임과 stale 경고를 확인한다.

#### 실물 연결 전 검토

- 출력 토픽을 모터 드라이버에 직접 연결하지 않는다.
- Follower의 실측 초기 자세를 브리지에 공급하도록 인터페이스를 수정한다.
- HOLD 명령과 torque-off의 의미를 드라이버 계약에 정의한다.
- E-stop 복구에는 수동 승인과 재정렬 단계를 둔다.

