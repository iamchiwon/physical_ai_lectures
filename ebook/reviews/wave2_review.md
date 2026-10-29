# 제5~6장 독립 교차검수

## 검수 범위와 기준

- 대상: `ebook/book/05_lerobot_smolvla/`, `ebook/book/06_sim2real_deployment/`
- 기준일: 2026-10-28
- 기준: 기술 정확성, 최신 공식 API와 논문 정합성, 출처, 장 간 연결, 코드-본문 대응, 예상 출력 표기, 실물 안전
- 실행 점검: 환경 독립 Python 예제와 결정적 `--demo` 출력, 전체 Python 정적 문법
- 대조 자료: Hugging Face LeRobotDataset v3/API/PEFT/Policy Deployment/RTC 문서, SmolVLA·ACT·Diffusion Policy·LoRA 원 논문, ROS 2 lifecycle/QoS 설계, 장에 인용된 NIST·ISO 자료

## 총평

제5장은 BC → ACT/Diffusion Policy → VLA → Dataset v3 → SmolVLA/LoRA → 폐루프 배포 흐름이 명확하고, 데이터 라이선스·개인정보·재현성까지 포함해 교육적 완성도가 높다. 제6장도 Reality Gap을 측정 가능한 축으로 분해하고, 단계적 승격과 latched FAULT, Wilson 구간, 자연어와 안전 권한의 분리를 강조한 점이 좋다. 두 장의 action chunk, temporal ensembling, 20 Hz 폐루프 설명도 자연스럽게 이어진다.

다만 실물 연결 예제로 제공되는 ROS 2 `workspace_guard.py`가 메시지의 좌표 프레임을 확인하지 않고 임의로 `base_link`로 재표기한다. 다른 frame의 수치를 base 좌표로 오인해 통과시킬 수 있으므로 현 상태로는 안전 교육 코드의 필수 불변조건을 위반한다. 이 항목은 출판 전 반드시 수정해야 한다.

## Blocker

### B-1. 좌표 프레임을 검증/변환하지 않고 `base_link`로 재표기

- 파일: `ebook/book/06_sim2real_deployment/code/ros2_ws/src/sim2real_safety/sim2real_safety/workspace_guard.py`
- 관련 절: 제6장 `6.4.2 작업공간 Bounding Box`, `6.9 실습 3: ROS 2 Workspace Guard`
- 문제:
  - `_on_current()`와 `_on_target()`이 `PoseStamped.header.frame_id`를 무시한다.
  - 입력 target이 `camera_link`, `world`, 빈 frame 등이어도 좌표 숫자만 base-frame 경계와 비교한다.
  - 통과한 출력에는 무조건 `output.header.frame_id = "base_link"`를 기록한다. 이것은 좌표 변환이 아니라 잘못된 relabeling이다.
  - 예를 들어 camera frame의 `(0.20, 0.00, 0.12)`가 base-frame 박스 안의 값처럼 보이면 실제 base pose가 전혀 달라도 승인될 수 있다.
- 권고:
  1. 교육용 최소 구현은 current와 target 모두 `frame_id == configured_base_frame`일 때만 허용하고 빈/불일치 frame을 latched FAULT로 처리한다.
  2. 다중 frame을 지원하려면 TF2 buffer로 메시지 timestamp 시점의 transform을 조회해 base frame으로 변환한다. 최신 transform으로 대충 변환하지 말고 timeout/extrapolation을 fault로 처리한다.
  3. 출력 timestamp는 변환/검증된 pose의 의미를 보존하고 source timestamp와 processing timestamp를 구분한다.
  4. 실습에 `camera_link` frame target을 주입해 반드시 거부되는 시험을 추가한다.

## Major

### M-1. `workspace_guard`가 target freshness와 orientation 유효성을 검사하지 않음

