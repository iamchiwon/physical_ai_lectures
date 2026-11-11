# FC27. [6주 오프라인] Physical AI 로봇 제어 올인원 : ROS2부터 Isaac Sim 시뮬레이션·Sim2Real, 실물 로봇팔 완성까지

- 조사일: 2026-11-02 (KST)
- 분류: 핵심·오프라인
- 공식 강의 페이지: [[6주 오프라인] Physical AI 로봇 제어 올인원 : ROS2부터 Isaac Sim 시뮬레이션·Sim2Real, 실물 로봇팔 완성까지](<https://fastcampus.co.kr/data_thecamp_physicalai>)
- 공식 교육과정소개서 1: [PDF](<https://cdn.day1company.io/prod/uploads/202610/140455-1893/-패스트캠퍼스--교육과정소개서--6주-오프라인--physical-ai-로봇-제어-올인원---ros2부터-isaac-sim-시뮬레이션·sim2real,-실물-로봇팔-완성까지.pdf>)
- 확인 수준: 별도 아래 확인 범위 참고. 온라인 CLIP 목록이 없는 자료에 차시 수를 임의로 부여하지 않았습니다.

## 과정의 활용 방향

현재 교재와 가장 가까운 SO-101·Isaac Sim·LeRobot/SmolVLA 흐름이다. 기존 6장을 매니퓰레이션 통합 실습 트랙으로 재사용한다.

## 확인 가능한 세부 커리큘럼
공식 상세페이지의 주차별 설명과 교육과정소개서 PDF 5~7쪽을 대조했습니다. 차시 CLIP 대신 공개된 6주차 구조를 사용합니다. 강의 일정은 페이지상 2026-12-13~2027-01-17로 안내되어 있습니다.

### FC27-W01. 로보틱스·Physical AI와 Isaac Sim 생태계

- `FC27-W01-T01` 로보틱스·Physical AI의 전체 흐름과 로봇 개발 과정
- `FC27-W01-T02` Isaac Sim 생태계 — Omniverse·OpenUSD·PhysX·ROS 2의 연결 구조
- `FC27-W01-T03` Isaac Sim 기본 Stage 탐색과 Prim 생성·배치 실습
- `FC27-W01-T04` 로보틱스 입문 : Robot, Sensor, Controller, Environment 등 로봇 시스템의 기본 구성 요소
- `FC27-W01-T05` Physical AI : Perception–Policy–Action의 흐름과 Physical AI에서 시뮬레이션·데이터의 역할
- `FC27-W01-T06` 로봇 개발 흐름 : 환경 구성–시뮬레이션–로봇 제어–데이터 수집–학습–실물 적용의 전체 흐름
- `FC27-W01-T07` 시뮬레이션의 역할 : 로봇 개발에서 시뮬레이션이 필요한 이유와 주요 활용 방법
- `FC27-W01-T08` Isaac Sim 생태계 : Omniverse, OpenUSD, PhysX, ROS 2가 Isaac Sim과 연결되는 구조와 역할
- `FC27-W01-T09` OpenUSD 입문 : OpenUSD의 역할과 Stage, Prim, Asset의 기본 개념
- `FC27-W01-T10` ROS 2 입문 : ROS 2의 역할과 Node, Topic, Message, Publisher/Subscriber의 기본 개념
- `FC27-W01-T11` 개발 환경 안내 : Isaac Sim 인터페이스, Script Editor, Python 및 이후 실습에서 사용할 핵심 용어 안내
- `FC27-W01-T12` 실습 : Isaac Sim 기본 Stage를 탐색하고 Prim을 생성·배치하며 기본 인터페이스와 작업 흐름 익히기

### FC27-W02. Isaac Sim 작업 환경·USD·물리 설정

- `FC27-W02-T01` USD 구조와 공간 표현 — Stage·Prim 계층, Xform과 로컬·월드 좌표
- `FC27-W02-T02` 3D 에셋과 Scene 구성 — Mesh·Material·Light
- `FC27-W02-T03` Rigid Body·Collider·Physics Material로 기본 물리 설정
- `FC27-W02-T04` Isaac Sim 시뮬레이터 : Isaac Sim의 시뮬레이터 구성과 기본 작업 흐름
- `FC27-W02-T05` USD 구조 : Stage와 Prim, Prim 계층 구조 및 Property(Attribute·Relationship)
- `FC27-W02-T06` 공간 표현 : Xform, Transformation Matrix, 로컬·월드 좌표와 객체 배치
- `FC27-W02-T07` 3D 에셋 : Mesh의 Vertex·Face 구조, Material·Light와 Scene 구성
- `FC27-W02-T08` 시뮬레이션 시간 : Discrete Time, Physics Step과 Render Step의 차이
- `FC27-W02-T09` Rigid Body와 Collider : Rigid Body, Collider API와 Collider 종류 및 선택 기준
- `FC27-W02-T10` 충돌 처리 : Discrete Time에서의 충돌 누락과 CCD(Continuous Collision Detection)
- `FC27-W02-T11` 물리 속성 : Physics Material의 마찰·반발, Mass와 CoM(무게중심)
- `FC27-W02-T12` 개발 방식 : Script Editor, Standalone, Extension의 역할과 사용 방식
- `FC27-W02-T13` 실습 : SO-101과 작업물을 배치하고 Collider·Rigid Body 등 물리 속성을 설정하여 기본 시뮬레이션 환경 구성

### FC27-W03. SO-101·기구학·ROS 2 텔레오퍼레이션

- `FC27-W03-T01` Rigging·Joint로 SO-101 시뮬레이션 모델 구성
- `FC27-W03-T02` FK(순기구학)·IK(역기구학) 로봇 기구학 기초
- `FC27-W03-T03` ROS 2로 실물 SO-101 텔레옵과 시뮬레이터 로봇 제어
- `FC27-W03-T04` 시뮬레이션 시간 : Discrete Time, Physics Step과 Render Step의 차이
- `FC27-W03-T05` 강체와 충돌 ① : Rigid Body, Collider API, Collider의 종류와 선택 기준
- `FC27-W03-T06` 강체와 충돌 ② : Discrete Time에서의 충돌 누락과 CCD(Continuous Collision Detection)
- `FC27-W03-T07` 물리 속성 : Physics Material의 마찰·반발, CoM(무게중심)
- `FC27-W03-T08` 로봇 구성 : Rigging, Joint와 관절 구조, SO-101 시뮬레이션 모델 구성
- `FC27-W03-T09` FK와 IK : FK(순기구학) — 관절값에서 말단 자세 계산, IK(역기구학) — 말단 목표 자세에서 관절값 계산, 관절 한계와 해의 선택
- `FC27-W03-T10` ROS 2 기초 : Node, Topic, Publisher/Subscriber, Message, /joint_states 토픽에서 JointState 값 읽기와 제어 토픽 발행
- `FC27-W03-T11` 실물 SO-101 세팅 : 연결·모터 설정·캘리브레이션, Leader–Follower 통신
- `FC27-W03-T12` 텔레옵 : SO-101 기본 조작과 집기 동작 수행
- `FC27-W03-T13` 실습 : 실물 SO-101 텔레옵, /joint_states 구독과 명령 토픽 발행으로 시뮬레이터 로봇 제어

### FC27-W04. 카메라·TF·조건별 데이터 수집

- `FC27-W04-T01` 카메라 모델과 좌표계, TF tree로 보는 로봇·카메라 프레임 관계
- `FC27-W04-T02` 도메인 랜덤화와 재현 가능한 장면 생성
- `FC27-W04-T03` 조건별 텔레옵 에피소드 수집과 Rerun 시간축 검증
- `FC27-W04-T04` 카메라 모델 : Intrinsic Matrix와 Extrinsic Matrix
- `FC27-W04-T05` 카메라 좌표계 : USD·OpenCV·ROS 2 카메라의 XYZ 축 방향과 좌표 변환
- `FC27-W04-T06` TF tree : frame_id, /tf, /tf_static, 로봇·카메라 프레임 관계
- `FC27-W04-T07` 센서 출력 : RGB·Depth 등 센서 출력과 카메라·관절 상태의 타임스탬프
- `FC27-W04-T08` 화면 구성 : 조명, 렌더링, 카메라 시점 설정
- `FC27-W04-T09` 도메인 랜덤화 : 객체 위치·외형, 조명, 카메라 조건 등 DR 설정
- `FC27-W04-T10` 재현 가능한 생성 : 랜덤 시드와 장면 설정 기록, 동일 조건 재실행
- `FC27-W04-T11` 에피소드 수집 : 2~3개 작업 지시문별로 조건을 바꾸며 텔레옵 시연 수집
- `FC27-W04-T12` Rerun 사용법 : 에피소드의 카메라 영상·관절 상태·행동을 시간축에 맞춰 시각화
- `FC27-W04-T13` 실습 : 영상·로봇 상태·행동 명령·타임스탬프 동기화 기록

### FC27-W05. LeRobot v3·SmolVLA 학습·실물 실행

- `FC27-W05-T01` RL·IL부터 ACT·Diffusion Policy·VLA까지 로봇 학습 방법론
- `FC27-W05-T02` LeRobot Dataset v3 구성과 Replayer 검증
- `FC27-W05-T03` SmolVLA 추가 학습과 시뮬레이터·실물 SO-101 실행
- `FC27-W05-T04` 로봇 학습의 흐름 : 강화학습(RL)과 모방학습(IL), 텔레옵 시연 데이터의 역할
- `FC27-W05-T05` 행동 정책 연구 : ACT와 Action Chunking, Diffusion Policy 비교
- `FC27-W05-T06` VLA 연구 흐름 : VLA 개념과 RT-2·OpenVLA 등 대표 연구, WAM 연구 방향
- `FC27-W05-T07` SmolVLA : 영상·로봇 상태·자연어 지시문에서 행동 묶음을 예측하는 구조
- `FC27-W05-T08` LeRobot Dataset v3 : 지시문별 에피소드와 시점별 영상·상태·행동·시간 데이터 저장
- `FC27-W05-T09` ROS 2 적용 : Isaac Sim·실물 SO-101의 관절 상태·명령·카메라 데이터 연결
- `FC27-W05-T10` Replayer : 저장한 에피소드의 관측·행동을 시간순으로 재생하는 도구 구현
- `FC27-W05-T11` 추가 학습 : 수집한 SO-101 에피소드로 SmolVLA 추가 학습
- `FC27-W05-T12` 실행 : 학습한 정책을 시뮬레이터와 실물 SO-101에서 실행

### FC27-W06. 프로젝트 포트폴리오·면접 설명

- `FC27-W06-T01` 대기업 합격을 위한 로보틱스 분야 포트폴리오 구성법
- `FC27-W06-T02` 현업에서 포트폴리오를 볼 때 중요하게 확인하는 요소
- `FC27-W06-T03` 프로젝트를 면접에서 효과적으로 설명하는 방법
- `FC27-W06-T04` Physical AI·로보틱스 취업을 위해 준비하면 좋은 역량

### 원자료 점검 메모

웹페이지 1주차 과제 영역에는 온톨로지·Competency Question 관련 문장이 포함되어 있으나 주차 핵심 내용 및 PDF의 로봇 커리큘럼과 연결이 불명확합니다. 사이트 편집상의 혼입 가능성이 있어, 이를 Physical AI 필수 단원으로 자동 편입하지 않았습니다. PDF 5~7쪽의 주차별 주제를 우선했습니다. 현재 우리 교재의 6장 전체가 이 과정과 동일하다는 뜻은 아니며, 우리 교재는 Sim2Real·배포·평가 내용을 별도로 확장하고 있습니다.
