### 제4장 확인문제 해설 및 평가 기준 {#chapter-4-solutions}

1. 주점 기준 픽셀 변위가 두 배가 된다. \(u-c_x=f_xX/Z\)다.
2. optical depth는 Z 성분이고 range는 \(\sqrt{X^2+Y^2+Z^2}\)다. 광축 밖에서는 range가 더 크다.
3. \(\tilde P_c=({}^{w}T_c)^{-1}\tilde P_w\)다.
4. body x→optical z, body y→optical -x, body z→optical -y다.
5. 같은 자세인데 component 차분이 큰 점프로 나타나 각속도와 보간이 잘못된다. 내적 부호를 맞춘다.
6. 한 child의 자세가 동시에 두 정의를 가져 트리 경로와 authority가 모호해진다.
7. 5 ms는 허용 시각 차이가 좁아 유효 짝이 없을 수 있고, 50 ms는 더 먼 시각까지 허용한다. 실제 pair 수가 반드시 증가하는 것은 아니며, 도착 순서·queue·표본 소비와 선택된 시각 차이를 관측해야 한다. 빠른 동작에서 큰 시각 차이는 공간 오차를 키울 수 있다.
8. 오프라인은 양쪽 표본을 이용할 수 있다. 온라인에서도 양쪽 표본이 이미 버퍼에 있으면 추가 대기가 필수는 아니지만, 아직 오지 않은 표본을 기다리면 지연이 생긴다. 사용 시점의 가용 정보와 대기 상한을 기록한다.
9. 새 calibration으로 projection, rectify, TF 기반 pose를 다시 계산할 수 있다.
10. “빨간 블록” prompt를 유지한 채 target을 파란색으로 바꾸면 관측과 label이 충돌한다.
11. 인접 timestamp의 차이가 0 이하인지 검사하고, 예상 frame interval의 임계 배수보다 큰지 검사한다.
12. 자동 기준은 일관된 탐지·격리를, Rerun은 여러 신호의 관계를 사람이 해석하는 역할을 한다.

