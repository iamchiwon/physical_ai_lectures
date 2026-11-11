# FC10. ROS 2 자율주행 로봇 Dev Academy Part 4. 지도 작성 및 위치를 추정하는 SLAM

- 조사일: 2026-11-02 (KST)
- 분류: 분할·Dev Academy 4
- 공식 강의 페이지: [ROS 2 자율주행 로봇 Dev Academy Part 4. 지도 작성 및 위치를 추정하는 SLAM](<https://fastcampus.co.kr/data_online_slambasic>)
- 공식 교육과정소개서 1: [PDF](<https://cdn.day1company.io/prod/uploads/202604/185251-1893/-패스트캠퍼스--교육과정소개서-ros-2-자율주행-로봇-dev-acadmey-part-4.-지도-작성-및-위치를-추정하는-slam.pdf>)
- 확인 수준: 공개 목차의 최하위 차시까지 확인. 1개 상위 묶음 / 4개 장 / 16개 CLIP 항목.
- 위 개수는 공개 목차 트리를 센 값입니다. 홍보 영역의 파트·클립 수, 영상 공개 여부, 실제 재생 가능한 수와 다를 수 있습니다.

## 과정의 활용 방향

SLAM 사용 입문에 배치한다. 심화 수학·최적화 중심 FC17과 난이도를 구분한다.

## 세부 커리큘럼

공식 페이지에 공개된 학습 주제의 순서를 정리했습니다. 번호·공백을 정규화했으며 강의 본문·영상·실습 해설을 재현한 자료가 아닙니다. 각 식별자는 통합안에서 원래 주제를 추적하기 위한 로컬 번호입니다.

### FC10-P01. SLAM : 로봇이 주변 환경을 인식하고 위치를 추정하는 방법

#### FC10-P01-C01. 자율주행 로봇을 위한 SLAM 기초

- `FC10-P01-C01-L001` SLAM 개요 및 선수 지식
- `FC10-P01-C01-L002` 모바일 로봇을 위한 Odometry

#### FC10-P01-C02. Mapping

- `FC10-P01-C02-L001` Mapping 개요
- `FC10-P01-C02-L002` [실습] Cartographer SLAM
- `FC10-P01-C02-L003` [실습] 작성한 지도 저장하기
- `FC10-P01-C02-L004` 작성한 지도 수정 전략 및 다른 프로세스에서 활용 방법
- `FC10-P01-C02-L005` Nav2 Lifecycle Manager
- `FC10-P01-C02-L006` [실습] Lifecycle Manager 서비스 테스트

#### FC10-P01-C03. Localization

- `FC10-P01-C03-L001` Localization 개요
- `FC10-P01-C03-L002` [실습] AMCL (Adaptive Monte Carlo Localization)

#### FC10-P01-C04. SLAM 심화 그리고 적용

- `FC10-P01-C04-L001` [실습] SLAM 파리미터 튜닝 전략
- `FC10-P01-C04-L002` [실습] AMCL 기반의 로봇 초기 위치 추정 전략
- `FC10-P01-C04-L003` [실습] Global Localization 전략
- `FC10-P01-C04-L004` SLAM을 위한 센서 그리고 활용 전략
- `FC10-P01-C04-L005` [실습] RGB-D Visual SLAM
- `FC10-P01-C04-L006` SLAM에서의 Ground Truth
