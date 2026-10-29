### [SIM→HW] [SAFETY] 실습 1-4: 시뮬레이터-ROS 2 브리지 계약 {#lab-1-4}

```bash
cd book/01_physical_ai_isaac_ros2
```

#### 목표

구현 전에 데이터 경계의 frame, unit, rate, QoS, owner, timeout을 문서화한다.

#### 절차

SO-101 디지털 트윈을 가정하고 아래 표를 완성한다.

| 데이터 | 타입 | Frame | Unit | Rate | QoS | Writer | Timeout |
|---|---|---|---|---:|---|---|---:|
| Joint state | JointState | - | rad | 50 Hz | sensor | bridge | 100 ms |
| Wrist image | Image | camera_optical | pixel | 30 Hz | sensor | bridge | 100 ms |
| Joint target | 미정 | - | rad | 20 Hz | reliable | safety gate | 100 ms |

1. `/clock` authority와 reset 동작을 명시한다.
2. GUI와 ROS가 동시에 관절을 쓰지 못하게 ownership 규칙을 작성한다.
3. pause, reset, bridge crash, stale command의 복구 절차를 작성한다.
4. 실물 전환 시 달라지는 부분과 유지되는 계약을 색으로 구분하지 말고 열로 표시한다.

