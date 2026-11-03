# E3 독립 콘텐츠 검수 기록

- 시작일: 2026-11-03 / 상태: 21개 콘텐츠 통과 · 실제 웹 통합 별도
- 범위: M10·M11·M12 각 6개와 M14.01/.03/.06, 총 21개. M14.02/.04/.05는 E6로 유보하며 M14 전체 완료로 판정하지 않는다.
- 기준: [품질 기준](../quality_gate.md), [통합 커리큘럼](../../integrated_curriculum.md), [E2 검수 기록](E2-review.md).
- 책임: 독립 검수자는 이 기록을 소유한다. 신규 원고 수정은 작성자, 기존 교재 수정·registry·runtime·실제 브라우저 최종 확인은 루트 소유다. PDF/EPUB를 생성하지 않는다.

## 1. 선수와 확인 범위

M10은 M05의 ROS·시간, M07의 물리·제어, M08의 URDF/관성/자산 계약을 사용한다. OpenUSD 합성과 물리 계산·렌더링·실제 로봇 구동을 분리한다. M11은 M01의 실행환경과 M02의 미분·확률·행렬을 사용하되 텐서, 손실, 학습 상태를 처음 배우는 독자에게 설명한다. M12는 M11의 분할/일반화·지표와 M02의 프레임/행렬을 사용한다. M14 기초는 M05 시간·TF, M12 투영, M02 확률을 사용하며 M13/EKF 심화를 필수로 끌어오지 않는다.

장비 없는 계산·합성 기록·코드 독해가 기본이다. 실제 CPU 실행, 문서 대조, 합성/예상 결과를 명확히 구분한다. 확인하지 않은 CUDA/GPU·Isaac·ROS 실행·학습/추론 실적을 주장하지 않는다. Ubuntu 24.04/ROS 2 Jazzy와 기존 Isaac 6.2 문서 조합의 범위를 구분하고, 다른 로컬 실행환경은 실제 버전을 기록한다. 기존 링크와 요약이 신규 완결 원고를 대신하지 않는다.

## 2. 공통 판정 기준

내용 7항목(목표·선수/설명 자립성/정확성·일관성/예제·전이/실습/평가·해설/자습 흐름·표현)을 각각 0·1·2점으로 평가하며 전 항목 2점일 때만 콘텐츠 통과다. 실제 웹 전달이라는 여덟째 기준은 루트가 별도로 검수한다. 세 행동 목표가 본문·실습과 해설·Q1~3 및 개별 풀이에서 실제로 드러나야 한다. 숫자만 맞춘 부분 답안, 근거·조건 누락, 대표 오개념의 피드백을 확인한다.

기호·shape·축·좌표 방향·단위·시간·부호와 모든 수치를 독립 계산한다. 처음 등장하는 용어와 가정을 건너뛰지 않는다. 전 섹션의 한국어 어절·영문 앞뒤·숫자/단위 가독성을 재독한다. 긴 수식의 KaTeX 구문과 실제 remark-math의 block/inline 판정을 구분한다. 불확실한 기술 사실은 공식/저자 primary 자료로 확인하고 접근 실패와 대체 원문 확인 범위를 남긴다. 검수용 영구 스크립트를 새로 만들지 않으며 필요한 계산은 일회성으로 수행한다.

## 3. 단위별 사전 집중 기준

| 단위 | 집중 검토 |
|---|---|
| M10.01 | Stage/Prim/속성·관계·레이어 의견, 강도 가정·edit target/저장, reference와 scenegraph instance의 편집 경계 |
| M10.02 | URDF/USD 변환의 단위·축·관절·관성·구동 계약, 변환/표시/물리 검증 구분 |
| M10.03 | rigid body/collider·접촉/마찰, 이산 이동량과 CCD 조건·설정 계층, 관통 원인 단정 한계 |
| M10.04 | 질량/COM/관성 표현 프레임·물리 가능성, articulation·fixed base·구동/수동 구분 |
| M10.05 | physics/render dt·substep·solver 반복의 구분, 수치 안정/접촉·반복 가능성의 조건 |
| M10.06 | ROS bridge 노드/타입·명령과 상태, 카메라 시간/축/encoding, 실행 환경과 증거 범위 |
| M11.01 | 손실 정의·chain rule·경사 부호·학습률 업데이트·학습/일반화 구분 |
| M11.02 | 텐서 shape/dtype/device, Dataset/DataLoader 배치·모델/optimizer/checkpoint·train/eval 상태 |
| M11.03 | 시간/장면/그룹 분할·전처리 fit·누수, validation 선택과 test 독립성 |
| M11.04 | CNN/Transformer 입출력·표현/수용영역·attention 가정, 사전학습/미세조정 한계 |
| M11.05 | 분류/검출/분할/회귀 출력·정답 계약, 지표의 분모/매칭/집계 조건 |
| M11.06 | 지연 측정 경계·warmup/동기화·메모리, 분포 이동·실험 조건/재현 기록 |
| M12.01 | 배열 축·BGR/RGB·dtype/range, 필터 경계/정규화·특징과 물리 의미 |
| M12.02 | 카메라 좌표·핀홀 깊이 조건·K/왜곡/내부 파라미터와 픽셀 투영 |
| M12.03 | 라벨 클래스/박스 계약·데이터 분할·YOLO 버전, 학습 예상/실행 구분 |
| M12.04 | semantic/instance 출력과 차선/도로 장면, 배경·mask/resize·평가 조건 |
| M12.05 | 시각/ID/가림·매칭과 추적, 오검출/미검출/ID switch·인과 범위 |
| M12.06 | precision/recall/IoU 계산·임계값/매칭, CV 성과와 로봇 과제 성공 구분·얼굴 비교 선택성 |
| M14.01 | 내부/외부 보정·기하/단위/프레임 방향·데이터 수집 조건과 독립 검증 |
| M14.03 | clock/epoch·timestamp 의미·멀티레이트/보간·ApproximateTime의 선택과 한계 |
| M14.06 | TF/재투영/시간/불확실성 오차 분리·잔차와 참오차·기록 범위 |

## 4. 원고별 검수 기록

작성자 고정 알림 후 전체 원고를 읽고 최초 결함·수정 요청·재검수·점수·최종 SHA256을 누적한다. 아래 승인 SHA가 있는 단위만 콘텐츠 통과이며 나머지는 순차 검수한다. 콘텐츠 통과를 실제 웹 검수나 전체 모듈 완료로 확대하지 않는다.

### M10.01 1차 독립 검수 — 콘텐츠 통과

