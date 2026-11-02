# FC13. ROS 2 자율주행 로봇 Dev Academy Part 7. 실물 로봇 ROS 2 구현과 센서 데이터 처리

- 조사일: 2026-11-02 (KST)
- 분류: 분할·Dev Academy 7
- 공식 강의 페이지: [ROS 2 자율주행 로봇 Dev Academy Part 7. 실물 로봇 ROS 2 구현과 센서 데이터 처리](<https://fastcampus.co.kr/data_online_realrobotros2>)
- 공식 교육과정소개서 1: [PDF](<https://cdn.day1company.io/prod/uploads/202604/185602-1893/-패스트캠퍼스--교육과정소개서-ros-2-자율주행-로봇-dev-acadmey-part-7.-실물-로봇-ros-2-구현과-센서-데이터-처리.pdf>)
- 확인 수준: 공개 목차의 최하위 차시까지 확인. 3개 상위 묶음 / 16개 장 / 67개 CLIP 항목.
- 위 개수는 공개 목차 트리를 센 값입니다. 홍보 영역의 파트·클립 수, 영상 공개 여부, 실제 재생 가능한 수와 다를 수 있습니다.

## 과정의 활용 방향

Encoder·IMU·LiDAR·Camera와 SLAM/Nav2 파이프라인을 실제 센서 데이터 트랙으로 통합한다.

## 세부 커리큘럼

공식 페이지에 공개된 학습 주제의 순서를 정리했습니다. 번호·공백을 정규화했으며 강의 본문·영상·실습 해설을 재현한 자료가 아닙니다. 각 식별자는 통합안에서 원래 주제를 추적하기 위한 로컬 번호입니다.

### FC13-P01. 실물 로봇으로 ROS 2 끝장내기

#### FC13-P01-C01. Intro: What is ROS 2?

- `FC13-P01-C01-L001` ROS 2 개요
- `FC13-P01-C01-L002` Host PC에서 원격 개발 환경 구성하기

#### FC13-P01-C02. ROS 2 기초: Package, Launch, Node

- `FC13-P01-C02-L001` Package, Node, Launch 개요
- `FC13-P01-C02-L002` Package 실습
- `FC13-P01-C02-L003` Node 실습
- `FC13-P01-C02-L004` Launch 실습

#### FC13-P01-C03. ROS 2의 통신 방식 (1): Topic

- `FC13-P01-C03-L001` Topic & Interface 개요
- `FC13-P01-C03-L002` Topic & Interface 명령어
- `FC13-P01-C03-L003` Rviz2를 통한 Topic 시각화
- `FC13-P01-C03-L004` Topic Programming (1) - Publisher
- `FC13-P01-C03-L005` Topic Programming (2) - Subscriber
- `FC13-P01-C03-L006` Topic Programming (3) - Publisher & Subscriber
- `FC13-P01-C03-L007` Interface Programming - Topic

#### FC13-P01-C04. ROS 2의 통신 방식 (2): Service

- `FC13-P01-C04-L001` Service 개요
- `FC13-P01-C04-L002` Service 명령어
- `FC13-P01-C04-L003` Service Programming (1) - Client
- `FC13-P01-C04-L004` Service Programming (2) - Server
- `FC13-P01-C04-L005` Interface Programming - Service

#### FC13-P01-C05. 05. ROS 2의 통신 방식 (3): Action

- `FC13-P01-C05-L001` Action 개요
- `FC13-P01-C05-L002` Interface Programming - Action
- `FC13-P01-C05-L003` Action Programming (1) - Server
- `FC13-P01-C05-L004` Action 명령어
- `FC13-P01-C05-L005` Action Programming (2) - Client

#### FC13-P01-C06. ROS 2 디버깅

- `FC13-P01-C06-L001` ROS 2 환경에서 디버깅하는 방법들
- `FC13-P01-C06-L002` Logger
- `FC13-P01-C06-L003` RQt
- `FC13-P01-C06-L004` rosbag2

### FC13-P02. 실물 로봇으로 자율주행 센서 끝장내기

#### FC13-P02-C01. Remote Ubuntu PC 환경 구성하기

- `FC13-P02-C01-L001` Linux (Ubuntu) 사용자 가이드
- `FC13-P02-C01-L002` Windows 사용자 가이드
- `FC13-P02-C01-L003` MacOS 사용자 가이드
- `FC13-P02-C01-L004` ROS 2 Humble 설치하기

#### FC13-P02-C02. Encoder & IMU 그리고 Odometry

- `FC13-P02-C02-L001` Encoder 개요
- `FC13-P02-C02-L002` Odometry 개요
- `FC13-P02-C02-L003` IMU 개요
- `FC13-P02-C02-L004` IMU를 활용한 선형 속도 및 각속도 보정
- `FC13-P02-C02-L005` IMU 및 Odometry 데이터 분석

#### FC13-P02-C03. LiDAR

- `FC13-P02-C03-L001` LiDAR 개요
- `FC13-P02-C03-L002` (Project 1) LiDAR 단독 장애물 회피
- `FC13-P02-C03-L003` (Project 2) LiDAR 기반 Folllower
- `FC13-P02-C03-L004` (Project 3) LiDAR Guarding

#### FC13-P02-C04. Camera

- `FC13-P02-C04-L001` Camera 개요
- `FC13-P02-C04-L002` 색상 임계값 사전 설정
- `FC13-P02-C04-L003` (Project 1) 색상 인식
- `FC13-P02-C04-L004` (Project 2) QR 코드 생성 및 인식
- `FC13-P02-C04-L005` (Project 3) Line Follower
- `FC13-P02-C04-L006` (Project 4) Color Tracking + Visual Servoing
- `FC13-P02-C04-L007` (Project 5) Object Tracking + Visual Servoing

### FC13-P03. 실물 로봇으로 SLAM & Navigation 끝장내기

#### FC13-P03-C01. 자율주행 로봇을 위한 SLAM 기초

- `FC13-P03-C01-L001` SLAM 개요 및 선수 지식
- `FC13-P03-C01-L002` URDF (Unified Robot Description Format)

#### FC13-P03-C02. Mapping

- `FC13-P03-C02-L001` Mapping 알고리즘 개요
- `FC13-P03-C02-L002` Mapping을 위한 환경 구성
- `FC13-P03-C02-L003` SLAM Toolbox

#### FC13-P03-C03. Localization

- `FC13-P03-C03-L001` Localization 알고리즘 개요
- `FC13-P03-C03-L002` AMCL (Adaptive Monte Carlo Localization)

#### FC13-P03-C04. Nav 2 & Path Planning

- `FC13-P03-C04-L001` Nav2 개요
- `FC13-P03-C04-L002` Path Planning 개요 (DWB, TEB)
- `FC13-P03-C04-L003` Costmap 개요
- `FC13-P03-C04-L004` 실물 로봇 기반 자율주행
- `FC13-P03-C04-L005` Nav2를 활용한 Path Planning 방법들

#### FC13-P03-C05. 성능 향상을 위한 Nav2 파라미터 튜닝

- `FC13-P03-C05-L001` Planner 파라미터 튜닝
- `FC13-P03-C05-L002` Controller 파라미터 튜닝
- `FC13-P03-C05-L003` Smoother Server 파라미터 튜닝
- `FC13-P03-C05-L004` Behavior Server 파라미터 튜닝
- `FC13-P03-C05-L005` Costmap 파라미터 튜닝

#### FC13-P03-C06. 자율주행을 위한 Nav 2 프로그래밍

- `FC13-P03-C06-L001` Simple Commander API - Navigate To Pose
- `FC13-P03-C06-L002` Simple Commander API - Navigate Through Poses
- `FC13-P03-C06-L003` Simple Commander API - Follow Waypoints
