# 커리큘럼 병합 원칙과 사이트 이행 계획

## 1. 변경할 구조

현재 6장 중심의 단일 경로를 **공통 기반 + 전문 트랙 + 통합 프로젝트**로 확장합니다. 기존 교재 제목과 학습 내용은 유지하고 로봇팔·모방학습·Sim2Real 경로의 주된 콘텐츠로 재사용합니다. 아래는 실행 계획이며 이 조사에서 앱의 라우트·콘텐츠·진도 저장을 수정하지 않았습니다.

| 기존 방식의 한계 | 재편 방안 |
|---|---|
| 로봇팔과 Isaac Sim·SmolVLA에 집중 | 모바일·인지/SLAM·RL/휴머노이드·제작/임베디드를 별도 트랙으로 확장 |
| 플랫폼별 환경·ROS·수학 설명 반복 | 공통 모듈을 한 번 제공하고 필요한 부분으로 링크 |
| 기초 도구 조작과 연구 심화가 섞임 | 사용 입문 → 원리 → 최적화/실패 진단을 구분 |
| 전체 순서가 하나로 고정 | 진단·선수 조건에 따라 여러 진입점 제공 |
| 실물·GPU 요구가 학습 진입 장벽 | 브라우저 개념 실습과 기록 재생을 기본, 로컬/실물 심화 선택 |

## 2. 공통 영역 병합

공개 목차의 문구가 같다는 사실과 같은 영상이라는 판단은 구분합니다. [조사 방법](research_method.md)의 분할 8개 과정은 종합 3개 과정과 230개 제목이 대응되므로 사이트에 중복 단원을 만들지 않습니다.

| 공통 개념 | 여러 원자료에서의 반복 | 통합 위치 | 반복을 줄이는 방법 |
|---|---|---|---|
| 개발 환경·Python·C/C++ | FC01·04·07·15·23·25 | M01 | 진단 통과 시 건너뛰고 트랙별 설정 차이만 부록 카드로 제공 |
| 좌표·변환·기구학 | FC01·02·03·15·17·18·27 | M02·M06 | 수학과 로봇 적용을 분리하고 각 트랙에서 짧은 회상 |
| ROS 2 통신·실행 | FC04~14·15·21·30 | M05 | 패키지·통신·시간·진단 한 번 학습 |
| URDF·Xacro·구동 모델 | FC05·08·09·15·21 | M08 | 동일 모델 계약을 Gazebo·Isaac·MoveIt에서 재사용 |
| 제어·동역학 | FC01·15·19·23 | M07 | 공통 PID·안정성 뒤 팔/차량/밸런싱 응용 분기 |
| 카메라·검출·딥러닝 | FC01·16·18 | M11~M12 | ML 기초와 인지 과제를 분리; 범용 얼굴 인식은 비교 선택 |
| 점군·보정·융합 | FC16·17·18·27 | M13~M14 | 좌표·시간·불확실성을 공통 계약으로 사용 |
| SLAM·위치추정 | FC04·10·15·17·18·21 | M15~M16 | 패키지 사용 입문과 최적화 심화를 별도 단계로 유지 |
| 경로 계획·Nav2 | FC04·11·15·18·21 | M17~M18 | 알고리즘 원리와 미션 통합을 구분 |
| 물리·시뮬레이션 | FC05·09·16·20·21·22·26·27 | M09~M10·M25 | 공통 물리 이해 후 Gazebo·Isaac·MuJoCo별 차이 학습 |
| 시연·BC·ACT·VLA | FC20·21·27 | M20~M22 | 데이터 → BC/ACT → VLA 순서; 같은 데이터 계약 사용 |
| 프로젝트·포트폴리오 | FC18·23·25·27·30 | M31~M32 | 실행 데모와 원인 분석·재현 근거를 함께 평가 |

## 3. 고유 주제 보존 및 출처별 배치

통합은 전문 주제를 삭제하는 것이 아닙니다. 아래 표에서 모든 조사 항목을 추적합니다. 단원 제목만으로 1,924개 차시가 모두 사이트 콘텐츠로 이식됐다고 주장하지 않습니다. 개별 차시 목록은 원자료 문서에 유지하고 실제 집필 단계에서 소주제별 상세 매핑을 확정합니다.

