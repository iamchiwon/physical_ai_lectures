### 제2장 연습문제 및 해설 지침 {#chapter-2-problem-set}

#### 개념 문제

1. render mesh, collision mesh, mass model을 분리하는 이유를 각각 쓰라.
2. static collider와 kinematic body가 같은 점과 다른 점을 설명하라.
3. `metersPerUnit=0.01`인 Stage에 m 단위 관성값을 그대로 넣었을 때 발생할 수 있는 문제를 설명하라.
4. q와 -q가 같은 회전이라는 사실을 데이터셋 loss 설계에서 어떻게 처리할 수 있는가?
5. CCD를 켜도 tunneling이나 ghost collision이 완전히 사라진다고 보장할 수 없는 이유를 쓰라.

#### 계산 문제

1. 120 Hz에서 4 m/s로 움직이는 물체가 한 step 동안 이동하는 거리를 구하라.
2. 0.3 kg, 크기 0.1×0.05×0.04 m 직육면체의 COM 기준 대각 관성 성분을 구하라.
3. 임계 경사각 측정값이 29°, 31°, 30°, 32°, 28°일 때 각 trial의 마찰 추정값과 평균을 구하라.
4. 0.4 m에서 낙하한 물체가 0.016 m 반동했다. 단순 모델의 반발계수를 구하라.
5. 0.5 kg 물체를 마찰계수 0.6인 두 평행 finger로 잡는다. 안전계수 2.5일 때 finger당 최소 법선력을 구하라.

#### 구현 문제

1. `Transform`에 `from_quaternion_translation()` classmethod를 추가하라.
2. 두 quaternion 사이의 shortest-path SLERP를 구현하라. dot product가 음수일 때 처리에 주의한다.
3. cylinder와 solid sphere의 관성 텐서 함수를 추가하라.
4. `contact_estimator.py`가 CSV trial을 읽어 평균과 95% bootstrap interval을 출력하도록 확장하라.
5. collision experiment configuration을 YAML로 저장하고 실험 ID의 hash를 만드는 도구를 작성하라.

#### 해설 작성 기준

- 숫자 답만 쓰지 말고 단위와 가정을 표시한다.
- quaternion 문제는 성분 순서와 multiplication convention을 명시한다.
- 시뮬레이션 문제는 정확도뿐 아니라 계산 비용과 failure mode를 논의한다.

