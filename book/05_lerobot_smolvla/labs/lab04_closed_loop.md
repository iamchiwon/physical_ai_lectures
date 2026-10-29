### 실습 5-D: 20 Hz Action Chunk 폐루프 {#lab-5-d}

#### 목표

- 50 ms deadline과 inference latency 관계를 측정한다.
- receding horizon과 temporal ensemble을 비교한다.
- queue underrun 시 safe behavior를 설계한다.

#### 준비

```bash
python code/temporal_ensemble.py
python code/closed_loop_20hz.py
```

#### 실험 조건

1. inference latency를 10, 40, 70, 120 ms로 모사한다.
2. chunk horizon을 1, 8, 16으로 바꾼다.
3. execution horizon을 1, 4, 8로 바꾼다.
4. temporal ensemble decay를 0, 0.25, 1.0으로 바꾼다.
5. 2% 확률의 latency spike와 NaN action을 주입한다.
6. stale chunk, task/phase가 다른 chunk, hard limit을 크게 벗어난 proposal을 주입하고 ensemble 전에 제거되는지 확인한다.
7. grasp/retreat phase 전환과 E-stop/reset에서 ensemble history를 비운다.

#### 측정

- missed deadline 수
- queue underrun 수
- command delta/jerk
- goal error
- safety reject 수
- stale observation age

#### 안전 정책 설계

다음 사건별 동작을 표로 작성한다.

| 사건 | 감지 조건 | 즉시 동작 | 복구/종료 |
|---|---|---|---|
| queue underrun | 실행할 action 없음 | hold 또는 감속 정지 | 새 chunk 대기 |
| stale image | age > threshold | 신규 inference 금지 | sensor 복구 |
| NaN action | finite check 실패 | command reject | safe stop |
| watchdog loss | heartbeat timeout | torque/velocity 안전 상태 | operator reset |

#### 토의

temporal averaging으로 smoothness는 좋아졌지만 goal error가 커질 수 있는 경우를 설명한다. 서로 다른 action mode를 평균하는 것이 안전하지 않은 사례도 제시한다.