| 원자료 | 보존할 특징 / 처리 | 통합 모듈 |
|---|---|---|
| [FC01](fastcampus/FC01_data_online_physicalai.md) | 폐루프·좌표·인지-판단-제어·회로의 전체 흐름 | M00~M03·M07·M11~M12·M17·M26 |
| [FC02](fastcampus/FC02_data_online_robotbegin.md) | 델타·옴니·메카넘·팔·텔레옵; C# 도구는 선택 비교 | M03·M04·M06·M19~M20·M33 |
| [FC03](fastcampus/FC03_data_online_articulatedrobot.md) | 협동 팔 티칭·산업 비전·디팔레타이징·피스피킹 | M06·M19·M32 |
| [FC04](fastcampus/FC04_data_online_selfdriving.md) | SLAM 사용·Nav2·BT·다중 로봇 | M05·M15·M18 |
| [FC05](fastcampus/FC05_data_online_selfdriving2.md) | URDF/Xacro·Gazebo·센서·주행 모델 | M08~M09 |
| [FC06](fastcampus/FC06_data_online_ros2ai.md) | 실물 조립·센서 처리·모바일 AI 통합 | M03·M05·M09·M14·M18·M22·M27·M32 |
| [FC07](fastcampus/FC07_data_online_ros2.md) | Part 1; FC04의 환경·ROS 2 주제와 병합 | M01·M05 |
| [FC08](fastcampus/FC08_data_online_urdf.md) | Part 2; FC05의 URDF 주제와 병합 | M08 |
| [FC09](fastcampus/FC09_data_online_gazebo.md) | Part 3; FC05의 Gazebo 주제와 병합 | M09 |
| [FC10](fastcampus/FC10_data_online_slambasic.md) | Part 4; FC04의 SLAM 주제와 병합 | M15 |
| [FC11](fastcampus/FC11_data_online_nav2.md) | Part 5; FC04의 Nav2 주제와 병합 | M17~M18 |
| [FC12](fastcampus/FC12_data_online_realrobot.md) | Part 6; FC06의 조립 주제와 병합 | M03 |
| [FC13](fastcampus/FC13_data_online_realrobotros2.md) | Part 7; FC06의 ROS·센서 주제와 병합 | M05·M09·M14·M18 |
| [FC14](fastcampus/FC14_data_online_aidevrobot.md) | Part 8; FC06의 AI 통합 주제와 병합 | M22 |
| [FC15](fastcampus/FC15_data_online_mp.md) | 그래프·PRM/RRT 변형·CHOMP/STOMP·MoveIt 2·이동 조작 | M02·M06~M08·M17~M19·M32 |
| [FC16](fastcampus/FC16_data_online_yolov11.md) | YOLO V11·로봇 비전·Isaac 기반 데이터/비전 | M10~M14·M25 |
| [FC17](fastcampus/FC17_data_online_slam.md) | Visual/LiDAR/관성 SLAM·백엔드·SIMD/CUDA·Jetson 최적화·드론/스캐너/사족/VR·AR 응용 | M02·M13~M16 |
| [FC18](fastcampus/FC18_data_online_autovehicle.md) | 2D/3D 검출·분할·센서퓨전·주행·주차; 얼굴 인식은 선택 | M11~M17·M29·M31~M32 |
| [FC19](fastcampus/FC19_data_online_matlab.md) | 전달함수·근궤적·PID·MATLAB 연동 목표 보존, Python 중심 | M07·M33 |
| [FC20](fastcampus/FC20_data_online_il.md) | Mobile ALOHA·양팔/이동 조작·ACT·Motion Manifold·MuJoCo | M20~M21·M30·M32 |
| [FC21](fastcampus/FC21_data_online_vla.md) | 로컬 LLM·MuJoCo·언어 주행·SmolVLA·로봇 패키지 분석 | M09·M18·M20~M22·M27 |
| [FC22](fastcampus/FC22_data_online_humanoid.md) | Isaac Lab·PPO·rsl_rl·Unitree G1·보행 | M10·M23~M24·M30 |
| [FC23](fastcampus/FC23_data_online_embedded.md) | Atmega·주변장치·HSI·PCB·CAD·BSW/ASW·밸런싱·테스트 | M01·M03~M04·M07·M26·M31~M33 |
| [FC24](fastcampus/FC24_data_online_can.md) | CAN/FD·ISO-TP·UDS·DTC·재프로그래밍·XCP/DAQ/A2L | M28 |
| [FC25](fastcampus/FC25_data_online_clauderobot.md) | 명세-재현-진단-회귀·장시간/다중 Agent·Isaac/Pi 연동 | M01·M27·M31 |
| [FC26](fastcampus/FC26_data_online_digitaltwin.md) | 부분 확인: SimReady·복합 관절·충돌 필터·도구 접촉 | M10·M25; 미확인 차시는 반영 유보 |
| [FC27](fastcampus/FC27_data_thecamp_physicalai.md) | SO-101·PhysX·기구학·센서·LeRobot·SmolVLA·포트폴리오 | 기존 6장 재사용·M10·M20~M22·M30·M32 |
| [FC28](fastcampus/FC28_dev_online_aicoding.md) | Scratch/IoT/블록 로봇만 비전공 브리지; 비로봇 프로젝트 제외 | M33 선택 |
| [FC29](fastcampus/FC29_dgn_online_fpvdrone.md) | 수동 FPV 조종·시뮬레이터·비행 연습; 자율비행으로 확대 해석 금지 | M33 선택 |
| [FC30](fastcampus/FC30_data_camp_roboai.md) | ROS·URDF·비전 조작·SLAM·배달 프로젝트 구조; 옛 환경 제외 | M05·M08·M15·M19·M32 |
| [FC31](fastcampus/FC31_event_online_isaacsim.md) | 현업 문제·역량·Isaac 활용 사례를 오리엔테이션 참고 | M00·M33; 별도 정규 코스 아님 |

