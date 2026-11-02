# FC17. 로보틱스 & 3D 컴퓨터 비전 개발을 위한 SLAM 바이블 with 슬램슬램

- 조사일: 2026-11-02 (KST)
- 분류: 핵심·SLAM 심화
- 공식 강의 페이지: [로보틱스 & 3D 컴퓨터 비전 개발을 위한 SLAM 바이블 with 슬램슬램](<https://fastcampus.co.kr/data_online_slam>)
- 공식 교육과정소개서 1: [PDF](<https://cdn.day1company.io/prod/uploads/202607/113205-24/-패스트캠퍼스--교육과정소개서-로보틱스---3d-컴퓨터-비전-개발을-위한-slam-바이블-with-슬램슬램.pdf>)
- 확인 수준: 공개 목차의 최하위 차시까지 확인. 7개 상위 묶음 / 21개 장 / 147개 CLIP 항목.
- 위 개수는 공개 목차 트리를 센 값입니다. 홍보 영역의 파트·클립 수, 영상 공개 여부, 실제 재생 가능한 수와 다를 수 있습니다.

## 과정의 활용 방향

프론트엔드/백엔드·확률 그래프·AI·최적화와 로봇/드론/스캐너/AR 응용을 심화 선택 과정으로 보존한다.

## 세부 커리큘럼

공식 페이지에 공개된 학습 주제의 순서를 정리했습니다. 번호·공백을 정규화했으며 강의 본문·영상·실습 해설을 재현한 자료가 아닙니다. 각 식별자는 통합안에서 원래 주제를 추적하기 위한 로컬 번호입니다.

### FC17-P01. SLAM 입문

#### FC17-P01-C01. SLAM 이란?

- `FC17-P01-C01-L001` 강의 소개
- `FC17-P01-C01-L002` 모바일 로보틱스
- `FC17-P01-C01-L003` SLAM이란
- `FC17-P01-C01-L004` SLAM에서 사용하는 하드웨어
- `FC17-P01-C01-L005` SLAM의 종류
- `FC17-P01-C01-L006` SLAM 기술의 사용처
- `FC17-P01-C01-L007` SLAM 공부 꿀팁

#### FC17-P01-C02. 프로그래밍 기초

- `FC17-P01-C02-L001` C++ 언어와 SLAM
- `FC17-P01-C02-L002` C++ 기초 프로그래밍
- `FC17-P01-C02-L003` C++ 라이브러리 빌드
- `FC17-P01-C02-L004` C++ CPU 프로파일러
- `FC17-P01-C02-L005` C++ 메모리 프로파일러
- `FC17-P01-C02-L006` 파이썬 기초
- `FC17-P01-C02-L007` 파이썬 기초 프로그래밍
- `FC17-P01-C02-L008` Nanobind

#### FC17-P01-C03. 수학 기초

- `FC17-P01-C03-L001` 3D 공간 속 회전과 이동 표현법
- `FC17-P01-C03-L002` 동차 좌표계
- `FC17-P01-C03-L003` Lie Group
- `FC17-P01-C03-L004` Lie algebra의 기초
- `FC17-P01-C03-L005` Eigen + Sophus 라이브러리 실습
- `FC17-P01-C03-L006` Continuous-Time 표현법

#### FC17-P01-C04. 센서 기초

- `FC17-P01-C04-L001` 로보틱스를 위한 카메라 기초
- `FC17-P01-C04-L002` 카메라 투영 모델 & 렌즈 왜곡
- `FC17-P01-C04-L003` 라이다의 구조
- `FC17-P01-C04-L004` IMU_preintegration
- `FC17-P01-C04-L005` 레이더의 구조
- `FC17-P01-C04-L006` Forward kinematics / Inverse kinematics
- `FC17-P01-C04-L007` 센서 캘리브레이션
- `FC17-P01-C04-L008` Kalibr 패키지 실습

### FC17-P02. Dive into SLAM (프론트엔드)

#### FC17-P02-C01. 영상 처리

- `FC17-P02-C01-L001` 파트 2 소개
- `FC17-P02-C01-L002` local feature 검출
- `FC17-P02-C01-L003` local feature 검출 실습
- `FC17-P02-C01-L004` 딥러닝 특징점 검출 실습
- `FC17-P02-C01-L005` Feature tracking 기초
- `FC17-P02-C01-L006` 실무에서 사용하는 고급 feature tracking
- `FC17-P02-C01-L007` Optical flow 실습
- `FC17-P02-C01-L008` Global feature 검출
- `FC17-P02-C01-L009` Global feature 검출 실습
- `FC17-P02-C01-L010` Deep global feature 검출 실습

#### FC17-P02-C02. 다중시점 기하학

- `FC17-P02-C02-L001` Epipolar geometry
- `FC17-P02-C02-L002` Epipolar geometry 실습
- `FC17-P02-C02-L003` Homography
- `FC17-P02-C02-L004` Homography 실습
- `FC17-P02-C02-L005` MonoVO 실습
- `FC17-P02-C02-L006` 삼각측량
- `FC17-P02-C02-L007` 삼각측량 실습(Triangulation 실습)
- `FC17-P02-C02-L008` Perspective-n-points
- `FC17-P02-C02-L009` Perspective-n-points 실습
- `FC17-P02-C02-L010` RANSAC
- `FC17-P02-C02-L011` 실무에서 사용하는 최신 RANSAC
- `FC17-P02-C02-L012` RANSAC&USAC 실습
- `FC17-P02-C02-L013` 고급 이상치 제거 테크닉
- `FC17-P02-C02-L014` Bundle adjustment
- `FC17-P02-C02-L015` Bundle adjustment 실습

#### FC17-P02-C03. 포인트 클라우드 처리

- `FC17-P02-C03-L001` 포인트 클라우드란
- `FC17-P02-C03-L002` PCL 라이브러리 소개
- `FC17-P02-C03-L003` 포인트 클라우드 전처리
- `FC17-P02-C03-L004` 포인트 클라우드 전처리 실습
- `FC17-P02-C03-L005` ICP
- `FC17-P02-C03-L006` ICP 실습
- `FC17-P02-C03-L007` 현업에서 사용하는 고급 ICP
- `FC17-P02-C03-L008` 최신 ICP 실습 1
- `FC17-P02-C03-L009` 최신 ICP 실습 2

### FC17-P03. Dive into SLAM (백엔드)

#### FC17-P03-C01. 확률론적 그래프 추론

- `FC17-P03-C01-L001` 파트 3 소개
- `FC17-P03-C01-L002` Factor graph
- `FC17-P03-C01-L003` 비선형 최소자승법(Nonlinear least squares)
- `FC17-P03-C01-L004` M-estimator & MAXCON
- `FC17-P03-C01-L005` 비선형 최적화(Nonlinear optimization)
- `FC17-P03-C01-L006` 매니폴드 상 최적화
- `FC17-P03-C01-L007` Graph-based SLAM
- `FC17-P03-C01-L008` Schur complement
- `FC17-P03-C01-L009` Auto-diff

#### FC17-P03-C02. SLAM 시스템 아키텍처

- `FC17-P03-C02-L001` SLAM 시스템
- `FC17-P03-C02-L002` 다양한 지도 표현 방법
- `FC17-P03-C02-L003` VSLAM 시스템 아키텍처
- `FC17-P03-C02-L004` LiDAR SLAM 시스템 아키텍처
- `FC17-P03-C02-L005` RADAR SLAM 시스템 아키텍처
- `FC17-P03-C02-L006` Event SLAM 시스템 아키텍처
- `FC17-P03-C02-L007` Inertial odometry 기초
- `FC17-P03-C02-L008` Leg odometry 기초
- `FC17-P03-C02-L009` 센서 퓨전

### FC17-P04. 클래시컬 SLAM

#### FC17-P04-C01. 클래시컬 SLAM

- `FC17-P04-C01-L001` 파트 4 소개
- `FC17-P04-C01-L002` Feature-based VSLAM
- `FC17-P04-C01-L003` Direct VSLAM
- `FC17-P04-C01-L004` Visual-inertial odometry
- `FC17-P04-C01-L005` 2D LiDAR SLAM
- `FC17-P04-C01-L006` 3D LiDAR SLAM

#### FC17-P04-C02. 클래시컬 SLAM 실습

- `FC17-P04-C02-L001` ORB-SLAM 2
- `FC17-P04-C02-L002` Basalt-VIO
- `FC17-P04-C02-L003` Cartographer
- `FC17-P04-C02-L004` KISS-SLAM
- `FC17-P04-C02-L005` GLIM
- `FC17-P04-C02-L006` FAST-LIO2
- `FC17-P04-C02-L007` FAST-LIVO2

### FC17-P05. 고급 SLAM - AI 활용과 하드웨어 최적화

#### FC17-P05-C01. AI + SLAM

- `FC17-P05-C01-L001` 파트 5 소개
- `FC17-P05-C01-L002` SLAM + Object detection + Segmentation 1
- `FC17-P05-C01-L003` SLAM + Object detection + Segmentation 2
- `FC17-P05-C01-L004` SLAM + Depth estimation
- `FC17-P05-C01-L005` SLAM + Camera pose regression
- `FC17-P05-C01-L006` SLAM + Deep feature matching
- `FC17-P05-C01-L007` SLAM + Deep optical flow
- `FC17-P05-C01-L008` SLAM + Differentiable bundle adjustment
- `FC17-P05-C01-L009` SLAM + Feed-forward 3D transformer
- `FC17-P05-C01-L010` SLAM + NeRF
- `FC17-P05-C01-L011` SLAM + Gaussian Splatting
- `FC17-P05-C01-L012` SLAM + Video generation
- `FC17-P05-C01-L013` SLAM + VLM/VLA
- `FC17-P05-C01-L014` SLAM + 3D Scene graph
- `FC17-P05-C01-L015` SLAM + Certifiably optimal algorithm
- `FC17-P05-C01-L016` SLAM + Auto-encoder / diffusion
- `FC17-P05-C01-L017` SLAM + Graph processor

#### FC17-P05-C02. AI + SLAM 실습

- `FC17-P05-C02-L001` DSP-SLAM
- `FC17-P05-C02-L002` Kimera
- `FC17-P05-C02-L003` ConceptFusion
- `FC17-P05-C02-L004` Gaussian Splatting SLAM
- `FC17-P05-C02-L005` MASt3r-SLAM
- `FC17-P05-C02-L006` PIN-SLAM
- `FC17-P05-C02-L007` Suma++

#### FC17-P05-C03. SLAM 소프트웨어/하드웨어 최적화

- `FC17-P05-C03-L001` 데스크탑, 서버, 임베디드 보드의 차이
- `FC17-P05-C03-L002` 실시간 SLAM의 특징
- `FC17-P05-C03-L003` 오토라벨링 / 데이터크런칭 SLAM의 특징
- `FC17-P05-C03-L004` C++ 빌드 설정 최적화
- `FC17-P05-C03-L005` SIMD 가속과 CPU 최적화 기법
- `FC17-P05-C03-L006` SIMD 가속 실습
- `FC17-P05-C03-L007` NVIDIA Jetson 소개
- `FC17-P05-C03-L008` CUDA 가속 실습

### FC17-P06. 최종 프로젝트

#### FC17-P06-C01. 프로젝트 1. 자율주행을 위한 SLAM

- `FC17-P06-C01-L001` 파트 6 소개
- `FC17-P06-C01-L002` 자율주행을 위한 SLAM 소개
- `FC17-P06-C01-L003` 실습 환경 구비
- `FC17-P06-C01-L004` 실습

#### FC17-P06-C02. 프로젝트 2. 드론을 위한 SLAM

- `FC17-P06-C02-L001` 드론을 위한 SLAM 소개
- `FC17-P06-C02-L002` 실습 환경 구비
- `FC17-P06-C02-L003` 실습

#### FC17-P06-C03. 프로젝트 3. 모바일 스캐너 시스템을 위한 SLAM

- `FC17-P06-C03-L001` 모바일 스캐너 시스템을 위한 SLAM 소개
- `FC17-P06-C03-L002` 하드웨어 셋업 및 조립 방법 소개
- `FC17-P06-C03-L003` 실습

#### FC17-P06-C04. 프로젝트 4. 강아지 로봇을 위한 SLAM

- `FC17-P06-C04-L001` 강아지 로봇을 위한 SLAM 소개
- `FC17-P06-C04-L002` 실습 환경 구비
- `FC17-P06-C04-L003` 실습

#### FC17-P06-C05. 프로젝트 5. 휴머노이드 로봇을 위한 SLAM

- `FC17-P06-C05-L001` 휴머노이드 로봇을 위한 SLAM 소개
- `FC17-P06-C05-L002` 실습 환경 구비
- `FC17-P06-C05-L003` 실습

#### FC17-P06-C06. 프로젝트 6. VR/AR 헤드셋을 위한 SLAM

- `FC17-P06-C06-L001` VR/AR 헤드셋을 위한 SLAM 소개
- `FC17-P06-C06-L002` 실습 환경 구비
- `FC17-P06-C06-L003` 실습

### FC17-P07. SLAM 기술 관련 논문 리뷰

- `FC17-P07-L001` PTAM

- `FC17-P07-L002` Past Present and Future of SLAM 1
