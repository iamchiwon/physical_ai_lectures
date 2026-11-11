# FC05. ROS 2 & Gazebo를 활용한 로봇 모델링과 자율주행 시뮬레이션

- 조사일: 2026-11-02 (KST)
- 분류: 핵심·모델/시뮬레이션
- 공식 강의 페이지: [ROS 2 & Gazebo를 활용한 로봇 모델링과 자율주행 시뮬레이션](<https://fastcampus.co.kr/data_online_selfdriving2>)
- 공식 교육과정소개서 1: [PDF](<https://cdn.day1company.io/prod/uploads/202506/111106-1154/-패스트캠퍼스--교육과정소개서-ros-2---gazebo를-활용한-로봇-모델링과-자율주행-시뮬레이션.pdf>)
- 확인 수준: 공개 목차의 최하위 차시까지 확인. 5개 상위 묶음 / 13개 장 / 50개 CLIP 항목.
- 위 개수는 공개 목차 트리를 센 값입니다. 홍보 영역의 파트·클립 수, 영상 공개 여부, 실제 재생 가능한 수와 다를 수 있습니다.

## 과정의 활용 방향

URDF·Xacro·센서 플러그인과 차량 시뮬레이션을 반영한다. Gazebo Classic 명령을 그대로 복제하지 않고 프로젝트 대상 버전에 맞춰 이식한다.

## 세부 커리큘럼

공식 페이지에 공개된 학습 주제의 순서를 정리했습니다. 번호·공백을 정규화했으며 강의 본문·영상·실습 해설을 재현한 자료가 아닙니다. 각 식별자는 통합안에서 원래 주제를 추적하기 위한 로컬 번호입니다.

### FC05-P01. 로보틱스 엔지니어를 위한 초기 개발 환경 구성

#### FC05-P01-C01. Introduction

- `FC05-P01-C01-L001` 강의 커리큘럼 소개

#### FC05-P01-C02. 운영체제 살펴보기: 리눅스와 Ubuntu 알아보기

- `FC05-P01-C02-L001` Linux 이해하기
- `FC05-P01-C02-L002` [실습] Linux 필수 명령어

#### FC05-P01-C03. 개발 도구 설치하기: Terminal, Visual Studio Code

- `FC05-P01-C03-L001` [실습] Terminal (terminator, zsh, htop 등)
- `FC05-P01-C03-L002` [실습] Visual Studio Code 및 Extension

#### FC05-P01-C04. ROS 2 설치 및 환경 구성: A Step-by-Step Guide

- `FC05-P01-C04-L001` [실습] ROS 2 Humble 설치하기
- `FC05-P01-C04-L002` (실습) Workspace 생성하기

### FC05-P02. URDF 기반의 로봇 모델 구축하기

#### FC05-P02-C01. 로봇 모델링 이해를 위한 선수 지식

- `FC05-P02-C01-L001` 로봇 모델링 개요
- `FC05-P02-C01-L002` TF(Transformation) 개요
- `FC05-P02-C01-L003` (실습) 모델링 이해를 위한 TF 기초

#### FC05-P02-C02. 실습으로 정복하는 URDF 요소

- `FC05-P02-C02-L001` URDF 개요
- `FC05-P02-C02-L002` Link & Joint 개요
- `FC05-P02-C02-L003` (실습) Link 및 URDF 파일 시각화
- `FC05-P02-C02-L004` (실습) Joint 및 TF 시각화
- `FC05-P02-C02-L005` (실습) 움직임을 위한 Joint 요소들
- `FC05-P02-C02-L006` (실습) Link의 요소 (1) - material
- `FC05-P02-C02-L007` (실습) Link의 요소 (2) - mesh
- `FC05-P02-C02-L008` (실습) Joint의 특수 요소
- `FC05-P02-C02-L009` (실습) Plottting 도구 plotjuggler

### FC05-P03. 시뮬레이션 기초: Gazebo Classic

#### FC05-P03-C01. Gazebo Classic

- `FC05-P03-C01-L001` 시뮬레이션 개요
- `FC05-P03-C01-L002` (실습) Gazebo Classic 튜토리얼

#### FC05-P03-C02. 나만의 Differential Drive 로봇 모델링 & 시뮬레이션

- `FC05-P03-C02-L001` 프로젝트 개요
- `FC05-P03-C02-L002` (실습) 시뮬레이션 패키지 생성
- `FC05-P03-C02-L003` (실습) Gazebo Classic에서 World 불러오기
- `FC05-P03-C02-L004` (실습) 나만의 시뮬레이션 환경 스케치
- `FC05-P03-C02-L005` 시뮬레이션을 위한 로봇 속성 (1) - Collision, Inertias
- `FC05-P03-C02-L006` (실습) 기존 모델에 collision과 inertia 적용하기
- `FC05-P03-C02-L007` (실습) Gazebo Classic에서 로봇 Spawn하기
- `FC05-P03-C02-L008` 시뮬레이션을 위한 로봇 속성 (2) - 물리적 속성
- `FC05-P03-C02-L009` (실습) 기존 모델에 물리적 속성 적용하기

### FC05-P04. 시뮬레이션 실전: 각종 Plugin과 실무 전략들

#### FC05-P04-C01. Gazebo Classic Plugins

- `FC05-P04-C01-L001` Gazebo Plugins (1) - Joint
- `FC05-P04-C01-L002` (실습) 나만의 로봇에 제어를 위한 플러그인 추가하기
- `FC05-P04-C01-L003` Gazebo Plugins (2) - Sensor
- `FC05-P04-C01-L004` (실습) 나만의 로봇에 각종 센서 추가하기

#### FC05-P04-C02. XACRO 기반 로봇 모델링 관리

- `FC05-P04-C02-L001` XACRO 개요
- `FC05-P04-C02-L002` (실습) XACRO를 활용한 효율적인 로봇 모델링
- `FC05-P04-C02-L003` (실습) Gazebo Classic에 다수의 XACRO 로봇 모델 Spawn

#### FC05-P04-C03. 모델링 및 시뮬레이션 패키지 관리 전략

- `FC05-P04-C03-L001` (실습) 유지보수를 고려한 패키지 구조 잡기
- `FC05-P04-C03-L002` (실습) 로봇 주행 메커니즘 쉽게 변경하기
- `FC05-P04-C03-L003` (실습) 모델링 파일 경량화 및 시뮬레이션 최적화 전략

### FC05-P05. 실무에 바로 적용 가능한 실전 프로젝트

#### FC05-P05-C01. Project 1: 오픈 소스 기반의 로봇 커스터마이징

- `FC05-P05-C01-L001` 프로젝트 개요
- `FC05-P05-C01-L002` (실습) 시뮬레이션 환경 구성
- `FC05-P05-C01-L003` (실습) 모델링 수정 및 각종 센서 추가하기
- `FC05-P05-C01-L004` (실습) 3D LiDAR SLAM

#### FC05-P05-C02. Project 2: 테슬라 사이버트럭 자율주행 시뮬레이션

- `FC05-P05-C02-L001` 프로젝트 개요
- `FC05-P05-C02-L002` CAD Software에서 URDF 추출 방법
- `FC05-P05-C02-L003` (실습) Linux 기반 URDF 추출 환경 구성
- `FC05-P05-C02-L004` (실습) 사이버트럭 URDF 추출하고 디버깅하기
- `FC05-P05-C02-L005` (실습) 사이버트럭 시뮬레이션 환경 구성
- `FC05-P05-C02-L006` (실습) 자율주행을 위한 Nav2 연동하기
