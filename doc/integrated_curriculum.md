# Physical AI 엔지니어링 통합 커리큘럼

이 문서는 공개 강의의 **학습 목표를 통합한 우리 사이트의 신규 설계안**입니다. 강의들을 이어 붙인 시간표나 원자료에 없는 차시를 복원한 자료가 아닙니다. 원래 세부 목차는 [31개 과정 문서](course_inventory.md)에 남깁니다.

## 1. 재편 방향

현재 교재 **Physical AI 로봇 제어 실무**의 로봇팔·시뮬레이션·데이터·VLA·Sim2Real 강점을 유지하면서, 공통 공학 기반과 모바일·인지·휴머노이드·임베디드를 확장합니다. 공통 개념은 한 번 학습하고 이후 응용에서 짧게 회상합니다. 도구 사용 입문 → 원리 → 실패 진단 → 통합 과제의 순환으로 깊이를 높입니다.

대상은 일반적인 코딩을 이미 할 수 있는 개발자입니다. 언어·문법·일반 코딩 입문은 가르치지 않습니다. Python·C/C++은 AI·로봇 실행 환경 구성, 패키지·네이티브 확장·ABI, CMake·colcon과 빌드 오류, 텐서·시간·데이터 계약 등 일반 개발과 다른 도구 선수지식만 다룹니다. 로봇 수학·제어·하드웨어·ML은 진단과 풀이로 필요한 브리지를 보충합니다. 한국어 설명에 영어 용어를 병기합니다. 기존 Linux Ubuntu 24.04 / ROS 2 Jazzy 기준을 유지하며, 원자료의 오래된 버전·C#·MATLAB·Windows 전용 도구를 그대로 필수화하지 않습니다. Isaac Sim·Isaac Lab·Gazebo 등 상세 조합은 실제 콘텐츠 제작 시 호환성을 확인해 별도 고정합니다.

## 2. 전체 구조와 추천 경로

모듈 번호 M00~M34는 내용을 찾는 고정 ID이며 학습 순서가 아닙니다. 2026-11-06에 KANT의 실습 진입 → 로봇 기반 → 모바일 → 조작 → AI → 통합이라는 흐름을 참고하여 기존 내용을 소주제 단위로 재배치했습니다. 세부 설명은 우리 콘텐츠로 보충합니다. 웹의 기본 이전·다음 이동과 공통 과정은 아래 순서를 사용합니다.

일반 코딩 경험을 전제하므로 Python 문법 입문은 추가하지 않습니다. 처음부터 기구학·딥러닝 전체를 요구하지 않고 제공된 가상 노드와 고전적 영상 연산으로 시작합니다. 다만 좌표·시간·제어 등 실제로 필요한 선수는 건너뛰지 않습니다.

| 단계 | 학습 내용 | 소주제 수 | 중간 과제 |
|---|---|---:|---|
| S00 | 과정 체험·문제 정의·진단 | 6 | — |
| S01 | 개발·빌드 도구와 AI·로봇 실행 환경 | 8 | — |
| S02 | 첫 ROS 프로그램·기본 영상 처리·P1 | 3 | P1 |
| S03 | 좌표·센서·로봇 모델·보정 | 26 | — |
| S04 | 확률·제어·추적·3D 공간 인지 | 13 | — |
| S05 | 시뮬레이션 주행·위치추정·계획·P2 | 22 | P2 |
| S06 | 팔 기구학·물리 시뮬레이션·조작 | 15 | — |
| S07 | 학습 기초·데이터·기본 모방학습 | 17 | — |
| S08 | 언어·시각·행동 모델과 실행 감독 | 6 | — |
| S09 | 다중 로봇·주행-조작 통합·P3 | 3 | P3 |
| S10 | 트윈·관제·엣지·현장 전이·P4 | 23 | P4 |
| S11 | 선택 캡스톤·재현 패키지·발표 | 5 | — |
| A01 | C/C++·MCU·제작·차량 통신 심화 | 19 | — |
| A02 | 계획·추정·학습 정책 연구 심화 | 16 | — |
| A03 | 강화학습·휴머노이드·균형 제어 | 13 | — |
| A04 | 선택 체험·전용 도구 비교 | 6 | — |
| A05 | 자율주행 차량 응용 | 6 | — |

S00~S11 공통 과정은 147개 소주제(필수 144개, S11 캡스톤 선택안 3개)입니다. S11에서는 모바일·로봇팔·통합 중 목표에 맞는 과제를 고릅니다. A01~A05의 60개는 전문화·선택 과정입니다. 기존 여섯 전문 트랙의 ID·소속 단위·필수/선택 의미는 유지하고 선수 조건을 만족하도록 순서를 조정했습니다. 공통 과정은 `track-main`으로 추가했습니다.

P1~P4는 단계별 목표·산출물·판정 기준을 잇는 안내입니다. 안내 페이지와 Python3.12.11 표준라이브러리 기본 실행 패키지를 제공합니다. P1은 고정RGB재생·합성폐루프, P2는 지도/제공위치·격자 이송·동적장애물/TF·시각/지도오류·원관측재생을 다루며 각각 실패해설·다운로드·별도수행근거저장을 갖습니다. 실제ROS/장비실증은 포함하지 않으며 P3는 예약/점유·주행/정지·작업/수납·출발 준비를 구분하는 두 로봇 합성 사건 재생과 실패 해설·다운로드·별도 근거 저장을 제공합니다. P4는 세션을 나눈 작은 BC 학습/평가·1차원 합성 폐루프·관측/개정 오류·롤백 보류의 6개 실험과 zero 비교·다운로드·별도 수행근거 저장을 제공합니다. M34.01~03 관제·장면 정합·운영 UI 교재를 제공합니다. 공통 과정147개에는 모두 상세 교재가 있으며, 전문화에는 집필 20개·미집필 40개가 있습니다. E1~E5는 집필 이력이며 미실행E6~E9는 현행W/PKG/G작업으로 재배분했습니다. 작업 순서와 학습자가 따라야 하는 단계는 구분합니다.