- 파일: `ebook/book/06_sim2real_deployment/code/ros2_ws/src/sim2real_safety/sim2real_safety/workspace_guard.py`
- 관련 절: `6.4.3 워치독과 생명주기`, 실습 `lab_6_3_ros2_guard.md`
- 문제:
  - current pose 수신 시간만 monotonic clock으로 본다. 오래된 policy target을 재전송해도 승인한다.
  - orientation의 NaN/Inf, zero quaternion, normalization을 검사하지 않은 채 그대로 복사한다.
  - 본문은 입력 신선도와 서로 다른 timeout 원인을 분리하라고 가르치지만 예제는 `current pose timeout` 하나만 구현한다.
- 권고:
  - target source timestamp age, receive monotonic age, sequence ID를 각각 확인한다.
  - quaternion 네 성분의 finite, norm 하한, normalization tolerance를 검사한다.
  - orientation을 이 장 범위에서 지원하지 않는다면 output에서 position-only contract를 명시하고 임의 orientation을 전달하지 않는다.
  - 실습에 stale target, zero/NaN quaternion, target timestamp 역전 주입을 추가한다.

### M-2. LeRobot 전역 `stats.json`과 train-only normalization 원칙의 실제 연결이 빠짐

- 파일: `ebook/book/05_lerobot_smolvla/chapter.md`
- 관련 절: `5.3.1 세 개의 기둥`, `5.5 정규화와 통계`, `5.8.1 데이터 사전 점검`
- 문제:
  - 본문은 올바르게 “train split에서만 통계를 계산”하라고 설명한다.
  - 그러나 LeRobotDataset v3의 `meta/stats.json`은 dataset 전체의 집계 통계이며, `inspect_lerobot_v3.py`도 `dataset.meta.stats`만 표시한다.
  - 한 repository 안에서 episode subset만 train으로 선택하고 전역 stats를 그대로 쓰면 validation/test 정보가 normalization에 들어갈 수 있다.
- 권고:
  - split을 먼저 확정한 뒤 train episode로 stats를 재계산하는 구체적 LeRobot 경로를 추가한다.
  - 방법 A: train/validation/test를 별 revision/repository로 materialize하고 train stats를 policy artifact에 저장.
  - 방법 B: episode subset에서 재계산한 stats를 명시적으로 policy pre/postprocessor에 주입하고 checkpoint와 함께 versioning.
  - dataset-global stats는 감사/시각화용, policy normalization은 train-only stats라는 구분을 표로 제시한다.

### M-3. Dataset 점검 예제가 exact revision을 받지 않아 재현성 지침과 모순

- 파일: `ebook/book/05_lerobot_smolvla/code/inspect_lerobot_v3.py`
- 관련 절: `5.4`, `5.8.1`, `5.12 재현성 체크리스트`
- 문제:
  - 본문은 dataset exact revision을 저장하라고 강조한다.
  - 코드는 `LeRobotDataset(args.repo_id, episodes=[...])`만 호출하여 기본 revision을 사용한다. Hub의 `main`이 바뀌면 동일 명령이 다른 데이터를 검사한다.
- 권고:
  - `--revision`을 필수 인자로 추가하고 constructor에 전달한다.
  - 출력에 resolved commit SHA를 표시하거나 별 manifest에 기록한다.
  - model base revision, adapter revision, dataset revision을 한 run manifest에서 함께 묶는다.

### M-4. 제6장 결정적 `--demo` 출력이 본문의 예상 출력과 불일치

- 파일: `ebook/book/06_sim2real_deployment/chapter.md`, `ebook/book/06_sim2real_deployment/code/sim2real_diagnostics.py`
- 관련 절: `6.9 실습 1: 로그 진단과 신뢰구간`
- 실제 실행 결과:

```text
episodes=20 success=15 rate=0.750 wilson95=[0.531, 0.888]
infer_ms  p50=31.1 p95=41.5 p99=42.2
e2e_ms    p50=82.4 p95=105.3 p99=106.7
```

- 본문 예시에는 `infer_ms p50=22.4 ...`, `e2e_ms p50=61.0 ...`가 적혀 있다.
- 문제: `random.Random(42)`로 결정적인 demo이므로 환경 차이로 설명할 수 없다. 학습자가 자신의 실행을 오류로 오해한다.
- 권고: 본문 출력을 실제 결정적 출력으로 갱신하거나, 예시를 유지하려면 demo generator를 그 값에 맞춘다. condition별 두 줄도 예상 출력에 포함하면 코드-본문 대응이 더 명확하다.

