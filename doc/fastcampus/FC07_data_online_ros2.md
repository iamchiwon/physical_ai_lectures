# FC07. ROS 2 자율주행 로봇 Dev Academy Part 1. 개발 환경 및 ROS 2 Basic

- 조사일: 2026-11-02 (KST)
- 분류: 분할·Dev Academy 1
- 공식 강의 페이지: [ROS 2 자율주행 로봇 Dev Academy Part 1. 개발 환경 및 ROS 2 Basic](<https://fastcampus.co.kr/data_online_ros2>)
- 공식 교육과정소개서 1: [PDF](<https://cdn.day1company.io/prod/uploads/202604/182640-1893/-패스트캠퍼스--교육과정소개서-ros-2-자율주행-로봇-dev-acadmey-part-1.-개발-환경-및-ros-2-basic.pdf>)
- 확인 수준: 공개 목차의 최하위 차시까지 확인. 2개 상위 묶음 / 11개 장 / 37개 CLIP 항목.
- 위 개수는 공개 목차 트리를 센 값입니다. 홍보 영역의 파트·클립 수, 영상 공개 여부, 실제 재생 가능한 수와 다를 수 있습니다.

## 과정의 활용 방향

공통 개발 환경·ROS 2 코어로 합친다. 종합 강의의 동일 수업을 다시 수강하도록 설계하지 않는다.

## 세부 커리큘럼

공식 페이지에 공개된 학습 주제의 순서를 정리했습니다. 번호·공백을 정규화했으며 강의 본문·영상·실습 해설을 재현한 자료가 아닙니다. 각 식별자는 통합안에서 원래 주제를 추적하기 위한 로컬 번호입니다.

### FC07-P01. 로보틱스 엔지니어를 위한 초기 개발 환경 구성

#### FC07-P01-C01. Introduction

- `FC07-P01-C01-L001` 강의 커리큘럼 소개

#### FC07-P01-C02. 운영체제 살펴보기 : 리눅스와 Ubuntu 알아보기

- `FC07-P01-C02-L001` Linux 이해하기
- `FC07-P01-C02-L002` [실습] Linux 필수 명령어

#### FC07-P01-C03. 개발 도구 설치하기 : Terminal, Visual Studio, Extension

- `FC07-P01-C03-L001` [실습] Terminal (terminator, zsh, htop 등)
- `FC07-P01-C03-L002` [실습] Visual Studio Code 및 Extension

#### FC07-P01-C04. ROS 2 설치 및 환경 구성 : A Step-by-Step Guide

- `FC07-P01-C04-L001` [실습] ROS 2 Humble 설치하기
- `FC07-P01-C04-L002` [실습] Workspace 생성하기

### FC07-P02. ROS 2 : 로보틱스 엔지니어링 기초

#### FC07-P02-C01. Intro : What is ROS 2?

- `FC07-P02-C01-L001` ROS 2 개요
- `FC07-P02-C01-L002` [실습] 시뮬레이션 환경 구성하기

#### FC07-P02-C02. ROS 2 기초 : Package, Launch, Node

- `FC07-P02-C02-L001` Package, Node, Launch 개요
- `FC07-P02-C02-L002` [실습] Package
- `FC07-P02-C02-L003` [실습] Node
- `FC07-P02-C02-L004` [실습] Launch

#### FC07-P02-C03. ROS 2의 통신 방식 (1) : Topic

- `FC07-P02-C03-L001` Topic & Interface 개요
- `FC07-P02-C03-L002` [실습] Topic & Interface 명령어
- `FC07-P02-C03-L003` [실습] Topic Programming (1) Publisher
- `FC07-P02-C03-L004` [실습] Topic Programming (2) Subscriber
- `FC07-P02-C03-L005` [실습] Topic Programming (3) Publisher & Subscriber
- `FC07-P02-C03-L006` [실습] Interface Programming - Topic

#### FC07-P02-C04. ROS 2의 통신 방식 (2) : Service

- `FC07-P02-C04-L001` Service 개요
- `FC07-P02-C04-L002` [실습] Service 명령어
- `FC07-P02-C04-L003` [실습] Service Programming (1) Client
- `FC07-P02-C04-L004` [실습] Service Programming (2) Server
- `FC07-P02-C04-L005` [실습] Interface Programming Service

#### FC07-P02-C05. ROS 2의 통신 방식 (3) : Action

- `FC07-P02-C05-L001` Action 개요
- `FC07-P02-C05-L002` [실습] Action 명령어
- `FC07-P02-C05-L003` [실습] Action Programming (1) Client
- `FC07-P02-C05-L004` [실습] Action Programming (2) Server
- `FC07-P02-C05-L005` [실습] Interface Programming Action

#### FC07-P02-C06. ROS 2 심화 : Node Programming

- `FC07-P02-C06-L001` [실습] Node Programming 시, 꼭 마주치는 문제 분석하기
- `FC07-P02-C06-L002` Executor & Callback Group
- `FC07-P02-C06-L003` [실습] 적절한 Callback Group 사용 전략

#### FC07-P02-C07. ROS 2 디버깅

- `FC07-P02-C07-L001` ROS 2 환경에서 디버깅하는 방법들
- `FC07-P02-C07-L002` [실습] Logger
- `FC07-P02-C07-L003` [실습] Rviz2
- `FC07-P02-C07-L004` [실습] RQt
- `FC07-P02-C07-L005` [실습] rosbag2
