### 실습 2-C: 마찰·반발·질량 파라미터 보정 {#lab-2-c}

**[SIM→HW] [SAFETY]** 실물 경사·낙하 시험은 파손 위험이 없는 시편과 낮은 에너지 조건에서 수행한다. 명령은 `ebook/book/02_physx_simulation` 장 루트를 기준으로 한다.

#### 목표

- 실측에서 simulation 초기값을 얻는다.
- 한 번에 한 파라미터만 변경하는 보정 절차를 수행한다.
- 평균과 분산으로 Reality Gap을 표현한다.

#### 실물 측정

##### Tilt test

1. 대상체와 경사판 표면을 기록하고 사진을 남긴다.
2. 판을 천천히 기울여 물체가 지속적으로 움직이기 시작하는 각도를 측정한다.
3. 최소 10회 반복한다.
4. 평균, 표준편차, 최소/최대값을 구한다.

##### Drop test

1. 안전한 작은 높이에서 물체를 낙하시킨다.
2. high-frame-rate 영상 또는 눈금을 이용해 첫 반동 높이를 구한다.
3. 물체가 손상될 수 있는 높이나 표면은 사용하지 않는다.
4. 최소 10회 반복한다.

#### 초기값 계산

```bash
cd ebook/book/02_physx_simulation
python code/contact_estimator.py \
  --tilt-deg 32 \
  --drop-m 0.30 \
  --rebound-m 0.003 \
  --mass-kg 0.25
```

#### 시뮬레이션 보정

1. geometry scale, mass, gravity를 먼저 고정한다.
2. restitution만 바꿔 rebound height error를 줄인다.
3. restitution을 고정하고 friction만 바꿔 critical angle error를 줄인다.
4. COM과 inertia를 바꾸기 전 tipping 실험을 별도로 설계한다.
5. 최종 파라미터로 사용하지 않은 pose/속도 조건을 검증한다.

#### 오차 지표

\[
E_h = |h_{sim}-h_{real}|,\qquad
E_\theta = |\theta_{sim}-\theta_{real}|
\]

#### 제출물

- raw measurement CSV
- 측정 환경과 재질 pair 설명
- 파라미터 변경 history
- calibration 조건과 validation 조건의 오차 비교
- rigid Coulomb contact model로 설명하지 못한 현상 목록