M31의 명세·재현·검토 습관은 초기에, 자동화·다중 에이전트 운영은 통합 단계에서 다룹니다. 양팔 실제 정책·실행을 선택하는 경우 M21.05를 추가 선수로 이수하며, 제공된 숫자만 사용하는 M32.03 기본 활동과 구분합니다.

## 3. 세부 모듈

각 모듈의 소주제는 1~여러 개의 짧은 학습 단위로 제작합니다. 아래 실습과 판정 기준은 신규 서비스 제안입니다. 출처 ID는 주제 근거를 추적하기 위한 것으로 세부 설명이 원자료와 동일하다는 뜻은 아닙니다.


### M00. 문제 정의·학습 진단·로봇 안전

- 선수 조건: 없음
- 주제 참고: [FC01](fastcampus/FC01_data_online_physicalai.md) · [FC27](fastcampus/FC27_data_thecamp_physicalai.md) · [FC31](fastcampus/FC31_event_online_isaacsim.md)

소주제:

1. `M00.01` Software AI와 Physical AI, 폐루프와 POMDP
2. `M00.02` 관측·상태·행동·보상의 구분
3. `M00.03` 로봇팔·AMR·휴머노이드·차량의 공통점과 차이
4. `M00.04` 성공 조건·환경 제약·지연·안전 한계 정의
5. `M00.05` 개발환경·수학·제어·ML 자기진단과 선행학습 분기
6. `M00.06` 장비 없는 실습·로그 재생·실물 실습의 차이

- 자습·가상실습: 가상 로봇의 센서 가림·행동 지연을 바꾸고 실패 원인을 서술.
- 이해·수행 판정: 상태와 관측을 구분하고 과제의 성공·중단 조건을 직접 정의.

### M01. AI·로봇 실행 환경·패키지·네이티브 빌드

- 선수 조건: M00
- 주제 참고: [FC01](fastcampus/FC01_data_online_physicalai.md) · [FC04](fastcampus/FC04_data_online_selfdriving.md) · [FC07](fastcampus/FC07_data_online_ros2.md) · [FC23](fastcampus/FC23_data_online_embedded.md) · [FC25](fastcampus/FC25_data_online_clauderobot.md)

소주제:

1. `M01.01` Ubuntu 24.04 셸·프로세스·권한·USB·네트워크
2. `M01.02` Python 패키지·가상환경·NumPy·파일과 로그
3. `M01.03` C/C++ 확장·ABI·버퍼 소유권과 수명
4. `M01.04` CMake·colcon·컴파일·링크·빌드 오류 진단
5. `M01.05` Git·의존성 고정·컨테이너와 재현 환경
6. `M01.06` Python 실험과 C++ 실행 경계·시간·데이터 계약

- 자습·가상실습: 제공된 실행·빌드 기록에서 인터프리터·패키지·ABI·경로·시간·단위 오류를 진단하기.
- 이해·수행 판정: 도구와 산출물의 계약을 확인하고 빌드·런타임 오류의 최초 실패 단계를 설명.

### M02. 로봇 수학·확률·최적화 브리지

- 선수 조건: M00, M01
- 주제 참고: [FC01](fastcampus/FC01_data_online_physicalai.md) · [FC15](fastcampus/FC15_data_online_mp.md) · [FC17](fastcampus/FC17_data_online_slam.md) · [FC18](fastcampus/FC18_data_online_autovehicle.md) · [FC19](fastcampus/FC19_data_online_matlab.md)

소주제:

1. `M02.01` 벡터·내적·외적·행렬·선형 방정식
2. `M02.02` 회전·동차변환·SO(3)/SE(3)와 쿼터니언
3. `M02.03` 미분·적분·Jacobian·수치 미분
4. `M02.04` 확률·가우시안·조건부 확률·공분산
5. `M02.05` 최소제곱·경사하강·비선형 최적화
6. `M02.06` 고윳값·안정성·오차 전파의 직관

- 자습·가상실습: 좌표 변환 블록과 잡음 슬라이더로 결과를 예측 후 계산.
- 이해·수행 판정: 변환 방향·각도 단위·불확실성 해석을 설명하고 작은 수치 문제 해결.

### M03. 기구·센서·액추에이터·전원

- 선수 조건: M00, M02 기하 기초
- 주제 참고: [FC01](fastcampus/FC01_data_online_physicalai.md) · [FC02](fastcampus/FC02_data_online_robotbegin.md) · [FC06](fastcampus/FC06_data_online_ros2ai.md) · [FC12](fastcampus/FC12_data_online_realrobot.md) · [FC23](fastcampus/FC23_data_online_embedded.md)

소주제:

1. `M03.01` 자유도·링크·관절·기어비·백래시
2. `M03.02` 서보·DC·스테퍼·엔코더·모터 드라이버
3. `M03.03` 카메라·깊이·LiDAR·IMU·GNSS의 측정 특성
4. `M03.04` 전압·전류·접지·노이즈·전원 용량
5. `M03.05` 차동·옴니·메카넘·델타·직렬 팔의 구조
6. `M03.06` BOM·배선·인터페이스·기계적 한계 읽기

- 자습·가상실습: 부품을 연결해 가상 배선도를 만들고 센서·전원 오류 찾기.
- 이해·수행 판정: 명령에서 구동과 피드백까지의 경로 및 전원 위험을 설명.

### M04. MCU·주변장치·드라이버 입문

- 선수 조건: M01, M03
- 주제 참고: [FC02](fastcampus/FC02_data_online_robotbegin.md) · [FC23](fastcampus/FC23_data_online_embedded.md)

소주제:

1. `M04.01` MCU 레지스터·메모리·Atmega328p 사례
2. `M04.02` GPIO·UART·인터럽트·타이머
3. `M04.03` ADC·PWM·센서 샘플링·모터 구동
4. `M04.04` SPI·I2C/TWI·EEPROM
5. `M04.05` 펌웨어 상태기계·타임아웃·호스트 통신
6. `M04.06` 단위·범위·오류 코드가 있는 드라이버 계약

- 자습·가상실습: 타이밍 차트에서 인터럽트·PWM·UART 프레임을 조합.
- 이해·수행 판정: 블로킹 처리의 영향을 찾고 안전 정지 상태 전이를 설계.

### M05. ROS 2 통신·실행·관측 도구

