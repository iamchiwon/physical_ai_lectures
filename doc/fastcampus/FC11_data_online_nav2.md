# FC11. ROS 2 자율주행 로봇 Dev Academy Part 5. 경로 계획과 제어를 담당하는 Nav 2

- 조사일: 2026-11-02 (KST)
- 분류: 분할·Dev Academy 5
- 공식 강의 페이지: [ROS 2 자율주행 로봇 Dev Academy Part 5. 경로 계획과 제어를 담당하는 Nav 2](<https://fastcampus.co.kr/data_online_nav2>)
- 공식 교육과정소개서 1: [PDF](<https://cdn.day1company.io/prod/uploads/202605/161113-2082/-패스트캠퍼스--교육과정소개서-ros-2-자율주행-로봇-dev-acadmey-part-5.-경로-계획과-제어를-담당하는-nav-2.pdf>)
- 확인 수준: 공개 목차의 최하위 차시까지 확인. 2개 상위 묶음 / 8개 장 / 23개 CLIP 항목.
- 위 개수는 공개 목차 트리를 센 값입니다. 홍보 영역의 파트·클립 수, 영상 공개 여부, 실제 재생 가능한 수와 다를 수 있습니다.

## 과정의 활용 방향

경로 계획·제어 서버·BT·Costmap을 모바일 내비게이션 모듈로 합친다.

## 세부 커리큘럼

공식 페이지에 공개된 학습 주제의 순서를 정리했습니다. 번호·공백을 정규화했으며 강의 본문·영상·실습 해설을 재현한 자료가 아닙니다. 각 식별자는 통합안에서 원래 주제를 추적하기 위한 로컬 번호입니다.

### FC11-P01. Navigation : 로봇의 경로 계획 그리고 장애물 회피

#### FC11-P01-C01. Nav2 & Path Planning 개요

- `FC11-P01-C01-L001` Nav2 개요
- `FC11-P01-C01-L002` Path Planning 개요
- `FC11-P01-C01-L003` [실습] Nav2를 활용한 Path Planning 방법들

#### FC11-P01-C02. Planner, Controller, Smoother Server

- `FC11-P01-C02-L001` [실습] Planner Parameter Tuning
- `FC11-P01-C02-L002` [실습] Controller Parameter Tuning
- `FC11-P01-C02-L003` [실습] Smoother Server Parameter Tuning

#### FC11-P01-C03. Behavior Server, Behavior-Tree Navigator

- `FC11-P01-C03-L001` [실습] Behavior Server Parameter Tuning
- `FC11-P01-C03-L002` [실습] BT Navigator Parameter Tuning

#### FC11-P01-C04. 장애물 회피 그리고 Costmap

- `FC11-P01-C04-L001` Costmap 개요
- `FC11-P01-C04-L002` [실습] Global Costmap, Local Costmap 그리고 Layer
- `FC11-P01-C04-L003` [실습] Costmap Parameter Tuning

### FC11-P02. 실무 적용을 위한 Nav2 심화 그리고 응용

#### FC11-P02-C01. Behavior Tree (BT)

- `FC11-P02-C01-L001` Behavior Tree 개요
- `FC11-P02-C01-L002` [실습] BT 이해를 위한 간단한 프로그래밍
- `FC11-P02-C01-L003` [실습] Nav2와 연동하여 BT 사용하기

#### FC11-P02-C02. 멀티 로봇 시스템

- `FC11-P02-C02-L001` 멀티 로봇 시스템 이해를 위한 Namespace 개요
- `FC11-P02-C02-L002` [실습] TF 공유 유무에 따른 멀티 로봇 시스템

#### FC11-P02-C03. 자율주행을 위한 Nav2 프로그래밍

- `FC11-P02-C03-L001` [실습] AMR과 물류 창고 시뮬레이션 환경 구성하기
- `FC11-P02-C03-L002` [실습] Simple Commander API - Navigate To Pose
- `FC11-P02-C03-L003` [실습] Simple Commander API - Navigate Through Poses
- `FC11-P02-C03-L004` [실습] Simple Commander API - Follow Waypoints

#### FC11-P02-C04. 특수한 상황을 위한 유용한 기능들

- `FC11-P02-C04-L001` Costmap Filters
- `FC11-P02-C04-L002` [실습] Keepout Filter 활용 (접근 금지 구역)
- `FC11-P02-C04-L003` [실습] Speed Filter 활용 (속도 제한 구역)
