# FC18. 자율주행을 위한 컴퓨터비전과 라이다 & 센서퓨전까지 초격차 패키지 Online.

- 조사일: 2026-11-02 (KST)
- 분류: 핵심·자율주행 확장
- 공식 강의 페이지: [자율주행을 위한 컴퓨터비전과 라이다 & 센서퓨전까지 초격차 패키지 Online.](<https://fastcampus.co.kr/data_online_autovehicle>)
- 공식 교육과정소개서 1: [PDF](<https://cdn.day1company.io/prod/uploads/202401/110423-1154/-패스트캠퍼스--교육과정소개서-자율주행을-위한-컴퓨터비전과-라이다---센서퓨전까지-초격차-패키지-online..pdf>)
- 확인 수준: 공개 목차의 최하위 차시까지 확인. 6개 상위 묶음 / 31개 장 / 234개 CLIP 항목.
- 위 개수는 공개 목차 트리를 센 값입니다. 홍보 영역의 파트·클립 수, 영상 공개 여부, 실제 재생 가능한 수와 다를 수 있습니다.

## 과정의 활용 방향

Camera·LiDAR·Fusion·계획/제어와 도심/주차 프로젝트를 차량 트랙으로 배치한다. 얼굴인식 등 직접성이 낮은 주제는 선택 예제로 둔다.

## 세부 커리큘럼

공식 페이지에 공개된 학습 주제의 순서를 정리했습니다. 번호·공백을 정규화했으며 강의 본문·영상·실습 해설을 재현한 자료가 아닙니다. 각 식별자는 통합안에서 원래 주제를 추적하기 위한 로컬 번호입니다.

### FC18-P01. Perception

#### FC18-P01-C01. Face Recognition

- `FC18-P01-C01-L001` 강사 및 강의 소개
- `FC18-P01-C01-L002` Face Recognition (1)
- `FC18-P01-C01-L003` Face Recognition (2)
- `FC18-P01-C01-L004` ~05. Face Detection - Retina Face (1)
- `FC18-P01-C01-L005` Face Detection - Retina Face (2)
- `FC18-P01-C01-L006` Dlib 및 Retina Face 코드 구현
- `FC18-P01-C01-L007` Dlib 및 Retina Face 코드 구현 라이브 코딩
- `FC18-P01-C01-L008` Face Lanmark Detection - PFLD (1)
- `FC18-P01-C01-L009` Face Lanmark Detection - PFLD (2)
- `FC18-P01-C01-L010` 황금비율 계산 코드 구현
- `FC18-P01-C01-L011` 황금비율 계산 코드 구현 라이브 코딩
- `FC18-P01-C01-L012` Face Recognition - ArcFace
- `FC18-P01-C01-L013` 그룹 가수 사진에서 각각 멤버 인식하기
- `FC18-P01-C01-L014` 그룹 가수 사진에서 각각 멤버 인식하기 - 라이브 코딩

#### FC18-P01-C02. Object Detection

- `FC18-P01-C02-L001` Object Detection 알고리즘의 정의 및 종류
- `FC18-P01-C02-L002` Object Detection 성능 지표
- `FC18-P01-C02-L003` NMS
- `FC18-P01-C02-L004` YOLOv8 (1)
- `FC18-P01-C02-L005` YOLOv8 (2)
- `FC18-P01-C02-L006` 마스크 검출 프로젝트 코드 구현
- `FC18-P01-C02-L007` 마스크 검출 프로젝트 라이브 코딩
- `FC18-P01-C02-L008` TensorRT
- `FC18-P01-C02-L009` 표지판, 신호등 검출 프로젝트 코드 구현
- `FC18-P01-C02-L010` 표지판, 신호등 검출 프로젝트 라이브 코딩
- `FC18-P01-C02-L011` Complex-Yolov4 (1)
- `FC18-P01-C02-L012` Complex-Yolov4 (2)
- `FC18-P01-C02-L013` Lidar Data 기반의 차량 검출 프로젝트 코드 구현
- `FC18-P01-C02-L014` Lidar Data 기반의 차량 검출 프로젝트 라이브 코딩

#### FC18-P01-C03. Semantic Segmentation

- `FC18-P01-C03-L001` Semantic Segmentation에 대한 이해
- `FC18-P01-C03-L002` Semantic Segmentation 성능 지표
- `FC18-P01-C03-L003` DeepLabv3+
- `FC18-P01-C03-L004` 건물 영역 검출 프로젝트 코드 구현
- `FC18-P01-C03-L005` 건물 영역 검출 프로젝트 라이브 코딩
- `FC18-P01-C03-L006` UNet++
- `FC18-P01-C03-L007` 위내시경 용종 검출 프로젝트 코드 구현
- `FC18-P01-C03-L008` 위내시경 용종 검출 프로젝트 라이브 코딩
- `FC18-P01-C03-L009` 도로 영역 검출 프로젝트 코드 구현
- `FC18-P01-C03-L010` 도로 영역 검출 프로젝트 라이브 코딩

#### FC18-P01-C04. Computer Vision 기반 알고리즘으로 구현하는 자율주행 Perception Project

- `FC18-P01-C04-L001` DMS 시스템에 대한 이해
- `FC18-P01-C04-L002` DMS 시스템 구현
- `FC18-P01-C04-L003` DMS 시스템 라이브 코딩
- `FC18-P01-C04-L004` Adas 카메라 시스템에 대한 이해
- `FC18-P01-C04-L005` Adas 카메라 시스템 구현
- `FC18-P01-C04-L006` Adas 카메라 라이브 코딩

#### FC18-P01-C05. Appendix

- `FC18-P01-C05-L001` 공공 데이터셋 사이트 소개
- `FC18-P01-C05-L002` 라벨링 도구 학습
- `FC18-P01-C05-L003` 라벨링 도구 실습

### FC18-P02. LiDAR Perception

#### FC18-P02-C01. 강의 소개

- `FC18-P02-C01-L001` 강의 소개

#### FC18-P02-C02. LiDAR Data Processing

- `FC18-P02-C02-L001` LiDAR 센서의 종류 및 데이터 취득 방식
- `FC18-P02-C02-L002` 포인트 클라우드의 특징
- `FC18-P02-C02-L003` 테스트를 위한 ROS 환경 구성 (1)
- `FC18-P02-C02-L004` 테스트를 위한 ROS 환경 구성 (2)
- `FC18-P02-C02-L005` 테스트를 위한 ROS 환경 구성 (3)
- `FC18-P02-C02-L006` 자율주행 실습을 위한 오픈 라이다 데이터 셋 소개
- `FC18-P02-C02-L007` 포인트 클라우드 처리 방법 구현을 위한 Open3D 사용법
- `FC18-P02-C02-L008` 포인트 클라우드 시각화 및 편집 툴 CloudCompare 사용법
- `FC18-P02-C02-L009` LiDAR 데이터 학습을 위한 레이블링 툴 소개

#### FC18-P02-C03. Point Cloud Processing Backbone

- `FC18-P02-C03-L001` PointNet (1)
- `FC18-P02-C03-L002` PointNet (2)
- `FC18-P02-C03-L003` PointNet++
- `FC18-P02-C03-L004` Graph Convolutional Network
- `FC18-P02-C03-L005` Dynamic Graph CNN
- `FC18-P02-C03-L006` Kernel Point Convolutions

#### FC18-P02-C04. Point Cloud Matching

- `FC18-P02-C04-L001` 포인트 클라우드 매칭과 활용 분야
- `FC18-P02-C04-L002` 포인트 클라우드의 특징 추출 방법
- `FC18-P02-C04-L003` 고전적인 포인트 클라우드 매칭 방법론 소개
- `FC18-P02-C04-L004` Open3D를 이용한 고전적인 포인트 클라우드 매칭 실습 (1)
- `FC18-P02-C04-L005` Open3D를 이용한 고전적인 포인트 클라우드 매칭 실습 (2)
- `FC18-P02-C04-L006` Open3D를 이용한 고전적인 포인트 클라우드 매칭 실습 (3)
- `FC18-P02-C04-L007` 딥러닝 기반의 포인트 클라우드 매칭 방법 - RPM-Net (1)
- `FC18-P02-C04-L008` 딥러닝 기반의 포인트 클라우드 매칭 방법 - RPM-Net (2)
- `FC18-P02-C04-L009` TEASER 라이브러리를 통한 포인트 클라우드 정합 실습 (1)
- `FC18-P02-C04-L010` TEASER 라이브러리를 통한 포인트 클라우드 정합 실습 (2)
- `FC18-P02-C04-L011` 포인트 클라우드 매칭을 활용한 Place recognition - PointNetVLAD
- `FC18-P02-C04-L012` PointNetVLAD 실습

#### FC18-P02-C05. 3D Object Detection

- `FC18-P02-C05-L001` 3차원 객체 검출 방법론
- `FC18-P02-C05-L002` Voxel 기반의 3차원 객체 검출(1) - VoxelNet (1)
- `FC18-P02-C05-L003` Voxel 기반의 3차원 객체 검출(1) - VoxelNet (2)
- `FC18-P02-C05-L004` Voxel 기반의 3차원 객체 검출(2) - PointPillars
- `FC18-P02-C05-L005` Point 기반의 3차원 객체 검출 - Point R-CNN (1)
- `FC18-P02-C05-L006` Point 기반의 3차원 객체 검출 - Point R-CNN (2)
- `FC18-P02-C05-L007` Voxel+Point 기반의 3차원 객체 검출 - PV-RCNN
- `FC18-P02-C05-L008` mmdetection3D를 이용한 3차원 객체 검출 실습 (1)
- `FC18-P02-C05-L009` mmdetection3D를 이용한 3차원 객체 검출 실습 (2)
- `FC18-P02-C05-L010` mmdetection3D를 이용한 3차원 객체 검출 실습 (3)
- `FC18-P02-C05-L011` ROS를 활용한 LiDAR Object Tracking 실습

#### FC18-P02-C06. 3D Segmentation

- `FC18-P02-C06-L001` 3차원 분할 방법론
- `FC18-P02-C06-L002` Dynamic Graph CNN을 활용한 Segmentation 실습
- `FC18-P02-C06-L003` Kernel Point Convolutions을 활용한 Segmentation 실습 (1)
- `FC18-P02-C06-L004` Kernel Point Convolutions을 활용한 Segmentation 실습 (2)
- `FC18-P02-C06-L005` LiDAR Segmentation 실습
- `FC18-P02-C06-L006` Ground segmentation - Patchwork (1)
- `FC18-P02-C06-L007` Ground segmentation - Patchwork (2)
- `FC18-P02-C06-L008` Ground segmentation - Patchwork++ (1)
- `FC18-P02-C06-L009` Ground segmentation - Patchwork++ (2)
- `FC18-P02-C06-L010` Ground segmentation 실습 (1) - Patchwork
- `FC18-P02-C06-L011` Ground segmentation 실습 (2) - Patchwork++
- `FC18-P02-C06-L012` Loop closure detection - OverlapNet 실습

### FC18-P03. Sensor Fusion

#### FC18-P03-C01. Introduction to Sensor Fusion

- `FC18-P03-C01-L001` 강의 커리큘럼 소개
- `FC18-P03-C01-L002` 센서 퓨전 기반 3차원 객체 검출 기술 개요
- `FC18-P03-C01-L003` 자율주행에 사용되는 센서
- `FC18-P03-C01-L004` 자율주행 데이터셋
- `FC18-P03-C01-L005` 자율주행 인지 기술 성능 평가 지표
- `FC18-P03-C01-L006` [실습 1] 자율주행 데이터셋 살펴보기 (nuScenes)

#### FC18-P03-C02. Sensor Fusion Preliminaries

- `FC18-P03-C02-L001` 객체 검출 네트워크 구성 요소 (1)
- `FC18-P03-C02-L002` 객체 검출 네트워크 구성 요소 (2)
- `FC18-P03-C02-L003` [실습 2] MMDetection 객체 검출 Toolbox 실습
- `FC18-P03-C02-L004` 센서 좌표계 및 캘리브레이션
- `FC18-P03-C02-L005` [실습 3] 3차원-2차원 좌표계 변환 실습
- `FC18-P03-C02-L006` 센서 퓨전 네트워크 구성 요소

#### FC18-P03-C03. Unimodal 3D Detection

- `FC18-P03-C03-L001` 라이다 기반 3차원 객체 검출 기술 개요
- `FC18-P03-C03-L002` 복셀 기반 3차원 객체 검출 - CenterPoint
- `FC18-P03-C03-L003` [실습 4] CenterPoint 실습
- `FC18-P03-C03-L004` 카메라 기반 3차원 객체 검출 기술 개요
- `FC18-P03-C03-L005` 이미지 뷰 기반 3차원 객체 검출 - DD3D
- `FC18-P03-C03-L006` 조감도 기반 3차원 객체 검출 - BEVDepth, BEVFormer
- `FC18-P03-C03-L007` [실습 5] BEVDepth 실습

#### FC18-P03-C04. Multimodal 3D Detection

- `FC18-P03-C04-L001` 센서 퓨전 기반 3차원 객체 검출 기술 개요
- `FC18-P03-C04-L002` Point level 퓨전 - PointPainting, MVP
- `FC18-P03-C04-L003` Feature level 퓨전 - BEVFusion, TransFusion
- `FC18-P03-C04-L004` [실습 6] Fine-grained 퓨전 네트워크 BEVFusion 실습
- `FC18-P03-C04-L005` Result-level 퓨전 - CLOC, F-PointNet
- `FC18-P03-C04-L006` Proposal-level 퓨전 - MV3D, AVOD, ImVoteNet
- `FC18-P03-C04-L007` [실습 7] ImVoteNet 실습

### FC18-P04. SLAM

#### FC18-P04-C01. Introduction to SLAM

- `FC18-P04-C01-L001` 강의&강사 소개
- `FC18-P04-C01-L002` SLAM이란?
- `FC18-P04-C01-L003` SLAM에서 사용되는 하드웨어
- `FC18-P04-C01-L004` SLAM의 종류
- `FC18-P04-C01-L005` SLAM의 사용처
- `FC18-P04-C01-L006` SLAM 공부에 앞서
- `FC18-P04-C01-L007` C++ 기초

#### FC18-P04-C02. 3D Space

- `FC18-P04-C02-L001` 3차원 회전과 이동
- `FC18-P04-C02-L002` 3차원 회전과 이동 [실습]
- `FC18-P04-C02-L003` 동차좌표계
- `FC18-P04-C02-L004` Lie Group
- `FC18-P04-C02-L005` 기초 Lie Algebra
- `FC18-P04-C02-L006` 기초 Lie Algebra [Sophus 실습]
- `FC18-P04-C02-L007` 카메라의 구조
- `FC18-P04-C02-L008` 라이다의 구조

#### FC18-P04-C03. Image Processing

- `FC18-P04-C03-L001` Local feature/Descriptor 검출
- `FC18-P04-C03-L002` Local feature/Descriptor 검출 [실습]
- `FC18-P04-C03-L003` Superpoint/Superglue 검출 [실습]
- `FC18-P04-C03-L004` Global feature 검출
- `FC18-P04-C03-L005` BoW 벡터 검출 [실습]
- `FC18-P04-C03-L006` Learning based global feature 검출 [실습]
- `FC18-P04-C03-L007` Feature tracking
- `FC18-P04-C03-L008` Feature tracking [실습]

#### FC18-P04-C04. Point Cloud Processing

- `FC18-P04-C04-L001` Point cloud processing 소개
- `FC18-P04-C04-L002` PCL 라이브러리 기초 [실습]
- `FC18-P04-C04-L003` Point cloud 전처리 기초
- `FC18-P04-C04-L004` Point cloud 전처리 기초 [실습]
- `FC18-P04-C04-L005` Iterative Closest Point (ICP)
- `FC18-P04-C04-L006` Iterative Closest Point (ICP) [실습]
- `FC18-P04-C04-L007` 최신 ICP
- `FC18-P04-C04-L008` 최신 ICP [실습]
- `FC18-P04-C04-L009` Octree, Octomap, Bonxai [실습]

#### FC18-P04-C05. Multiple View Geometry

- `FC18-P04-C05-L001` Epipolar geometry
- `FC18-P04-C05-L002` Epipolar geometry [실습]
- `FC18-P04-C05-L003` Homography
- `FC18-P04-C05-L004` Homography [실습]
- `FC18-P04-C05-L005` Simple monocular visual odometry [실습]
- `FC18-P04-C05-L006` Triangulation
- `FC18-P04-C05-L007` Triangulation [실습]
- `FC18-P04-C05-L008` Perspective-n-Points (PnP), Direct Linear Transform (DLT)
- `FC18-P04-C05-L009` Perspective-n-Points (PnP) [실습]
- `FC18-P04-C05-L010` RANSAC
- `FC18-P04-C05-L011` 최신 RANSAC
- `FC18-P04-C05-L012` RANSAC [실습]
- `FC18-P04-C05-L013` Graph-based SLAM
- `FC18-P04-C05-L014` Least squares, Non-linear optimization, Gauss-Newton
- `FC18-P04-C05-L015` Schur complement
- `FC18-P04-C05-L016` Bundle adjustment
- `FC18-P04-C05-L017` Bundle adjustment [실습]

#### FC18-P04-C06. Visual SLAM

- `FC18-P04-C06-L001` Feature-based SLAM
- `FC18-P04-C06-L002` Direct SLAM
- `FC18-P04-C06-L003` Visual-inertial odometry (VIO)/Visual-inertial system (VINS)
- `FC18-P04-C06-L004` Spatial AI
- `FC18-P04-C06-L005` ORB-SLAM3 [실습]
- `FC18-P04-C06-L006` DynaVINS [실습]
- `FC18-P04-C06-L007` CubeSLAM [실습]

#### FC18-P04-C07. LiDAR SLAM

- `FC18-P04-C07-L001` 2D LiDAR SLAM
- `FC18-P04-C07-L002` 3D LiDAR SLAM/LiDAR-inertial odometry (LIO)
- `FC18-P04-C07-L003` HDL-Graph-SLAM [실습]
- `FC18-P04-C07-L004` KISS-ICP [실습]
- `FC18-P04-C07-L005` SHINE-Mapping [실습]

#### FC18-P04-C08. CI/CD

- `FC18-P04-C08-L001` 강인한 SLAM 개발 방법
- `FC18-P04-C08-L002` Test와 TDD
- `FC18-P04-C08-L003` CI/CD
- `FC18-P04-C08-L004` 성능 평가

### FC18-P05. Motion Planning & Control

#### FC18-P05-C01. Introduction

- `FC18-P05-C01-L001` Motion Planning & Control 강의 소개
- `FC18-P05-C01-L002` Motion Planning & Control System Architecture
- `FC18-P05-C01-L003` Modeling for Planning and Control

#### FC18-P05-C02. Decision Making & Motion Planning

- `FC18-P05-C02-L001` Route Planner - 개요 및 방법론
- `FC18-P05-C02-L002` Route Planner - Road Network & Free Space
- `FC18-P05-C02-L003` Route Planner - 실습
- `FC18-P05-C02-L004` Behavior Decision Making - 개요
- `FC18-P05-C02-L005` Behavior Decision Making : 기반 지식 - Motion Prediction
- `FC18-P05-C02-L006` Behavior Decision Making : 기반 지식 - Risk Assessment
- `FC18-P05-C02-L007` Behavior Decision Making - 방법론 및 사례
- `FC18-P05-C02-L008` 실습 환경 소개 - HighwayEnv
- `FC18-P05-C02-L009` Behavior Decision Making - 실습
- `FC18-P05-C02-L010` Motion Planner - 개요
- `FC18-P05-C02-L011` Motion Planner - 방법론 및 사례
- `FC18-P05-C02-L012` Motion Planner - 실습 (1) Lane Change
- `FC18-P05-C02-L013` Motion Planner - 실습 (2) Collision Avoidance
- `FC18-P05-C02-L014` Motion Planner - 실습 (3) Parking

#### FC18-P05-C03. Motion Control

- `FC18-P05-C03-L001` Motion Control - 개요
- `FC18-P05-C03-L002` Lateral Motion Control - 개요
- `FC18-P05-C03-L003` Lateral Motion Control - 방법론 (1) Geometry Based
- `FC18-P05-C03-L004` Lateral Motion Control - 방법론 (2) Model Based
- `FC18-P05-C03-L005` Lateral Motion Control - 실습
- `FC18-P05-C03-L006` Longitudinal Motion Control - 개요
- `FC18-P05-C03-L007` Longitudinal Motion Control - 방법론
- `FC18-P05-C03-L008` Longitudinal Motion Control - 실습 (1)
- `FC18-P05-C03-L009` Longitudinal Motion Control - 실습 (2)
- `FC18-P05-C03-L010` Longitudinal Motion Control - 실습 (3)
- `FC18-P05-C03-L011` Longitudinal Motion Control - 실습 (4)
- `FC18-P05-C03-L012` Longitudinal Motion Control - 실습 (5)

#### FC18-P05-C04. Project

- `FC18-P05-C04-L001` 고속도로에서 안전과 효율을 고려한 차선 변경
- `FC18-P05-C04-L002` 비보호 교차로에서 안전을 고려한 진입 진출

#### FC18-P05-C05. Appendix

- `FC18-P05-C05-L001` Connected Systems
- `FC18-P05-C05-L002` End-to-end Driving

### FC18-P06. 자율주행 3종 최종 프로젝트

#### FC18-P06-C01. 도심 속 자율주행 드라이빙 시나리오 (1) (Camera + SLAM)

- `FC18-P06-C01-L001` Camera Perception - MaskRCNN Review
- `FC18-P06-C01-L002` Point Clouds Object Detection - PointPillars Review
- `FC18-P06-C01-L003` Object-aware SLAM - ORB SLAM2 Review
- `FC18-P06-C01-L004` DSP-SLAM Review
- `FC18-P06-C01-L005` DSP-SLAM 빌드 및 실습

#### FC18-P06-C02. 도심 속 자율주행 드라이빙 시나리오 (2) (LiDAR + SLAM)

- `FC18-P06-C02-L001` LiDAR Segmetation - RangeNet++ Review
- `FC18-P06-C02-L002` LiDAR SLAM - SuMa Review
- `FC18-P06-C02-L003` LiDAR Semantic SLAM - SuMa++ Review
- `FC18-P06-C02-L004` SuMa++ 빌드 및 실습

#### FC18-P06-C03. Auto Valet Parking 서비스 구현 (LiDAR SLAM + Path Planning & Control)

- `FC18-P06-C03-L001` 프로젝트 소개
- `FC18-P06-C03-L002` LiDAR SLAM을 이용한 2D occupancy grid map 생성
- `FC18-P06-C03-L003` 2D occupancy grid map에서의 주차 경로 계획
