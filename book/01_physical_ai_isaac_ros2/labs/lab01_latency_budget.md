### [SIM] 실습 1-1: Physical AI 지연 예산 {#lab-1-1}

```bash
cd book/01_physical_ai_isaac_ros2
```

#### 목표

50 ms 정책 주기를 구성 요소별로 배분하고 평균이 아닌 최악 지연을 기준으로 실패를 판단한다.

#### 절차

1. `code/physical_ai_loop.py`의 감지, 정책, 안전, plant 단계를 구분한다.
2. 각 단계에 `perf_counter_ns()` 측정을 추가한다.
3. 1,000회 실행해 평균, p95, p99를 계산한다.
4. 정책 단계에 0~40 ms의 무작위 지연을 추가한다.
5. 50 ms deadline miss 비율과 command age를 표로 작성한다.
6. 큐를 1개만 유지하는 latest-only 전략과 모든 명령을 순서대로 실행하는 전략을 비교한다.

#### 제출물

- 단계별 p50/p95/p99 표
- deadline miss 원인 3가지
- watchdog TTL 선정 근거

#### 토의

평균 지연이 50 ms 이하인데도 로봇이 불안정할 수 있는 이유를 설명하라.