- 선수 조건: M01, M03
- 주제 참고: [FC04](fastcampus/FC04_data_online_selfdriving.md) · [FC07](fastcampus/FC07_data_online_ros2.md) · [FC13](fastcampus/FC13_data_online_realrobotros2.md) · [FC15](fastcampus/FC15_data_online_mp.md) · [FC21](fastcampus/FC21_data_online_vla.md) · [FC30](fastcampus/FC30_data_camp_roboai.md)

소주제:

1. `M05.01` 워크스페이스·패키지·빌드·노드·Executor
2. `M05.02` Topic·Service·Action·Parameter와 인터페이스
3. `M05.03` DDS·QoS·통신 발견·네임스페이스
4. `M05.04` Launch·설정·Lifecycle·로그·진단
5. `M05.05` tf2·RViz·rqt와 rosbag2/MCAP 입문
6. `M05.06` 시뮬레이션 시간·실물 시간·주기·네트워크 장애

- 자습·가상실습: 노드 연결도에서 QoS·시간·네임스페이스 오류 수정.
- 이해·수행 판정: 왜 메시지가 안 오는지 증거를 들어 진단하고 통신 방식을 선택.

### M06. 기구학·좌표계·역기구학

- 선수 조건: M02, M03
- 주제 참고: [FC01](fastcampus/FC01_data_online_physicalai.md) · [FC02](fastcampus/FC02_data_online_robotbegin.md) · [FC03](fastcampus/FC03_data_online_articulatedrobot.md) · [FC15](fastcampus/FC15_data_online_mp.md) · [FC27](fastcampus/FC27_data_thecamp_physicalai.md)

소주제:

1. `M06.01` 프레임·오른손 좌표·변환 합성
2. `M06.02` DH 파라미터·정기구학·작업공간
3. `M06.03` 기하학적 IK·Jacobian·감쇠 최소제곱 IK
4. `M06.04` 특이점·관절 제한·다중 해·연속성
5. `M06.05` 차동·옴니·메카넘 순/역운동학
6. `M06.06` 델타 구조와 SO-101 비교·엔코더 영점 보정

- 자습·가상실습: 2~3자유도 팔과 바퀴 속도 위젯에서 목표 도달.
- 이해·수행 판정: 관절 한계 안에서 해를 찾고 도달 불가·특이점 이유 설명.

### M07. 동역학·피드백 제어

- 선수 조건: M02, M03, M06
- 주제 참고: [FC15](fastcampus/FC15_data_online_mp.md) · [FC19](fastcampus/FC19_data_online_matlab.md) · [FC23](fastcampus/FC23_data_online_embedded.md)

소주제:

1. `M07.01` 질량·관성·마찰·토크·중력과 동역학
2. `M07.02` 전달함수·상태공간·시간응답·안정성
3. `M07.03` P/PI/PID·적분 포화·미분 잡음·샘플링
4. `M07.04` 주파수 응답·근궤적의 해석
5. `M07.05` 위치·속도·토크 제어와 궤적 추종
6. `M07.06` 필터·지연·jitter·센서 잡음과 제어 품질

- 자습·가상실습: PID·지연·마찰을 조절해 응답과 오버슈트 비교.
- 이해·수행 판정: 오차·정착 시간·제어 입력을 근거로 튜닝 판단; MATLAB은 비교 선택 자료.

### M08. URDF·Xacro·로봇 모델 계약

- 선수 조건: M05, M06, M07 관성 기초
- 주제 참고: [FC05](fastcampus/FC05_data_online_selfdriving2.md) · [FC08](fastcampus/FC08_data_online_urdf.md) · [FC09](fastcampus/FC09_data_online_gazebo.md) · [FC15](fastcampus/FC15_data_online_mp.md) · [FC21](fastcampus/FC21_data_online_vla.md)

소주제:

1. `M08.01` 링크·관절·visual·collision·inertial
2. `M08.02` Xacro 매크로·자산 경로·패키지 구성
3. `M08.03` 관절 축·제한·mimic·트리 검사
4. `M08.04` 메시 경량화·관성·충돌 형상 품질
5. `M08.05` JointState·robot_state_publisher·tf 연결
6. `M08.06` 구동 인터페이스와 시뮬레이터 간 모델 이식

- 자습·가상실습: 잘못된 축·관성·부모 링크가 있는 모델 고치기.
- 이해·수행 판정: 시각적으로 맞는 모델과 물리적으로 맞는 모델의 차이를 설명.

### M09. Gazebo 기반 모바일·센서 시뮬레이션

- 선수 조건: M05, M07, M08
- 주제 참고: [FC05](fastcampus/FC05_data_online_selfdriving2.md) · [FC09](fastcampus/FC09_data_online_gazebo.md) · [FC13](fastcampus/FC13_data_online_realrobotros2.md) · [FC21](fastcampus/FC21_data_online_vla.md)

소주제:

1. `M09.01` 월드·로봇 스폰·리셋·고정 스텝
2. `M09.02` 차동 구동·조인트 구동·플러그인·브리지
3. `M09.03` 카메라·깊이·LiDAR·IMU 센서 구성
4. `M09.04` odom·base_link·map과 시뮬레이션 시간
5. `M09.05` 주행 명령·오도메트리·로그 기록
6. `M09.06` 모델·월드·Navigation 패키지 구조 분석

- 자습·가상실습: 가상 주행 로봇의 센서 주기·바퀴 간격을 바꾸며 odom 비교.
- 이해·수행 판정: 모델·구동·센서·시간 오류를 분리; 원자료 Classic 예제는 대상 버전에 이식.

### M10. OpenUSD·Isaac Sim·PhysX 기초

- 선수 조건: M05, M07, M08
- 주제 참고: [FC16](fastcampus/FC16_data_online_yolov11.md) · [FC22](fastcampus/FC22_data_online_humanoid.md) · [FC26](fastcampus/FC26_data_online_digitaltwin.md) · [FC27](fastcampus/FC27_data_thecamp_physicalai.md)

소주제:

1. `M10.01` Stage·Prim·레이어·참조·인스턴싱
2. `M10.02` URDF 자산과 USD 자산의 관계
3. `M10.03` RigidBody·Collider·CCD·접촉·마찰
4. `M10.04` 질량·질량중심·관성·Articulation
5. `M10.05` 물리 스텝·렌더 스텝·솔버와 반복 가능성
6. `M10.06` ROS 2 브리지·관절 명령·카메라 연결

- 자습·가상실습: 물체 미끄러짐·관통·폭발 현상을 파라미터로 재현.
- 이해·수행 판정: 시각·충돌·물리·시간 계층을 분리하여 원인 설명.

### M11. ML·딥러닝·PyTorch 핵심

- 선수 조건: M01, M02
- 주제 참고: [FC01](fastcampus/FC01_data_online_physicalai.md) · [FC16](fastcampus/FC16_data_online_yolov11.md) · [FC18](fastcampus/FC18_data_online_autovehicle.md) · [FC20](fastcampus/FC20_data_online_il.md) · [FC21](fastcampus/FC21_data_online_vla.md)

소주제:

1. `M11.01` 지도학습·손실·경사·역전파·최적화
2. `M11.02` 텐서·Dataset·DataLoader·모델 저장
3. `M11.03` 학습/검증/시험 분리·과적합·데이터 누수
4. `M11.04` CNN·Transformer·표현학습의 역할
5. `M11.05` 분류·검출·분할·회귀의 출력과 지표
6. `M11.06` 추론 지연·메모리·분포 이동과 실험 추적

- 자습·가상실습: 학습 곡선·데이터 분할·임계값을 바꾸며 일반화 비교.
- 이해·수행 판정: 정확도가 높아도 로봇이 실패하는 조건을 데이터 관점에서 설명.

### M12. 카메라 비전·YOLO·분할·추적

- 선수 조건: M02, M11
- 주제 참고: [FC01](fastcampus/FC01_data_online_physicalai.md) · [FC16](fastcampus/FC16_data_online_yolov11.md) · [FC18](fastcampus/FC18_data_online_autovehicle.md)

소주제:

1. `M12.01` OpenCV 영상·색공간·필터·특징
2. `M12.02` 핀홀·왜곡·내부 파라미터와 투영
3. `M12.03` 라벨링·데이터 품질·YOLO 계열 검출 학습
4. `M12.04` Semantic/Instance Segmentation과 차선/도로 장면
5. `M12.05` 시간 추적·가림·ID·오검출과 인지 프로젝트
6. `M12.06` 정밀도·재현율·IoU·작업 성공 기준; 얼굴 인식은 선택 비교

- 자습·가상실습: 정해진 영상에서 임계값과 가림을 바꾸고 오류 분석.
- 이해·수행 판정: 검출 상자와 실제 집기 가능 위치를 구분하고 오탐 비용 설명.

### M13. LiDAR·포인트클라우드·3D 인지

- 선수 조건: M13.01/.02의 고전적 점군/정합은 M02 좌표·최적화와 M12 투영 기초에서 시작한다. M11 전체를 공통 필수로 요구하지 않으며 학습 기반 특징/3D 검출은 해당 소주제의 ML 선수를 추가한다. 다중 시점/추적은 각 단위의 프레임·보정·기하 선수를 확인한다.
- 주제 참고: [FC17](fastcampus/FC17_data_online_slam.md) · [FC18](fastcampus/FC18_data_online_autovehicle.md)

소주제:

1. `M13.01` 점군 좌표·필터·다운샘플링·군집화
2. `M13.02` 정합·ICP·대응점·잔차
3. `M13.03` Point Cloud Backbone·학습 기반 특징
4. `M13.04` 3D Object Detection·3D Segmentation
5. `M13.05` 다중 시점 기하·삼각측량·깊이 추정
6. `M13.06` 3D 객체 추적과 가림·희소성·거리별 품질

- 자습·가상실습: 점군에서 장애물 분리 후 정합 초기값의 영향 비교.
- 이해·수행 판정: 정합 실패와 검출 실패를 구별하고 좌표·거리 오차 설명.

### M14. 캘리브레이션·시간 정합·센서퓨전

- 선수 조건: M05, M12, M02 확률; 점군/다중 모달 심화는 M13 추가
- 주제 참고: [FC16](fastcampus/FC16_data_online_yolov11.md) · [FC17](fastcampus/FC17_data_online_slam.md) · [FC18](fastcampus/FC18_data_online_autovehicle.md) · [FC27](fastcampus/FC27_data_thecamp_physicalai.md)

소주제:

1. `M14.01` 카메라 내부·외부 보정·프레임 계약
2. `M14.02` 카메라-LiDAR·IMU·엔코더·GNSS 정합
3. `M14.03` 여러 시간원·멀티레이트·보간·ApproximateTime
4. `M14.04` Kalman/EKF·관측 모델·공분산·센서 가중치
5. `M14.05` 단일 모달과 다중 모달 3D Detection·융합 위치
6. `M14.06` TF·재투영 오차·시간 오차·불확실성 기록

- 자습·가상실습: 센서 지연·외부 파라미터를 바꾸고 융합 실패 진단.
- 이해·수행 판정: 잡음 큰 센서를 무조건 평균내면 안 되는 이유와 보정 품질 설명.

### M15. SLAM·지도·위치추정 입문

- 선수 조건: M05, M09 또는 동등 로그, M14 기초
- 주제 참고: [FC04](fastcampus/FC04_data_online_selfdriving.md) · [FC10](fastcampus/FC10_data_online_slambasic.md) · [FC17](fastcampus/FC17_data_online_slam.md) · [FC18](fastcampus/FC18_data_online_autovehicle.md)

소주제:

1. `M15.01` 오도메트리·로컬라이제이션·매핑·SLAM 구분
2. `M15.02` 점유 격자·지도 좌표·지도 저장과 재사용
3. `M15.03` LiDAR SLAM과 Visual SLAM 파이프라인
4. `M15.04` 스캔/특징 매칭·상대 이동·루프 폐쇄의 직관
5. `M15.05` IMU 융합·드리프트·재위치추정
6. `M15.06` 기록 데이터로 지도 품질·경로 오차 평가

