### 실습 2-B: 충돌 근사와 CCD 비용-효과 분석 {#lab-2-b}

**[SIM]** Isaac Sim 안에서 수행한다. 프로젝트 경로가 필요한 명령은 `book/02_physx_simulation` 장 루트를 기준으로 한다.

#### 목표

- discrete collision의 tunneling 조건을 관찰한다.
- collider, timestep, CCD가 정확도와 성능에 미치는 영향을 비교한다.

#### 장면

- Z-up, metersPerUnit = 1
- 두께 0.005 m인 static platform
- 한 변 0.02 m인 dynamic cube 또는 radius 0.01 m sphere
- 초기 높이 0.5 m
- 아래 방향 초기속도: 1, 3, 6, 10 m/s

#### 독립 변수

- physics rate: 60, 120, 240 Hz
- collision approximation: primitive, convex hull
- CCD: off, sweep, speculative

#### 종속 변수

- platform 아래로 통과한 trial 수 / 전체 trial 수
- 최대 penetration depth
- 평균 physics step time
- 99th percentile physics step time

#### 절차

1. CCD off, 60 Hz를 baseline으로 설정한다.
2. 각 속도에서 20회 반복한다. initial horizontal offset에 작은 고정 seed 난수를 준다.
3. physics rate만 바꿔 반복한다.
4. 원래 rate로 돌아가 CCD 방식만 바꾼다.
5. visual mesh는 유지하고 collision approximation만 바꾼다.
6. 결과를 CSV로 저장하고 configuration 전체를 함께 기록한다.

#### 안전한 판정 코드 예

```python
passed_through = final_z < platform_bottom_z - object_half_extent
```

한 frame만 보지 말고 trajectory 전체의 최소 z와 contact event를 함께 검사한다.

#### 결과표

| rate | speed | CCD | collider | tunnel rate | mean step ms | p99 step ms |
|---:|---:|---|---|---:|---:|---:|
| 60 | 1 | off | primitive | | | |
| 60 | 10 | off | primitive | | | |
| 60 | 10 | sweep | primitive | | | |

#### 토의

1. timestep 감소와 CCD 중 어느 방법이 더 일반적인 개선을 제공했는가?
2. 빠른 각운동을 갖는 긴 물체에서 sweep CCD만으로 부족할 수 있는 이유는 무엇인가?
3. CCD를 모든 물체에 적용하지 않을 근거를 결과에서 찾으라.