## 4. 현재 교재 6장 재사용 지도

| 현재 교재 | 유지할 핵심 | 통합 위치 | 추가할 내용 |
|---|---|---|---|
| 1장 Physical AI·Isaac·ROS 2 | 폐루프·관측·환경·브리지 | M00·M05·M10 | ROS 2 통신·빌드·QoS·진단 체계와 기초 진단 |
| 2장 PhysX 시뮬레이션 | 충돌·마찰·관성·시간·자산 | M10·M25 | Gazebo 비교·복합 관절·디지털 트윈·합성 데이터 프로젝트 |
| 3장 SO-101 기구학·텔레옵 | FK/IK·보정·Leader-Follower·안전 | M06·M19~M20 | 일반 기구학·MoveIt 2·산업 티칭·다른 구동 구조 |
| 4장 센서 정합·데이터 | 카메라·TF·시간 정합·MCAP·Rerun·랜덤화 | M12·M14·M20·M25 | 점군·검출·센서퓨전·SLAM의 별도 기초/심화 |
| 5장 LeRobot·SmolVLA | 데이터 품질·학습·추론·BC/ACT/VLA 계보 | M11·M20~M22 | ML 브리지·Mobile ALOHA·양팔·로컬 LLM·언어 미션 |
| 6장 Sim2Real·배포 실증 | Gap 진단·필터·감독기·지표·신뢰구간·포트폴리오 | M27·M30·M32 | 모바일·보행·밸런싱별 실패 시나리오와 배포 계약 |

기존 장 전체를 쪼개 삭제하지 않습니다. 설명·코드·수식·해설·문제를 학습 단위로 재배치하고, 기존 URL은 유지하거나 명시적인 별칭으로 연결합니다. 다른 트랙에서 같은 본문을 복제하지 않고 공통 단원으로 연결합니다. 머리말·판권·판매 안내는 학습 본선에 추가하지 않습니다. 용어·수학·디버깅 자료는 관련 내용으로 바로 연결할 때 유지합니다.

