# 1차 교차검수 보고서: 앞부분 및 제1~4장

## 검수 범위와 판정

- 범위: `book/00_frontmatter/`, 제1장~제4장의 원고, 실습, 예제 코드, 그림, 연습문제
- 기준: Ubuntu 24.04/ROS 2 Jazzy 일관성, 용어 병기, 링크와 파일 참조, 장 간 중복·모순, 안전, 예상 출력 표기, 출처, 코드 대응, 난이도와 학습 흐름
- 방법: 내부 Markdown 링크와 backtick 파일 경로 존재 여부 검사, 범용 Python/C++ 예제 실행, Python 구문 검사, 원고-코드 수동 대조
- 종합 판정: **Blocker 없음, Major 7건, Minor 7건**. 전체 학습 순서와 안전 기조는 양호하지만, 자유도 표기·실습 표식·결정론적 예제 출력·제4장 무결성 예제가 통합 전에 정리되어야 한다.

## 긍정적 확인 사항

1. 앞부분과 제1~4장은 모두 Ubuntu 24.04 LTS 및 ROS 2 Jazzy Jalisco를 기준으로 쓰였으며 Humble/Iron/Foxy를 실행 기준으로 섞은 곳은 발견하지 못했다.
2. 검사한 로컬 Markdown 링크와 `code/`, `labs/`, `exercises/`, `images/` 파일 참조는 모두 실제 파일에 대응했다.
3. 제1~4장 모두 학습 목표, 이론, 실습, 트러블슈팅, 요약, 연습문제, 참고문헌의 흐름을 대체로 갖췄다.
4. 제1장 안전 게이트, 제2장 Sim2Real 전 안전 검증, 제3장 하드웨어 전원 차단·첫 자세 정렬·워치독, 제4장 개인정보·데이터 무결성 주의가 포함되어 있다.
5. 범용 예제 중 제2장의 변환·관성·접촉 계산, 제3장의 FK/DLS와 안전 필터, 제4장의 카메라 수학과 C++ 보간은 실행 또는 컴파일이 가능했다.

## Blocker

없음.

## Major

### M1. SO-101 자유도 표기가 앞부분과 제3장에서 모순됨

- 증거: `book/00_frontmatter/environment.md`의 **실습 장비**는 “동등한 6자유도 교육용 매니퓰레이터”라고 쓰지만, `book/03_so101_kinematics_teleop/chapter.md`의 **장 개요**, **3.3.3 5-DoF 과업 설계**, **요약**은 SO-101을 “5-DoF 팔 + 그리퍼 구동기, 총 6개 모터”로 정확히 구분한다.
- 영향: 독자가 6차원 pose를 완전히 제어할 수 있는 6-DoF 팔로 오해하여 IK 과제와 대체 장비 선정 기준을 잘못 잡을 수 있다.
- 권고: 앞부분을 “5-DoF 팔 + 그리퍼(6개 구동기)”로 고치고, 대체 장비는 “동등한 관절 구성 또는 6-DoF 팔을 사용할 경우 과제 차이를 별도 설명”으로 구분한다.

### M2. 앞부분에서 약속한 실습 표식이 제1~4장에 전혀 적용되지 않음

- 증거: `book/00_frontmatter/how_to_use.md`의 **실물 장비와 시뮬레이션**은 `[SIM]`, `[HW]`, `[SIM→HW]`, `[SAFETY]` 표식을 정의한다. 그러나 제1~4장 원고와 실습 파일에는 해당 표식이 한 건도 없다.
- 영향: 독자가 장비 필요 여부와 위험 단계를 실습을 열기 전 판단할 수 없으며, 책의 사용법과 실제 편집 체계가 불일치한다.
- 권고: 모든 실습 제목 또는 준비물 바로 아래에 하나 이상의 표식을 적용하고, `[HW]`/`[SIM→HW]` 실습에는 시작 전 안전 체크리스트를 연결한다. 표식을 사용하지 않을 계획이면 앞부분의 약속을 제거하고 다른 일관된 메타데이터 체계를 선택한다.

### M3. 제3장의 결정론적 예상 출력이 실제 코드와 상태·수치 모두 불일치함

- 증거: `book/03_so101_kinematics_teleop/chapter.md`의 **실습 1: FK와 DLS IK**는 14회 반복과 특정 관절해를 예시하지만 실제 `code/fk_dls_ik.py` 실행은 7회 반복과 다른 관절해를 출력했다. **실습 2: 안전 필터 dry-run**은 frame 1을 `TRACKING`으로 표시하지만 실제 `code/safe_teleop_core.py`는 frame 0~3 모두 `ALIGNING`이며 명령 벡터도 다르다.
- 영향: “환경에 따라 숫자가 다를 수 있다”로 설명하기 어려운 상태 머신 의미 차이다. 학습자가 정상 동작 기준을 잘못 판단한다.
- 권고: 현재 코드의 실제 출력을 예상 출력으로 갱신하거나, 예시가 다른 파라미터에서 나온 것이라면 그 파라미터와 버전을 명시한다. 상태 문자열과 분기 결과는 코드와 반드시 일치시킨다.