### M-5. 20개 표본에서 p99를 안정적인 tail 지표처럼 사용

- 파일: `ebook/book/06_sim2real_deployment/chapter.md`, `code/sim2real_diagnostics.py`, `labs/lab_6_1_diagnostics.md`
- 관련 절: `6.2.1 지연과 jitter`, `6.6.2 성공률과 Wilson 신뢰구간`, `6.9 실습 1`
- 문제:
  - demo는 20 episode에서 선형보간 p99를 출력한다. 20개 표본의 p99는 사실상 최댓값 근처를 보간한 값으로 tail latency를 신뢰성 있게 추정하지 못한다.
  - 작은 표본에서 소수점 한 자리 p99를 제시하면 정밀도가 과장된다.
- 권고:
  - 지연 분포는 control tick/frame 단위로 충분한 표본을 수집하고 episode 성공 표본과 분리한다.
  - `n`, max, missed-deadline count를 함께 보고한다.
  - 표본이 작으면 p95/p99에 “탐색적 값” 경고를 붙이고 exact order statistic 또는 bootstrap interval을 논의한다.
  - 평가 protocol에 warm-up 제외, GPU synchronization, measurement boundary를 명시한다.

### M-6. 성공 CSV의 boolean parsing이 오탈자를 조용히 실패로 처리

- 파일: `ebook/book/06_sim2real_deployment/code/sim2real_diagnostics.py`
- 관련 절: `6.6 평가 설계`, 실습 `lab_6_1_diagnostics.md`
- 문제:
  - `success`가 `{"1","true","yes"}`가 아니면 무엇이든 `False`가 된다. `treu`, 빈 값, `success` 같은 오탈자도 정상 실패로 집계된다.
  - 통계 교재에서 입력 오류와 실제 실패를 합치면 결과의 provenance가 훼손된다.
- 권고:
  - 허용 true/false literal을 각각 선언하고 그 외 값은 행 번호를 포함한 `ValueError`로 거부한다.
  - duplicate episode ID, missing condition, timestamp 단위/clock domain도 검증한다.

### M-7. 최신 LeRobot 배포 인터페이스와 제5~6장 연결이 부분적으로 오래됨

- 파일: `ebook/book/05_lerobot_smolvla/chapter.md`, `ebook/book/06_sim2real_deployment/chapter.md`
- 관련 절: 제5장 `5.9 20 Hz 폐루프 추론`, 제6장 `6.5 End-to-End Pick & Place 배포`
- 문제:
  - 제5장은 async와 RTC를 짧게 언급하지만, 2026년 공식 Policy Deployment 문서는 local RTC와 remote backend를 구분하고 observation age, action timeout, startup timeout, starvation grace 같은 명시적 freshness/deadline budget을 제공한다.
  - 제6장은 `latest CLI가 변경될 수 있다` 수준에 머물러 제5장의 queue/worker 설명을 실제 `lerobot-rollout` 계약으로 연결하지 않는다.
- 권고:
  - local RTC(`--inference.type=rtc`)와 remote inference를 구분한다.
  - `execution_horizon`, `max_observation_age_s`, `action_timeout_s`, startup/freshness, queue starvation 시 fault 동작을 6장 safety supervisor 개념과 연결한다.
  - 단순 async tutorial의 `actions_per_chunk/chunk_size_threshold`와 최신 RTC의 continuation/guidance 개념을 같은 기능으로 혼동하지 않도록 버전 표를 둔다.
  - 출처: Hugging Face `Policy Deployment`, `Real-Time Chunking`, `Remote Inference` 공식 문서.

### M-8. 필터 전 proposal의 안전 유효성 검사 정책이 불충분하게 명시됨