- 객체/Attribute/Relationship은 실습 1·Q1, 직접 의견/편집·저장은 실습 2·Q2, 공유 비용/편집 경계는 실습 3·Q3에서 확인한다. 정의→단순 조건→계산→한계의 순서가 자립적이며 전 섹션의 자연스러운 띄어쓰기를 재독했다. 부분 답안과 센서 실행·수정 시각 우선·GPU 비용 확정의 오개념을 구별한다.
- 독립 계산: 강도가 명시된 직접 의견은 0.8→asset 수정 후 0.8→session 의견 제거 후 1.2, 이후 experiment도 제거하면 1.5다. Q2는 4→5다. 비용은 10×102=1020 대 100+20=120, Q3은 4×83=332 대 80+12=92다. N=1의 102도 일치한다. task:massNoteKg는 물리 스키마가 아닌 사용자 메모로 구별한다.
- [OpenUSD 소개](https://openusd.org/release/intro.html), [용어집](https://openusd.org/release/glossary.html), [참조 튜토리얼](https://openusd.org/release/tut_referencing_layers.html), [scenegraph instancing](https://openusd.org/release/api/_usd__page__scenegraph_instancing.html), [UsdStage API](https://openusd.org/release/api/class_usd_stage.html)를 직접 대조했다. Stage.Save의 session 제외, 명시 경로/defaultPrim 조건, instanceable과 호환 구조·하위 개별 편집 제약이 맞다. USD release 일반 개념 대조이며 Isaac 버전별 실제 동작을 실행해 검증한 것이 아니다.
- 내용 7항목 모두 2점. 실제 pxr/Isaac/GPU 실행과 출판 생성은 없다. 승인 SHA256: `47303f5c58c587c3fb67899decdf7fa673119f2ebbac9cbbd94a70a004a7396b`. 실제 웹/registry는 루트 별도다.

### M10.02 1차 독립 검수 — 콘텐츠 통과

- 원본/확장/생성/배치 역할은 실습 1·Q1, 단위·이름·mimic·베이스 보존은 실습 2·Q2, 의존성/재가져오기 증거는 실습 3·Q3에 대응한다. 전 섹션의 자연어 표현과 초출 용어를 재독했다. 원본 변경과 배치 변경, 표시와 물리 검증, Source와 Fixed를 분리하는 오개념/부분 답안 피드백이 있다.
- 독립 계산: 0.2(cos0.5,sin0.5)=(0.1755165124,0.0958851077) m, ±1 rad=±57.2957795 degree, 0.3/0.01=30 unit, 그리퍼 0.04−0.01=0.03 m 및 Q2 0.05−0.02=0.03 m가 일치한다. 모든 scale=1의 최종 길이와 개별 속성/API 단위의 조건을 보존한다.
- [Isaac Sim 6.2 importer](https://docs.isaacsim.omniverse.nvidia.com/6.2.0/importer_exporter/ext_isaacsim_asset_importer_urdf.html)의 이름 정리·package 매핑·충돌 근사·Base Type과 mimic 기록을 직접 대조했다. Source는 원본 유지이며 고정을 보장하지 않는다. 해당 문서의 NewtonMimicAPI 작성 내용으로 모든 백엔드 지원이나 기본 백엔드를 추론하지 않는 원고의 경계가 적절하다. [OpenUSD 관절](https://openusd.org/release/api/class_usd_physics_revolute_joint.html)과 [길이 단위](https://openusd.org/release/api/group___usd_geom_linear_units__group.html)의 파일 속성/실행 API·전체 변환 구분도 맞다.
- 내용 7항목 모두 2점. 실제 importer/Isaac/GPU 실행은 없다. 승인 SHA256: `f8ff08536d3c61d68dd2a1176c9972871fadf35164e420b9e3fa183c18e474d3`. 웹/registry는 루트 별도다.

### M10.03 1차 독립 검수 — 콘텐츠 통과

- 표시/강체/접촉/질의 역할은 실습 1·Q1, 이산 교차와 CCD/offset은 실습 2·Q2, 마찰과 진단 증거는 실습 3·Q3에 대응한다. 용어·기호·경로 가정과 전 섹션의 문장/띄어쓰기를 재독했다. 정마찰 최대를 실제 힘으로 쓰거나 raycast를 접촉 증거로 읽는 오개념과 부분 답안을 구별한다.
- 독립 계산: 2×0.01=0.02 m, 구의 두 끝 범위는 각각 [−0.011,−0.009]/[0.009,0.011] m로 벽 밖이며 중간은 교차한다. Q2는 0.06 m다. contact 합은 0.005/0.003 m, 정마찰 최대 4 N/실제 3 N, 미끄러짐 가정은 5−3=2 N→2 m/s², Q3 최대 10 N/실제 8 N이다. 실제 solver 재현과 구분한다. 수식 1개는 remark-math에서 block math로 파싱되고 KaTeX throwOnError 검사를 통과했다.
- [PhysX 5.4.1 충돌 참여](https://nvidia-omniverse.github.io/PhysX/physx/5.4.1/docs/RigidBodyCollision.html), [접촉/CCD](https://nvidia-omniverse.github.io/PhysX/physx/5.4.1/docs/AdvancedCollisionDetection.html), [Isaac 6.2 fundamentals](https://docs.isaacsim.omniverse.nvidia.com/6.2.0/physics/simulation_fundamentals.html)를 직접 확인했다. query/simulation 분리, contactOffset의 비음수·rest보다 큼 조건, pair 합과 즉시 반발력 구별, sweep CCD scene/body 조건이 맞다. PhysX 경로와 다른 백엔드 이식의 경계가 명시됐다.
- 내용 7항목 모두 2점. 승인 SHA256: `6ae2b4125bb54f4a522de1ccbbc34338de2ac33c1dcf43d50067c2d55c5ff50b`. 실제 엔진/GPU 실행과 출판 생성은 없다. 웹/registry는 루트 별도다.

### M10.04 1차 독립 검수 — 콘텐츠 통과

- 질량/밀도·COM/중력 하중은 실습 1·Q1, 공통 축/점 관성은 실습 2·Q2, articulation/베이스/자유도는 실습 3·Q3에 대응한다. 기호와 선수 연결·자연어 흐름·부분 답/오개념을 재독했다. 중력 토크 계산과 별도 z축 관성 계산을 명시하여 축을 혼동하지 않는다.
- 독립 계산: ρV=1 kg, M=4 kg, COM=0.15 m, 중력 토크 크기 6 N·m, 평행축 기여 0.0225+0.0075, I=0.038 kg·m², 단일 고정 축 가속도 2 rad/s², Q2 관성 0.09 kg·m²다. 독립 열린 트리의 고정 2/자유 8과 베이스 quaternion의 4성분/회전 3자유도를 구분했다. 수식 2개 모두 실제 remark block 및 KaTeX 검사를 통과했다.
- [Modern Robotics 강체 관성](https://modernrobotics.northwestern.edu/nu-gm-book-resource/8-2-dynamics-of-a-single-rigid-body-part-1-of-2/), [OpenUSD ArticulationRootAPI](https://openusd.org/release/api/class_usd_physics_articulation_root_a_p_i.html), [PhysX 5.4.1 articulation](https://nvidia-omniverse.github.io/PhysX/physx/5.4.1/docs/Articulations.html)을 직접 대조했다. 공통 기준 합산·물리 조건/실부품 일치 구별, 축약 좌표의 루트/관절 표현, 루트 표시와 고정 조건 구분이 적절하다. 다관절 전체를 상수 I로 일반화하지 않는다.
- 내용 7항목 모두 2점. 승인 SHA256: `3752704ee4ef1d0935b56cdf4948c5e0d5459b3c15e734ffde9fdb6134d03eda`. 실제 엔진/GPU/실물 실행은 없으며 웹/registry는 루트 별도다.

### 기존 응용 8원고와 시간 정합 SVG — 콘텐츠 재검토 통과

- 여섯 장의 E3 선수 연결과 frontmatter의 21개 범위·M14 심화 유보·CPU/합성 기본 경로를 재독했다. 목표 경로와 기존 응용의 관계가 적절하며 실제 GPU/Isaac/OpenCV/YOLO 성공으로 확대하지 않는다.
- [Isaac 6.2 Newton backend](https://docs.isaacsim.omniverse.nvidia.com/6.2.0/physics/newton_physics.html)와 [importer](https://docs.isaacsim.omniverse.nvidia.com/6.2.0/importer_exporter/ext_isaacsim_asset_importer_urdf.html)를 직접 확인했다. PhysX 예제 경로·선택 backend/런처·작성된 Newton mimic/root schema와 runtime 소비를 분리한 1~3장 조건은 맞다.
- 5장의 L1을 평균 회귀로 부르던 모순이 해소됐다. 같은 관측의 목표 ±1에 예측0/±0.5를 대입한 평균 L1은 모두1, 평균 제곱 L2는1/1.25로 독립 계산했다. L1의 성분별 중앙값 최소해와 L2 조건부 평균, 한 결정론적 출력의 다봉성 한계를 구분한다. PyTorch2.13 공식 loss.py 정의를 직접 대조했으며 독립 검산 자체는 Python 표준 산술이다. 버전 문서 페이지 접근 실패 후 공식 raw를 사용했다.
- [Jazzy message_filters 공식 구현](https://raw.githubusercontent.com/ros2/message_filters/jazzy/src/message_filters/__init__.py)을 직접 읽었다. timestamp 허용 조합·도착/queue/표본 소비 조건과 clock offset 보정 아님 설명이 맞다. 본문245행/문항272행/확인포인트274행의 pair 수 증가 단정 및 미래 표본 대기 일반화를 지적했고, 수정본은 허용 범위와 실제 짝 수·아직 미도착과 이미 양쪽 buffer 존재를 일관되게 구분한다.
- SVG의 보간선은 t0=540<t_image=563<t1=680을 실제로 둘러싸며 두 끝의 표본을 식별한다. annotation x610이 보간선과 겹치는 문제를 지적해 x810/y155 빈 공간으로 이동한 것을 source에서 확인했다. 최종 시각/모바일 검수는 루트가 별도로 수행한다.
- 다음9파일의 콘텐츠 개정을 승인한다. 기존 제목/순서·배포 전달은 루트 검수이며 신규 목적지 원고의 승인을 대신하지 않는다.

| 파일 | 승인 SHA256 |
|---|---|
| `ebook/book/01_physical_ai_isaac_ros2/chapter.md` | `dc2aff65925d924d276f2e2f97bde1a63efca340f5b9d7fe3856f2a0e43dd0b8` |
| `ebook/book/02_physx_simulation/chapter.md` | `5507d0f2ecfe66bfe0b5dafb36a41e1055cc81a1e5fe0fb4badc695f8e9512b6` |
| `ebook/book/03_so101_kinematics_teleop/chapter.md` | `5e3c45e256c9fc5ac7230b429c4dba759c24cfcd0f45f7bf62eea5aadd16bc1f` |
| `ebook/book/04_sensor_data_pipeline/chapter.md` | `63f8300ad4c9ad559b9d8001471eabb34baae98983bdae1b24e385ec11cb6c71` |
| `ebook/book/05_lerobot_smolvla/chapter.md` | `e5d4749c0d15b0db1c98bd476e9a2ac12bf90a6225c12edc34621d0a7ae12c74` |
| `ebook/book/06_sim2real_deployment/chapter.md` | `e2b7679ff687527324ac81cc7ff63e5e45072177bca2c3aa726aad35900b57cb` |
| `ebook/book/00_frontmatter/how_to_use.md` | `d1117a7c0d11069aacb72e150a5d8184bf8ffd7bfed09695a4cf7f4b11074714` |
| `ebook/book/00_frontmatter/environment.md` | `c297bdd09c3cab96cda354faafece91473dbef857b3eac8ce32d9c1882886ec6` |
| `ebook/book/04_sensor_data_pipeline/images/time_alignment.svg` | `03379450f80c5819698f71acd0fcc8d87314f967ba1814bdfec14f5b6a4b28b6` |

### 선택 임계값/투영 모형 — 독립 수학·표현 검토 통과

원고 검수와 별도로 helper/TSX를 읽고 실제 source를 TypeScript transpile하여 Node에서 일회성 계산했다. React 검토 스킬의 파생 계산/안정 ID/상태 갱신 관점도 확인했다. 실제 브라우저는 루트 별도이며 원고 학습 완료를 대체하지 않는다.

- threshold 0/50/95/100에서 (TP,FP,FN,TN)은 (4,4,0,0)/(3,2,1,2)/(1,0,3,4)/(0,0,4,4)다. FP 단가2/FN 단가3이면 비용8/7/9/12다. threshold50의 P=.6/R=.75/F1=2/3, 95의 P=1/R=.25/F1=.4, 100의 precision=null이 맞다. 정수 percent 비교의 ≥ 경계와 고정 양성4개로 F1 분모 양수 조건을 표현한다. 비용은 8행 합계이며 실제 손실/보정확률/검출AP가 아니다.
- projection 기본은 (360,260)→(364,260), ΔX=.01 m, Δu=4 px다. 음수 Δt는(356,260), 0이면 겹친다. Z=1 m와 range≈1.00623059 m를 구별하며 x=.8이면 u=640으로 프레임 밖이다. 같은 clock·고정 깊이·일정 상대 x속도 조건, 왜곡/가림/rolling shutter 미포함, half-open 경계·표시 반올림과 원값 판정·숫자 비클램프/SVG clip이 일치한다.
- 상태는 각 컴포넌트 내부에만 있으며 답안/진도 자동 저장 호출이 없다. 모바일/키보드·실제 연결/시각 판정은 루트 담당이다.

| 파일 | 승인 SHA256 |
|---|---|
| `apps/web/src/lib/threshold-model.ts` | `657418df2a623f1ef3b11e51f7a476c48baded752fab745082d3ce02378f52ef` |
| `apps/web/src/components/threshold-concept-lab.tsx` | `974589a992513570690d81db466a47ea7e07d957b4bba962dfeab0106bbc34a5` |
| `apps/web/src/lib/projection-model.ts` | `78a661e269c51f55b6d4d7bf457c2ca13fef80983b781ca77f68978dc012d609` |
| `apps/web/src/components/projection-concept-lab.tsx` | `7de02b2512d2765b2b386c17e3185a5fe895c4fe302a07ae5a5cbf002c1c1ab5` |

### M10.05 1차 독립 검수 — 콘텐츠 통과

- 시간/스케줄/RTF는 실습 1·Q1, 적분/solver/비용은 실습 2·Q2, 반복 조건과 증거 범위는 실습 3·Q3에 대응한다. 기호/단위·논리 순서·전 섹션의 자연어 표현과 부분 답안/오개념을 확인했다. 경과 구간의 스텝 수와 끝점 포함 표본 수를 섞지 않는다.
- 직접 갱신식 계산에서 a=2의 한 단계/반 간격 두 단계 위치는 .02/.015 m, 속도 둘 다 .2 m/s다. 정확 위치 .01에 대한 오차 .01/.005가 맞다. Q2 a=1의 위치 .04/.03 m와 정확 .02의 구별도 일치한다. 120/30·240/60은4스텝, RTF는.5, A는오차/B는비용 실패, .00008<.0001 허용 통과와 비트 동일성 미증명이 맞다. 수식1개는 remark block 및 KaTeX 검사를 통과했다.
- [Isaac6.2 시간 이벤트](https://docs.isaacsim.omniverse.nvidia.com/6.2.0/physics/simulation_fundamentals.html), [PhysX5.4.1 solver/결정성](https://nvidia-omniverse.github.io/PhysX/physx/5.4.1/docs/RigidBodyDynamics.html)을 직접 대조했다. TGS 내부 시간 분할과 외부 스텝을 분리하고 seed만으로 재현성을 보장하지 않는다. 제한된 PhysX 동일 장면/순서/스텝/릴리스/플랫폼의 문서 조건을 전체 Isaac/GPU/센서 경로로 확대하지 않는다.
- 내용 7항목 모두2점. 승인 SHA256: `0218809e3f6f860bd7426cc42e2c0dd9c0b4d34a71ccfdd17647a92a575f30d5`. 실제 엔진/성능 실행 없이 교육용 산술과 문서를 확인했다. 웹/registry는 루트 별도다.

### M10.06 1차 독립 검수 — 콘텐츠 통과

- 발행/구독·제어/피드백 책임은 실습 1·Q1, 이름 재정렬/TTL/상태 시각은 실습 2·Q2, 영상 바이트/보정/TF는 실습 3·Q3에 대응한다. 전 섹션의 용어·자연어 흐름·부분 답/오개념을 확인했다. 메시지 형식과 소비자의 명령 계약, 발견과 적용/추종·영상 생성의 증거를 분리한다.
- 독립 계산: 관절 재정렬은 [.5,.2]/Q2 [.3,.1] rad, 나이는 .02 통과/.08 및 .06 실패다. 명령 전 상태로 이후 추종을 주장하지 않는다. 640×3×480=921600 byte, 30Hz 원시 payload=27.648 MB/s(십진), Q3 step12/data24와 패딩 step16/data32가 맞다. 실제 전송 측정으로 표현하지 않는다.
- [Isaac6.2 Joint Control](https://docs.isaacsim.omniverse.nvidia.com/6.2.0/ros2_tutorials/robot_control/tutorial_ros2_manipulation.html), [Camera](https://docs.isaacsim.omniverse.nvidia.com/6.2.0/ros2_tutorials/tutorial_series/tutorial_ros2_camera.html), [Jazzy Image](https://raw.githubusercontent.com/ros2/common_interfaces/jazzy/sensor_msgs/msg/Image.msg), [CameraInfo](https://raw.githubusercontent.com/ros2/common_interfaces/jazzy/sensor_msgs/msg/CameraInfo.msg)를 직접 확인했다. 소비자별 JointState 명령·OmniSensorAPI/tickRate 조건, 취득 stamp/optical frame·행바이트/패딩·불일치 frame 계약·K[0]=0 미보정 표시가 맞다. 본문에 수식 block은 없고 기본 활동은 합성 기록 분석이다.
- 내용 7항목 모두2점. 승인 SHA256: `1b975c6d4181ae73db0a2840c42eb1030b1b6788e87ee73d7c22f562d8a9eede`. M10 여섯 원고의 콘텐츠 검토가 끝났으며 모듈 연결/실제 웹은 루트 별도다.

### M11.01 1차 독립 검수 — 콘텐츠 통과

- 데이터/모형/손실·작업 성공은 실습1/Q1, 연쇄법칙/경사/업데이트는 실습2/Q2, 학습률·누적/역전파와갱신은 실습3/Q3에 대응한다. 모든 섹션의 기호·초출 용어·문장과 부분 답/오개념을 재독했다. MSE 전체 원소 평균과 표본당 단일 출력 조건, 의도한 gradient accumulation을 구분한다.
- 독립 계산에서 L=2.5(w−2)², g=5(w−2)다. w=0의 L10/g−10→w1/L2.5→w1.5/L.625, η.5의w5/L22.5, 미초기화 누적g−15의w2.5가 맞다. 원고 코드 자체를 추출하여 Darwin/Python3.13.4/torch2.13.0 CPU에서 실제 실행했고 before0/10/−10, after1/2.5 출력과 일치했다. CUDA/GPU나 실제 데이터 학습은 하지 않았다. 수식2개는 실제 remark block 및 KaTeX 검사를 통과했다.
- [PyTorch autograd](https://docs.pytorch.org/tutorials/beginner/basics/autogradqs_tutorial.html), [최적화 절차](https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html), [2.13 loss 정의 원문](https://raw.githubusercontent.com/pytorch/pytorch/v2.13.0/torch/nn/modules/loss.py)을 직접 대조했다. stable/tutorial의 현재2.15 문서와 로컬2.13 CPU 실행을 구별한다. backward의 누적과 optimizer.step, no_grad 범위가 맞다.
- 내용7항목 모두2점. 승인 SHA256: `19ccfe618ebc721691b08c4e1e7dc99812b4468c575804c95b1b086a4a815770`. 임시 승인 큐에도 추가했다. 웹/registry는 루트 별도다.

### 기존 4장 문제 해설 추가 동기화 — 콘텐츠 통과

`ebook/book/04_sensor_data_pipeline/exercises/solutions.md`의7/8번을 본문·점검문항 및 Jazzy ApproximateTime 구현 조건과 재대조했다. slop5/50 ms는 허용 시각 차이 범위이며 실제 pair 수의 단조 증가를 보장하지 않는다. 이미 양쪽 표본이 버퍼에 있는 온라인 경우와 미도착 표본 대기의 지연/가용정보·상한을 나누었다. 기존 번호/정답 의미를 유지하면서 본문의 수정 조건과 맞는다. 승인 SHA256: `7d61c3d11f67fe4b18713be00736863ff80a6c212a92be757898d7443bc7e7c8`. 실제 웹 전달은 루트 별도다.

### M11.02 1차 독립 검수 — 콘텐츠 통과

- shape/dtype/device·축은 실습1/Q1, Dataset/배치와 가중 평균은 실습2/Q2, 저장/입력 의미·평가/재개는 실습3/Q3에 대응한다. 초출 용어와 전체 자연어·부분 답/오개념을 재독했다. reshape와 축 교환, 전체 메모리와 수치 저장량, 수동 가중치와 학습 성과를 구별한다.
- 원고의 완전 코드를 직접 추출하여 Darwin/Python3.13.4/torch2.13 CPU에서 재실행했다. 입력/목표 배치(2,2)/(2,1)→(1,2)/(1,1), 예측[5,11]/[17], reload_equal True, x_bytes24가 일치했다. 별도 torch 계산으로 (3,1)−(3,)→(3,3) broadcasting과 reshape/transpose 값 차이도 확인했다. 표본 평균11/3 대 배치 평균5, Q2 표본13/5 대 배치11/3은 독립 산술과 맞는다.
- [공식 텐서](https://docs.pytorch.org/tutorials/beginner/basics/tensorqs_tutorial.html), [데이터](https://docs.pytorch.org/tutorials/beginner/basics/data_tutorial.html), [저장/로드](https://docs.pytorch.org/tutorials/beginner/basics/saveloadrun_tutorial.html)를 직접 확인했다. state_dict/구조·전처리·optimizer 재개 상태, eval과 경사 비활성화 구분이 맞다. 현재2.15 문서와 실제2.13 CPU 환경은 별개다. 메모리 왕복을 디스크 manifest나 실제 학습 결과로 주장하지 않는다.
- 내용7항목 모두2점. 승인 SHA256: `1fb51fb2cab2270a385e46e9f064e38a2386388b10ea5e1e9e702b812bb8749a`. 임시 승인 큐 추가 완료, 웹/registry는 루트 별도다.

### M11.03 1차 독립 검수 — 콘텐츠 통과

- 평가 주장/그룹 분할은 실습1/Q1, train-only 통계/미래 입력 누수는 실습2/Q2, validation 선택/test 잠금은 실습3/Q3에 대응한다. 전 섹션의 초출 용어·기호·자연어와 부분 답/오개념을 재독했다. 새 episode와 새 물체·미래 입력과 감독 목표·누수와 일반화 한계를 구분한다.
- 독립 산술로 train[0,2]의 μ1/σ1/test z9, 전체[0,2,10]의 μ4/분산56/3/σ4.320493799/z1.388730150, Q2 μ3/σ1/z5를 확인했다. A/B 대 C 대 D의6/3/3프레임·1/1/1물체와 작은 그룹 한계, validation 최소 epoch2/Q3 첫시점도 맞다. 학습 곡선은 명시된 가상 입력이다.
- [scikit-learn pitfalls](https://scikit-learn.org/stable/common_pitfalls.html#data-leakage), [group CV](https://scikit-learn.org/stable/modules/cross_validation.html#cross-validation-iterators-for-grouped-data), [TimeSeriesSplit](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html)를 직접 대조했다. 분할 후 train fit/동일 transform과 그룹 분리, gap의 표본 제외 기능을 모든 그룹/창 누수 자동 처리로 확대하지 않는 설명이 맞다. test 재사용의 선택 참여와 보고 경계를 명시한다.
- 내용7항목 모두2점. 승인 SHA256: `d75a56d58171756f2440bb331781acdbe7edd1d8b3d240a0dcae0fda0af7feea`. 실제 학습/일반화 실험은 수행하지 않았으며 임시 승인 큐 갱신 완료다. 웹/registry는 루트 별도다.

### M11.04 1차 검수·표기 보완 재검수 — 콘텐츠 통과

- 국소/공유·ReLU는 실습1/Q1, attention·위치/mask는 실습2/Q2, 표현/head·전이는 실습3/Q3에 대응한다. 기술 내용은 최초 검토에서 일치했고, 실습 해설의 문장 사이 공백 ‘다.0 query’를 보완 요청했다. 수정본 ‘다. 0 query’를 확인하고 자습 표현을 재판정했다. 내용/수치/목표 변경은 없다.
- 원고 코드 추출 후 Darwin/Python3.13.4/torch2.13 CPU 실행에서 conv[−1,2,−1]/ReLU[0,2,0], attention[.669762,.330238]/mixed[1.339523,1.320954]가 일치했다. 별도 exp 산술로 α1=.6697615493, 출력1.3395230987/1.3209538027, zero query의[1,2], Q1[1,0]도 확인했다. 공유 가중치2 대 dense12는 명시한 bias 없는 구조에 맞다. 수식1개는 실제 remark block/KaTeX를 통과했다.
- [공식 Conv2d](https://docs.pytorch.org/docs/2.15/generated/torch.nn.modules.conv.Conv2d.html), [Vaswani 원논문3.2/3.5](https://arxiv.org/html/1706.03762v7), [공식 전이학습](https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html)을 직접 대조했다. cross-correlation/stride, sqrt(dk)·softmax·value 가중합, positional 정보와 causal mask, freeze/미세조정 및 평가 상태의 구분이 맞다. attention을 원인/정답 확률이나 전체 Transformer로 오해하지 않도록 경계를 명시한다.
- 보완 후 내용7항목 모두2점. 최종 승인 SHA256: `f15b38daba3f46aeb646c3187822508e0014fd1d0498957b89879e9740e15160`. 임시 승인 큐는 이 교정본만 포함한다. 실제 학습/GPU 실행은 없으며 웹/registry는 루트 별도다.

### M11.05 1차 독립 검수 — 콘텐츠 통과

- 출력 계약은 실습1/Q1, confusion/IoU/회귀는 실습2/Q2, threshold/오류 비용·작업 기준은 실습3/Q3에 대응한다. 초출 용어·단위·전 섹션의 자연어와 부분 답/오개념을 재독했다. score와 확률·score threshold와 IoU threshold·AP/F1/한 상자 IoU를 구별한다.
- 독립 산술에서 t.5의count1/1/1/1와P/R/F1=.5, t.3의2/1/0/1와2/3·1·.8, t.8의1/0/1/2와1·.5·2/3이 맞다. FP+4FN 비용5/1/4, 상자16+16−8=24와마스크 교/합1/3, MAE.133333m/RMSE.163299m, Q2비율2/3/IoU.6/MAE.1m/RMSE.141421m가 일치한다. 수식1개는 remark block/KaTeX 검사를 통과했다.
- [scikit 평가](https://scikit-learn.org/stable/modules/model_evaluation.html), [Ultralytics task](https://docs.ultralytics.com/tasks/), [COCO evaluator 원문](https://raw.githubusercontent.com/cocodataset/cocoapi/master/PythonAPI/pycocotools/cocoeval.py)을 직접 대조했다. 출력 분류·semantic/instance 차이와 COCO IoU/크기/maxDets 조건, 분모/미정의 표시 정책이 적절하다. 실제 모델 평가/AP 측정이 아니라 합성 계산이다. 선택 위젯의 별도8행과 본문4행을 명확히 나눈다.
- 내용7항목 모두2점. 승인 SHA256: `8566ee1c1cd478f2fafa25554339d5e673ffebd023aec2fe3e1144f6dff2271e`. 임시 승인 큐 추가 완료, 웹/registry는 루트 별도다.

### M11.04 기존 교재 연결 재정정 — 콘텐츠 재통과

작성자가 후속 heading 대조에서 기존 ‘5.3 VLA 구조/chapter7’가 실제 ‘5.3 LeRobotDataset v3’로 가는 의미 오류를 발견했다. 최초 독립검수에서 이 연결 의미를 놓쳤다. 원본의 실제5.6 SmolVLA 구조/chapter10을 읽고 본문·참고 링크의 교정과 내용 연결을 확인했다. 기술/수치/목표는 불변이며 내용7항목을 다시2점으로 판정한다. 새 최종 승인 SHA256: `feff450ee3a3d0593139399939500f0114db2e69dcf456820dfae71afcd92068`. 앞 f15b38… 승인을 대체하고 임시 승인 큐도 교체했다.

같은 방식으로 현재 M10 여섯/M11.01~05의 기존 교재 링크를 실제 원본 H2와 전수 대조했다. M10 여섯/.01/.03은 제목·의미가 맞고, .05는 실제5.8.4에 offline loss/replay와 closed-loop task success가 있어 설명과 대응한다. .02는 목적지5.5의 state/action 정규화·행동 표현·통계 manifest 내용과 연결되나 ‘데이터 스키마’ 제목은 부정확해 명료화를 요청했다. 이후 신규 원고에서도 기존 URL 도달 여부와 목적지 의미를 함께 확인한다.

### M11.02 기존 교재 라벨 명료화 — 콘텐츠 재통과

목적지5.5는 실제 정규화·action representation·state/action 통계 혼동·checkpoint/run manifest를 다뤄 본문 연결 의미가 맞다. 다만 참고 라벨 ‘데이터 스키마와 정규화’를 정확한 제목 ‘정규화와 통계’로, 본문 라벨을 ‘정규화·행동 표현’으로 명료화하도록 요청했고 수정본을 확인했다. 코드/수치/목표는 불변이며 내용7항목2점을 유지한다. 새 최종 승인 SHA256: `2c150cdec8842f6078f28e82795efc6a4c54ab07a049a06134edfda1d17b36f2`. 앞1fb51…을 대체하며 임시 승인 큐도 교체했다.

### M11.06 1차 검수·표기 보완 재검수 — 콘텐츠 통과

- 전체/꼬리 지연은 실습1/Q1, 메모리 범위는 실습2/Q2, 혼합 분포/추적은 실습3/Q3에 대응한다. 문장 사이 ‘42다.20 ms’의 공백을 요청해 수정본을 확인했다. 초출 정의·단위·전 섹션의 자연어와 부분 답/오개념을 재독했다.
- 독립 계산: 추론8/전체25/기한초과5ms, 지연 평균16/중앙10/최대42/명시 nearest-rank p95=42/초과1/5가 맞다. float32 가중치8MB/명시 네 배열32MB와 Q2 4/16MB, 성공률110/140=.785714와 조건 혼합.58/Q3 .7이 일치한다. peak/MB-MiB·장치 실측/합성 수치와 조건률 유지 가정을 구분한다.
- [PyTorch benchmark](https://docs.pytorch.org/tutorials/recipes/recipes/benchmark.html), [CUDA allocator](https://docs.pytorch.org/docs/2.15/notes/cuda.html#cuda-memory-management), [Adam](https://docs.pytorch.org/docs/2.15/generated/torch.optim.Adam.html), [재현성](https://docs.pytorch.org/docs/2.15/notes/randomness.html)을 직접 확인했다. 비동기 완료·warm-up/thread·allocated/reserved·moment 배열과 추가 구현 비용·플랫폼 간 재현 한계를 올바르게 제한한다. 실제 CPU/GPU benchmark나 성공률 측정은 하지 않았다. 기존5.9/chapter13와5.10/chapter14의 실제 제목·의미도 대조했다.
- 보완 후 내용7항목 모두2점. 최종 승인 SHA256: `0b17dfd0391a62a6bb4e4755dd129b2f9bec937313e245b0d8464506a3cf723a`. 임시 승인 큐 추가 및 M11 현재6원고 SHA 전수 일치를 확인했다. M11 콘텐츠6개 통과이며 실제 웹/registry·모듈 연결은 루트 별도다.

### M12.01 1차 자립성 보완·재검수 — 콘텐츠 통과

- 영상 계약은 실습1/Q1, 필터/차분·과제별 정보 손실은 실습2/Q2, 특징 대응/기하 한계는 실습3/Q3에 대응한다. 최초 본문에서 descriptor 정의 없이 Q3의 거리 판단을 요구하는 자립성 공백을 발견해 보완 요청했다. 주변 모양을 벡터/이진부호 등으로 요약한 표현과 정한 거리 규칙의 비유사도·같은 물리점 미보장을 추가한 원고를 재독했다. 최초 자립성1점을 보완 후2점으로 재판정했다.
- 원고 코드 추출 후 Darwin/Python3.13.4/NumPy2.4.4 CPU 재실행에서 평균[30,30,30]/median[0,0,0]/차분[0,90,−90,0]/uint8합4/넓은합260이 일치했다. 회색 부동합76.245/29.07, 계단 평균30/60/90·median0/90/90, Q2평균20/median0도 독립 계산했다. 대칭 평균 kernel의 valid 경로이며 OpenCV 경계/정수 반올림 실측으로 확대하지 않는다.
- OpenCV4.x가 연결한 공식4.13 [색공간](https://docs.opencv.org/4.13.0/df/d9d/tutorial_py_colorspaces.html), [회색 계수](https://docs.opencv.org/4.13.0/de/d25/imgproc_color_conversions.html), [필터](https://docs.opencv.org/4.13.0/d4/d13/tutorial_py_filtering.html), [산술](https://docs.opencv.org/4.13.0/d0/d86/tutorial_py_image_arithmetics.html), [Harris](https://docs.opencv.org/4.13.0/dc/d0d/tutorial_py_features_harris.html), [matcher](https://docs.opencv.org/4.13.0/dc/dc3/tutorial_py_matcher.html)를 직접 대조했다. HWC/픽셀 인덱스·HSV8bit범위·포화/랩어라운드·특징/물리 출력의 구분이 맞다. 기존4.1/chapter5의 실제 제목/영상 좌표 내용과도 연결된다.
- 보완 후 내용7항목 모두2점. 승인 SHA256: `6fac537cbebabb1818ea707b8b49729377d0fcb7dfb32710ea121b89c5df99d6`. 실제 cv2/카메라 실행은 없고 NumPy 개념 대체만 수행했다. 임시 승인 큐 추가 완료, 웹/registry는 루트 별도다.

### M12.02 1차 독립 검수 — 콘텐츠 통과

- optical/K 투영은 실습1/Q1, radial/resize/crop은 실습2/Q2, 역투영·Z/range/광선은 실습3/Q3에 대응한다. 전체 용어/가정·자연어·부분 답과 오개념을 재독했다. 실제 resizer의 반픽셀 규약을 교육용 u'=su와 구분하고 좌표 변환 순서를 명시한다.
- 독립 산술로 기본360/260, 가까운Z.5의400/280, 전체2배의360/260, radial u400.32, half180/130·f200·주점160/120, crop260/210·주점220/190, staleK x−.35가 맞다. 역투영 .1/.05/1과 .2/.1/2, range1.00623059/2.01246118, 양의 λ 광선의 깊이 모호성도 일치한다. 수식2개는 실제 remark block/KaTeX 검사를 통과했다.
- [OpenCV4.13 calib3d](https://docs.opencv.org/4.13.0/d9/d0c/group__calib3d.html), [Jazzy CameraInfo](https://raw.githubusercontent.com/ros2/common_interfaces/jazzy/sensor_msgs/msg/CameraInfo.msg)를 대조했다. 정규화 좌표에서 왜곡 후 K, 원본/undistorted/rectified 모형, Z와range·유효값/프레임/시각 구분이 적절하다. 기존4.1/chapter5 핀홀 내용과 선택 투영 모형의 제한된 범위가 맞다.
- 내용7항목 모두2점. 승인 SHA256: `8f605d0865dd2f215fda96a48be34deb638a4d423f9606dae81e4294e8e44824`. 실제 보정/센서/OpenCV 실행은 없고 기본 계산만 수행했다. 임시 승인 큐 추가 완료, 웹/registry는 루트 별도다.

### M12.03 1차 실습 입력 보완·재검수 — 콘텐츠 통과

- 라벨 정책/xywh는 실습1/Q1, 변환/누락·중복은 실습2/Q2, 학습 명세/증거는 실습3/Q3에 대응한다. 최초 실습2가 split 결함 진단을 요구하지만 실제 배정 입력이 없어서 실습 구성1점으로 판정하고 보완 요청했다. 원본A=train/A회전증강본=validation 입력과 동일 원본 그룹 중복을 지적하는 해설을 확인해 재판정했다. 전 섹션의 자연어·용어·부분 답/오개념도 재독했다.
- 독립 산술로 원본 xywh=.5/.5/.2/.4, letterbox 모서리256/256/384/384와 .5/.5/.2/.2, Q1 .375/.5/.25/.5, 잘못된 높이256 대128px, 오른쪽1.1 및 class2 범위 위반을 확인했다. 보이는 범위 라벨 정책과 실제 라이브러리의 auto-pad/stride/반올림·이중 변환은 구분한다.
- [Ultralytics detect 포맷](https://docs.ultralytics.com/datasets/detect/), [YOLO11 API](https://docs.ultralytics.com/models/yolo11/), [train](https://docs.ultralytics.com/modes/train/), [공식 LICENSE](https://raw.githubusercontent.com/ultralytics/ultralytics/main/LICENSE), [공급자 안내](https://www.ultralytics.com/license)를 직접 확인했다. 정규화 분모/클래스0시작, .yaml/.pt·train 인터페이스 설명과 코드/가중치/자료 조건의 별도 기록이 적절하다. 모든 제품의 권한이나 배포 요건을 단정하지 않는다. 기존5.8/chapter12 실제 학습 파이프라인의 의미와도 연결된다.
- 보완 후 내용7항목 모두2점. 승인 SHA256: `ad5e3160942598067d6a2fd7c44a02e45ca743d43ad7e9e01a3e88c94acac10b`. 실제 ultralytics 설치/다운로드/학습·탐지는 없으며 임시 승인 큐 추가 완료다. 웹/registry는 루트 별도다.

### M12.04 1차 독립 검수 — 콘텐츠 통과

- semantic/instance·차선/ID는 실습1/Q1, ignore/변환·픽셀지표는 실습2/Q2, road/통과·가림 근거는 실습3/Q3에 대응한다. 코드표·ID/색·정답ignore와 예측unknown의 구분·자연어·부분 답/오개념을 재독했다.
- 유효 인덱스 집합으로 독립 계산해 정확도3/5=.6, road 교2/합4=.5, obstacle 교1/합3=1/3, mIoU5/12를 확인했다. Q2 유효3 중2정답·두IoU .5/평균.5도 맞다. 없는 클래스/분모0·무시 라벨/집계 조건, 범주 ID와 연속 score 보간을 구분한다.
- [Cityscapes overview](https://www.cityscapes-dataset.com/dataset-overview/), [공식 labels.py](https://raw.githubusercontent.com/mcordts/cityscapesScripts/master/cityscapesscripts/helpers/labels.py), [torchvision DeepLab](https://docs.pytorch.org/vision/stable/models/generated/torchvision.models.segmentation.deeplabv3_resnet50.html), [OpenCV 보간](https://docs.opencv.org/4.13.0/da/d54/group__imgproc__transform.html)을 직접 대조했다. id/trainId/색/hasInstances/ignore 정책과 자체0/1/255 코드를 구별한다. 원래 주석/평가 정책을 모든 데이터셋으로 확대하지 않으며 영상road 예측을 실제 빈 공간/주행 허가로 읽지 않는다. 기존4.6/chapter10 장면 랜덤화 연결 의미도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `5dc99984d34fa871f9a340f9949966536627fb9da7094bf4b2f93ee95e39fd5f`. 실제 분할모델/도로 주행 실행은 없으며 임시 승인 큐 추가 완료다. 웹/registry는 루트 별도다.

### M12.05 1차 검수·표현 보완 재검수 — 콘텐츠 통과

- 시간/관측/ID는 실습1/Q1, 비용/게이트·모호성은 실습2/Q2, 수명/프로젝트 평가 근거는 실습3/Q3에 대응한다. 실습2의 비문 ‘최가까움’을 자연스러운 비교 절차로 풀도록 요청했고 수정 문장을 확인했다. 전 섹션 용어/기호/자연어와 부분 답/오개념을 재독했다.
- 독립 계산: A18/B12 예측 비용표[6,0]/[0,6]에서 일치배정0/반대12, t2.25의A19/t2.75의A21과 나이.75>.5수명, Q1 22px가 맞다. Q2 직접2/교차18·gate2, 두예측15일 때 비용4의 동률/모두gate탈락도 일치한다. 가상 참값과 합성 등속모형을 실제 영상/3차원 추정으로 읽지 않는다.
- [Ultralytics Track](https://docs.ultralytics.com/modes/track/), [ByteTrack 저자 자료](https://github.com/FoundationVision/ByteTrack), [SORT 저자 초록](https://arxiv.org/abs/1602.00763)을 직접 대조했다. persist의 동일 연속 스트림 상태 유지, frame 수 buffer와 시간 환산, 낮은점수 후보와 tracklet 일관성 활용·검출 품질의 역할 설명이 적절하다. 현재 기본 tracker를 과거 버전 전체에 확대하지 않는다. 기존4.7/chapter11 Rerun 기반 무결성 검사 연결 의미도 맞다.
- 보완 후 내용7항목 모두2점. 승인 SHA256: `d551257307594161bcbc5d20669c4e87779ef1d936a3820a3db70d65ae4ed5c5`. 실제 tracker/영상 실행은 없으며 임시 승인 큐 추가 완료다. 웹/registry는 루트 별도다.

### M12.06 1차 검수·표현 보완 재검수 — 콘텐츠 통과

- 매칭/중복 지표는 실습1/Q1, score/IoU·AP/시험은 실습2/Q2, 작업 조건/증거는 실습3/Q3에 대응한다. 문장 속 한글과 TP/FP/FN/TN 기호의 붙임을 보완 요청했고 띄어쓰기 교정본을 확인했다. 기본 컵 사례만으로 목표를 모두 평가하며 얼굴 비교는 선택이다.
- 독립 구현한 단순 score순 일대일 배정에서 (TP,FP,FN)은(.5,.5)의(2,1,0),(.85,.5)의(1,0,1),(.5,.9)의(1,2,1)로 일치했다. 각각P/R=2/3·1,1·.5,1/3·.5다. 연속 상자IoU9/11, 중복Q1의1/1/0·P.5/R1과 작업6/10=12/20=.6도 맞다. 이 계산을 COCO 전체 evaluator 실행으로 표현하지 않는다.
- [COCO 공식 원문](https://raw.githubusercontent.com/cocodataset/cocoapi/master/PythonAPI/pycocotools/cocoeval.py)의 score정렬·비crowd 중복·IoU매칭과 집계 조건, 기존 scikit 지표를 대조했다. [NIST FRTE1:1](https://pages.nist.gov/frvt/html/frvt11.html)은 web timeout 후 공식 HTML을 curl로 받아 관련 본문을 직접 확인했다. FMR은 impostor/FNMR은 mated 비교의 threshold 오류율로 검출 상자 분모와 다르다. 실제 사람 식별/영상/로봇 실행은 없다.
- 보완 후 내용7항목 모두2점. 승인 SHA256: `60098e75cc6900f1814b1dada1b45fccd295404330bc91691c358421a333e125`. 임시 승인 큐 추가와 M12 여섯 현재원고 SHA 전수 일치를 확인했다. 기존 링크의 실제 H2/의미도 여섯 단위에서 대조 완료다. 실제 웹/registry·모듈 연결은 루트 별도다.

### M14.01 1차 독립 검수 — 콘텐츠 통과

- 내부/외부·축 계약은 실습1/Q1, R/t 방향/역·알려진R의이동은 실습2/Q2, 재투영/metric·자료 범위는 실습3/Q3에 대응한다. 초출 정의·선수·전 섹션 자연어와 부분 답/오개념을 재독했다. M13/KF를 필요 없이 끌어오지 않으며 알려진회전/3차원 대응 한점의 특수 계산을 전체 보정 추정으로 확대하지 않는다.
- 독립 행렬 계산으로 pB(.95,2.1,1), 역 pC(.1,.05,1), 역이동(−2,1,0), Q2 pB(1,2.2,1)와역복원을 확인했다. 기본투영360/260·관측−예측 잔차(1,−2)·norm√5=2.23606798px, 칸 단위/실제.02m 스케일의 투영 모호성이 맞다. 수식2개는 실제 remark block/KaTeX 검사를 통과했다.
- [OpenCV PnP](https://docs.opencv.org/4.13.0/d5/d1f/calib3d_solvePnP.html), [보정](https://docs.opencv.org/4.13.0/dc/dbb/tutorial_py_calibration.html), [REP103 공식 raw](https://raw.githubusercontent.com/ros-infrastructure/rep/master/rep-0103.rst)를 직접 대조했다. object/world→camera의rvec/tvec, 광학/몸체 축·SI·예외 기록, 다양한 대응/독립검사·방법별 조건의 구분이 적절하다. 기존4.2/chapter6 좌표 변환의 의미와도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `4921462a74f0e2f5a62fb585f93c229a2b4d877b943d7596466101203c96c674`. 실제 카메라/solvePnP/보정 실행은 없고 임시 승인 큐 추가 완료다. M14 전체 완료를 뜻하지 않으며 웹/registry는 루트 별도다.

### M14.03 1차 정확성/표현 보완·재검수 — 콘텐츠 통과

- 시계/취득·수신은 실습1/Q1, 보간/현재 가용성과 각도 경계는 실습2/Q2, 큐/선택·공간 예산은 실습3/Q3에 대응한다. 최초 ‘stamp가 같은 물리 사건을 나타낸다’가 실제 동시취득처럼 읽히는 조건과 headerless의 기본 동작이 모호한 문장을 지적했다. 각 관측의 공통 시간 기준 취득 시점이라는 전제와 allow_headerless 기본False/명시True 선택을 확인해 정확성/자립성을 재판정했다.
- 독립 산술: a1.001/b2/c12.01→t10, offset-only오차10ms, α.4/q.28rad, 현재1.045부터1.10까지55ms, 위치4mm/투영1.6px/1px예산12.5ms가 맞다. Q1의a1.001/b1/t20, Q2 .05m, Q3 .01m/4px도 일치한다. 179→181의 중간180과 같은시계/고정Z/상대속도 가정·외삽/보간을 구별한다. 수식1개는 remark block/KaTeX 통과다.
- 이미 읽은 [Jazzy Python 구현](https://raw.githubusercontent.com/ros2/message_filters/jazzy/src/message_filters/__init__.py)의 기본 headerlessFalse·입력별queue·최종 max−min<slop·소비 후break를 다시 대조했다. A1/B1.02가 먼저 소비되면 뒤의B.99로 전역 재매칭하지 않는 사례와 맞다. [공식tf2 개념](https://raw.githubusercontent.com/ros2/ros2_documentation/jazzy/source/Concepts/Intermediate/About-Tf2.rst)의 시간있는 프레임과 기존4.4/chapter8 시간 정합 연결도 적절하다.
- 보완 후 내용7항목 모두2점. 승인 SHA256: `d348f166c58e8d0c7705177c3b5f4ec9a688a8fb0b62dcb98edd40dd86f10940`. 실제 ROS/센서 동기화 실행은 없고 임시 승인 큐 추가 완료다. M14 전체 완료가 아니며 웹/registry는 루트 별도다.

### M14.06 1차 독립 검수 — 콘텐츠 통과

- TF/취득시각·잔차 집계는 실습1/Q1, 시간 편향/부호는 실습2/Q2, 부분 분산/기록은 실습3/Q3에 대응한다. 정의·기호·단위·선수와 전 섹션 자연어/부분 답/오개념을 재독했다. 실제 센서/KF를 요구하지 않으며 고정 f/c/TF·같은시계·고정Z/상대vx의 부분 예산을 전체 정확도로 확대하지 않는다.
- 독립 산술: 잔차(−1,2)/(3,−4)의 제곱합30→점당3.87298335/성분2.73861279px, Q1합25→3.53553391/2.5px다. +50ms는+10mm/+4px·관측−예측−4px, Q2−20ms는−4mm/−1.6px·잔차+1.6px로 맞다. J_u=.0025m/px/J_Z=.1에서 부분분산.00001025m²→3.201562mm, 독립시간항 추가.00001425→3.774917mm, Q3σu2는.000029→5.385165mm다. 수식2개는 실제 remark block/KaTeX를 통과했다.
- [NIST 불확실성 전파](https://physics.nist.gov/cuu/Uncertainty/combination.html)를 직접 확인했다. 기준점 민감도·1차 Taylor 근사·공분산·표준편차와 보장범위 구별, 알려진 편향과 남은 변동·미상 항목의 분리가 적절하다. 앞서 직접 읽은 공식 Jazzy tf2/PnP의 방향·취득 시각 계약과 기존4.3/chapter7·4.4/chapter8 실제 의미에도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `957ff8b7946845f800ef9112a4b3998bb142f24c38666c1f1b35861dc948de70`. 실제 센서/필터/보정 실행은 없고 임시 승인 큐 추가 완료다.

## 5. E3 콘텐츠 최종 판정

M10·M11·M12 각6개와 M14.01/.03/.06 총21개는 내용7항목을 모두2점으로 통과했다. 발견한 용어/실습 입력·문장 조건·표현·기존 연결 결함은 위에 최초 판단과 보완/재검수 근거를 남겼다. 최종21개 승인 지문을 `/tmp/e3-approved-content.json` 및 현재 source와 전수 비교해 모두 일치함을 확인했다. 이 결론은 실제 웹 전달/통합·registry 공개·전체 모듈 완료 판정과 별개이며 해당 판정은 루트 검수를 따른다.

M14.02/.04/.05의 신규 원고는 현재 생성되지 않았고 승인 큐에도 없다. 이 세 단위는 E6로 유보하며 M14 전체가 완성됐다고 표시하지 않는다. GPU/Isaac/ROS·실물/실제 모델 학습 성과를 확인했다고 주장하지 않았고 PDF/EPUB 생성 명령도 수행하지 않았다.

| 단위 | 내용7항목 | 최종 승인 SHA256 |
|---|---|---|
| M10.01 | 모두2점 | `47303f5c58c587c3fb67899decdf7fa673119f2ebbac9cbbd94a70a004a7396b` |
| M10.02 | 모두2점 | `f8ff08536d3c61d68dd2a1176c9972871fadf35164e420b9e3fa183c18e474d3` |
| M10.03 | 모두2점 | `6ae2b4125bb54f4a522de1ccbbc34338de2ac33c1dcf43d50067c2d55c5ff50b` |
| M10.04 | 모두2점 | `3752704ee4ef1d0935b56cdf4948c5e0d5459b3c15e734ffde9fdb6134d03eda` |
| M10.05 | 모두2점 | `0218809e3f6f860bd7426cc42e2c0dd9c0b4d34a71ccfdd17647a92a575f30d5` |
| M10.06 | 모두2점 | `1b975c6d4181ae73db0a2840c42eb1030b1b6788e87ee73d7c22f562d8a9eede` |
| M11.01 | 모두2점 | `19ccfe618ebc721691b08c4e1e7dc99812b4468c575804c95b1b086a4a815770` |
| M11.02 | 모두2점 | `2c150cdec8842f6078f28e82795efc6a4c54ab07a049a06134edfda1d17b36f2` |
| M11.03 | 모두2점 | `d75a56d58171756f2440bb331781acdbe7edd1d8b3d240a0dcae0fda0af7feea` |
| M11.04 | 모두2점 | `feff450ee3a3d0593139399939500f0114db2e69dcf456820dfae71afcd92068` |
| M11.05 | 모두2점 | `8566ee1c1cd478f2fafa25554339d5e673ffebd023aec2fe3e1144f6dff2271e` |
| M11.06 | 모두2점 | `0b17dfd0391a62a6bb4e4755dd129b2f9bec937313e245b0d8464506a3cf723a` |
| M12.01 | 모두2점 | `6fac537cbebabb1818ea707b8b49729377d0fcb7dfb32710ea121b89c5df99d6` |
| M12.02 | 모두2점 | `8f605d0865dd2f215fda96a48be34deb638a4d423f9606dae81e4294e8e44824` |
| M12.03 | 모두2점 | `ad5e3160942598067d6a2fd7c44a02e45ca743d43ad7e9e01a3e88c94acac10b` |
| M12.04 | 모두2점 | `5dc99984d34fa871f9a340f9949966536627fb9da7094bf4b2f93ee95e39fd5f` |
| M12.05 | 모두2점 | `d551257307594161bcbc5d20669c4e87779ef1d936a3820a3db70d65ae4ed5c5` |
| M12.06 | 모두2점 | `60098e75cc6900f1814b1dada1b45fccd295404330bc91691c358421a333e125` |
| M14.01 | 모두2점 | `4921462a74f0e2f5a62fb585f93c229a2b4d877b943d7596466101203c96c674` |
| M14.03 | 모두2점 | `d348f166c58e8d0c7705177c3b5f4ec9a688a8fb0b62dcb98edd40dd86f10940` |
| M14.06 | 모두2점 | `957ff8b7946845f800ef9112a4b3998bb142f24c38666c1f1b35861dc948de70` |