### M4. 제4장 Rerun 무결성 예시가 실제 파일과 다른 사건을 설명하며 timestamp reversal을 구현하지 않음

- 증거: `book/04_sensor_data_pipeline/chapter.md`의 **4.7 Rerun 기반 무결성 검사** 예상 관찰은 frame 184 drop, frame 291 timestamp reversal, `joint_3` 속도 이상을 제시한다. 실제 `code/rerun_integrity_check.py`는 180 frame만 생성하고 frame 90 drop과 frame 130의 `joint_1` spike만 만든다. timestamp reversal을 생성하거나 `quality/timestamp_reversal`을 로그하지 않는다.
- 영향: 장의 핵심 학습 목표인 frame drop·timestamp reversal·joint spike 검사가 코드로 재현되지 않는다.
- 권고: 코드에 세 사건을 명시적으로 주입하고 원고의 frame/joint 이름을 맞추거나, 원고를 현재 코드의 두 사건으로 축소한다. 권장 entity 목록과 실제 `rr.log` 경로도 일치시킨다.

### M5. 실습 명령의 기준 작업 디렉터리가 장마다 달라 독립 실행 시 실패할 수 있음

- 증거: 제1장 `labs/lab02_openusd_scene.md`와 제4장 `labs/lab01_camera_frames.md`는 실습 파일 위치를 기준으로 `../code/...`를 사용한다. 제2장 `labs/lab01_transforms.md`·`lab03_material_tuning.md`, 제3장 `labs/lab_3_1_fk_ik.md`·`lab_3_2_safe_teleop.md`는 장 루트를 전제로 `code/...`를 사용한다. `how_to_use.md`에는 실습 명령의 기준 디렉터리가 정의되어 있지 않다.
- 영향: EPUB/PDF에서 실습 파일만 따라가는 학습자는 같은 형식의 명령이 어떤 장에서는 성공하고 어떤 장에서는 실패한다.
- 권고: 모든 실습 첫 단계에 저장소 루트 또는 장 루트로 이동하는 `cd`를 넣고, 이후 명령을 동일 기준으로 통일한다.

### M6. 시뮬레이터·데이터 도구 버전이 `latest`로 남아 재현성 계약이 부족함

- 증거: `book/00_frontmatter/environment.md`는 Ubuntu/ROS/Python/C++만 고정한다. 제2장은 “Isaac Sim 최신 안정 릴리스”, 여러 NVIDIA 링크는 `/latest/`, 제3장은 “LeRobot 최신 안정 릴리스”, 제4장은 Replicator와 Rerun의 릴리스별 API 변화를 경고하지만 호환 버전 표가 없다.
- 영향: Isaac Sim, Replicator, LeRobot, Rerun의 API가 바뀌면 코드와 문서가 동시에 “최신”을 가리키면서도 서로 다른 버전을 전제로 할 수 있다.
- 권고: 앞부분에 집필 기준 버전/확인일과 호환 표를 추가하고, 장별로 `tested`, `documented`, `expected-only` 상태를 표시한다. `/latest/` 링크는 보조로 두되 최소 한 개의 고정 버전 문서를 함께 남긴다.

### M7. 제4장 ROS 동기화 실습에 재현 가능한 입력 발생기가 없음

- 증거: `book/04_sensor_data_pipeline/labs/lab02_tf_sync.md`는 “카메라와 JointState publisher를 실행”하라고 하지만 해당 장의 ROS 패키지는 `approx_sync`와 `static_camera_tf`만 제공한다. 카메라 30 Hz/관절 50 Hz, jitter, timestamp offset을 재현하는 fake publisher나 구체적인 외부 실행 명령이 없다.
- 영향: 실물 카메라 또는 별도 패키지가 없는 독자는 slop별 pair 수·delta p95 비교라는 핵심 실습을 수행할 수 없다. 앞부분이 약속한 장비 없는 제4장 학습 경로와도 어긋난다.
- 권고: timestamp/jitter를 파라미터화한 synthetic Image/JointState publisher를 제공하거나, 사용할 공식 demo/package와 정확한 명령을 실습에 명시한다.

## Minor

### m1. 앞부분의 ROS 플랫폼·배포판 선택 주장에 직접 출처가 없음

- 증거: `book/00_frontmatter/environment.md`의 Jazzy/Ubuntu 24.04 Tier 1 주장과 `preface.md`의 Lyrical/Jazzy 선택 근거에 링크나 참고문헌이 없다.
- 권고: ROS REP 2000과 Jazzy/Lyrical release page를 바로 연결한다. “현업 전환 비용”은 공식 통계가 아니라 편집 판단임을 표시한다.