## 5. 단계별 실행 순서

### 단계 A. 정보 구조와 기존 콘텐츠 보존

- `track → module → unit` 카탈로그와 선수 조건을 데이터로 분리.
- 기존 lesson/unit ID·URL·로컬 진도·대화 이력을 보존. 이행용 alias/version과 충돌 규칙을 정의.
- 기존 6장 본문·코드·해설·문제의 누락 여부를 확인하고 공통 개념 매핑.
- 완료 기준: 현재 학습 경로가 계속 동작하고 기존 학습자가 진도·대화를 잃지 않음.

### 단계 B. 공통 기반과 모바일 최소 완결 경로

- M00~M03·M05~M09의 부족한 설명을 먼저 보강. M04는 제작 트랙 진입 시 제공.
- M11~M12 기초·M14 시간/보정 기초·M15·M17~M18를 추가.
- 좌표계·PID·URDF 오류 찾기·2D SLAM·A*/RRT·가상 배달 미션 제작.
- 완료 기준: 장비 없이 인지-위치추정-계획-제어의 연결을 설명하고 가상 배달 과제를 끝낼 수 있음.

### 단계 C. 로봇팔·학습 정책 심화

- 기존 M10·M20~M22·M30 콘텐츠에 M19 티칭/MoveIt·M21 양팔/ACT·M25 트윈을 연결.
- 코드/수식 이해 질문, 에피소드 품질 검사, 비교 롤아웃, 실패 원인 서술 및 해설 제공.
- 완료 기준: 기존 단원 설명을 보존하면서 데이터→정책→평가 경로가 끊기지 않음.

### 단계 D. 전문 트랙 순차 확장

1. M13~M16 인지·센서퓨전·SLAM 심화.
2. M23~M24 RL·휴머노이드와 M27 엣지 실행.
3. M04·M26 임베디드 제작, M28~M29 차량 통신/자율주행.
4. M31 고급 개발 워크플로우, M33 선택 체험.

우선순위는 현재 교재 자산 재사용과 장비 없는 실습 제작 난도를 기준으로 한 제안입니다. 각 트랙은 독립 배포 가능한 완결 과제를 확보한 뒤 공개합니다. 모든 전문 모듈을 한 번에 집필·배포하지 않습니다.

### 단계 E. 트랙별 캡스톤·숙달 지도

- M32의 배달·집기·이동 조작·보행·밸런싱 과제를 트랙별 제공.
- 객관/수치 판정과 서술 AI 피드백을 분리. 오답→힌트→재시도→해설 흐름 적용.
- 방문 완료와 이해/수행 수준을 구분하고, 약한 선수 개념을 추천.
- 완료 기준: 수강 진도 외에도 답안·실험·원인 분석으로 학습 성과를 설명할 수 있음.

## 6. 콘텐츠·서비스 구현 경계

- 문서의 주제 조사만으로 타사 교안·동영상·코드를 가져오지 않음. 자체 설명과 예제·해설을 작성.
- Ubuntu 24.04·Python/C++ 기본선에 맞춰 실습을 설계하고, 유료/특정 OS 도구는 선택 비교로 분리.
- Cloudflare Pages 정적 학습 콘텐츠, Worker 텍스트 AI 기능, localStorage 진도/대화 구조를 유지할 수 있음. 연구용 GPU 연산·장비 드라이버를 Worker에 넣지 않음.
- 인터랙티브 데이터는 정답·허용 오차·루브릭·해설·선수 개념 ID를 명시. 비밀 API 키는 프런트 정적 파일에 포함하지 않음.
- AI 검색 인덱스의 범위를 전체 카탈로그로 넓히되 질문과 관련된 본문·코드·실습 상태만 보충. 학습 범위 제어 정책은 별도 검토/구현 대상으로 유지.
- 출시 전에는 링크·수식·접근성·진도 이행·기존 콘텐츠 누락·답안/해설 흐름을 실제 화면에서 확인. 이 조사 자체는 서비스 코드 변경이나 배포를 수행하지 않음.
