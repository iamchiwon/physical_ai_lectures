# FC08. ROS 2 자율주행 로봇 Dev Academy Part 2. URDF 기반의 로봇 모델 구축

- 조사일: 2026-11-02 (KST)
- 분류: 분할·Dev Academy 2
- 공식 강의 페이지: [ROS 2 자율주행 로봇 Dev Academy Part 2. URDF 기반의 로봇 모델 구축](<https://fastcampus.co.kr/data_online_urdf>)
- 공식 교육과정소개서 1: [PDF](<https://cdn.day1company.io/prod/uploads/202605/154946-2082/-패스트캠퍼스--교육과정소개서-ros-2-자율주행-로봇-dev-acadmey-part-2.-urdf-기반의-로봇-모델-구축.pdf>)
- 확인 수준: 공개 목차의 최하위 차시까지 확인. 2개 상위 묶음 / 6개 장 / 19개 CLIP 항목.
- 위 개수는 공개 목차 트리를 센 값입니다. 홍보 영역의 파트·클립 수, 영상 공개 여부, 실제 재생 가능한 수와 다를 수 있습니다.

## 과정의 활용 방향

URDF·Xacro·좌표계 모듈로 합치며 이미 확인한 환경 설정은 반복하지 않는다.

## 세부 커리큘럼

공식 페이지에 공개된 학습 주제의 순서를 정리했습니다. 번호·공백을 정규화했으며 강의 본문·영상·실습 해설을 재현한 자료가 아닙니다. 각 식별자는 통합안에서 원래 주제를 추적하기 위한 로컬 번호입니다.

### FC08-P01. 로보틱스 엔지니어를 위한 초기 개발 환경 구성

#### FC08-P01-C01. Introduction

- `FC08-P01-C01-L001` 강의 커리큘럼 소개

#### FC08-P01-C02. 운영체제 살펴보기: 리눅스와 Ubuntu 알아보기

- `FC08-P01-C02-L001` Linux 이해하기
- `FC08-P01-C02-L002` [실습] Linux 필수 명령어

#### FC08-P01-C03. 개발 도구 설치하기: Terminal, Visual Studio Code

- `FC08-P01-C03-L001` [실습] Terminal (terminator, zsh, htop 등)
- `FC08-P01-C03-L002` [실습] Visual Studio Code 및 Extension

#### FC08-P01-C04. ROS 2 설치 및 환경 구성: A Step-by-Step Guide

- `FC08-P01-C04-L001` [실습] ROS 2 Humble 설치하기
- `FC08-P01-C04-L002` (실습) Workspace 생성하기

### FC08-P02. URDF 기반의 로봇 모델 구축하기

#### FC08-P02-C01. 로봇 모델링 이해를 위한 선수 지식

- `FC08-P02-C01-L001` 로봇 모델링 개요
- `FC08-P02-C01-L002` TF(Transformation) 개요
- `FC08-P02-C01-L003` (실습) 모델링 이해를 위한 TF 기초

#### FC08-P02-C02. 실습으로 정복하는 URDF 요소

- `FC08-P02-C02-L001` URDF 개요
- `FC08-P02-C02-L002` Link & Joint 개요
- `FC08-P02-C02-L003` (실습) Link 및 URDF 파일 시각화
- `FC08-P02-C02-L004` (실습) Joint 및 TF 시각화
- `FC08-P02-C02-L005` (실습) 움직임을 위한 Joint 요소들
- `FC08-P02-C02-L006` (실습) Link의 요소 (1) - material
- `FC08-P02-C02-L007` (실습) Link의 요소 (2) - mesh
- `FC08-P02-C02-L008` (실습) Joint의 특수 요소
- `FC08-P02-C02-L009` (실습) Plottting 도구 plotjuggler
