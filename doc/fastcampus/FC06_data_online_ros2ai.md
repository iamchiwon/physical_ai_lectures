# FC06. ROS 2 & AI 로 끝내는 자율주행 로봇 개발 올인원

- 조사일: 2026-11-02 (KST)
- 분류: 핵심·실물 모바일
- 공식 강의 페이지: [ROS 2 & AI 로 끝내는 자율주행 로봇 개발 올인원](<https://fastcampus.co.kr/data_online_ros2ai>)
- 공식 교육과정소개서 1: [PDF](<https://cdn.day1company.io/prod/uploads/202512/152553-2082/-패스트캠퍼스--교육과정소개서-ros-2---ai-로-끝내는-자율주행-로봇-개발-올인원.pdf>)
- 확인 수준: 공개 목차의 최하위 차시까지 확인. 6개 상위 묶음 / 25개 장 / 104개 CLIP 항목.
- 위 개수는 공개 목차 트리를 센 값입니다. 홍보 영역의 파트·클립 수, 영상 공개 여부, 실제 재생 가능한 수와 다를 수 있습니다.

## 과정의 활용 방향

조립·센서 처리·내비게이션·멀티모달 AI를 한 시스템으로 통합한다. Dev Academy Part 6~8과의 동일 목차를 중복 수업으로 만들지 않는다.

## 세부 커리큘럼

공식 페이지에 공개된 학습 주제의 순서를 정리했습니다. 번호·공백을 정규화했으며 강의 본문·영상·실습 해설을 재현한 자료가 아닙니다. 각 식별자는 통합안에서 원래 주제를 추적하기 위한 로컬 번호입니다.

### FC06-P01. 강의 소개 및 로봇 선정 가이드

#### FC06-P01-C01. Introduction

- `FC06-P01-C01-L001` 강의 커리큘럼 소개
- `FC06-P01-C01-L002` [구매 전 필독] 로봇 선정 및 구매 가이드
- `FC06-P01-C01-L003` MentorPi 소개
- `FC06-P01-C01-L004` MentorPi 충전 및 사용 가이드

### FC06-P02. 실물 모바일 로봇 조립부터 구동까지

#### FC06-P02-C01. 직접 조립하며 로봇 구성 요소 배우기

- `FC06-P02-C01-L001` 라즈베리파이5 SD 카드 이미지 준비하기
- `FC06-P02-C01-L002` 로봇 조립 및 배선 연결하기
- `FC06-P02-C01-L003` 로봇 상태 확인 및 제어하기 (App & 조이스틱 활용)

#### FC06-P02-C02. MentorPi 개발 환경 구성하기

- `FC06-P02-C02-L001` VNC Viewer 설치 (Windows Linux MacOS)
- `FC06-P02-C02-L002` 로봇 네트워크 환경 설정하기
- `FC06-P02-C02-L003` 라즈베리파이5 개발 환경 개요 및 구성하기
- `FC06-P02-C02-L004` Docker 개념 및 환경 알아보기

#### FC06-P02-C03. 운영체제 살펴보기: Linux와 Raspberry Pi OS 알아보기

- `FC06-P02-C03-L001` Linux 및 Raspberry Pi OS 이해하기
- `FC06-P02-C03-L002` Linux 필수 명령어

#### FC06-P02-C04. 모바일 로봇 구동 메커니즘 정복하기

- `FC06-P02-C04-L001` Ackermann Steering 방식 분석
- `FC06-P02-C04-L002` HolonomicOmni Drive 방식 분석
- `FC06-P02-C04-L003` Tank(궤도) 구동 방식 분석
- `FC06-P02-C04-L004` Differential Drive Skid Steering 방식 분석
- `FC06-P02-C04-L005` 모바일 로봇 속도제어 코드 분석 및 실습

### FC06-P03. 실물 로봇으로 ROS 2 끝장내기

#### FC06-P03-C01. Intro: What is ROS 2?

- `FC06-P03-C01-L001` ROS 2 개요
- `FC06-P03-C01-L002` Host PC에서 원격 개발 환경 구성하기

#### FC06-P03-C02. ROS 2 기초: Package, Launch, Node

- `FC06-P03-C02-L001` Package, Node, Launch 개요
- `FC06-P03-C02-L002` Package 실습
- `FC06-P03-C02-L003` Node 실습
- `FC06-P03-C02-L004` Launch 실습

#### FC06-P03-C03. ROS 2의 통신 방식 (1): Topic

- `FC06-P03-C03-L001` Topic & Interface 개요
- `FC06-P03-C03-L002` Topic & Interface 명령어
- `FC06-P03-C03-L003` Rviz2를 통한 Topic 시각화
- `FC06-P03-C03-L004` Topic Programming (1) - Publisher
- `FC06-P03-C03-L005` Topic Programming (2) - Subscriber
- `FC06-P03-C03-L006` Topic Programming (3) - Publisher & Subscriber
- `FC06-P03-C03-L007` Interface Programming - Topic

#### FC06-P03-C04. ROS 2의 통신 방식 (2): Service

- `FC06-P03-C04-L001` Service 개요
- `FC06-P03-C04-L002` Service 명령어
- `FC06-P03-C04-L003` Service Programming (1) - Client
- `FC06-P03-C04-L004` Service Programming (2) - Server
- `FC06-P03-C04-L005` Interface Programming - Service

#### FC06-P03-C05. 05. ROS 2의 통신 방식 (3): Action

- `FC06-P03-C05-L001` Action 개요
- `FC06-P03-C05-L002` Interface Programming - Action
- `FC06-P03-C05-L003` Action Programming (1) - Server
- `FC06-P03-C05-L004` Action 명령어
- `FC06-P03-C05-L005` Action Programming (2) - Client

#### FC06-P03-C06. ROS 2 디버깅

- `FC06-P03-C06-L001` ROS 2 환경에서 디버깅하는 방법들
- `FC06-P03-C06-L002` Logger
- `FC06-P03-C06-L003` RQt
- `FC06-P03-C06-L004` rosbag2

### FC06-P04. 실물 로봇으로 자율주행 센서 끝장내기

#### FC06-P04-C01. Remote Ubuntu PC 환경 구성하기

- `FC06-P04-C01-L001` Linux (Ubuntu) 사용자 가이드
- `FC06-P04-C01-L002` Windows 사용자 가이드
- `FC06-P04-C01-L003` MacOS 사용자 가이드
- `FC06-P04-C01-L004` ROS 2 Humble 설치하기

#### FC06-P04-C02. Encoder & IMU 그리고 Odometry

- `FC06-P04-C02-L001` Encoder 개요
- `FC06-P04-C02-L002` Odometry 개요
- `FC06-P04-C02-L003` IMU 개요
- `FC06-P04-C02-L004` IMU를 활용한 선형 속도 및 각속도 보정
- `FC06-P04-C02-L005` IMU 및 Odometry 데이터 분석

#### FC06-P04-C03. LiDAR

- `FC06-P04-C03-L001` LiDAR 개요
- `FC06-P04-C03-L002` (Project 1) LiDAR 단독 장애물 회피
- `FC06-P04-C03-L003` (Project 2) LiDAR 기반 Folllower
- `FC06-P04-C03-L004` (Project 3) LiDAR Guarding

#### FC06-P04-C04. Camera

- `FC06-P04-C04-L001` Camera 개요
- `FC06-P04-C04-L002` 색상 임계값 사전 설정
- `FC06-P04-C04-L003` (Project 1) 색상 인식
- `FC06-P04-C04-L004` (Project 2) QR 코드 생성 및 인식
- `FC06-P04-C04-L005` (Project 3) Line Follower
- `FC06-P04-C04-L006` (Project 4) Color Tracking + Visual Servoing
- `FC06-P04-C04-L007` (Project 5) Object Tracking + Visual Servoing

### FC06-P05. 실물 로봇으로 SLAM & Navigation 끝장내기

#### FC06-P05-C01. 자율주행 로봇을 위한 SLAM 기초

- `FC06-P05-C01-L001` SLAM 개요 및 선수 지식
- `FC06-P05-C01-L002` URDF (Unified Robot Description Format)

#### FC06-P05-C02. Mapping

- `FC06-P05-C02-L001` Mapping 알고리즘 개요
- `FC06-P05-C02-L002` Mapping을 위한 환경 구성
- `FC06-P05-C02-L003` SLAM Toolbox

#### FC06-P05-C03. Localization

- `FC06-P05-C03-L001` Localization 알고리즘 개요
- `FC06-P05-C03-L002` AMCL (Adaptive Monte Carlo Localization)

#### FC06-P05-C04. Nav 2 & Path Planning

- `FC06-P05-C04-L001` Nav2 개요
- `FC06-P05-C04-L002` Path Planning 개요 (DWB, TEB)
- `FC06-P05-C04-L003` Costmap 개요
- `FC06-P05-C04-L004` 실물 로봇 기반 자율주행
- `FC06-P05-C04-L005` Nav2를 활용한 Path Planning 방법들

#### FC06-P05-C05. 성능 향상을 위한 Nav2 파라미터 튜닝

- `FC06-P05-C05-L001` Planner 파라미터 튜닝
- `FC06-P05-C05-L002` Controller 파라미터 튜닝
- `FC06-P05-C05-L003` Smoother Server 파라미터 튜닝
- `FC06-P05-C05-L004` Behavior Server 파라미터 튜닝
- `FC06-P05-C05-L005` Costmap 파라미터 튜닝

#### FC06-P05-C06. 자율주행을 위한 Nav 2 프로그래밍

- `FC06-P05-C06-L001` Simple Commander API - Navigate To Pose
- `FC06-P05-C06-L002` Simple Commander API - Navigate Through Poses
- `FC06-P05-C06-L003` Simple Commander API - Follow Waypoints

### FC06-P06. 포트폴리오에 활용 가능한 실물 로봇 프로젝트

#### FC06-P06-C01. 인간과 로봇의 비전기반 상호작용

- `FC06-P06-C01-L001` Google MediaPipe 개요
- `FC06-P06-C01-L002` Google MediaPipe 실습 및 분석
- `FC06-P06-C01-L003` (Project 1) 틸팅 카메라를 활용한 Hand Follower
- `FC06-P06-C01-L004` (Project 2) Human Pose Estimation 기반 로봇 주행 제어
- `FC06-P06-C01-L005` (Project 3) Human Pose Estimation 기반 로봇 행동 제어

#### FC06-P06-C02. 라즈베리파이5에 YOLO11 활용하기

- `FC06-P06-C02-L001` Ultralytics & YOLO 개요
- `FC06-P06-C02-L002` Docker에서 Ultralytics 환경 구성하기
- `FC06-P06-C02-L003` Object Detection 실습
- `FC06-P06-C02-L004` YOLO 모델을 라즈베리파이5에 최적화하기
- `FC06-P06-C02-L005` Segmentation 실습
- `FC06-P06-C02-L006` Pose Estimation 실습

#### FC06-P06-C03. 모바일 로봇에서 LLM, VLM, LMM, VLA 활용하기

- `FC06-P06-C03-L001` LLM 개요 및 실습
- `FC06-P06-C03-L002` LMM, VLM, VLA 개요 및 실습
- `FC06-P06-C03-L003` (Project 1) LLM 기반 로봇 제어
- `FC06-P06-C03-L004` (Project 2) LLM 기반 로봇 Line Follower
- `FC06-P06-C03-L005` (Project 3) VLM 기반 로봇 상황 분석 기능 구현
- `FC06-P06-C03-L006` (Final Project) Nav2와 LMM을 이용한 스마트 홈 어시스턴트 로봇 구현

#### FC06-P06-C04. 개발자를 위한 취업·이직 가이드

- `FC06-P06-C04-L001` 여러분들의 포트폴리오가 매력 없는 이유
- `FC06-P06-C04-L002` 합격률을 높이기 위한 개발자 포트폴리오 전략