- 자습·가상실습: 가상 방을 이동하며 센서 가림·미끄러짐에 따른 지도 비교.
- 이해·수행 판정: 지도가 생기는 것과 위치가 정확한 것을 구분하여 진단.

### M16. SLAM 심화·최적화·연구 구현

- 선수 조건: M02 최적화, M13, M14, M15
- 주제 참고: [FC17](fastcampus/FC17_data_online_slam.md) · [FC18](fastcampus/FC18_data_online_autovehicle.md)

소주제:

1. `M16.01` 특징 기반/직접법 Visual Odometry·다중 시점 기하
2. `M16.02` LiDAR Odometry·점군 잔차·강건 추정
3. `M16.03` 비주얼-관성·LiDAR-관성 추정
4. `M16.04` Factor Graph·Pose Graph·Bundle Adjustment
5. `M16.05` Loop Closure·백엔드 최적화·실패 사례
6. `M16.06` 학습 기반 SLAM·CPU/SIMD·CUDA·Jetson 최적화·벤치마크·드론/스캐너/사족/VR·AR 응용

- 자습·가상실습: 작은 Pose Graph에서 루프 제약 전후 오차 시각화.
- 이해·수행 판정: 잔차·가중치·이상치의 영향을 수식과 로그로 설명.

### M17. 모션 플래닝·경로·궤적

- 선수 조건: M02, M06, M07
- 주제 참고: [FC01](fastcampus/FC01_data_online_physicalai.md) · [FC15](fastcampus/FC15_data_online_mp.md) · [FC18](fastcampus/FC18_data_online_autovehicle.md)

소주제:

1. `M17.01` Configuration Space·충돌 검사·격자·로드맵
2. `M17.02` 그래프 탐색·Dijkstra·A*·경로 비용
3. `M17.03` PRM과 변형·연결성·샘플링
4. `M17.04` RRT와 변형·목표 편향·재배선
5. `M17.05` CHOMP·STOMP·최적화 기반 경로 개선
6. `M17.06` 경로 대 시간 궤적·속도/가속도 제한·재계획

- 자습·가상실습: 같은 장애물에서 A*·PRM·RRT 및 경로 평활화 비교.
- 이해·수행 판정: 충돌 여부·계획 시간·경로 길이·동역학 제약을 함께 평가.

### M18. Nav2·미션·다중 로봇

- 선수 조건: M05, M07, M09, M15, M17
- 주제 참고: [FC04](fastcampus/FC04_data_online_selfdriving.md) · [FC11](fastcampus/FC11_data_online_nav2.md) · [FC13](fastcampus/FC13_data_online_realrobotros2.md) · [FC15](fastcampus/FC15_data_online_mp.md)

소주제:

1. `M18.01` Nav2 구성·Lifecycle·Map/Planner/Controller Server
2. `M18.02` Global/Local Costmap·Inflation·장애물 갱신
3. `M18.03` 전역 경로·지역 제어·Recovery·도착 판정
4. `M18.04` Behavior Tree·Action·Waypoint·작업 상태
5. `M18.05` 다중 로봇 Namespace·TF·지도·충돌 조정
6. `M18.06` 이동 매니퓰레이터의 주행-조작 미션

- 자습·가상실습: 동적 장애물·센서 중단을 주입한 배달 미션.
- 이해·수행 판정: 성공률·충돌·회복·도착 시간과 실패 원인 리포트.

### M19. 매니퓰레이션·MoveIt 2·산업용 티칭

- 선수 조건: M06, M07, M08, M12, M17
- 주제 참고: [FC02](fastcampus/FC02_data_online_robotbegin.md) · [FC03](fastcampus/FC03_data_online_articulatedrobot.md) · [FC15](fastcampus/FC15_data_online_mp.md) · [FC30](fastcampus/FC30_data_camp_roboai.md)

소주제:

1. `M19.01` 그리퍼·Tool Frame·작업 좌표·핸드아이 보정
2. `M19.02` MoveIt 2 Planning Scene·IK·충돌·궤적 실행
3. `M19.03` 티칭·웨이포인트·속도·접근/후퇴·안전 구역
4. `M19.04` CoppeliaSim 사례와 시뮬레이터 비교
5. `M19.05` 비전 Pick-and-Place·Piece Picking·Depalletizing
6. `M19.06` 델타·협동 팔·모바일 매니퓰레이터 응용

- 자습·가상실습: 가상 상자 적재 해제와 팔의 장애물 회피.
- 이해·수행 판정: 성공률·사이클 시간·도달 가능성·안전 여유 설명.

### M20. 텔레오퍼레이션·데이터 파이프라인

- 선수 조건: M05, M06, M10 또는 MuJoCo 입문, M14
- 주제 참고: [FC02](fastcampus/FC02_data_online_robotbegin.md) · [FC20](fastcampus/FC20_data_online_il.md) · [FC21](fastcampus/FC21_data_online_vla.md) · [FC27](fastcampus/FC27_data_thecamp_physicalai.md)

소주제:

1. `M20.01` SO-101·Leader-Follower·영점·스케일·클러치
2. `M20.02` MuJoCo 설치·모델·환경 및 재생 입문
3. `M20.03` 관측·행동·지시문·에피소드와 LeRobot Dataset
4. `M20.04` rosbag2/MCAP·변환·압축·스키마·버전
5. `M20.05` Rerun·Replayer·누락·단위·범위·정합 검사
6. `M20.06` 실패 데이터·데이터 분할·Domain Randomization

- 자습·가상실습: 키보드/슬라이더로 가상 팔 시연을 기록하고 에피소드 검사.
- 이해·수행 판정: 데이터 누수·시간 정합·안전 한계가 있는 데이터 계약 제출.

### M21. 모방학습·BC·ACT·Diffusion Policy

- 선수 조건: M11, M19 기초, M20
- 주제 참고: [FC20](fastcampus/FC20_data_online_il.md) · [FC21](fastcampus/FC21_data_online_vla.md) · [FC27](fastcampus/FC27_data_thecamp_physicalai.md)

소주제:

1. `M21.01` Behavior Cloning·분포 이동·시연 품질
2. `M21.02` 관측 구성·행동 공간·정규화·시퀀스
3. `M21.03` ACT·Action Chunking·Temporal Ensembling
4. `M21.04` Diffusion Policy와 Motion Manifold 접근
5. `M21.05` Mobile ALOHA·양팔·이동 조작의 협응
6. `M21.06` 학습·롤아웃·미관측 상황·데이터 재수집 루프

