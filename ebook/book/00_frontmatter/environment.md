# 기준 실습 환경

## 운영체제와 미들웨어

| 항목 | 기준 |
|---|---|
| 운영체제 | Ubuntu 24.04 LTS 64-bit |
| ROS 2 | Jazzy Jalisco |
| Python | 3.12 계열 |
| C++ | C++17 |
| 빌드 도구 | colcon, CMake, ament |
| GPU | NVIDIA RTX 계열, Isaac Sim 요구 사양 충족 권장 |
| 컨테이너 | Docker/Podman은 보조 경로로 사용 |

ROS 2 공식 플랫폼 정책에서 Jazzy의 Ubuntu 24.04 `amd64`와 `arm64`는 Tier 1이다. Tier 1은 지속 통합과 패키지 배포가 가장 강하게 보장되는 조합을 뜻한다. 근거는 [ROS 2 Jazzy 지원 플랫폼](https://docs.ros.org/en/jazzy/Releases/Release-Jazzy-Jalisco.html)과 [REP 2000](https://www.ros.org/reps/rep-2000.html)이다.

## 집필 기준 버전과 검증 상태

아래 표는 2026-10-28에 고정한 집필 기준이다. `문서 확인`은 공식 문서와 API를 대조했다는 뜻이고, `구문 확인`은 현재 작업 환경에서 Python/XML 또는 독립 C++ 예제까지 확인했다는 뜻이다. GPU·로봇 장비가 필요한 항목은 **예상 실행**이며 실제 장비 검증을 주장하지 않는다.

| 구성 요소 | 집필 기준 | 상태 | 적용 원칙 |
|---|---|---|---|
| Ubuntu | 24.04 LTS | 기준 환경 | 책 전체의 기본 OS |
| ROS 2 | Jazzy Jalisco | 문서 확인·일부 구문 확인 | `/opt/ros/jazzy`와 Jazzy 메시지/API 사용 |
| Python | 3.12 계열 | 구문 확인 | 범용 예제 기준, Isaac Sim 내장 Python은 별도 |
| C++ | C++17 | 독립 예제 컴파일 확인 | ROS 2 예제는 Jazzy 빌드 환경 필요 |
| NVIDIA Isaac Sim | 6.2.0 문서 기준 | 문서 확인·예상 실행 | 설치 릴리스에서 API 경로 재확인 |
| LeRobot | 0.6.1 | 문서 확인·예상 실행 | SO-101 CLI 변경 가능성 확인 |
| Rerun SDK | 0.40.0 | 구문 확인·예상 실행 | 시각화 예제 API 기준 |
| OpenUSD `usd-core` | 26.11 | 범용 예제 구문 확인·예상 실행 | Isaac Sim 번들 USD와 혼용 금지 |

버전 확인 출처: [Isaac Sim 6.2 release notes](https://docs.isaacsim.omniverse.nvidia.com/6.2.0/overview/release_notes.html), [LeRobot PyPI](https://pypi.org/project/lerobot/), [Rerun SDK PyPI](https://pypi.org/project/rerun-sdk/), [OpenUSD usd-core PyPI](https://pypi.org/project/usd-core/).

패치 버전이 달라져도 개념과 데이터 계약은 유지한다. 명령이나 import가 달라지면 설치 버전의 release note를 먼저 확인하고, 실습 보고서에 실제 버전을 기록한다.

## 실습 장비

- SO-101 Leader/Follower 한 쌍: 5-DoF 팔 + 그리퍼, 총 6개 구동기
- 대체 장비는 동일한 관절 구성을 권장한다. 6-DoF 팔을 사용하면 제3장의 IK 과업 우선순위가 달라진다.
- 광각 RGB 카메라 2대(상부 및 손목 시점)
- 안정화된 전원 공급 장치와 물리적 전원 차단 수단
- 로봇 고정 마운트, 작업대, 파지 대상체와 트레이
- 최소 60 GB 이상의 여유 저장 공간

실물 장비가 없으면 제1·2장의 Isaac Sim 환경과 제3장의 가상 조인트 인터페이스를 이용해 제4장까지 학습할 수 있다. 제5장의 데이터셋 실습은 제공 예제 또는 공개 데이터셋으로 대체할 수 있다.

