### 실습 5-B: Episode split과 정규화 누출 {#lab-5-b}

#### 목표

- frame random split과 episode split을 비교한다.
- train-only statistics를 적용한다.
- outlier와 작은 표준편차 문제를 찾는다.

#### 절차

1. `python code/normalization.py`를 실행한다.
2. `split_by_episode()` 대신 frame을 무작위 분할한 조건을 만든다.
3. 인접 frame의 state 차이를 기준으로 train/validation 유사도를 비교한다.
4. 전체 dataset stats와 train-only stats로 validation을 각각 정규화한다.
5. 한 joint에 큰 encoder spike를 한 개 주입하고 mean/std/min/max 변화를 기록한다.
6. 한 joint를 상수로 만들고 epsilon 없이 나누었을 때 결과를 확인한다.
7. min-max, z-score, percentile clipping을 비교한다.
8. LeRobot `meta/stats.json`의 dataset-global stats와 train episode에서 다시 계산한 policy stats를 비교하고, 후자와 split/hash를 checkpoint manifest에 저장한다.

#### 질문

1. frame split의 validation loss가 낮아진다면 왜 일반화 향상으로 해석할 수 없는가?
2. joint limit clamp와 statistical clipping은 어떤 순서와 목적으로 적용해야 하는가?
3. validation에 train 범위를 벗어나는 값이 있을 때 자동으로 제거하면 안 되는 이유는 무엇인가?

#### 제출물

- 분할별 episode ID 목록
- train-only normalization stats
- outlier 전후 통계표
- 선택한 normalization과 근거