- 자습·가상실습: 시연 수·노이즈·지연을 바꾼 정책 롤아웃 비교.
- 이해·수행 판정: 학습 손실과 작업 성공률을 구별하고 실패 기반 수집 계획 작성.

### M22. 로봇 LLM·VLM·VLA와 접지된 실행

- 선수 조건: M11, M18 또는 M19, M20, M21
- 주제 참고: [FC06](fastcampus/FC06_data_online_ros2ai.md) · [FC14](fastcampus/FC14_data_online_aidevrobot.md) · [FC21](fastcampus/FC21_data_online_vla.md) · [FC27](fastcampus/FC27_data_thecamp_physicalai.md)

소주제:

1. `M22.01` LLM 계획·VLM 인지·VLA 행동 정책 구분
2. `M22.02` Prompt·구조화 출력·Tool/ROS Action 연결
3. `M22.03` Ollama·로컬 모델·파인튜닝과 엣지 제약
4. `M22.04` OpenVLA·SmolVLA·멀티모달 관측·행동 토큰
5. `M22.05` 지도 장소 의미화·언어 지시 주행·로봇팔
6. `M22.06` 권한·검증·확인·중단을 거치는 실행 감독

- 자습·가상실습: 자연어 작업을 유효한 행동 후보로 바꾸고 위험 명령 차단.
- 이해·수행 판정: 언어 응답과 실행 성공을 분리하고 모호한 지시의 확인 절차 설명.

### M23. 강화학습·PPO·Isaac Lab

- 선수 조건: M07, M10, M11
- 주제 참고: [FC22](fastcampus/FC22_data_online_humanoid.md)

소주제:

1. `M23.01` MDP/POMDP·정책·가치·보상·종료 조건
2. `M23.02` Rollout·Actor-Critic·PPO의 업데이트
3. `M23.03` 관측·행동·보상 설계와 Reward Hacking
4. `M23.04` Isaac Lab·병렬 환경·rsl_rl 구성
5. `M23.05` 학습 안정성·평가 Seed·재현성
6. `M23.06` MuJoCo 비교·Domain Randomization·정책 내보내기

- 자습·가상실습: 작은 균형/도달 과제에서 보상 설계와 사전 계산 학습 곡선 분석.
- 이해·수행 판정: 높은 보상이 실제 목표 달성을 보증하지 않는 사례 설명.

### M24. 휴머노이드·보행·전신 제어

- 선수 조건: M06, M07, M23
- 주제 참고: [FC22](fastcampus/FC22_data_online_humanoid.md)

소주제:

1. `M24.01` Unitree G1 모델·관절·접촉·전신 상태
2. `M24.02` 속도 지령·보행 관측·행동 스케일
3. `M24.03` 보상·넘어짐·리셋·지면·보행 평가
4. `M24.04` 기준 자세·PD 제어·학습 정책 연결
5. `M24.05` 외란·마찰·지연·질량 변화와 일반화
6. `M24.06` 보행 정책 배포·Sim2Real 전 단계 점검

- 자습·가상실습: 사전 계산 보행 재생에서 외란·마찰 조건 비교.
- 이해·수행 판정: 보행 속도·낙상·에너지·안정성의 trade-off 보고; 실물 전이는 별도 검증.

### M25. 디지털 트윈·합성데이터·복합 접촉

- 선수 조건: M10, M12, M20
- 주제 참고: [FC16](fastcampus/FC16_data_online_yolov11.md) · [FC26](fastcampus/FC26_data_online_digitaltwin.md) · [FC27](fastcampus/FC27_data_thecamp_physicalai.md)

소주제:

1. `M25.01` SimReady 자산·계층·단위·재질·물리 속성
2. `M25.02` 바퀴·서랍·Revolute/Prismatic·Articulation Root
3. `M25.03` Collision Group·Filter Pairs·Physics Debug
4. `M25.04` Stiffness·Damping·마찰·질량·접촉 보정
5. `M25.05` Replicator·조명/재질/카메라 랜덤화·합성 라벨
6. `M25.06` 키보드 텔레옵·도구 접촉·상태/행동 기록

- 자습·가상실습: 서랍 열기·도구 접촉 시나리오와 실제/합성 검출 비교.
- 이해·수행 판정: 보기 좋은 장면과 제어·학습에 쓸 수 있는 트윈의 차이를 증명.

### M26. 임베디드 심화·HSI·밸런싱 로봇

- 선수 조건: M04, M07
- 주제 참고: [FC01](fastcampus/FC01_data_online_physicalai.md) · [FC23](fastcampus/FC23_data_online_embedded.md)

소주제:

1. `M26.01` 요구사항·HSI·BSW/ASW·상태기계·형상 관리
2. `M26.02` IMU·모터 드라이버·센서 필터·균형 제어
3. `M26.03` 회로·KiCad·PCB·전원·신호·보드 검토
4. `M26.04` 기구 CAD·무게중심·조립·공차
5. `M26.05` 호스트/모바일 UI·명령 계약·통신 지연
6. `M26.06` 기본 성능·통합 TEST·결함 분석·포트폴리오

- 자습·가상실습: 가상 밸런싱 로봇을 펌웨어·제어·기구 관점에서 진단.
- 이해·수행 판정: HSI와 테스트 근거를 연결; Atmega/Fusion360/Android/전용 IDE는 비교·선택 자료.

### M27. 엣지 실행·추론 최적화

- 선수 조건: M11, M21 또는 M22 또는 M23
- 주제 참고: [FC06](fastcampus/FC06_data_online_ros2ai.md) · [FC21](fastcampus/FC21_data_online_vla.md) · [FC25](fastcampus/FC25_data_online_clauderobot.md) · [FC27](fastcampus/FC27_data_thecamp_physicalai.md)

소주제:

