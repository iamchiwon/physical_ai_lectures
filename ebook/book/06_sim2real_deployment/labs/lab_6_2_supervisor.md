### 실습 6-2: Temporal Filter와 안전 승격 감독기 {#lab-6-2}

#### 목표

- EMA와 temporal ensemble을 구분한다.
- 승격 게이트와 latched FAULT를 시험한다.
- workspace 위반을 clamp하지 않고 거부한다.

#### 1부: 필터

```bash
python code/temporal_filters.py
```

1. EMA `alpha`를 0.1, 0.3, 0.8로 바꾸고 step input 응답을 기록한다.
2. chunk의 두 번째 예측에 큰 이상치를 넣고 ensemble 출력 변화를 본다.
3. ensemble 출력을 joint/rate limit에 다시 통과시켜야 하는 이유를 설명한다.
4. stale/NaN/다른 phase proposal을 ensemble 전에 제거하고 E-stop/reset에서 history를 비운다.

#### 2부: 감독기

```bash
python code/safety_supervisor.py
```

1. `OFFLINE → DRY_RUN`을 승인 없이 시도한다.
2. 단계를 건너뛰어 `DRY_RUN → BOUNDED`로 승격을 시도한다.
3. NaN target, timeout, workspace 위반을 각각 주입한다.
4. `human_approval=True`, `pose_aligned=False`로 fault reset을 시도한다.
5. 두 조건을 모두 만족시킨 뒤 reset이 항상 `DRY_RUN`으로 돌아가는지 확인한다.

#### 상태 전이 설계 과제

다음 사건을 상태 전이표에 추가한다.

- 카메라 serial 변경
- 정책 checkpoint hash 변경
- 세 번 연속 deadline miss
- E-stop 입력
- 그리퍼 과전류

각 사건에서 자동 복구 허용 여부와 사람이 확인할 항목을 적는다.

