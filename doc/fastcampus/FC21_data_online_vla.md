# FC21. 피지컬 AI 개발을 위한 VLA & 로봇 특화 LLM 한번에 끝내기

- 조사일: 2026-11-02 (KST)
- 분류: 핵심·VLA/LLM
- 공식 강의 페이지: [피지컬 AI 개발을 위한 VLA & 로봇 특화 LLM 한번에 끝내기](<https://fastcampus.co.kr/data_online_vla>)
- 공식 교육과정소개서 1: [PDF](<https://cdn.day1company.io/prod/uploads/202602/143426-2083/-패스트캠퍼스--교육과정소개서-피지컬-ai-개발을-위한-vla---로봇-특화-llm-한번에-끝내기.pdf>)
- 확인 수준: 공개 목차의 최하위 차시까지 확인. 6개 상위 묶음 / 21개 장 / 88개 CLIP 항목.
- 위 개수는 공개 목차 트리를 센 값입니다. 홍보 영역의 파트·클립 수, 영상 공개 여부, 실제 재생 가능한 수와 다를 수 있습니다.

## 과정의 활용 방향

LLM 계획·도구 연결과 실제 행동 정책 VLA를 구분한다. MuJoCo·ROS 2·로컬 모델·SmolVLA 및 모바일/팔 사례를 보존한다.

## 세부 커리큘럼

공식 페이지에 공개된 학습 주제의 순서를 정리했습니다. 번호·공백을 정규화했으며 강의 본문·영상·실습 해설을 재현한 자료가 아닙니다. 각 식별자는 통합안에서 원래 주제를 추적하기 위한 로컬 번호입니다.

### FC21-P01. MuJoCo

#### FC21-P01-C01. Ubuntu에서 mujoco 설치 및 간단 투토리얼

- `FC21-P01-C01-L001` 강의 전체 흐름 소개
- `FC21-P01-C01-L002` 윈도우에서 MuJoCo 설치
- `FC21-P01-C01-L003` Ubuntu에서 MuJoCo 설치
- `FC21-P01-C01-L004` MuJoCo 실행해서 로봇 구동해보기

#### FC21-P01-C02. MuJoCo에 로봇 런칭하는 법 및 로봇 구성법

- `FC21-P01-C02-L001` Python으로 접근하는 MuJoCo 시뮬레이션 기본 설정
- `FC21-P01-C02-L002` Python으로 접근하는 MuJoCo 시뮬레이션 기본 설정 실제 코드 구동
- `FC21-P01-C02-L003` Pendulum 시뮬레이션으로 물리엔진 이해해보기
- `FC21-P01-C02-L004` MuJoCo에서 상태를 관찰하기 위해 그래프로 표현해보기
- `FC21-P01-C02-L005` Inverted Pendulum 구성
- `FC21-P01-C02-L006` MuJoCo와 같은 시뮬레이션에서 상태를 관찰하기 위해 노력하기
- `FC21-P01-C02-L007` MuJoCo에서 상태를 제어하는 과정을 Inverted Pendulum으로 경험하기

#### FC21-P01-C03. MuJoCo에 로봇 런칭 및 환경 구성법

- `FC21-P01-C03-L001` MuJoCo에서 주행로봇 구성하기
- `FC21-P01-C03-L002` MuJoCo에서 구성된 주행로봇 실행 및 코드 관찰

### FC21-P02. 사람과 로봇을 연결하기 위한 LLM

#### FC21-P02-C01. 로봇 구동 명령 생성을 위한 prompt engineering

- `FC21-P02-C01-L001` LLM과 프롬프트 엔지니어링 소개
- `FC21-P02-C01-L002` OpenAI API 사용 준비 및 Python 환경에서 접근하기
- `FC21-P02-C01-L003` Python에서 OpenAI API를 이용해서 프롬프트 시작하기
- `FC21-P02-C01-L004` Prompt 엔지니어링 Tutorials
- `FC21-P02-C01-L005` YOLO와 LLM을 연결하기 위한 준비
- `FC21-P02-C01-L006` YOLO의 결과를 LLM에서 해석하기 위한 Prompt 작업
- `FC21-P02-C01-L007` YOLO의 결과를 LLM에서 해석하기 위한 Prompt 작업 코드 실행

#### FC21-P02-C02. Ollama를 활용한 LLM 사용법

- `FC21-P02-C02-L001` Ollama 설치 및 환경 세팅
- `FC21-P02-C02-L002` LLM 모델 로컬 구동
- `FC21-P02-C02-L003` Python에서 OLLAMA 사용하기

#### FC21-P02-C03. 이미 훈련된 모델의 fine tuning

- `FC21-P02-C03-L001` Fine Tuning을 위한 데이터 생성
- `FC21-P02-C03-L002` LLM 모델 Fine Tuning

### FC21-P03. VLA Vision Language Action Model

#### FC21-P03-C01. 주행로봇을 이용한 SIMPLE VLA 구현해보기

- `FC21-P03-C01-L001` Simple VLA를 통한 VLA 기본
- `FC21-P03-C01-L002` MuJoCo에서 YOLO를 주행로봇 영상에 접목 컨셉 설명
- `FC21-P03-C01-L003` MuJoCo에서 YOLO를 주행로봇 영상에 접목 코드
- `FC21-P03-C01-L004` Simple VLA를 구성하기 위한 LLM Chain 구성
- `FC21-P03-C01-L005` 비젼 정보와 사용자의 지시를 해석한 주행로봇의 VLA 구현

#### FC21-P03-C02. 오픈소스 VLA 모델 소개

- `FC21-P03-C02-L001` 오픈소스 VLA 모델 소개

#### FC21-P03-C03. Smol VLA를 활용한 로봇팔

- `FC21-P03-C03-L001` Smol VLA 구동을 위한 환경 설정
- `FC21-P03-C03-L002` Smol VLA 로봇팔 모방학습 투토리얼

### FC21-P04. ROS2의 자율주행과 VLA를 연결해보자

#### FC21-P04-C01. ROS2 기초

- `FC21-P04-C01-L001` ROS2 설치 및 bashrc 설정
- `FC21-P04-C01-L002` alias 설정
- `FC21-P04-C01-L003` ROS2 package build and alias
- `FC21-P04-C01-L004` ROS2 topic publisher
- `FC21-P04-C01-L005` ROS2 topic subscriber
- `FC21-P04-C01-L006` ROS2 service
- `FC21-P04-C01-L007` ROS2 launch

#### FC21-P04-C02. ROS2 SLAM / Nav2 기초

- `FC21-P04-C02-L001` SLAM 구동을 위한 패키지 다운로드 및 설치
- `FC21-P04-C02-L002` SLAM 구동을 위한 패키지 다운로드 및 설치 시연
- `FC21-P04-C02-L003` SLAM 구동을 위한 패키지 실행해보기 및 맵 만들기
- `FC21-P04-C02-L004` SLAM 패키지 구성 코드 부분 설명
- `FC21-P04-C02-L005` Navigation PKG 구동하기
- `FC21-P04-C02-L006` Navigation PKG 구동 실습

#### FC21-P04-C03. LLM이 SLAM에서 장소를 인식하게 Prompt 적용

- `FC21-P04-C03-L001` LLM 모델과 Nav2을 연결하기 위한 Gazebo 구성 및 Nav2 환경 변수 설정
- `FC21-P04-C03-L002` LLM과 Nav2 연결을 위한 장소 맵핑 및 LLM ROS2 서비스 서버 및 클라이언트 선언
- `FC21-P04-C03-L003` 자연어로 “여기는 연구실, 저기는 회의실” 인식하게 하기
- `FC21-P04-C03-L004` 장소와 비전인식을 통합하는 명령에 대한 LLM 적용

### FC21-P05. Mini Project

#### FC21-P05-C01. 행동복제를 이용한 자율주행

- `FC21-P05-C01-L001` 행동복제 개요
- `FC21-P05-C01-L002` 행동복제를 위한 환경 설정
- `FC21-P05-C01-L003` 행동복제 데이터 수집
- `FC21-P05-C01-L004` 행동복제 데이터 학습 및 추론

#### FC21-P05-C02. 반려로봇만들기

- `FC21-P05-C02-L001` 감정기반 대화시스템을 갖춘 반려로봇 만들기
- `FC21-P05-C02-L002` LED 구현 함수
- `FC21-P05-C02-L003` LCD, 카메라, 모터 구현 함수
- `FC21-P05-C02-L004` LLM을 활용한 로봇의 감정 표현
- `FC21-P05-C02-L005` 웹브라우저를 통한 서비스 구현

#### FC21-P05-C03. 로컬 LLM에서 아두이노 다루기

- `FC21-P05-C03-L001` Ollama부터 만나요
- `FC21-P05-C03-L002` LOCAL PC에서 아두이노의 LED를 제어하기
- `FC21-P05-C03-L003` 소형 모델의 성능을 확보하기 위한 시나리오 구현하기

#### FC21-P05-C04. 실제 라즈베리파이에 LLM 모델 탑재에 대한 이야기

- `FC21-P05-C04-L001` 소형 모델들을 라즈베리파이에 탑재한 후기
- `FC21-P05-C04-L002` 소형 모델들을 라즈베리파이에 탑재하고 테스트한 결과 후기
- `FC21-P05-C04-L003` 임베딩 모델을 라즈베리파이에 탑재하고 테스트한 결과 후기

### FC21-P06. ROS2 심층 분석

#### FC21-P06-C01. 주행로봇 ROS2 Description PKG의 이해

- `FC21-P06-C01-L001` 파트시작을 위한 환경 구축
- `FC21-P06-C01-L002` Description PKG의 기본 구조와 view launch의 구조
- `FC21-P06-C01-L003` Desc. PKG내의 robot.urdf.xacro 구조
- `FC21-P06-C01-L004` 주행로봇의 일반적인 link-joint 구조
- `FC21-P06-C01-L005` Upload launch의 역할과 rviz2 환경 사용하기

#### FC21-P06-C02. 주행로봇 ROS2 GAZEBO 패키지의 이해

- `FC21-P06-C02-L001` 주행로봇의 Gazebo PKG 구성
- `FC21-P06-C02-L002` 가제보에서 센서와 구동부 설정

#### FC21-P06-C03. 주헹로봇 ROS2 Navigation 패키지의 이해

- `FC21-P06-C03-L001` SLAM toolbox 설정
- `FC21-P06-C03-L002` ACML 설정 및 파라미터 설명
- `FC21-P06-C03-L003` Nav2의 Controller Server 설정
- `FC21-P06-C03-L004` Nav2에서 Velocipy Smoother, planner server 설정
- `FC21-P06-C03-L005` Waypoint Follower와 BT 설정
- `FC21-P06-C03-L006` Nav2 Navigation 실행해보기

#### FC21-P06-C04. 로봇팔 ROS2에서 다루기

- `FC21-P06-C04-L001` Moveit 환경설정
- `FC21-P06-C04-L002` Moveit assistant 설정하기
- `FC21-P06-C04-L003` Moveit demo 동작
- `FC21-P06-C04-L004` Moveit python으로 동작

#### FC21-P06-C05. 행동복제와 ACT 개념 익히기

- `FC21-P06-C05-L001` 행동복제 개념
- `FC21-P06-C05-L002` 행동복제 학습 결과
- `FC21-P06-C05-L003` 행동복제의 한계
- `FC21-P06-C05-L004` DAgger의 개념
- `FC21-P06-C05-L005` ACT 개념 이야기
- `FC21-P06-C05-L006` ACT 학습