- 파일: `ebook/book/06_sim2real_deployment/chapter.md`
- 관련 절: `6.3 출력 안정화`, 제5장 `5.9.3 Temporal Ensembling`
- 문제:
  - 양 장 모두 ensemble 후 최종 limit 적용은 잘 강조한다.
  - 그러나 NaN/Inf뿐 아니라 서로 다른 mode, stale chunk, 이미 workspace/joint limit을 크게 벗어난 proposal을 평균 후보에 넣을지 명시하지 않는다. 위험 proposal이 평균으로 “정상처럼” 보일 수 있다.
- 권고:
  - 후보별 schema/unit/finite/timestamp/mode/기본 hard-limit 검증 → stale·invalid proposal 폐기 → ensemble/filter → 최종 rate/workspace/collision 검사의 2단계 계약을 제시한다.
  - mode 전환(grasp open→close, pre-grasp→retreat)에서는 history reset 또는 phase-aware ensemble을 설명한다.

## Minor

### m-1. `split_by_episode()`가 정렬된 앞부분을 train으로 고정

- 파일: `ebook/book/05_lerobot_smolvla/code/normalization.py`
- 관련 절: `5.3.3 episode 경계와 split`, `5.5`
- 문제: episode ID가 날짜·작업자·난이도 순서라면 앞 80%/뒤 20% 분할은 의도하지 않은 domain shift를 만든다. 교육용 누출 예제라는 설명은 있지만 함수명이 일반 split처럼 보인다.
- 권고: seed를 받는 episode-level shuffle 또는 group/stratified split을 별도로 제공하고, 현재 함수는 `ordered_episode_split_demo`처럼 의도를 드러낸다.

### m-2. LeRobot v3 task metadata 경로의 공식 문서 간 불일치를 더 명확히 고정할 필요

- 파일: `ebook/book/05_lerobot_smolvla/chapter.md`
- 관련 절: `5.3.1 세 개의 기둥`
- 관찰: 최신 API/porting 문서는 `tasks.parquet`를 사용하지만 v3 overview 일부에는 아직 `tasks.jsonl`이 남아 있다. 본문은 이 차이를 언급해 방향은 옳다.
- 권고: “이 책의 기준 commit에서는 `tasks.parquet`”처럼 exact LeRobot commit과 확인한 schema를 함께 표기하고, 항상 `info.json`/API를 따르라고 강조한다.

### m-3. LoRA parameter 계산 예제의 범위를 더 선명하게 표시

- 파일: `ebook/book/05_lerobot_smolvla/code/lora_budget.py`, `chapter.md`의 `5.7`
- 문제: 계산기는 square projection 두 개만 가정한다. 최신 SmolVLA PEFT 기본 target에는 LM expert q/v뿐 아니라 task-dependent state/action projection도 포함될 수 있어 실제 trainable 수와 다르다.
- 권고: 출력에 `simplified estimate`를 명시하고 실제 학습 시작 시 framework가 출력한 trainable/total parameter를 정답으로 기록하게 한다. 공식 PEFT 문서의 default target 목록을 표로 추가한다.

### m-4. `workspace_guard`의 상태 문자열이 실제 mode보다 강한 의미를 줌

- 파일: `ebook/book/06_sim2real_deployment/code/.../workspace_guard.py`
- 문제: 노드 자체에 승격 mode가 없는데 정상 target마다 `DRY_RUN_ACCEPTED`를 발행한다. 사용자가 안전 감독기의 DRY_RUN state로 오해할 수 있다.
- 권고: `TARGET_VALIDATED`처럼 검증 결과만 표현하거나 실제 supervisor mode 입력을 받아 상태를 결합한다.

### m-5. ROS 2 QoS와 fault 전달 계약이 코드 예제에 드러나지 않음

- 파일: `workspace_guard.py`, `lab_6_3_ros2_guard.md`
- 관련 절: `6.4.3 워치독과 생명주기`
- 문제: 기본 depth 1 QoS만 사용하고 deadline/liveliness, transient/local fault state, driver acknowledgement를 보여 주지 않는다. 본문 참고문헌에는 QoS가 있지만 실습 연결이 약하다.
- 권고: 교육 범위에서 sensor/state QoS와 command/fault QoS 차이를 표로 설명하고, fault 상태를 late subscriber가 놓치지 않는 설계 및 driver HOLD acknowledgement를 과제로 추가한다.

