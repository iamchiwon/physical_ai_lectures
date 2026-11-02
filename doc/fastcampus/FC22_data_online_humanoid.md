# FC22. NVIDIA Isaac Sim과 강화학습을 활용한 휴머노이드 보행 제어

- 조사일: 2026-11-02 (KST)
- 분류: 핵심·휴머노이드
- 공식 강의 페이지: [NVIDIA Isaac Sim과 강화학습을 활용한 휴머노이드 보행 제어](<https://fastcampus.co.kr/data_online_humanoid>)
- 공식 교육과정소개서 1: [PDF](<https://cdn.day1company.io/prod/uploads/202608/105347-1893/-패스트캠퍼스--교육과정소개서-nvidia-isaac-sim과-강화학습을-활용한-휴머노이드-보행-제어.pdf>)
- 확인 수준: 공개 목차의 최하위 차시까지 확인. 5개 상위 묶음 / 13개 장 / 28개 CLIP 항목.
- 위 개수는 공개 목차 트리를 센 값입니다. 홍보 영역의 파트·클립 수, 영상 공개 여부, 실제 재생 가능한 수와 다를 수 있습니다.

## 과정의 활용 방향

PPO·Isaac Lab·rsl_rl·Unitree G1·전신 상태·불확실성을 휴머노이드 트랙으로 확장한다. 실물 전이 성공을 수강 사실만으로 가정하지 않는다.

## 세부 커리큘럼

공식 페이지에 공개된 학습 주제의 순서를 정리했습니다. 번호·공백을 정규화했으며 강의 본문·영상·실습 해설을 재현한 자료가 아닙니다. 각 식별자는 통합안에서 원래 주제를 추적하기 위한 로컬 번호입니다.

### FC22-P01. 강의 커리큘럼 소개

#### FC22-P01-C01. 강의 커리큘럼 소개

- `FC22-P01-C01-L001` 강의 커리큘럼 소개

### FC22-P02. 휴머노이드 로코모션을 위한 강화학습 환경 구축

#### FC22-P02-C01. 강화학습(RL)과 로코모션의 만남

- `FC22-P02-C01-L001` 강화학습의 핵심 개념
- `FC22-P02-C01-L002` 마르코프 결정 과정(MDP) (1)
- `FC22-P02-C01-L003` 마르코프 결정 과정(MDP) (2)

#### FC22-P02-C02. Unitree G1 분석 및 전신 상태 표현

- `FC22-P02-C02-L001` Humanoid HW Landscape 2026 (1)
- `FC22-P02-C02-L002` Humanoid HW Landscape 2026 (2)
- `FC22-P02-C02-L003` Unitree G1 로봇 구조 이해

#### FC22-P02-C03. Isaac Lab: 차세대 로봇 시뮬레이션 환경 구성

- `FC22-P02-C03-L001` NVIDIA Isaac Lab 아키텍처
- `FC22-P02-C03-L002` NVIDIA Isaac Lab 아키텍처 2
- `FC22-P02-C03-L003` NVIDIA Isaac Lab 아키텍처 3
- `FC22-P02-C03-L004` NVIDIA Isaac Lab 아키텍처 4
- `FC22-P02-C03-L005` 실습 환경 구축

### FC22-P03. PPO로 휴머노이드 보행 정책 학습하기

#### FC22-P03-C01. 왜 PPO인가? 알고리즘 선택 배경

- `FC22-P03-C01-L001` Dynamic Programming 1
- `FC22-P03-C01-L002` Dynamic Programming 2
- `FC22-P03-C01-L003` MC와 TD, Model-free RL의 기초 1
- `FC22-P03-C01-L004` MC와 TD, Model-free RL의 기초 2
- `FC22-P03-C01-L005` 로코모션 강화학습의 진화 1
- `FC22-P03-C01-L006` 로코모션 강화학습의 진화 2
- `FC22-P03-C01-L007` PPO의 핵심 원리

#### FC22-P03-C02. rsl_rl 프레임워크와 정책/가치 함수의 역할

- `FC22-P03-C02-L001` rsl_rl 프레임워크와 실습 코드 분석 1
- `FC22-P03-C02-L002` rsl_rl 프레임워크와 실습 코드 분석 2

### FC22-P04. 전신(Whole-Body) 로코모션의 이해

#### FC22-P04-C01. Observation-Action 일관성과 데이터 설계

- `FC22-P04-C01-L001` 전신 상태를 고려한 신경망 입력과 출력

#### FC22-P04-C02. Whole-Body Control이 필요한 물리적 이유

- `FC22-P04-C02-L001` 상체 고정 vs 전신 정책 안정성 비교

#### FC22-P04-C03. 중복 자유도(Redundancy)와 동적 궤적 공간

- `FC22-P04-C03-L001` 중복 자유도를 활용한 외란 대처

### FC22-P05. 정적 보행에서 현실 환경으로 확장하기

#### FC22-P05-C01. 로코모션에서 불확실성과 지형 변화

- `FC22-P05-C01-L001` 지형 변화에 적응하는 강건한 정책

#### FC22-P05-C02. 합성 데이터 수합 연구 트렌드

- `FC22-P05-C02-L001` 대규모 병렬 시뮬레이션을 통한 데이터 스케일업

#### FC22-P05-C03. Sim-to-Real을 고려한 학습 설계 사고방식

- `FC22-P05-C03-L001` Sim-to-Real Gap

#### FC22-P05-C04. [Bonus] Humanoid Industry Landscape in Korea

- `FC22-P05-C04-L001` [Bonus] Humanoid Industry Landscape in Korea
