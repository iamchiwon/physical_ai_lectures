### [SIM] 실습 4-4: Domain Randomization과 Rerun 품질 검토 {#lab-4-4}

```bash
cd book/04_sensor_data_pipeline
```

#### 목표

랜덤화 분포를 버전 관리하고 시계열 이상을 공간·시간 뷰에서 검토한다.

#### 절차

1. 카메라 jitter, light intensity, object color, friction 분포를 YAML로 작성한다.
2. 의미를 깨는 표본과 물리적으로 불가능한 표본을 거부하는 조건을 설계한다.
3. Isaac Sim 환경이 있으면 `replicator_randomization.py`를 설치 버전에 맞게 실행한다.
4. `code/rerun_integrity_check.py`에서 frame 184 drop, frame 250 `joint_3` spike, frame 291 timestamp reversal을 찾는다.
5. 자동 threshold와 사람의 시각 검토가 불일치하는 사례를 기록한다.

#### 제출물

- randomization manifest
- Rerun 캡처 또는 관찰 기록
- quarantine 에피소드 목록과 사유