### m-6. Python 3.12 기준과 실제 ROS 2 Jazzy/LeRobot interpreter를 구분하면 더 정확함

- 파일: 제5장 기준 환경, 제6장 선수 지식
- 문제: Ubuntu 24.04의 system Python과 ROS 2/LeRobot venv가 우연히 같은 minor version이어도 system package와 pip environment를 섞으면 dependency 충돌이 생긴다.
- 권고: ROS 2 workspace의 interpreter, LeRobot venv, Isaac Sim 내장 Python을 별 환경으로 명시하고 shell별 `which python`, `python --version` 기록을 추가한다.

## 장 간 연결 평가

### 잘 연결된 부분

- 제5장의 chunk/receding horizon/temporal ensemble이 제6장의 안정화와 승격 단계로 자연스럽게 이어진다.
- 제5장의 데이터 revision·개인정보·model card가 제6장의 포트폴리오 및 hash 기록으로 확장된다.
- 제5장의 20 Hz latency 예산이 제6장의 p50/p95/p99와 deadline miss 진단으로 연결된다.
- 양 장 모두 자연어가 safety authority가 아니라 task condition이라는 원칙을 일관되게 유지한다.

### 보완할 연결

1. 제5장의 train-only normalization stats artifact를 제6장 “배포 전 고정해야 할 계약”에 추가한다.
2. 제5장의 camera `rename_map`, action representation, normalization/inverse-normalization을 제6장의 checkpoint 계약에 포함한다.
3. 제5장의 queue underrun/stale observation 정책을 제6장 supervisor의 구체적 FAULT event로 연결한다.
4. 제6장의 calibration/URDF hash 변경 강등 조건에 제5장의 dataset/model/base/adapter revision을 함께 묶는다.
5. 제5장의 temporal ensemble history는 제6장의 task/phase 전환, E-stop, reset에서 반드시 clear한다는 불변조건을 추가한다.

## 코드-설명 및 예상 출력 점검

| 대상 | 결과 | 비고 |
|---|---|---|
| 제5장 범용 Python 예제 | 통과 | 본문 예상 출력과 일치 |
| 제5장 LeRobot 환경 의존 예제 | 정적 검사만 가능 | revision 인자 보완 필요 |
| 제6장 Python 문법 | 통과 | 환경 독립 코드 실행 가능 |
| `safety_supervisor.py` 출력 | 일치 | latched FAULT/reset 예시와 대응 |
| `sim2real_diagnostics.py --demo` | 불일치 | M-4 참조 |
| ROS 2 `workspace_guard` | 실행 환경 미검증 | frame/freshness/orientation 수정 후 Jazzy에서 빌드·토픽 시험 필요 |

## 출처 평가

출처의 기본 품질은 높다. Hugging Face 공식 문서/코드, SmolVLA·ACT·Diffusion Policy·LoRA 원 논문, NIST, ISO, ROS 2 설계 문서를 사용한다. 다음 보강을 권한다.

- 제5장: 최신 `Policy Deployment`, `RTC`, `Remote Inference` 공식 문서
- 제5장: SmolVLA PEFT default target은 문서뿐 아니라 고정 commit의 `modeling_smolvla.py` 링크
- 제6장: TF2 timestamped transform과 frame semantics 공식 ROS 2 문서
- 제6장: latency 측정 protocol과 작은 표본 percentile 한계에 대한 통계 출처
- 모든 웹 문헌: “2026년 접근”만이 아니라 가능한 경우 exact 문서 버전/commit을 기록

## 출판 전 권장 처리 순서

1. B-1 frame semantics 수정 및 실패 주입 시험
2. M-1 target freshness/orientation 검증
3. M-4 결정적 출력 일치
4. M-2 train-only stats와 LeRobot 전역 stats 연결
5. M-7 최신 RTC/remote inference와 supervisor 연결
6. M-5/M-6 통계 입력과 tail metric 보강
7. 나머지 Major/Minor 반영 후 ROS 2 Jazzy 실제 빌드·토픽 시험

