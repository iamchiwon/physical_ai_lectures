# 부록 A. ROS 2 Lyrical 마이그레이션 노트

## A.1 왜 본문은 Jazzy를 사용하는가

ROS 2는 짝수 해에 Ubuntu LTS와 맞춘 장기지원(Long Term Support, LTS) 배포판을 제공한다. ROS 2 Jazzy Jalisco는 Ubuntu 24.04를 Tier 1 플랫폼으로 지원하며 2029년 5월까지 지원된다. ROS 2 Lyrical Luth는 2026년 5월에 공개된 후속 LTS이며 2031년 5월까지 지원된다.

이 책은 다음 이유로 Jazzy를 주 환경으로 삼는다.

- Ubuntu 24.04 기반 개발·배포 환경이 이미 널리 축적되어 있다.
- 교육용 로봇 드라이버, 시뮬레이터 확장, 서드파티 패키지의 바이너리와 문서가 충분하다.
- 새 LTS 공개 직후 발생하는 패키지 이식 지연을 줄일 수 있다.
- Jazzy의 지원 기간이 교육 및 단기 제품 개발 주기에 충분하다.

새 프로젝트가 Ubuntu 26.04와 Lyrical의 특정 기능을 필요로 한다면, 아래 점검표로 이식 범위를 판단한다.

## A.2 이식 점검표

1. 필요한 ROS 패키지가 Lyrical 바이너리로 배포되는지 `index.ros.org`와 `apt`에서 확인한다.
2. 로봇 하드웨어 드라이버가 사용 중인 커널, USB/시리얼 계층과 호환되는지 확인한다.
3. Isaac Sim의 공식 지원 운영체제와 ROS 브리지 조합을 확인한다.
4. `rclcpp`, `rclpy`, `rosbag2`, `launch`, `message_filters`의 변경 사항을 릴리스 노트에서 검토한다.
5. 워크스페이스를 새 환경에서 깨끗하게 빌드하고, 컴파일 경고를 오류처럼 다룬다.
6. QoS, 타임스탬프, rosbag 기록/재생, TF 트리를 통합 시험한다.
7. 실물 로봇에서는 저속·저토크 모드로 회귀 시험한다.

## A.3 Lyrical에서 주목할 기능

Lyrical에는 비동기 Python 노드 지원 개선, 이벤트 기반 실행기, `rosbag2` 제어 및 관측 기능 확장, 런타임 로깅 백엔드 선택 등 새 기능이 포함된다. 그러나 새 기능을 사용하기 위해 시스템 전체를 즉시 이식할 필요는 없다. 제품의 요구사항, 의존 패키지 준비 상태, 유지보수 기간을 함께 비교한다.

## 참고문헌

- ROS 2, [REP 2000: ROS 2 Releases and Target Platforms](https://www.ros.org/reps/rep-2000.html).
- ROS 2 Documentation, [Jazzy Jalisco Release Notes](https://docs.ros.org/en/jazzy/Releases/Release-Jazzy-Jalisco.html).
- ROS 2 Documentation, [Lyrical Luth Release Notes](https://docs.ros.org/en/rolling/Releases/Release-Lyrical-Luth.html).

