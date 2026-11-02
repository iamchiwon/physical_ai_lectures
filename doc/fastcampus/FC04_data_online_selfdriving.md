# FC04. 자율주행 로봇을 위한 ROS 2 & SLAM & Nav2 한번에 끝내기

- 조사일: 2026-11-02 (KST)
- 분류: 핵심·모바일
- 공식 강의 페이지: [자율주행 로봇을 위한 ROS 2 & SLAM & Nav2 한번에 끝내기](<https://fastcampus.co.kr/data_online_selfdriving>)
- 공식 교육과정소개서 1: [PDF](<https://cdn.day1company.io/prod/uploads/202501/150246-1154/-패스트캠퍼스--교육과정소개서-자율주행-로봇을-위한-ros-2---nav-2-한번에-끝내기.pdf>)
- 확인 수준: 공개 목차의 최하위 차시까지 확인. 5개 상위 묶음 / 23개 장 / 76개 CLIP 항목.
- 위 개수는 공개 목차 트리를 센 값입니다. 홍보 영역의 파트·클립 수, 영상 공개 여부, 실제 재생 가능한 수와 다를 수 있습니다.

## 과정의 활용 방향

ROS 2·SLAM·Nav2 기본 흐름과 Behavior Tree·다중 로봇을 모바일 트랙으로 배치한다. 아래 분할 강의와 중복 확인이 필요하다.

## 세부 커리큘럼

공식 페이지에 공개된 학습 주제의 순서를 정리했습니다. 번호·공백을 정규화했으며 강의 본문·영상·실습 해설을 재현한 자료가 아닙니다. 각 식별자는 통합안에서 원래 주제를 추적하기 위한 로컬 번호입니다.

### FC04-P01. 로보틱스 엔지니어를 위한 초기 개발 환경 구성

#### FC04-P01-C01. Introduction

- `FC04-P01-C01-L001` 강의 커리큘럼 소개

#### FC04-P01-C02. 운영체제 살펴보기 : 리눅스와 Ubuntu 알아보기

- `FC04-P01-C02-L001` Linux 이해하기
- `FC04-P01-C02-L002` [실습] Linux 필수 명령어

#### FC04-P01-C03. 개발 도구 설치하기 : Terminal, Visual Studio, Extension

- `FC04-P01-C03-L001` [실습] Terminal (terminator, zsh, htop 등)
- `FC04-P01-C03-L002` [실습] Visual Studio Code 및 Extension

#### FC04-P01-C04. ROS 2 설치 및 환경 구성 : A Step-by-Step Guide

- `FC04-P01-C04-L001` [실습] ROS 2 Humble 설치하기
- `FC04-P01-C04-L002` [실습] Workspace 생성하기

### FC04-P02. ROS 2 : 로보틱스 엔지니어링 기초

#### FC04-P02-C01. Intro : What is ROS 2?

- `FC04-P02-C01-L001` ROS 2 개요
- `FC04-P02-C01-L002` [실습] 시뮬레이션 환경 구성하기

#### FC04-P02-C02. ROS 2 기초 : Package, Launch, Node

- `FC04-P02-C02-L001` Package, Node, Launch 개요
- `FC04-P02-C02-L002` [실습] Package
- `FC04-P02-C02-L003` [실습] Node
- `FC04-P02-C02-L004` [실습] Launch

#### FC04-P02-C03. ROS 2의 통신 방식 (1) : Topic

- `FC04-P02-C03-L001` Topic & Interface 개요
- `FC04-P02-C03-L002` [실습] Topic & Interface 명령어
- `FC04-P02-C03-L003` [실습] Topic Programming (1) Publisher
- `FC04-P02-C03-L004` [실습] Topic Programming (2) Subscriber
- `FC04-P02-C03-L005` [실습] Topic Programming (3) Publisher & Subscriber
- `FC04-P02-C03-L006` [실습] Interface Programming - Topic

#### FC04-P02-C04. ROS 2의 통신 방식 (2) : Service

- `FC04-P02-C04-L001` Service 개요
- `FC04-P02-C04-L002` [실습] Service 명령어
- `FC04-P02-C04-L003` [실습] Service Programming (1) Client
- `FC04-P02-C04-L004` [실습] Service Programming (2) Server
- `FC04-P02-C04-L005` [실습] Interface Programming Service

#### FC04-P02-C05. ROS 2의 통신 방식 (3) : Action

- `FC04-P02-C05-L001` Action 개요
- `FC04-P02-C05-L002` [실습] Action 명령어
- `FC04-P02-C05-L003` [실습] Action Programming (1) Client
- `FC04-P02-C05-L004` [실습] Action Programming (2) Server
- `FC04-P02-C05-L005` [실습] Interface Programming Action

#### FC04-P02-C06. ROS 2 심화 : Node Programming

- `FC04-P02-C06-L001` [실습] Node Programming 시, 꼭 마주치는 문제 분석하기
- `FC04-P02-C06-L002` Executor & Callback Group
- `FC04-P02-C06-L003` [실습] 적절한 Callback Group 사용 전략

#### FC04-P02-C07. ROS 2 디버깅

- `FC04-P02-C07-L001` ROS 2 환경에서 디버깅하는 방법들
- `FC04-P02-C07-L002` [실습] Logger
- `FC04-P02-C07-L003` [실습] Rviz2
- `FC04-P02-C07-L004` [실습] RQt
- `FC04-P02-C07-L005` [실습] rosbag2

### FC04-P03. SLAM : 로봇이 주변 환경을 인식하고 위치를 추정하는 방법

#### FC04-P03-C01. 자율주행 로봇을 위한 SLAM 기초

- `FC04-P03-C01-L001` SLAM 개요 및 선수 지식
- `FC04-P03-C01-L002` 모바일 로봇을 위한 Odometry

#### FC04-P03-C02. Mapping

- `FC04-P03-C02-L001` Mapping 개요
- `FC04-P03-C02-L002` [실습] Cartographer SLAM
- `FC04-P03-C02-L003` [실습] 작성한 지도 저장하기
- `FC04-P03-C02-L004` 작성한 지도 수정 전략 및 다른 프로세스에서 활용 방법
- `FC04-P03-C02-L005` Nav2 Lifecycle Manager
- `FC04-P03-C02-L006` [실습] Lifecycle Manager 서비스 테스트

#### FC04-P03-C03. Localization

- `FC04-P03-C03-L001` Localization 개요
- `FC04-P03-C03-L002` [실습] AMCL (Adaptive Monte Carlo Localization)

#### FC04-P03-C04. SLAM 심화 그리고 적용

- `FC04-P03-C04-L001` [실습] SLAM 파리미터 튜닝 전략
- `FC04-P03-C04-L002` [실습] AMCL 기반의 로봇 초기 위치 추정 전략
- `FC04-P03-C04-L003` [실습] Global Localization 전략
- `FC04-P03-C04-L004` SLAM을 위한 센서 그리고 활용 전략
- `FC04-P03-C04-L005` [실습] RGB-D Visual SLAM
- `FC04-P03-C04-L006` SLAM에서의 Ground Truth

### FC04-P04. Navigation : 로봇의 경로 계획 그리고 장애물 회피

#### FC04-P04-C01. Nav2 & Path Planning 개요

- `FC04-P04-C01-L001` Nav2 개요
- `FC04-P04-C01-L002` Path Planning 개요
- `FC04-P04-C01-L003` [실습] Nav2를 활용한 Path Planning 방법들

#### FC04-P04-C02. Planner, Controller, Smoother Server

- `FC04-P04-C02-L001` [실습] Planner Parameter Tuning
- `FC04-P04-C02-L002` [실습] Controller Parameter Tuning
- `FC04-P04-C02-L003` [실습] Smoother Server Parameter Tuning

#### FC04-P04-C03. Behavior Server, Behavior-Tree Navigator

- `FC04-P04-C03-L001` [실습] Behavior Server Parameter Tuning
- `FC04-P04-C03-L002` [실습] BT Navigator Parameter Tuning

#### FC04-P04-C04. 장애물 회피 그리고 Costmap

- `FC04-P04-C04-L001` Costmap 개요
- `FC04-P04-C04-L002` [실습] Global Costmap, Local Costmap 그리고 Layer
- `FC04-P04-C04-L003` [실습] Costmap Parameter Tuning

### FC04-P05. 실무 적용을 위한 Nav2 심화 그리고 응용

#### FC04-P05-C01. Behavior Tree (BT)

- `FC04-P05-C01-L001` Behavior Tree 개요
- `FC04-P05-C01-L002` [실습] BT 이해를 위한 간단한 프로그래밍
- `FC04-P05-C01-L003` [실습] Nav2와 연동하여 BT 사용하기

#### FC04-P05-C02. 멀티 로봇 시스템

- `FC04-P05-C02-L001` 멀티 로봇 시스템 이해를 위한 Namespace 개요
- `FC04-P05-C02-L002` [실습] TF 공유 유무에 따른 멀티 로봇 시스템

#### FC04-P05-C03. 자율주행을 위한 Nav2 프로그래밍

- `FC04-P05-C03-L001` [실습] AMR과 물류 창고 시뮬레이션 환경 구성하기
- `FC04-P05-C03-L002` [실습] Simple Commander API - Navigate To Pose
- `FC04-P05-C03-L003` [실습] Simple Commander API - Navigate Through Poses
- `FC04-P05-C03-L004` [실습] Simple Commander API - Follow Waypoints

#### FC04-P05-C04. 특수한 상황을 위한 유용한 기능들

- `FC04-P05-C04-L001` Costmap Filters
- `FC04-P05-C04-L002` [실습] Keepout Filter 활용 (접근 금지 구역)
- `FC04-P05-C04-L003` [실습] Speed Filter 활용 (속도 제한 구역)