1. `M27.01` Raspberry Pi·엣지 컴퓨팅·메모리·전력 제약
2. `M27.02` 모델 크기·정밀도·양자화·추론 배치의 비교
3. `M27.03` 카메라 전처리·모델·통신·제어 지연 분해
4. `M27.04` 정책 주기·큐·프레임 누락·백프레셔
5. `M27.05` 원격/로컬 추론·모델 버전·교체·롤백
6. `M27.06` 성능 측정과 정확도/성공률의 공동 평가

- 자습·가상실습: 재생 로그에서 지연 예산을 배분하고 최적화 후보 선택.
- 이해·수행 판정: 평균 지연뿐 아니라 꼬리 지연·메모리·성공률로 판단; 상세 최적화는 우리 확장안.

### M28. 차량 CAN·UDS·진단·캘리브레이션

- 선수 조건: M01, M03, M04 통신 기초
- 주제 참고: [FC24](fastcampus/FC24_data_online_can.md)

소주제:

1. `M28.01` IVN·물리 계층·토폴로지·중재·프레임
2. `M28.02` 비트 타이밍·에러 관리·CAN FD·DBC 해석
3. `M28.03` ISO-TP·UDS 주소·타이밍·세션·응답
4. `M28.04` DTC 읽기/초기화/제어와 고장 추적
5. `M28.05` 다운로드·보안 접근·검증·리셋 흐름
6. `M28.06` XCP·DAQ/폴링·A2L·모니터링·캘리브레이션

- 자습·가상실습: 가상 ECU·CAN Trace에서 진단 세션과 오류 코드 해석.
- 이해·수행 판정: 프로토콜 상태 전이와 타임아웃 설명; 실제 차량 쓰기 없이 완료.

### M29. 자율주행 차량·센서 통합 프로젝트

- 선수 조건: M07, M12, M13, M14, M15, M17
- 주제 참고: [FC18](fastcampus/FC18_data_online_autovehicle.md)

소주제:

1. `M29.01` 차량 운동학·도로·차선·객체·의사결정
2. `M29.02` 카메라 기반 Perception와 위치추정
3. `M29.03` LiDAR 기반 Perception와 지도·SLAM
4. `M29.04` 멀티모달 인지와 주변 객체 추적
5. `M29.05` Motion Planning·제어·도심 시나리오
6. `M29.06` Auto Valet Parking·실패 분석·재현 실험

- 자습·가상실습: 기록 장면과 단순 차량 모델에서 주차·주행 시나리오 수행.
- 이해·수행 판정: 충돌·정지선·추종 오차·미션 성공을 평가; 실제 도로 자율주행 인증과 구분.

### M30. Sim2Real·안전 배포·정량 평가

- 선수 조건: M07, M14 및 선택 트랙의 정책/제어 모듈
- 주제 참고: [FC20](fastcampus/FC20_data_online_il.md) · [FC22](fastcampus/FC22_data_online_humanoid.md) · [FC25](fastcampus/FC25_data_online_clauderobot.md) · [FC27](fastcampus/FC27_data_thecamp_physicalai.md)

소주제:

1. `M30.01` Reality Gap·백래시·마찰·지연·센서 오차 진단
2. `M30.02` Domain Randomization·System Identification·수집 재설계
3. `M30.03` EMA·Temporal Ensembling·속도/토크/작업공간 제한
4. `M30.04` Watchdog·중단·상태 승격·Shadow/제한 실행
5. `M30.05` 성공률·신뢰구간·층화 실험·비교 기준
6. `M30.06` 버전·배포 계약·감독·롤백·최종 실증 리포트

- 자습·가상실습: 장애를 주입한 가상 정책을 제한 실행으로 승격.
- 이해·수행 판정: 실패 조건을 숨기지 않고 안전·성능·반복 가능성을 함께 보고.

### M31. AI 개발 에이전트·검증 자동화

- 선수 조건: M31.01/.02는 M01의 실행 환경·자료 계약을 바탕으로 S01에서 시작한다. M31.03/.04는 모바일·시뮬레이션 적용, M31.05/.06는 후반 자동화·실물 변경의 해당 선수 후에 이수한다. ROS·한 트랙 전체 경험을 초반 두 단위의 공통 필수로 요구하지 않는다.
- 주제 참고: [FC25](fastcampus/FC25_data_online_clauderobot.md) · [FC18](fastcampus/FC18_data_online_autovehicle.md) · [FC23](fastcampus/FC23_data_online_embedded.md)

소주제:

1. `M31.01` 작업 명세·환경·완료 기준·작은 변경 루프
2. `M31.02` Claude Code/Codex 등 도구의 역할과 사람 검토
3. `M31.03` 실패 재현·로그·가설·수정·회귀 실험
4. `M31.04` 시뮬레이션 반복·CI·실험 결과 비교
5. `M31.05` 장시간 작업·다중 Agent·권한·산출물 관리
6. `M31.06` Isaac Sim·Raspberry Pi 연결·실물 변경 승인

- 자습·가상실습: 의도적으로 실패하는 로봇 작업을 에이전트와 진단.
- 이해·수행 판정: 생성 코드가 아니라 재현·검토·검증 근거를 평가; 공급자 종속 최소화.

### M32. 통합 캡스톤·포트폴리오

- 선수 조건: 공통 기반과 선택 트랙, M30; M31 권장
- 주제 참고: [FC03](fastcampus/FC03_data_online_articulatedrobot.md) · [FC06](fastcampus/FC06_data_online_ros2ai.md) · [FC15](fastcampus/FC15_data_online_mp.md) · [FC18](fastcampus/FC18_data_online_autovehicle.md) · [FC20](fastcampus/FC20_data_online_il.md) · [FC22](fastcampus/FC22_data_online_humanoid.md) · [FC23](fastcampus/FC23_data_online_embedded.md) · [FC25](fastcampus/FC25_data_online_clauderobot.md) · [FC27](fastcampus/FC27_data_thecamp_physicalai.md) · [FC30](fastcampus/FC30_data_camp_roboai.md)

소주제:

1. `M32.01` 모바일 배달·동적 장애물·언어 미션
2. `M32.02` SO-101/산업용 팔 비전·모방학습 Pick-and-Place
3. `M32.03` 이동 매니퓰레이터·양팔 협응
4. `M32.04` 휴머노이드 보행 외란 대응 또는 밸런싱 로봇
5. `M32.05` 요구사항·인터페이스·실험표·실패 사례·재현 패키지
6. `M32.06` 데모·설계 근거 설명·동료 검토·개선 계획