### m2. 제3장 인용 표기가 다른 장보다 추적하기 어려움

- 증거: 본문은 `[Hugging Face, 2026]`, `[TheRobotStudio, 2026]`, `[OpenUSD, 2026]`처럼 일반 텍스트 인용을 쓰고 장 말미에는 번호 목록을 사용한다. 동일 기관 자료가 여러 개라 어느 항목인지 즉시 알기 어렵다.
- 권고: 본문에 직접 링크를 붙이거나 `[3-2]`처럼 참고문헌 항목과 일대일 대응하는 키를 사용한다.

### m3. 제1장 순수 Python 예상 출력의 결정론적 수치가 현재 코드와 다름

- 증거: `book/01_physical_ai_isaac_ros2/chapter.md`의 **1.6.1 순수 Python 폐루프**는 step 10의 `q=+0.456`을 제시하지만 실제 `physical_ai_loop.py`는 현재 `q=+0.505`를 출력한다.
- 권고: 실행 환경에 무관한 결정론적 예제는 실제 출력과 동기화한다. 시간 기반 `age_ms`처럼 변동 가능한 값만 근사 예시로 남긴다.

### m4. 앞부분 README가 완성된 파일을 여전히 “예정 항목”으로 표시함

- 증거: `book/00_frontmatter/README.md`는 “앞부분 예정 항목” 목록만 두고, 실제로 존재하는 `title.md`, `preface.md`, `how_to_use.md`, `environment.md`, `safety.md`의 순서나 링크를 제공하지 않는다.
- 권고: 최종 통합 순서와 파일 링크를 가진 목차형 README로 바꾼다.

### m5. 전문용어 병기 스타일이 장마다 다름

- 증거: 제2장은 “강체(rigid body)” 형식을 비교적 일관되게 사용하지만, 제1·3·4장은 `Node`, `Topic`, `pose`, `hold`, `stale`, `jitter`, `writer`, `entity` 등이 첫 등장부터 영어만 나오거나 한글 음역 없이 사용된다.
- 권고: API 고유명은 영어 그대로 유지하되 일반 개념은 첫 등장에 `한국어(English)`로 통일하고 용어집 후보를 수집한다.

### m6. 제1장의 C++ 안전 게이트는 본문에 빌드·실행 경로가 없음

- 증거: **1.6.3 ROS 2 C++ 안전 게이트**는 폴더 역할만 설명하고 `colcon build`, 실행 명령, 입력 생성 방법, 예상 출력 또는 관련 실습을 제공하지 않는다.
- 권고: 최소 빌드/실행 명령과 stale/clamp 실패 주입 예를 추가하거나 부록 예제로 명확히 낮춘다.

### m7. 외부 링크의 접근성과 고정성이 균일하지 않음

- 증거: 자동 HTTP 점검에서 ROS, NVIDIA, OpenUSD 등 검사된 링크는 대부분 정상 응답했으나 OpenCV 문서는 봇 차단으로 403을 반환했다. 여러 장이 `/latest/` 문서를 사용한다.
- 권고: OpenCV는 같은 공식 문서의 고정 버전 또는 소스 저장소 링크를 병기하고, 최종 빌드 전에 전체 URL을 다시 점검한다. 403 자체를 문서 오류로 단정하지 않는다.

## 장 간 중복과 학습 흐름 평가

- 제1장의 좌표·시간·QoS 계약은 제3·4장에서 구체화되어 교육적 반복으로 볼 수 있다.
- 제2장의 동차변환·쿼터니언과 제4장의 카메라 프레임 변환은 일부 겹치지만, 제2장은 강체 pose, 제4장은 optical frame과 투영이라는 차이가 분명하다. 제4장 첫머리에 “제2장 변환 규약을 재사용한다”는 짧은 연결 문장을 두면 중복 인상이 줄어든다.
- 제3장의 JointState 이름 기반 정렬과 제4장의 시계열 정합은 자연스럽게 이어진다. 다만 제4장 synthetic publisher 누락 때문에 실습 흐름이 끊긴다.
- 난이도는 컴퓨터공학 졸업 예정자에게 대체로 적합하다. 제2장 역학과 제3장 IK의 수식이 빠르게 진행되므로 장 시작 전 선형대수/미분/고전역학 진단문제 또는 부록 링크가 있으면 학습 격차를 줄일 수 있다.

## 수정 우선순위

1. M1, M3, M4: 사실·출력·코드 대응을 먼저 고친다.
2. M2, M5, M7: 학습자가 실습을 재현할 수 있도록 표식·작업 디렉터리·입력 발생기를 정리한다.
3. M6: 통합 빌드 전에 버전 호환 표를 확정한다.
4. Minor 항목을 편집 패스로 일괄 정리한다.

