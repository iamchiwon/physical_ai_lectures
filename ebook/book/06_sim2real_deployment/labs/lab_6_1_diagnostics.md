### 실습 6-1: Sim2Real 로그 진단 {#lab-6-1}

#### 목표

- stage timestamp로 추론 및 end-to-end latency를 계산한다.
- 평균 대신 p50/p95/p99를 비교한다.
- 전체 성공률과 조건별 Wilson 95% 신뢰구간을 계산한다.

#### 절차

1. 데모 데이터를 분석한다.

```bash
cd ebook/book/06_sim2real_deployment
python code/sim2real_diagnostics.py --demo
```

2. 다음 header를 가진 `episodes.csv`를 만든다.

```csv
episode_id,condition,success,capture_ns,receive_ns,infer_start_ns,infer_end_ns,send_ns,motion_ns
```

3. 자신의 로그를 분석한다.

```bash
python code/sim2real_diagnostics.py --csv episodes.csv
```

4. 한 행의 `infer_end_ns`를 `infer_start_ns`보다 작게 만들어 timestamp inversion이 거부되는지 확인한다.
5. 성공 9/10과 90/100의 점추정은 같지만 신뢰구간 폭이 어떻게 다른지 `wilson_interval`로 계산한다.
6. 조건별 성공률이 전체 성공률에 가려지는 사례를 만든다.

#### 분석 질문

- p99가 p50보다 3배 클 때 제어 주기를 어떻게 정할 것인가?
- 표본이 20개뿐일 때 p99를 운영 tail latency로 해석하면 안 되는 이유는 무엇인가? `n`, max, deadline miss를 함께 보고하라.
- `motion_ns`를 어떤 센서 사건으로 정의했는가?
- 서로 다른 컴퓨터의 timestamp를 직접 빼도 되는가?
- 실패 episode를 삭제하면 성공률과 latency가 각각 어떤 편향을 갖는가?

#### 제출물

- 전체/조건별 성공률과 Wilson 구간 표
- latency p50/p95/p99 표
- clock domain과 누락 episode 처리 정책
- success literal 오탈자, duplicate episode ID, 빈 condition이 거부되는 시험
- 가장 가능성 높은 Reality Gap 가설 3개와 다음 실험

