# FC20. Mobile ALOHA와 모방 학습을 활용한 로봇 행동 제어

- 조사일: 2026-11-02 (KST)
- 분류: 핵심·모방학습
- 공식 강의 페이지: [Mobile ALOHA와 모방 학습을 활용한 로봇 행동 제어](<https://fastcampus.co.kr/data_online_il>)
- 공식 교육과정소개서 1: [PDF](<https://cdn.day1company.io/prod/uploads/202507/105046-1154/-패스트캠퍼스--교육과정소개서-mobile-aloha와-모방-학습을-활용한-로봇-행동-제어.pdf>)
- 확인 수준: 공개 목차의 최하위 차시까지 확인. 6개 상위 묶음 / 26개 장 / 41개 CLIP 항목.
- 위 개수는 공개 목차 트리를 센 값입니다. 홍보 영역의 파트·클립 수, 영상 공개 여부, 실제 재생 가능한 수와 다를 수 있습니다.

## 과정의 활용 방향

BC·ACT·Motion Manifold·MuJoCo·Mobile ALOHA와 데이터/평가를 기존 LeRobot·SmolVLA 과정의 선행 및 심화로 통합한다.

## 세부 커리큘럼

공식 페이지에 공개된 학습 주제의 순서를 정리했습니다. 번호·공백을 정규화했으며 강의 본문·영상·실습 해설을 재현한 자료가 아닙니다. 각 식별자는 통합안에서 원래 주제를 추적하기 위한 로컬 번호입니다.

### FC20-P01. 커리큘럼 소개

#### FC20-P01-C01. 커리큘럼 소개 및 개요

- `FC20-P01-C01-L001` 커리큘럼 소개 및 개요

### FC20-P02. 모방학습(Imitation Learning)

#### FC20-P02-C01. 강화학습 알고리즘 분류

- `FC20-P02-C01-L001` Machine Learning taxonomy와 모방학습

#### FC20-P02-C02. 모방학습 소개

- `FC20-P02-C02-L001` 모방학습에 대한 개념 소개 및 강화학습과의 비교

#### FC20-P02-C03. 로봇 모방학습의 대표 기법

- `FC20-P02-C03-L001` Behavior Cloning
- `FC20-P02-C03-L002` DAgger

#### FC20-P02-C04. 모방학습의 한계 극복과 확장 기법

- `FC20-P02-C04-L001` Inverse Reinforcement Learning
- `FC20-P02-C04-L002` GAIL

#### FC20-P02-C05. 모방학습의 최신 트렌드

- `FC20-P02-C05-L001` Multi-modal IL
- `FC20-P02-C05-L002` Diffusion Policy

### FC20-P03. 모방학습의 적용 사례

#### FC20-P03-C01. End-to-End Imitation Learning-based Approach

- `FC20-P03-C01-L001` 사례1) DexMV Imitation Learning for Dexterous Manipulation from Human Videos
- `FC20-P03-C01-L002` 사례2) DexMimicGen Automated Data Generation for Bimanual Dexterous~
- `FC20-P03-C01-L003` 사례3) Learning Bimanual Manipulation via Action ~

### FC20-P04. MuJoCo

#### FC20-P04-C01. 시뮬레이션 툴 비교

- `FC20-P04-C01-L001` 시뮬레이션 툴 비교

#### FC20-P04-C02. 환경 세팅 실습

- `FC20-P04-C02-L001` Anaconda 설치
- `FC20-P04-C02-L002` CUDA, CuDnn 설치
- `FC20-P04-C02-L003` 가상환경 세팅 및 MuJoCo 설치

#### FC20-P04-C03. 미니프로젝트 1

- `FC20-P04-C03-L001` mujoco를 통한 모델 생성 및 시뮬레이션 환경에서 구현(1)
- `FC20-P04-C03-L002` mujoco를 통한 모델 생성 및 시뮬레이션 환경에서 구현(2)
- `FC20-P04-C03-L003` mujoco를 통한 모델 생성 및 시뮬레이션 환경에서 구현(3)
- `FC20-P04-C03-L004` mujoco를 통한 모델 생성 및 시뮬레이션 환경에서 구현(4)

#### FC20-P04-C04. Robotics

- `FC20-P04-C04-L001` Rotation
- `FC20-P04-C04-L002` Forward Kinematics
- `FC20-P04-C04-L003` Inverse Kinematics
- `FC20-P04-C04-L004` Control

### FC20-P05. End to End를 위한 ACT 알고리즘

#### FC20-P05-C01. 미니프로젝트 2 - Supervised Method

- `FC20-P05-C01-L001` Data Preprocessing
- `FC20-P05-C01-L002` Supervised Learning

#### FC20-P05-C02. 미니프로젝트 2 - Unsupervised Method

- `FC20-P05-C02-L001` PCA TSNE UMAP
- `FC20-P05-C02-L002` Autoencoder CVAE

#### FC20-P05-C03. 미니프로젝트 2 - Motion Manifold

- `FC20-P05-C03-L001` Motion Manifold Primitives

### FC20-P06. Mobile ALOHA 구현을 위한 파이널 프로젝트

#### FC20-P06-C01. Paper Review

- `FC20-P06-C01-L001` Paper Review - Mobile ALOHALearning Bimanual~

#### FC20-P06-C02. Mujoco Gym 환경 세팅 및 실습

- `FC20-P06-C02-L001` ALOHA 프로젝트 구현을 위한 가상 환경 구성

#### FC20-P06-C03. ALOHA 로봇 모델 설명

- `FC20-P06-C03-L001` ALOHA 로봇 모델 설명 및 episode dataset 생성

#### FC20-P06-C04. ALOHA 로봇 trajectory 생성

- `FC20-P06-C04-L001` mujoco 환경에서 ACT 알고리즘 학습 및 검증

#### FC20-P06-C05. ALOHA 로봇 policy 생성

- `FC20-P06-C05-L001` ACT PLUS PLUS Diffusion Policy 환경 세팅

#### FC20-P06-C06. 시뮬레이션 데이터 생성 실습

- `FC20-P06-C06-L001` ACT tuning tip 및 학습 결과 비교 분석

#### FC20-P06-C07. simulated experiment 생성

- `FC20-P06-C07-L001` CNNMLP Diffusion 학습을 위한 코드 분석 및 ACT와의 비교

#### FC20-P06-C08. ACT 알고리즘 학습

- `FC20-P06-C08-L001` Human dataset을 활용한 ACT 학습

#### FC20-P06-C09. ACT Tuning tip

- `FC20-P06-C09-L001` Mobile Aloha 구현을 위한 code 리뷰

#### FC20-P06-C10. Custom Dataset 생성 및 학습

- `FC20-P06-C10-L001` Cotraining 성능 검증

#### FC20-P06-C11. Evaluation

- `FC20-P06-C11-L001` Mobile Aloha ACT Inference Visualization

#### FC20-P06-C12. Mobile Aloha 구현 시 필요개념 정리

- `FC20-P06-C12-L001` MuJoCo 환경변형에 따른 성능 검증 및 Future Direction
