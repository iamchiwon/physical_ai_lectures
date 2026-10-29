### [SIM] 실습 1-3: ROS 2 인터페이스와 QoS {#lab-1-3}

```bash
cd ebook/book/01_physical_ai_isaac_ros2
```

#### 목표

Topic의 빈도와 QoS를 관찰하고 Service/Action의 적용 범위를 구분한다.

#### 절차

1. `physical_ai_demo`를 빌드하고 `joint_state_source`를 실행한다.
2. `ros2 node list`, `ros2 topic list -t`, `ros2 topic info -v /demo/joint_states`를 기록한다.
3. `ros2 topic hz`와 `ros2 topic delay`로 주기와 지연을 관찰한다.
4. 구독자의 reliability를 reliable로 강제했을 때 sensor-data publisher와 호환되는지 확인한다.
5. 다음 기능을 Topic/Service/Action 중 하나로 분류한다: 카메라, 비상 정지 요청, 홈 이동, 캘리브레이션 조회, pick-and-place.

#### 제출물

- ROS graph 스케치
- QoS 호환성 관찰 결과
- 인터페이스 선택 표와 근거

