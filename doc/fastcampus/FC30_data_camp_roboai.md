# FC30. AI로봇 구현 CAMP

- 조사일: 2026-11-02 (KST)
- 분류: 이전·2020 CAMP
- 공식 강의 페이지: [AI로봇 구현 CAMP](<https://fastcampus.co.kr/data_camp_roboai>)
- 공식 교육과정소개서 1: [PDF](<https://cdn.day1company.io/prod/uploads/202007/115520-166/[패스트캠퍼스]-교육과정소개서-ai-로봇-구현-camp-2기.pdf>)
- 공식 교육과정소개서 2: [PDF](<https://cdn.day1company.io/prod/uploads/202004/122239-149/[%ED%8C%A8%EC%8A%A4%ED%8A%B8%EC%BA%A0%ED%8D%BC%EC%8A%A4]-%EA%B5%90%EC%9C%A1%EA%B3%BC%EC%A0%95%EC%86%8C%EA%B0%9C%EC%84%9C-ai-%EB%A1%9C%EB%B4%87-%EA%B5%AC%ED%98%84-camp-2%EA%B8%B0.pdf>)
- 확인 수준: 별도 아래 확인 범위 참고. 온라인 CLIP 목록이 없는 자료에 차시 수를 임의로 부여하지 않았습니다.

## 과정의 활용 방향

ROS 통신·URDF·비전 Pick-and-Place·SLAM·배달 로봇의 프로젝트 구조만 참고한다. Ubuntu 18.04·ROS1/2 혼용 환경을 신규 기본 환경으로 채택하지 않는다.

## 확인 가능한 세부 커리큘럼
교육과정소개서 PDF 2쪽에 2020-05-19~2020-08-08 및 Ubuntu 18.04가 명시되어 있어 역사적 과정으로 분류했습니다. 세부 교육 주제는 PDF 6~7쪽과 현재 남아 있는 공식 페이지에서 확인했습니다.

### FC30-P01. ROS 통신과 실행 환경

- 로봇 기술의 활용과 인간-로봇 공존 특강
- ROS 설치·환경 설정
- Turtlesim으로 노드 실행
- Message와 Topic 통신
- Service와 요청·응답
- Parameter Server
- Action과 양방향 피드백
- ROS1/ROS2 비교와 함께 사용하는 환경

### FC30-P02. 비전 기반 로봇팔 Pick-and-Place

- URDF 로봇 표현
- Open Manipulator 구동
- Gazebo 시뮬레이션
- Depth Camera와 영상 처리
- Universal Robots 활용
- ROS에 영상 인식 연결
- 인식 결과를 로봇팔의 집기·이동으로 연결
- PickIt 기반 Bin Picking 사례

### FC30-P03. 주행로봇 자율주행

- SLAM의 역할
- LiDAR 기반 지도 작성 패키지
- Visual SLAM 기반 위치 추정·지도 작성
- 영상 인식과 주행 연결
- 배달 로봇 패키지 프로젝트

과거의 장비·운영체제·패키지 버전을 현행 실습 기준으로 복사하지 않습니다. 이 자료는 프로젝트 구성의 역사적 참고 자료입니다.