- 자습·가상실습: 장비 없는 버전의 과제를 완수하고 선택적으로 실물 확장.
- 이해·수행 판정: 성능 30·원인 분석 25·재현성 20·안전 15·설명 10의 제안 루브릭.

### M33. 선택 체험·비전공 브리지·도구 비교

- 선수 조건: M00; FPV는 조작·안전 안내
- 주제 참고: [FC02](fastcampus/FC02_data_online_robotbegin.md) · [FC19](fastcampus/FC19_data_online_matlab.md) · [FC23](fastcampus/FC23_data_online_embedded.md) · [FC28](fastcampus/FC28_dev_online_aicoding.md) · [FC29](fastcampus/FC29_dgn_online_fpvdrone.md) · [FC31](fastcampus/FC31_event_online_isaacsim.md)

소주제:

1. `M33.01` Scratch·IoT·코딩로봇의 입력-처리-출력 체험
2. `M33.02` FPV 조작 축·모드·카메라 시점·조종기 설정
3. `M33.03` Uncrashed 등 시뮬레이터 기초·선회·코스·촬영 연습
4. `M33.04` C# OpenJigware·MATLAB/Simulink·전용 GUI 비교
5. `M33.05` Android·Fusion360·Microchip Studio의 대체 도구 경로
6. `M33.06` 현업 세미나·포트폴리오 자료 읽기

- 자습·가상실습: 단순 입력-피드백 체험 또는 가상 비행 코스.
- 이해·수행 판정: 코어 학습에는 필수 아님; FPV 수동 조종을 자율비행 학습으로 표시하지 않음.

### M34. 운영·관제 UI와 로봇 상태 계약

- 상태: 준비중. 목차·선수와 S10 배치만 등록했으며 상세 교재·실행 실습은 미집필입니다.
- 선수 조건: M05 통신 기초, M06 프레임·M14 시간, M22 실행 경계·M30 배포 기준을 소주제별로 적용합니다.

1. `M34.01` 관제 텔레메트리·상태/이벤트·읽기 전용 대시보드
2. `M34.02` 3D 장면과 로봇 상태의 좌표·시간·버전 동기화
3. `M34.03` 운영 UI의 요청·권한·확인·취소·감사 기록

이 단원은 일반 웹 문법 교육 대신 로봇 상태와 명령의 계약·실패 판정을 다룹니다.

## 4. 사이트 학습 단위와 인터랙션

### 4.1 한 학습 단위의 구성

1. 해결할 질문과 예상 현상.
2. 짧은 설명, 수식·그림·코드. 긴 설명은 여러 단위로 나누되 논리적 연결과 원문 학습 내용을 보존.
3. 어려운 개념에만 도움글·실수 예시·확인 질문.
4. 예측 → 조작/실행 → 관찰 → 설명의 미니 실습.
5. 학습자 답안과 피드백. 첫 오답에는 힌트, 재시도 뒤 해설 공개.
6. 핵심 정리와 다음 단원 선수 조건. 단순 페이지 방문을 숙달로 처리하지 않음.

### 4.2 세 가지 실습 수준

| 수준 | 제공 방식 | 예시 | 결과 표시 |
|---|---|---|---|
| 브라우저 개념 실습 | JS/WASM·2D/간단 3D·슬라이더·가상 장치 | FK/IK·PID·RRT·점군·가상 CAN | 교육용 근사 모델임을 표시 |
| 재생·분석 실습 | 사전 기록한 로그·에피소드·학습 곡선·영상 | SLAM·센서퓨전·모방학습·보행 | 재생 결과와 직접 실행 결과 구분 |
| 선택 로컬 심화 | Python/C++·ROS 2·실제 시뮬레이터·GPU/장비 | Isaac Lab 학습·실물 SO-101·MCU | 요구 환경과 결과 변동을 표시 |

기본 경로는 장비·GPU 없이 완료할 수 있게 만듭니다. 브라우저 조작이 Isaac Sim의 실제 물리 정확도나 학습 실행과 같다고 표현하지 않습니다. GPU 학습을 Cloudflare Worker에서 실행하는 구조로 만들지 않습니다.

### 4.3 평가와 AI 강사

- 객관·매칭·수치·상태 전이 문제: 정답과 허용 오차에 따른 결정적 판정.
- 서술·설계 문제: 개념 정확성·근거·실패 진단·안전성 루브릭. AI 평가가 불확실하면 추가 질문과 예시 해설을 제공하고 확정 판정을 강요하지 않음.
- 실습: 결과 수치만이 아니라 파라미터·실험 조건·관찰·해석을 제출. 정답 궤적 외에도 타당한 접근을 인정.
- 로컬 진도: 기존 대화·진도 키를 보존하면서 모듈별 답안·시도·도달 수준을 별도 관리. 새 데이터베이스를 필수화하지 않음.
- AI 강사: 현재 학습 단위·실습 상태·질문 관련 본문/코드·선수 개념을 필요한 만큼 검색하여 전달. 기존 적응형 수준 판단·대화 요약을 새 커리큘럼 ID와 연결.
- 범위: 로봇과 Physical AI 및 해당 이해에 필요한 수학·컴퓨터공학은 지원. 과목과 무관한 대화에는 학습 목표로 돌아오도록 안내하는 정책을 별도 구현 검토. 이 문서는 정책 구현 완료를 의미하지 않음.

## 5. 완료 기준과 범위

이 통합안은 커리큘럼·서비스 설계의 완료본이며, 35개 모듈·207개 소주제의 교안·코드·시뮬레이터가 모두 제작됐다는 뜻은 아닙니다. 사이트 확장은 [병합·이행 계획](merge_and_migration.md)의 단계로 진행합니다. 기존 학습 설명을 보존하고, 학습에 기여하지 않는 머리말·판권·판매 안내를 본선에 추가하지 않습니다. 수학·용어·디버깅처럼 학습에 도움이 되는 참고 항목은 관련 단원에서 바로 열 수 있게 연결합니다.
