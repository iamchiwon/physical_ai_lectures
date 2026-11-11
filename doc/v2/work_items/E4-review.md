# E4 독립 콘텐츠 검수 기록

- 시작일: 2026-11-03 / 상태: 42개 콘텐츠 통과·웹 최종 별도
- 범위: M19·M20·M21·M22·M27·M30·M32 각 6개, 총 42개 단위.
- 근거: [품질 기준](../quality_gate.md), [통합 커리큘럼](../../integrated_curriculum.md), [E3 검수 기록](E3-review.md).
- 책임: 이 기록과 임시 독립 승인 큐는 검수자 소유다. 신규 원고 수정은 작성자에게 요청한다. 기존 교재 수정·registry·runtime·실제 브라우저/통합·최종 공개는 루트 소유다. 다른 작업자의 편집을 되돌리지 않는다.
- 금지 범위: PDF/EPUB/Pandoc/exporter/배포 명령을 실행하지 않는다. 저장소에 교재용 검증 스크립트를 새로 만들지 않는다. 실제 장비 명령/설치·모델 다운로드·외부 서비스 호출을 기본 실습으로 요구하지 않는다.

## 1. 선수와 학습 경계

M19는 E2 기구학/제어/모델과 E3 영상·보정 기초를 연결한다. M17의 계획이나 M18의 주행이 아직 집필되지 않았으므로 필요한 상태/경로/궤적/충돌/실행 용어와 기본 판단은 해당 본문에서 보충한다. M20은 E2 ROS·프레임과 E3 시뮬레이션·시간 기초를 데이터 계약으로 옮긴다. M21은 M11 손실/텐서/평가 위에 M19·M20의 과제/시연 계약을 사용한다. M22는 이 흐름 위에서 언어/영상 모델의 후보와 실제 실행 책임을 나눈다. M27은 모델/정책의 처리 비용·지연·상태를, M30은 Sim2Real 검증·감독·정량 평가를 다룬다. M32는 선택 과제의 장비 없는 완결 경로를 제공하며 미집필 강화학습/보행/임베디드·주행 모듈 이수를 가정하지 않는다.

장비 없는 합성 로그·계산·문서/작은 CPU 코드가 기본이다. 실제 CPU 실행·모의 계산·문서 대조·예상 결과를 구분한다. CUDA/GPU/Isaac/MuJoCo/ROS·학습/추론·실물 작업을 하지 않았으면 했다고 쓰지 않는다. Ubuntu24.04/ROS2 Jazzy 및 각 실제 실행/문서 버전·API/자료 개정을 구별한다. 수식/정책 손실·인지 지표가 과제 성공이나 물리 안전 인증의 증거가 아니며 LLM 출력/Action 수락/취소 응답과 실행 완료/물리 정지를 구분한다.

## 2. 공통 사전 판정 기준

내용 7항목은 0=미충족, 1=보완 필요, 2=충족이며 합계가 아닌 전 항목 2점일 때만 콘텐츠 통과다. 실제 웹 전달이라는 여덟째 기준과 최종 공개는 루트 별도 검수다.

| 내용 항목 | 독립 검수의 2점 기준 |
|---|---|
| 목표·선수 지식 | 행동 목표3개가 확인 가능하고 선행/보충 경로가 유효하다. 미집필 선수의 필수 개념은 본문에서 설명한다. |
| 설명의 자립성 | 초출 용어/기호·축·단위·시점·조건을 정의하고 왜→계산/절차→한계가 이어진다. |
| 정확성·일관성 | 모든 수치/부호/shape·코드/서술/정답과 확인 범위가 일치하며 기술 불확실성은 공식/저자 1차 자료로 검증한다. |
| 예제·전이 | 단계별 정상 예제와 조건 변경/오류·경계/실패 사례로 개념의 적용 범위를 확인한다. |
| 실습 구성 | 장비 없는 입력·절차·관찰·해석·실패 안내와 해설이 이어지며 실제 진단에 필요한 입력이 빠지지 않는다. |
| 평가·해설 | Q1~3와 개별 풀이가 목표를 실제로 평가하며 이유/가정·대표 오답과 부분 답안 피드백이 있다. |
| 자습 흐름·표현 | 전 섹션에 자연스러운 한국어 띄어쓰기·영문/기호 경계와 일관 용어를 사용하고 초심자가 자립해 따라간다. |

작성자 고정 알림 뒤 전체 원고를 독해하고 독립 산술/안전한 CPU 코드로 확인한다. 긴 수식은 KaTeX 자체 검사와 실제 remark-math block/inline 판정을 구분한다. 기존 교재 링크는 도달 경로뿐 아니라 원본의 실제 heading과 내용 의미를 함께 확인한다. 웹 source만 읽고 실제 브라우저 검수를 했다고 기록하지 않는다. 출처 접근 실패/공식 raw 대체와 검증한 범위를 명시한다. 승인 원고는 새 근거 없이 수정하지 않는다.

## 3. 단위별 사전 집중 기준

| 단위 | 주제 | 집중 검수 |
|---|---|---|
| M19.01 | 그리퍼·Tool Frame·작업 좌표·핸드아이 보정 | TCP/플랜지/작업 프레임 방향·기준점, eye-in-hand/eye-to-hand와 AX=XB의 정의·관측 조건 |
| M19.02 | MoveIt 2 Planning Scene·IK·충돌·궤적 실행 | scene 상태/장애물·IK/계획/시간화/실행 단계, 충돌 검사 범위·상태 신선도와 실행 증거 |
| M19.03 | 티칭·웨이포인트·속도·접근/후퇴·안전 구역 | 관절/Cartesian waypoint·경로/속도/가속/정지거리·기하 구역과 인증 안전의 구별 |
| M19.04 | CoppeliaSim 사례와 시뮬레이터 비교 | 선택 모형/단위·주기/동역학/센서·API/버전, 문서/합성 비교와 실제 실행의 구별 |
| M19.05 | 비전 Pick-and-Place·Piece Picking·Depalletizing | 2D→3D/보정/시간·파지/접촉/부착·작업 순서와 가림/실패/분모 |
| M19.06 | 델타·협동 팔·모바일 매니퓰레이터 응용 | 기구/작업공간/구속·베이스/팔 협응·협동과 안전 승인 범위 |
| M20.01 | SO-101·Leader-Follower·영점·스케일·클러치 | 영점/부호/단위·클러치 재연결 연속성·포화/속도/나이 계약 |
| M20.02 | MuJoCo 설치·모델·환경 및 재생 입문 | 설치 선택/실제 환경·MJCF/URDF·상태·물리 stepping/제어/재생의 다른 의미 |
| M20.03 | 관측·행동·지시문·에피소드와 LeRobot Dataset | 시점별 관측/명령/적용상태·episode 종료·스키마/shape/단위/버전 |
| M20.04 | rosbag2/MCAP·변환·압축·스키마·버전 | 원본 로그/변환 자료·timestamp/메타데이터/압축·손실/스키마 호환 |
| M20.05 | Rerun·Replayer·누락·단위·범위·정합 검사 | 타임라인/축/단위·결측/역행/재생·시각화와 원본/실제 성능의 구별 |
| M20.06 | 실패 데이터·데이터 분할·Domain Randomization | 실패/개입 라벨·원본 그룹/시간 분리·증강과 실제 분포·평가 누수 |
| M21.01 | Behavior Cloning·분포 이동·시연 품질 | 감독 목표/손실·L1/L2·시연 선택·covariate shift와 closed-loop 과제 성공 |
| M21.02 | 관측 구성·행동 공간·정규화·시퀀스 | absolute/delta/속도·chunk 시각/배열·단위/역정규화·미래 입력 누수 |
| M21.03 | ACT·Action Chunking·Temporal Ensembling | 원논문의 chunk/CVAE·시점 정렬/가중치 방향·기한/후처리·다봉 행동 평균 한계 |
| M21.04 | Diffusion Policy와 Motion Manifold 접근 | 학습/noise/denoising·조건/행동 표현·반복 추론/제약·다양한 접근의 출처 범위 |
| M21.05 | Mobile ALOHA·양팔·이동 조작의 협응 | 베이스/양팔 공동 행동·프레임/접촉/시간·저자 성과와 합성 활동 구별 |
| M21.06 | 학습·롤아웃·미관측 상황·데이터 재수집 루프 | split/정책 선택·독립 rollout/trial·복구/개입과 실패 기반 재수집 |
| M22.01 | LLM 계획·VLM 인지·VLA 행동 정책 구분 | 입출력/시간/단위·grounding·텍스트/인지/실행 피드백 증거 |
| M22.02 | Prompt·구조화 출력·Tool/ROS Action 연결 | schema/허용 도구·서버/goal/feedback/result·중복/timeout/취소·권한 검증 |
| M22.03 | Ollama·로컬 모델·파인튜닝과 엣지 제약 | 모델/API/가중치/양자화·메모리/지연·추론/학습 구분·실제 호출/비용 범위 |
| M22.04 | OpenVLA·SmolVLA·멀티모달 관측·행동 토큰 | 저자 모델별 구조/손실/출력 차이·정규화·embodiment·보고 성과 범위 |
| M22.05 | 지도 장소 의미화·언어 지시 주행·로봇팔 | 의미 이름/지도 프레임/경로/물체·미집필 주행 선수 보충·모호한 지시와 상태 |
| M22.06 | 권한·검증·확인·중단을 거치는 실행 감독 | 권한 범위/사전조건·실행 확인/완료/중단·재시도/감사·물리 정지 구별 |
| M27.01 | Raspberry Pi·엣지 컴퓨팅·메모리·전력 제약 | 실제 기종/OS/가속기·저장/peak/전력·열/성능 주장과 합성 예산 |
| M27.02 | 모델 크기·정밀도·양자화·추론 배치의 비교 | 원소 수/dtype·quant scale/zero/clipping·메모리 추가 항목·속도/정확도 tradeoff |
| M27.03 | 카메라 전처리·모델·통신·제어 지연 분해 | 측정 구간/시계·대기/복사/비동기·병렬 경로와 end-to-end 합산 |
| M27.04 | 정책 주기·큐·프레임 누락·백프레셔 | 도착/소비율·관측 나이·drop/latest/backpressure·absolute/delta 차이 |
| M27.05 | 원격/로컬 추론·모델 버전·교체·롤백 | 네트워크/timeout·체크포인트/전처리 호환·상태/큐·전환/rollback 원자성 |
| M27.06 | 성능 측정과 정확도/성공률의 공동 평가 | warmup/thread/동기화·꼬리/peak·독립 조건별 평가와 분모/동시 변경 |
| M30.01 | Reality Gap·백래시·마찰·지연·센서 오차 진단 | 기구/관측/구동/시간 오차 가설·단위·별도 원인 증거와 비교 조건 |
| M30.02 | Domain Randomization·System Identification·수집 재설계 | 식별/랜덤화 변수/범위·데이터 분리·모델 적합과 실물 일반화 한계 |
| M30.03 | EMA·Temporal Ensembling·속도/토크/작업공간 제한 | 가중치/시점·주기/필터 지연·검증/최종 제한·복구 상태와 안전 범위 |
| M30.04 | Watchdog·중단·상태 승격·Shadow/제한 실행 | clock/나이·watchdog action·미실행/shadow/제한실행 상태·정지/물리 안전 구별 |
| M30.05 | 성공률·신뢰구간·층화 실험·비교 기준 | 성공/trial/독립성·이항 CI의 방법/가정·층별/혼합·paired 비교와 선택 |
| M30.06 | 버전·배포 계약·감독·롤백·최종 실증 리포트 | 실행/자료/하드웨어 계약·승격/rollback·실증/합성·인증 및 외부 배포 구별 |
| M32.01 | 모바일 배달·동적 장애물·언어 미션 | M17/M18 미집필 보충·주행/충돌/미션·동적 상태·텍스트와 실행 증거 |
| M32.02 | SO-101/산업용 팔 비전·모방학습 Pick-and-Place | 인지→보정→정책/제어 계약·재현 자료/분모·순환·장비 없는 판정 |
| M32.03 | 이동 매니퓰레이터·양팔 협응 | 베이스/팔/양팔 프레임과 공동 시간/제약·분업/연동 실패·실제 실행 범위 |
| M32.04 | 휴머노이드 보행 외란 대응 또는 밸런싱 로봇 | 미집필 M23/M24/M26 필요 기초의 본문 보충·모형/실험 한계·장비 없는 경로 |
| M32.05 | 요구사항·인터페이스·실험표·실패 사례·재현 패키지 | 관찰 가능한 요구·입출력/상태/시간·실험의 조건/단계/원본 근거 |
| M32.06 | 데모·설계 근거 설명·동료 검토·개선 계획 | 루브릭 가중치/통과 조건·시연/독립 검토·관측/예상/미확인과 개선 근거 |

## 4. 원고별 검수 기록

각 고정 원고의 최초 판정·점수/결함·작성자 수정·재검수 근거·최종 승인 SHA256을 누적한다. 통과할 때만 작성자에게 다음 단위를 요청하고 루트에 정확한 SHA를 전달한다. 아래 최종 승인 SHA가 있는 원고만 콘텐츠 통과다.

임시 큐 `/tmp/e4-approved-content.json`은 독립 콘텐츠 통과 결정의 topicId→최종 SHA 기록이며 registry 자체 승인이 아니다. 임시 파일을 쓴 뒤 같은 디렉터리에서 atomic replace로 갱신한다. 수정본 재통과 시 이전 SHA를 교체하고 이 문서의 이력을 보존한다. 마지막에 42개 source/큐 지문을 전수 대조한다.

### M19.01 1차 독립 검수 — 콘텐츠 통과

- 장치/F/T/W 계약은 실습1/Q1, TCP→플랜지 목표는 실습2/Q2, eye-in-hand/자료 조건은 실습3/Q3에 대응한다. 전체 초출 정의·단위·선수·자연어와 부분 답/오개념을 재독했다. 미집필M17의 IK/끝점·경로·충돌 검사의 차이를 본문에서 보충하고 실제 파지와 엔코더·계획/실행 허가를 구분한다.
- 독립 NumPy 계산에서 Rz90의 TCP(.4,.2,.3), 공구.1m의플랜지(.4,.1,.3), .15m변형(.4,.05,.3), Q2 TCP(.5,.1,.2)/플랜지(.5,0,.2)를 확인했다. 회전된offset을 더해 복원된다. G_iXC_i=G_jXC_j에서 Gj^-1GiX=XCjCi^-1의 AX=XB 방향도 직접 유도해 일치했다. 수식2개는 실제 remark block/KaTeX 검사를 통과했다.
- [Modern Robotics 동차변환](https://modernrobotics.northwestern.edu/nu-gm-book-resource/3-3-1-homogeneous-transformation-matrices/), [OpenCV4.13 hand-eye](https://docs.opencv.org/4.13.0/d9/d0c/group__calib3d.html)를 직접 대조했다. gripper→base/target→camera 입력과camera→gripper 출력, 비평행 상대회전2motion/3pose 필요조건·다수 관측/독립검증의 한계가 맞다. 기존3.2/chapter6의 동차체인과4.1/chapter5의4.1.4 보정품질을 실제로 읽어 제목/연결 의미를 확인했다.
- 내용7항목 모두2점. 승인 SHA256: `54da8773021d04550aba210a0624900bba6c9118d23a9ebc4d8cee30682a9c0d`. 실제 장비/핸드아이 solver 실행은 없다. 임시 승인 큐는 atomic replace로 갱신했으며 웹/registry는 루트 별도다.

### M19.02 1차 독립 검수 — 콘텐츠 통과

- 상태/scene/IK는 실습1/Q1, 경로/ACM은 실습2/Q2, 시간/시작 상태·실행 증거는 실습3/Q3에 대응한다. 미집필M17의 상태공간/연속 경로·표본 검사를 자립 보충했다. 전 섹션 정의·가정·자연어와 부분 답/오개념을 재독했다.
- 독립 계산: q∈[0,1]에서0→1은 금지[.45,.55]를 연속 통과하고0/.4/.6/1 표본은 이를 놓친다. 시간 예는 별도 유효 경로 전제로 평균1.2/.8rad/s·속도하한.6/.4s, 시작차이.1>.02, Q3 1.5rad/s·.3s다. 속도 하한이 가속/jerk/경로 충돌까지 보장하지 않는 설명이 맞다. scene300ms의 허용은 운동/정책 근거가 없으면 미상이다.
- [MoveIt Rolling scene](https://moveit.picknik.ai/main/doc/examples/planning_scene/planning_scene_tutorial.html), [시간 매개화](https://moveit.picknik.ai/main/doc/examples/time_parameterization/time_parameterization_tutorial.html), [move_group](https://moveit.picknik.ai/main/doc/concepts/move_group.html), [Jazzy FollowJointTrajectory raw](https://raw.githubusercontent.com/ros-controls/control_msgs/jazzy/control_msgs/action/FollowJointTrajectory.action)를 직접 대조했다. 상태/scene·ACM·후처리 후 충돌 재검사·별도 제어기와path/goal tolerance/result의 역할이 맞다. Rolling 개념과 Jazzy 실제 API를 구분하며 실행 명령을 요구하지 않는다. 기존3.3/chapter7 DLS와3.5/chapter9 안전루프의 실제 제목/내용 연결도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `bff5839860b516723dc6fbb1aa205e1a1f081634e15b84cd6b1cdfe8f8755252`. ROS/MoveIt/실물 실행은 없으며 임시 승인 큐 atomic 갱신 완료다. 실제 웹/registry는 루트 별도다.

### M19.03 1차 독립 검수 — 콘텐츠 통과

- 티칭의 TCP/작업 프레임·보간/블렌딩은 실습1/Q1, 접근/후퇴와 확인 단계는 실습2/Q2, 교육용 구역·정지 여유는 실습3/Q3에 대응한다. 초출 계약·정적/동적 한계와 부분 답/오개념까지 전 섹션을 재독했다.
- 독립 Python 산술에서 접근/후퇴140/160mm·하한2/2s, 거리120 변형3s, Q2 접근110mm/2s, 정적여유25/−5/5mm, 정지거리20/60mm를 확인했다. Q3는5−20=−15mm다. 정지/관측 대기를 이동 시간 하한에 포함한 실제 사이클로 과장하지 않는다.
- [UR SW5.20 Move](https://www.universal-robots.com/manuals/EN/HTML/SW5_20/Content/prod-usr-man/complianceUR30/SW_sections/first_program/move.htm), [Waypoints](https://www.universal-robots.com/manuals/EN/HTML/SW5_20/Content/prod-usr-man/complianceUR30/SW_sections/first_program/waypoints.htm), [SW5.19 safety planes](https://www.universal-robots.com/manuals/EN/HTML/SW5_19/Content/prod-usr-man/complianceUR16e/H_g5_sections/firstuse/Planes_g5_en.htm)를 직접 대조했다. feature/TCP 관계, MoveJ 관절/MoveL TCP 직선·블렌딩과 정의한 tool/팔꿈치만 검사하는 범위가 맞다. 기존3.5/chapter9의 실제 안전루프 내용 연결도 유효하다. 단순 감속 모형과 실제 제동/안전 인증·전체 팔 검증을 구별한다.
- 내용7항목 모두2점. 승인 SHA256: `a51488e42b0bebaebf629241a4583c62004ad9b4deb705739f1c5718b814dba3`. 실제 티칭/장비/안전 설정 실행은 없다. 임시 승인 큐 atomic 갱신 완료이며 웹/registry는 루트 별도다.

## 5. 기존 교재 보완의 별도 독립 검수 — 최종 고정 대기

- 루트가 제안한 6장 선수/후속 링크와 front E4 42개 범위는 본 기록의 사전 범위·미집필 선수 보충·합성/실제 실행 구분에 맞는다. 공개된 교안을 학습자 프로젝트 완료로 취급하지 않는다.
- 감독기 `safety_supervisor.py`는 독립 Python 실행에서 유한 양수 timeout, NaN/Inf 관측/현재 시각, 미래/경계/초과 나이, fault 이전 승인 무효화, fault 이후 승인·자세 재확인과 새 관측 필수, DRY_RUN의 hardware flag false 및 LOW_SPEED flag true를 확인했다. 이는 실제 모터 속도 제한이나 제동/안전 인증 시험이 아니다.
- [LeRobot ACT 공식 구현](https://raw.githubusercontent.com/huggingface/lerobot/main/src/lerobot/policies/act/modeling_act.py)의 ACTTemporalEnsembler153~165/193~223과 [원 ACT 공식 구현](https://raw.githubusercontent.com/tonyzhaozh/act/main/imitate_episodes.py)229~238을 직접 읽었다. oldest index0에 exp(−coeff·index)를 쓰므로 양의 coeff는 오래된 후보 우선이다. 기존5/6장의 교육용 newer 우선 예제와 차이를 명시한 서술이 맞다. 같은 실행 시점/단위의 후보 정렬과 proposal 검사→합성→최종 제한의 설명도 맞다.
- 최초 제안8개 source SHA가 제안 JSON과 일치함을 확인했으나 **최종 승인은 보류**했다. 루트가 좁은 코드 감사에서 추가 발견한 safe_teleop_core/closed_loop_20hz의 NaN/Inf·시간 역전·기준 범위 결함을 보완 중이다. 고정10파일 알림 후 변경된 leaf/본문을 추가 검토하고 최종 SHA를 승인한다. 이 별도 기존 교재 검수는 신규 단위 승인 큐에 넣지 않는다.

### M19.04 1차 독립 검수 — 콘텐츠 통과

- kinematic/dynamic·목표/관측 계약은 실습1/Q1, simulation/dynamics/render/외부 갱신은 실습2/Q2, 통제 비교와 근거의 한계는 실습3/Q3에 대응한다. 전체 정의·단위·동작 모드·부분 답/오개념과 자연어를 재독했다.
- 독립 산술:20pass×.05s=1s, 물리200/렌더10회, RTF.4, 외부10Hz 대 물리200Hz. Q2는1s/물리500/렌더10회/RTF.5, 외부50Hz 대 물리500Hz다. 오차0의 강제 위치와 동적 추종오차.04를 동등한 제어 실험으로 순위 매기지 않는다.
- CoppeliaSim 공식 [joint modes](https://manual.coppeliarobotics.com/en/jointModes.htm), [settings](https://manual.coppeliarobotics.com/en/simulationPropertiesDialog.htm), [ZeroMQ](https://manual.coppeliarobotics.com/en/zmqRemoteApiOverview.htm), [dynamics](https://manual.coppeliarobotics.com/en/dynamicsModule.htm)를 직접 대조했다. 유효 연결 구조에서 dynamic 처리, simulation pass와 하위 적분/렌더, 외부 stepping과 비실시간성·엔진별 차이를 정확히 구분한다. 기존2.3/chapter7의 실제 강체역학/시간과2.7/chapter11 질량/관성 연결도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `d160d0364f67b9888fcc18d8be2f522820f5ffbd20ed6b715e98518fbc5ebd8c`. CoppeliaSim 설치/실행이나 실제 성능 측정은 없고 전부 합성 비교다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### 기존 교재 최종10파일 — 독립 검토 통과

- 새 두 leaf를 독립 실행했다. JointSafetyFilter는 NaN/Inf/비양수·상한초과dt, NaN/Inf 현재시각과 역전, 범위 밖 measured(deadman 양쪽), TTL.25/.251 경계를 판정했다. 오류 시 command={}이고 상위 latched 감독기와 입력 필터의 책임이 분리되어 있다. main 출력의 그리퍼7/9/11/13이 본문과 일치했다.
- SafetyLimits는 clamp 전 Inf/NaN·shape 불일치·범위 밖 previous를 거부하고 정상 ±2 제안을 ±.08로 제한했다. run(1,.001)의 CPU mock도 실제 실행했으며 하드웨어/실시간20Hz 보장 검증은 아니다. 이전 supervisor와 temporal 불변 부분의 독립 근거는 위에 유지한다.
- 여섯 장의 E4 링크·front 범위와69개 기존 원고의 시간/좌표·입력/최종제한·실행/물리안전 구분을 대조해 새 모순은 찾지 않았다. 추가된 링크는 계획된 E4 단위 경로이며 현재 새42개 전부의 집필/공개 완료를 뜻하지 않는다. 제안 JSON10행의 현재 source 지문을 전수 일치 확인했다. 최종 승인 지문은 다음과 같다. 실제 웹/registry/최종 공개는 루트 검수다.

| source | 승인 SHA256 |
|---|---|
| ebook/book/00_frontmatter/how_to_use.md | `478bd10e127bee98fa37f37e97a20eede9197cda83a09a49be8636875df0e163` |
| ebook/book/01_physical_ai_isaac_ros2/chapter.md | `0658d775a58fe696d5d9a2f74b3dda996ef1d399571448a7d46067f03685f76c` |
| ebook/book/02_physx_simulation/chapter.md | `046ff676a51a1cf529673af29f76532f742dee148d67289c869e32a3d616dd93` |
| ebook/book/03_so101_kinematics_teleop/chapter.md | `2a3930847f4239da32f60dc7554f4fdf5b4197e5694eb6e86499f3bf3d6929e7` |
| ebook/book/03_so101_kinematics_teleop/code/safe_teleop_core.py | `e24a9c037415c93e4d37ae493de9187f55a8cf7b811bd0036b528db5913907fc` |
| ebook/book/04_sensor_data_pipeline/chapter.md | `9440f558163e693c71c6925d3e39f063c6ab9e1c1387a8f58a7f3f218ac4eeb6` |
| ebook/book/05_lerobot_smolvla/chapter.md | `af2be1c26daef8c1e7ada4fa962d1366f5ce2d7e85c2903390f771d94a1a213a` |
| ebook/book/05_lerobot_smolvla/code/closed_loop_20hz.py | `e90f12a72fbe41ead9ee9f068499cf50af103bd225f20154292e922bc31d5c0f` |
| ebook/book/06_sim2real_deployment/chapter.md | `7f6a9c5db746e01dec7de67d2b1e483052e33d0e27ca0623bf7a959415ed7533` |
| ebook/book/06_sim2real_deployment/code/safety_supervisor.py | `1bcf6aca1fad053dd77c2a4de567bf61796252234d8b854d16e38ad17160672a` |

### M19.05 1차 독립 검수 — 콘텐츠 통과

- 후보/score·파지 계약은 실습1/Q1, 깊이/프레임·접근과 층 변화는 실습2/Q2, 단계 근거와 성공률 분모는 실습3/Q3에 대응한다. 단일점에서 자세를 복원했다고 하지 않고 고정 접근 자세를 별도 입력하며 전 섹션 정의/가정·부분 답과 오개념을 재독했다.
- 독립 산술에서 pC(.05,0,.5)→base(.35,.1,.1)/접근z.2, 폭34≤36mm, 층.7→.5m, 요청3/10과 실행3/5 및 조건부 곱3/10이 일치했다. Q2 base(.4,.1,.1)/접근(.4,.1,.2), Q3 50%/75%다. 탈락2/2/1/1/1과 유지 미상/미실행을 성공으로 더하지 않는다.
- 공식 MoveIt Task Constructor의 접근·GenerateGraspPose/IK·attach/lift·place/retreat 구조와 Robotiq 응용의 위치/높이 변동 자료를 직접 대조했다. scene attach는 모형 관계이며 실제 유지 감지가 아니고, 물체 제거 명령과 층 계산 사이의 재관측을 구별한다. 기존4.1/chapter5 카메라/깊이·3.5/chapter9 안전루프의 실제 heading/내용 연결이 맞다.
- 내용7항목 모두2점. 승인 SHA256: `3ff98ea96d39e1385c72e53bfd98e841bf691d71b38095684edadbd00c6f1cd4`. 실제 카메라/모델/로봇/작업 실행은 없다. 임시 승인 큐 atomic 갱신 완료이며 웹/registry는 루트 별도다.

### M19.06 1차 독립 검수 — 콘텐츠 통과

- 구조/도달·하중은 실습1/Q1, 베이스 좌표/오차 여유는 실습2/Q2, 통합 관측/협동 응용은 실습3/Q3에 대응한다. M17/M18을 요구하지 않고 베이스 이동/정지·최신 자세를 본문 보충하며 초출 정의·부분 답/오개념과 전 섹션을 재독했다.
- 독립 산술에서 델타 근사 반경.282843/.353553m·질량.7kg·모멘트.6867/.34335Nm, 세계→베이스 역회전의.5/.4m, 최대 병진오차 구간.47~.63/.37~.53/Q2.35~.45m가 일치했다. σ와 최대 범위를 구별하고 회전/장착/대상 오차·경로·안정성을 제외한 근사임이 명확하다.
- 공식 igus 델타 사례·Modern Robotics13.5·UR SW5.20 risk assessment를 직접 대조했다. 구조와 협동 응용의 분류 축, 베이스/팔 체인 및 정지 후/동시 협응, 전체 응용 검증의 범위를 구별한다. 기존3.1/chapter5 모델과3.5/chapter9 실행루프의 실제 heading/내용 연결도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `33382a75be4aec0c00bfb23f29d00be7c92a28ab1b9ca24a01044af8ca5c46e8`. 수치는 합성이고 실물 정격/운전/안전 인증 시험은 없다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다. M19 여섯 원고의 현재 SHA가 큐와 전수 일치함도 확인했다.

### M20.01 1차 독립 검수 — 콘텐츠 통과

- 장치/보정·단위 계약은 실습1/Q1, 상대 매핑/클러치 재기준은 실습2/Q2, 제한 후/실제 기록은 실습3/Q3에 대응한다. 모든 입력/기호·부분 답/오개념을 재독했고 내장 클러치 기능이나 실제 유지/속도 측정으로 과장하지 않는다.
- 독립 산술은 tick→.2rad, 목표.4/배율변형.45, 옛기준.75/점프.35, 관측 재기준.41/이후.31, 제한.40과 Q1.3/Q2.4/Q3.22rad가 일치한다. 최신 관측 미상 시 재기준 보류와 희망/전송/실제 action 열 분리가 맞다. remark block1/KaTeX를 실제 검사했다.
- 공식 SO101 문서의 leader/follower와 SOFollower main61~70의 body DEGREES 또는 RANGE_M100_100·gripper RANGE_0_100을 직접 확인했다. 교육용 선형 보정/상대 매핑과 공식 보정의 차이, 버전/설정 고정 요구가 정확하다. 기존3.4/chapter8의 데이터경로·그리퍼/첫프레임 정렬과3.5/chapter9 제한루프를 실제 읽어 의미를 대조했다.
- 내용7항목 모두2점. 승인 SHA256: `14c0ebedb5f870819af52ee31b77681ed1266ab344429c6a39010145298a735a`. 실물/시리얼/보정 실행은 없고 합성 로그 계산이다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M20.02 1차 독립 검수 — 콘텐츠 통과

- 모델/선택 설치·MjModel/MjData는 실습1/Q1, 환경/물리 step과 ctrl/관측은 실습2/Q2, 상태 재생/행동 재실행은 실습3/Q3에 대응한다. Gym/RL 미집필 개념은 reset/action/step/종료로 보충하고 전 섹션 초출 정의·부분 답/오개념을 재독했다.
- 원고에서 직접 추출한 완전 MJCF를 표준 XML로, Python을 AST로 독립 검사했다. 엔진 컴파일/step 실행 검사가 아니다. 독립 산술20환경×5물리×.01s=1s와20/100Hz, 로그 평균1.6/1.2rad/s·오차.3/.22/.16, Q2 500물리/1s·50/500Hz가 맞다.
- MuJoCo 공식 Python/Modeling/Overview를 직접 대조했다. 모델과 상태, position actuator의 목표 의미·일반 actuator와 구분, free joint nq7/nv6, forward와 시간 적분 step, 필요한 초기 상태/설정·버전 기록의 설명이 맞다. 기존2.3/chapter7 역학/시간과3.1/chapter5 모델 구조의 실제 내용 연결도 유효하다.
- 내용7항목 모두2점. 승인 SHA256: `31ccea52c11c35d46f6cdddd9b8da6b43a45523b3022a36d0c2f306132d36372`. MuJoCo 설치·컴파일·물리/렌더 실행은 없으며 예상 차원/구조/합성 계산을 실제 실행 결과로 표시하지 않는다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### 기존5장 shape 설명 후속 재승인

- 5.3.2의 video 저장 모달리티와 로더 후 RGB CHW 텐서 예시를 구별한 문단을 표와 함께 재독했다. 공식 LeRobotDataset v3 loading187~228의 단일[C,H,W]/시간창[T,C,H,W]와 DataLoader 별도 배치축을 직접 확인했다. metadata shape/dtype를 로드 후 텐서로 그대로 복사하지 않고 decode/전처리·채널 순서를 각각 기록하는 설명이 정확하다. 기존 승인 불변 부분은 유지하며5장 최종 승인 SHA를 `7fd1692b77826b19a858fd4db037cf5272610b836ed74b879c34a8ab3db43bbd`로 교체한다. 실제 데이터 다운로드/로더 실행은 하지 않았다.

### M20.03 독립 검수·표현 보완 재검수 — 콘텐츠 통과

- feature/action/지시문은 실습1/Q1, episode/시각/창은 실습2/Q2, 공유 저장과 writer/재로딩은 실습3/Q3에 대응한다. 단위/shape·끝행 action·성공/실패와 손상 구분을 전 섹션 재독했다. 최초 Q1 물음표 뒤/해설Q2 쉼표 뒤의 문장 경계 공백2곳을 요청했고 작성자 수정본의 실제 반영을 확인했다. 내용/수치는 불변이다.
- 독립 산술은3/2행·총5행, 취득범위.10/.05s·명목.05s, 영상차20ms>10ms, H2의 frame1/2 가능·새episode row3 연결 불가, Q1절대.3을delta로읽으면.5, Q2취득차.2 대3/fps.3s가 일치한다. 패딩은 실제 관측이 아니고 mask 정책이 필요하다.
- 공식 LeRobot v3 storage/metadata 및 loading CHW/TCHW를 직접 대조했고 current API finalize514~526에서 pending flush/close·footer 역할을 확인했다. 정상 마감과 의미/시각/라벨 검사의 분리가 정확하다. 기존5.3/chapter7 v3 설계·5.4/chapter8 수집/품질의 실제 heading/내용과 root의 새shape 보충 문단이 일치한다.
- 내용7항목 모두2점. 승인 SHA256: `4abbce3b101a29df27aea4c636e3d1c802daee17886c437c5eb44d4332cf1c56`. 실제 수집/로더/학습/업로드 실행은 없다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M20.04 1차 독립 검수 — 콘텐츠 통과

- 도구/컨테이너/직렬화와 세 시각은 실습1/Q1, 압축/정밀도/단위는 실습2/Q2, 변환 검증/경계 근거는 실습3/Q3에 대응한다. schema·channel·chunk·round-trip의 초출 설명과 단위/시계·부분 답/오개념을 전 섹션 재독했다.
- 독립 Python struct 실행에서1000000001/2ns를float32 초로 바꾸면 모두1.0이 되어1ns차가 사라졌다.20/20/40ms와2.5:1/60%·Q2 4:1/75% 및180degree=πrad가 맞다. 무손실 저장압축과 손실영상·의미 변환·원래 수집누락을 구별한다.
- 공식 MCAP spec의 message log_time/publish_time과 발행시각 미상시fallback, Jazzy MCAP plugin의chunk압축·rosbag2의/clock 기반 기록을 직접 대조했다. 메시지수/hash·round-trip만으로 의미가 보장되지 않고 독립 기준이 필요한 설명이 정확하다. 기존4.4/chapter8 시간정합과5.3/chapter7 Dataset의 실제 heading/내용 연결도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `ca95b8b6a1c805372776e769fe70925655de43d6dffca031a7531acfe2ec858f`. 실제 ROS/MCAP 수집/재생·변환 실행은 없고 struct 수치 검증과 합성 활동이다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M20.05 1차 독立 검수 — 콘텐츠 통과

- entity/timeline·표시 계약은 실습1/Q1, 원시 순서/범위·속도/정합 계산은 실습2/Q2, 격리/수정 근거는 실습3/Q3에 대응한다. Replayer를 특정 설치 제품으로 가정하지 않고 전체 초출/규칙·부분 답/오개념을 재독했다.
- 독립 산술:seq12누락/13중복·기대4개중고유3의25%, dt.05/.10/−.01s, 범위.20rad초과·양의구간.4/11.8rad/s, 영상−20ms, 2배속.075s·Q2 6rad/s/−30ms가 맞다. 음의dt를 정상 속도로 판정하지 않고 경고 사실과 원인을 구별한다.
- Rerun 공식 timeline/latest-at/transforms/entity 자료를 직접 대조했다. 확인한 timeline/query/transform 문서는0.41이며 entity 페이지의 웹캐시표시는0.40이다. 해당 계층 이름의 설명은 동일하며 버전별 API 명령을 제시하지 않는다. 최신 component 값의 유지 표시가 새 이벤트가 아님을 정확히 설명한다. 기존4.7/chapter11의 실제 무결성 설명/합성코드 연결도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `f251bdd83b61738d722f8aabae0b5ce4913afd5d95702ba60a1865bda1094f59`. 실제 Rerun SDK/viewer 실행은 없고 합성 표 계산/공식 개념 대조다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M20.06 1차 독립 검수 — 콘텐츠 통과

- 실패/개입의 품질과 용도는 실습1/Q1, 그룹/통계·분할은 실습2/Q2, 랜덤화 의미/분포·시험 조건은 실습3/Q3에 대응한다. BC/Uniform 초출 설명·개입source·분모n과n−1 구분 및 부분 답/오개념을 전 섹션 재독했다.
- 독립 Python 산술에서 train2/4→μ3/분산1/σ1/validation10의z7, Q2의 train1/3→μ2/분산1/σ1/z3가 일치한다. A복구/B증강/C증강 세group의 누수를 모두 묶는 수정과 작은3그룹의 한계가 맞다. 위치.29~.31/변형.308·Q3.38~.42/.385m와 시험.32의 범위 밖 판정도 맞다.
- Ross/Gordon/Bagnell 순차모방 원논문·Tobin 도메인랜덤화 원논문·scikit 그룹분할 공식 자료를 직접 대조했다. 실패 수집 자체와 올바른 복구 라벨/closed-loop 일반화, 렌더 변형과 물리 적용·라벨 일관성·잠근 시험의 차이를 정확히 설명한다. 기존4.6/chapter10 랜덤화와5.4/chapter8 수집/품질의 실제 heading/내용 연결도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `670928df2226b312ddb9af0db1e9da646b1841af02ed121e173df4ca310fc48c`. 실제 자료 생성/학습/시뮬레이터·장비 실행은 없다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다. M19/M20총12개 current source/queue SHA 전수 일치도 확인했다.

### M21.01 1차 독립 검수 — 콘텐츠 통과

- BC/action·単一成分손실은 실습1/Q1, 상태분포/두 폐루프 모형은 실습2/Q2, 다중모드·시연/평가는 실습3/Q3에 대응한다. 초출 θ/π/o·MSE/RMSE의 분모/단위와 부분 답/오개념을 전 섹션 재독했다.
- 독립 계산으로MSE.0008rad²/RMSE.0282843/최대.04, 두모형 .02/.04/.06 대 .02/.03/.035rad, 상수예측0/1의손실1/2m²·Q1 .01rad²/.1rad·Q2 .01/.02/.03/.04가 일치한다. action오차와 상태오차·실물추종은 다른 변수/실험이며 작은offline손실에서 임의의성공률을 도출하지 않는다.
- MIT Tedrake 모방학습 강의·Ross 원논문·LeRobot 모방학습/평가 경로를 직접 확인했다. 지도시연·분포의 정책의존성과 손실/과업성공 분리, 다중모드 평균의 한계 설명이 정확하다. 기존5.1/chapter5 행동복제/분포이동·5.4/chapter8 시연품질의 실제 heading/내용 연결도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `13c1c6022b666e3e061bf77d0b1d24173d52db8d31cbd56e9f050d8923231480`. 실제 학습/GPU/로봇 실행은 없고 합성 산술이다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### 기존5장 action 표현 후속 재승인

- 5.5.3을 공식 LeRobot action_representations170~244 및gripper 제외 설정과 대조했다. 예측시 공통qref 기반 relative와 순차delta의 차이·기준시각/프레임 및 전처리/역정규화 순서가 정확하다. .3rad와[.1,.2]에서고정[.4,.5] 대누적[.4,.6]을 독립 산술 확인했다. 기존 불변 승인 부분을 유지하며5장 최종 승인 SHA는 `d312121c227dba06ae1ce56d7645e48f7bb26dccf4b82ef67b64e94cf762e09f`로 교체한다. 실제 정책 processor/로봇 실행 검증은 아니다.

### M21.02 1차 독립 검수 — 콘텐츠 통과

- 인과적 이력·축/shape는 실습1/Q1, 행동공간/기준은 실습2/Q2, 정규화와padding/mask는 실습3/Q3에 대응한다. 첫가용 취득/수신을 입력으로 정의하고 미래 행동 정답과 미래 관측 누설을 구별한다. 모든 정의/기준·부분 답/오개념을 재독했다.
- 원고 표준 Python을 직접 추출 실행해action_rad=.450/valid_mse=2.500을 확인했다. 영상96원소/uint8 96byte/float32 384byte·state6, 고정.50/.45/.38 대누적.50/.55/.53rad, 잘못된state통계.6/clip.4, Q2고정.3/.15 대누적.3/.25, Q3 .2rad/MSE4가 일치한다. 유효0의평균 미정의·각도합성을모든자세에확대하지 않는 조건도 정확하다.
- 공식 LeRobot action_representations170~267의 공통current기준/순차delta·relative→normalize와unnormalize→absolute/제외gripper, v3의시간창을 직접 대조한 근거와 일치한다. 기존5.5/chapter9의root새표현 보충과5.3/chapter7 Dataset경계의 실제 의미도 맞다. 특정ACT loss reduction을 단정하지 않고 이단위규약을 명시한다.
- 내용7항목 모두2점. 승인 SHA256: `1ef9b17b7f404c8d5e942c6758717c06700b6096e0a9161a87d3e1958385c16a`. 실제 정책/tensor학습/로봇 실행은 없으며 표준 Python 산술만 실행했다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M21.03 1차 독립 검수 — 콘텐츠 통과

- chunk/실행 시간은 실습1/Q1, CVAE 정보/손실은 실습2/Q2, 동일시각ensemble은 실습3/Q3에 대응한다. latent/조건부/encoder/decoder·KL/β·패딩 분모와 후보순서 정의를 전 섹션 재독했다. E2개 실행/매단계 질의 예를 별도로 명시하여 혼동을 막는다.
- 독립 산술로H4의1/1.05/1.10/1.15s·끝차.15/유지.2/재계획.1, L1전체1/유효1.5·총1.5/2, oldest양수계수 .342857/age최신 .6/균등.466667rad, Q2총2/3·Q3 .4가 일치했다. 후보유효0/합법0행동·모드/reset/프레임과 최종 제한을 구별한다.
- 저자ALOHA프로젝트·originalpolicy.py의mask후전체mean 및detr_vae의추론latent0을 직접 대조했다. LeRobot current의valid원소×행동차원 분모와oldestindex0 가중방향은 앞서 직접 확인한 공식소스와 일치한다. 새단위가 교육용 최신우선 예제와 차이를 정확히 설명하고 기존5.2/chapter6·5.9/chapter13의 실제계보/추론 내용을 연결한다. 수식2개 실제remark block/KaTeX 통과다.
- 내용7항목 모두2점. 승인 SHA256: `8d43056ad99f54a7d52751e0cb07769adcfa9e383b70de3d929fbf23c51fb202`. 실제 ACT/학습/GPU/로봇 실행은 없으며 합성 계산이다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M21.04 1차 독립 검수 — 콘텐츠 통과

- noise追加/복원은 실습1/Q1, 계산예산/제어시계는 실습2/Q2, family/대칭·제약은 실습3/Q3에 대응한다. 생성n/제어t·무차원행동·잠재/다양체·equivariance를 초출 보충하고 부분 답/오개념까지 전 섹션 재독했다.
- 독립 산술x=−.2/MSE.01/복원.425와Q1 .8→.25,35/65ms·여유5/초과25·Q2 37/3ms, H/E .20/.10s·Q2.10/.04s가 일치했다. ±.3곡선은 중앙x.4~.6에서|y|≥.285317>.1m로 원판을 피하고 평균0은중심충돌이다.±.2도중간점은원판밖이며 매끄러움만으로 일반제약을 보장하지 않는다.
- DiffusionPolicy 저자프로젝트/공식lowdim 코드 및Lee EMMP 원논문을 직접 대조했다. 조건부 행동diffusion·샘플링/역정규화와receding horizon, EMMP의autoencoder/변형가정·대칭 활용을 구별하며 자체family를학습EMMP로과장하지 않는다. 기존5.2/chapter6계보·3.3/chapter7IK/과업자유도 의미연결도 맞다. 수식2개의remark block/KaTeX 실제검사 통과다.
- 내용7항목 모두2점. 승인 SHA256: `1c0f0e9a1172b81bc03744b2ad0c18812dcc2572e391b71ac7328be6480e21a4`. 실제 sampler/모델학습/GPU/로봇 실행은 없고 합성 산술·문서대조다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M21.05 1차 독립 검수 — 콘텐츠 통과

- 전신채널/공통물체 계약은 실습1/Q1, 접촉점·베이스/시간 계산은 실습2/Q2, 공동자료/가중치/검증은 실습3/Q3에 대응한다. co-training과실측없는base0·파생0,좌우ID와장착offset·부분 답/오개념을 전 섹션 재독했다.
- 독립 계산에서90도 접촉(0,−.2)/(0,.2) 간격.4m·벌림.42m, base+.1 세계−.1/.3과보상−.3/.1·Q2세계−.15/.25와보상−.25/.15m,40ms×.25m/s=10mm가 맞다. loss개수가중.3/domain균등.4·Q3둘다.3을 확인했다. 개별속도제한과강체접촉·전신안정성/작업성공을 구별한다.
- MobileALOHA 저자프로젝트/하드웨어repo/ACT++repo를 직접 대조해이동베이스·전신teleop·정적ALOHA자료co-training의 의미가 맞음을 확인했다. 과거ROS1등의설치명령을Jazzy절차로복사하지 않고 원연구성과와합성활동을나눈다. 기존3.2/chapter6변환체인·5.4/chapter8시연품질의실제heading/내용연결도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `4b85ce4e46bffde007ee66d86f6f7dfdf67616d66c4edd54dbb1adf49c4e8cb5`. 실제 장비/학습/코드 실행은 없으며 합성 산술·공식 자료 대조다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M21.06 독립 검수·표현 보완 재검수 — 콘텐츠 통과

- 맞춤/선택·checkpoint 계약은 실습1/Q1, 개발rollout/종료·분모는 실습2/Q2, 재수집/독립시험은 실습3/Q3에 대응한다. 최초 실습해설의 쉼표 뒤 숫자경계 공백1곳을 요청했고 작성자 새고정본의 실제반영을 확인했다. 내용/코드/수치는 불변이다.
- 원고 표준Python을 직접 추출실행해trainMSE.000과0.6시작성공4action·1.1시작실패5action/경로가 출력표와 일치했다. Q1 c.2/MSE.006667·Q2 .8→.9→1의2action/.2논리s도 확인했다.1/2개발성공·도움포함2/3 대자율1/3,개발수정후회귀와독립시험의 차이가 맞다.
- LeRobot 수집/학습/평가·Ross 순차분포와scikit 공식누수지침을 직접 대조한근거와 일치한다. 상수클래스가표현못하는음수복구·부적절한실패정답자동채택을설명하며작은CPU맞춤을신경망/실물성과로과장하지 않는다. 기존5.8/chapter12학습파이프라인·5.10/chapter14평가의실제heading/내용연결도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `41c87c6d09bec521ef6856d3154125bdc3b3ca9db0cb29e747d67c028e7f38cd`. 표준Python의제한된합성모형만실행했으며실물/GPU학습은없다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다. M19/M20/M21총18개current source/queue SHA 전수 일치도 확인했다.

### M22.01 1차 독립 검수 — 콘텐츠 통과

- LLM/VLM/VLA 역할과출력계약은 실습1/Q1, 객체·프레임/시각·skill접지는 실습2/Q2, 점수선택/실제완료는 실습3/Q3에 대응한다. 미집필주행선수를요구하지않고지도/경로·현재위치의기본책임을본문보충한다. 초출grounding/skill/affordance·부분 답/오개념을 전 섹션 재독했다.
- 독립 곱셈.08/.54/.24와Q3.18/.4, 나이.1/.3·Q2.25s/허용.2s가 일치한다. 모호한대상/프레임·오래된가능성은최대점수로통과시키지않고유보한다. 모든점수를독립확률이나작업성공률로해석하지 않는다.
- SayCan/RT2/OpenVLA 저자프로젝트를직접확인했다. 언어유용성×가능성접지·원SayCan의피드백한계와본교재응용검증요구를구별하고 RT2토큰행동을모든VLA의보편출력으로단정하지 않는다. 기존5.2/chapter6 VLA계보·3.5/chapter9 실행루프의 실제heading/내용연결도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `98565e55601be81c02b777e1537911198e8d8417b29e0b3bec62bd6e93de6a96`. 실제모델/API/ROS/장비실행은없으며합성사례계산이다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M22.02 독립 검수·표현 보완 재검수 — 콘텐츠 통과

- prompt/schema는 실습1/Q1, 신뢰봉투/현재상태·TTL은 실습2/Q2, Action/timeout·중복은 실습3/Q3에 대응한다. 최초실습해설 쉼표뒤공백1곳을요청했고실제반영확인했다. 전섹션 용어/기준·부분 답/오개념을재독했다.
- 원고표준Python parser를직접추출실행했다. 정상dict와unknown skill/extra field/타입/중복key/NaN/비object6종거부를확인했다. 실행도구/ROS호출은없다. 나이100/250ms·여유100/초과50·Q190/여유10이맞고봉투나이/관측나이·입장TTL/실행deadline을구별한다.
- 공식ROSAction설계·JSONSchema object·Python3.13json문서를직접대조했다. properties와required/additionalProperties 구분,parse_constant/중복처리·크기/깊이의실서비스한계가정확하다. 수락/취소응답/terminal/물리정지·client timeout과서버실행미상을구별하고ID만으로exactlyonce보장하지않는다. 기존3.5/chapter9실행루프·5.9/chapter13추론의실제heading/의미연결도맞다.
- 내용7항목 모두2점. 승인 SHA256: `5c6483b5b6eae40b7ff32d9414f295bd5774accace880fffb3555dc33aef4da9`. 실제ROSAction/model/API/장비실행은없고Python파싱만실행했다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M22.03 1차 독립 검수 — 콘텐츠 통과

- prompt/LoRA/import는 실습1/Q1, 가중치/KV/예산은 실습2/Q2, API시간/제어역할은 실습3/Q3에 대응한다. LoRA저랭크·양자화/KV·단위와범위/미실행조건·부분 답/오개념을전섹션재독했다.
- 독립 산술로65536/해당W의.390625%,3B4bit1.5GB≈1.396984GiB·합3GB/여유정책후잔여.2GB, 독립KV64/128/Q256KiB·Q1B8bit1GB가맞다. 생성20/2=10token/s·전체2.5/기한.5초과2s·Q30/3=10/전체4s를확인했다. weights만으로peak승인·tokenrate로응답기한승인을하지않는다.
- Ollama공식Modelfile/import/generate와Transformers cache자료를직접대조했다. SYSTEM/PARAMETER변경과학습·지원모델가져오기·generate duration ns/전체구간·layer/token cache의기본역할이맞다. 기존5.7/chapter11LoRA·6.2/chapter6오차진단의실제지연/지터내용연결도유효하다.
- 내용7항목 모두2점. 승인 SHA256: `8140a568eb21ba832031a929b47d1c7e0d24f2402c733f471cea57acf7250ee7`. 모델다운로드/서버시작/추론/파인튜닝은없고CLI버전확인과합성예산이다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M22.04 독립 검수·개념 귀속 보완 재검수 — 콘텐츠 통과

- 모델/멀티모달계약은 실습1/Q1, 독립4bin복원은 실습2/Q2, 생성/시각·artifact검증은 실습3/Q3에 대응한다. 최초본문/Q1의'OFT/FAST후속모델'표현은FAST를OpenVLA후속모델로오해할수있어수정요청했다. 저자README12~13에서OFT적응recipe와FAST별도actiontokenizer를직접대조했고작성자의본문/해설구분을실제확인했다.
- 독립4bin계산에서.008→.005/−3mm,clip .03→.015/−15mm,Q−.008→−.005/+3mm·범위안오차최대5mm가맞다. flow.1→.3→.5와H10마지막180ms<준비200ms·QH5마지막80<120ms가일치한다. 이tokenizer/flow가실제모델구현결과가아님을명시한다.
- OpenVLA공식README/modelcard·SmolVLA카드/current source를직접읽어원OpenVLA영상/언어→7성분행동·SmolVLA multi-image/state/lang의continuousflow구분이맞다. MITcard와README기반Llama조건·SmolApache표기를artifact별로확인할뿐허용범위판정을하지않는다. 기존5.6/chapter10·5.9/chapter13의실제구조/추론연결도맞다.
- 내용7항목 모두2점. 승인 SHA256: `fa1ae59c7f403fd47fa3f8d12263bacef361e24926197a9cf2391e629ea8f78b`. 실제모델다운로드/추론/학습/장비실행은없다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M22.05 독립 검수·표현 보완 재검수 — 콘텐츠 통과

- 지도/ID·접지는 실습1/Q1, 조건부경로/도킹은 실습2/Q2, 주행→팔의전후조건은 실습3/Q3에 대응한다. 그래프/지도·거리경로/폭필터를미집필M17/M18없이설명하고초출/부분 답·오개념을전섹션재독했다. 최초실습해설쉼표뒤공백1곳수정요청/실제반영확인했다.
- 독립 산술폭.7/.9m와닫힌직결4m제외·5/7m중조건부선택,도킹hypot(−.04,.06)=.072111m통과/yaw.15>.1초과·Q필요폭.9/7m·yaw.12초과가맞다. 원형각도경계/실제footprint/불확실성·동적장애물/정지검증을합성거리표로대체하지않는다.
- VLMaps/SayPlan저자프로젝트와Jazzy NavigateToPose공식정의를직접읽었다. 공간재구성+언어feature와계층scenegraph/기하경로·반복검증의차이,PoseStamped/feedback/result와물체작업후조건구분이맞다. 기존4.3/chapter7 TF·6.5/chapter9배포아키텍처의실제heading/의미연결도유효하다.
- 내용7항목 모두2점. 승인 SHA256: `83300147e4a546c7592154da0eb4c625f388fbfaefce58ac76299804b2777603`. 실제지도생성/Nav2/주행/팔실행은없고합성표분석이다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M22.06 1차 독립 검수 — 콘텐츠 통과

- 외부자료/권한경계는 실습1/Q1, 승인/관측·장면조건은 실습2/Q2, 중단/결과·재개근거는 실습3/Q3에 대응한다. 초출최소권한/신뢰경계·scope/만료·부분 답/오개념을전섹션재독했다. 확인주체의권한과대상·버전범위를검증하며반복확인을검사대체로쓰지않는다.
- 독립 산술승인age.600/여유.200s·관측age.150/초과.050s, v12/v13불일치·Q경계.500포함/.550은.050초과가맞다. 음수나이/다른시계·입장TTL과실행lease/deadline·새승인과낡은관측을구별한다.
- OWASP공식PromptInjection와앞서확인한ROSAction설계를대조했다. 외부이미지/웹문구를신뢰권한으로승격하지않고schema성공/모델설명과접근통제·실행결과를분리한다. cancel응답/terminal/물리정지·미상후중복재시도및실장비복구범위도정확하다. 기존6.4/chapter8감독기의실제내용과root보완계약을연결하며인증된안전제어기로과장하지않는다.
- 내용7항목 모두2점. 승인 SHA256: `a5ca679923f57721bf3642fd24870cbba92d119cbbc108971ba8a2ebe9f27313`. 실제ROS/명령/중단/장비실행은없고교육용관문/상태표분석이다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다. M19~M22총24개current source/queue SHA 전수 일치도 확인했다.

### M27.01 1차 독립 검수 — 콘텐츠 통과

- SBC/MCU와 실행 호환은 실습1/Q1, 메모리/전력·에너지 예산은 실습2/Q2, 지속 부하/측정 근거는 실습3/Q3에 대응한다. 초출 RAM/저장·MiB/MB/W/Wh와 경계·부분 답/오개념을 전 섹션 재독했다.
- 독립 산술: 동시424/예비포함488MiB·여유24/추가 후72MiB 초과, RGB921600/float32 3686400/동시4608000byte,9W/1.8A·16Wh/1.77778h가 맞다. Q2는420필요/20MiB 초과·24Wh/8W=3h, 시간 예40/65 대50ms의여유10/초과15·Q35 대30의초과5ms가 일치한다.
- Raspberry Pi 공식 하드웨어 문서의 Linux 제품군/Pico MCU 구분과 부하·열 관리/주파수 조정을 직접 확인했다. 제품별 한계/실측값을 합성 구성에 부여하지 않고 열 원인을 가설로 남긴다. 기존6.2/chapter6 정량 오차 진단의 실제 내용 연결도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `430c26530ca10915f640d729fea0c55600fc901d5eeab5b5b7c527733b3f251b`. 실물/구매/설치/배선·벤치마크는 없고 합성 예산 계산이다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M27.02 1차 독립 검수 — 콘텐츠 통과

- 原始크기/실행지원은 실습1/Q1, 양자화/보정은 실습2/Q2, batch 지연/품질은 실습3/Q3에 대응한다. 초출 scale/zero point/round/clip·범위·부분 답/오개념을 전 섹션 재독했다. 중간 반올림 입력을 제외하는 규약과 단일 변환 오차 범위를 명시한다.
- 독립 계산:천만 성분40/20/10MB·Q8/2MB, .734→37/.74/+ .006와3→127/2.54/−.46·Q−37/−.74/−.006, batch83.33/142.86개/s·지연58/48/38/28ms·기한2개누락, Q125개/s·44/34/24ms·첫1개누락이 맞다. 분류94/92%와 작업80/70%는 다른 표본/분모다.
- ONNX Runtime 공식 양자화 자료를 직접 대조했다. 정적 활성범위 보정/동적 계산·실제 커널 지원/변환비용과 가속 비보장, 보정/선택과 독립 시험의 차이가 정확하다. 기존5.10/chapter14 평가·6.2/chapter6 정량 진단의 실제 내용 연결도 맞다. 수식1개의 remark block/KaTeX 실제 검사가 통과했다.
- 내용7항목 모두2점. 승인 SHA256: `66c20f99e32064fb8be54d02f744a73916f358e28ab65fa5e8080baeadf6d792`. 실제 모델 변환/학습/추론 성능 측정은 없고 합성 산술·공식 대조다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M27.03 1차 독립 검수 — 콘텐츠 통과

- 사건 경계/ID/시계는 실습1/Q1, 직렬/병렬 시간은 실습2/Q2, 비동기·분포/계측은 실습3/Q3에 대응한다. 초출 latency/deadline·단조/원격 시계와 부분 답/오개념을 전 섹션 재독했다. 취득/적용과 실제 목표 도달의 차이를 명시한다.
- 독립 차분8/5/6/18/5/8ms 합50·기한5초과, 모델10변형 전체42·여유3ms, 병렬28/짧은 경로만 개선28/긴경로 개선20ms가 맞다. Q직렬45/초과5·병렬20, 제출1/결과13ms의 서로 다른 경계도 정확하다. 같은ID의 합과 개별stage p95합을 구별하고 전체 표본에서 분위수를 재계산한다.
- Python3.12 perf_counter·PyTorch current synchronize의 모든 stream kernel 완료 대기·ROS Clock and Time 공식 자료를 직접 대조했다. 비동기 제출·다른 작업 포함 동기화·운영 겹침 변경과 원격 counter의 기준 차이를 정확히 제한한다. 기존6.2/chapter6의 실제 경로 분해 내용도 연결된다.
- 내용7항목 모두2점. 승인 SHA256: `da1a7bcfa8da78e0d6cad7a1cd4acd3417725df8c1dc58c0659570b1d38527e7`. 실제 GPU/ROS/카메라 계측이나 최적화 성과는 없으며 합성 차분이다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M27.04 1차 독립 검수 — 콘텐츠 통과

- 주기/서비스·대기는 실습1/Q1, 사건표는 실습2/Q2, 명령/기록 의미와 압력 정책은 실습3/Q3에 대응한다. 비선점·대기슬롯1·동시 도착우선/입력종료 가정을 전부 명시하며 초출/부분 답·오개념을 재독했다.
- 독립 임시 Python 사건 모형에서 FIFO ID0/1/2/3의 완료30/60/90/120·나이30/40/50/60ms, latest ID0/1/3의완료30/60/90·나이30/40/30/ID2누락, Qlatest0/2·나이20/20을 확인했다. 입력50/서비스33.3개/s·Q100/40개/s 및 absolute최종.6 대delta누락.5rad가 맞다. 제한된 사건표를 보편 지연 상한으로 쓰지 않는다.
- Python Queue의 유한put/Full·qsize/empty 경쟁 한계와 JazzyQoS history/depth/reliability 공식 자료를 직접 대조했다. maxsize1 자체는latest교체가 아니고 미들웨어 정책이 장치/추론/기록 전체 나이를 보장하지 않음을 정확히 설명한다. 기존5.9/chapter13·6.4/chapter8의실제추론/감독계약연결도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `5223a744c6f8ec110ff2f0ab4553521ae2bad3e587fd09d94a47a26a9122a06c`. 실제 ROS/카메라/경쟁스레드 실행은 없고 합성 사건 모형만 계산했다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### 기존5장 지연 fallback 의미 후속 재승인

- 5.9.1의 늦은 결과 처리 문구를 읽었다. 사전 HOLD/STOP 계약과 제한 시간 안의 유효 절대 위치 유지 등을 구분하고, 증분/속도/토글의 반복 송신을 정지로 부르지 않는 변경이 M27.04와 5.5.3 행동 표현·5.9.5 무기한 유지 금지에 맞는다. 실제 정지/에너지 차단의 검증을 대체하지 않는 기존 경계를 유지한다. 다른 승인 부분은 불변이며5장 최종 승인 SHA를 `ef00906df80aa1ff5447cffa1967bdce09e69c97088f6900868f7aaa693e8459`로 교체한다. 실제 장비 fallback 실행 시험은 하지 않았다.

### M27.05 1차 독립 검수 — 콘텐츠 통과

- 로컬/원격 경로·관측 나이는 실습1/Q1, 묶음/출력 호환은 실습2/Q2, epoch/교체·rollback은 실습3/Q3에 대응한다. 요청/관측 ID와 신뢰된 권한·원자적 논리 선택/물리 상태의 차이 및 부분 답/오개념을 전 섹션 재독했다.
- 독립 산술로 로컬/원격 모두80ms·변형120ms/기한20초과, 적용나이80/120·Q95/초과5ms, A.4/B.8/혼용.31/차.49rad·Q.3/.7/.205rad가 일치한다. 새 봉투나 모델만의 빠른 시간으로 오래된 관측을 승인하지 않는다.
- Triton Model Repository/Model Management 공식 문서를 직접 읽어 버전 디렉터리/설정과 제어 모드별 변경 적용을 대조했다. 로봇 측 보류/기존 goal 결과·큐/EMA/상태 초기화·새 관측/epoch 검사는 별도 설계이며 서버 기능을 실행했다고 하지 않는다. rollback이 세계/파지 상태를 되돌리지 않는 설명과 기존6.5/chapter9의 실제 배포 계약 연결이 맞다.
- 내용7항목 모두2점. 승인 SHA256: `7895c9520b5d54c49b5009ac9fe3bcfcb9530bc98d45d77b2a22f6d722e32207`. 실제 서버/모델 교체·다운로드·배포는 없고 합성 구성 검토다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M27.06 1차 독립 검수 — 콘텐츠 통과

- 측정 조건/분할은 실습1/Q1, 지연/peak·품질 계산은 실습2/Q2, 공동 관문/독립 근거는 실습3/Q3에 대응한다. cold/warm/지속·nearest-rank/분모·paired 정보의 초출과 부분 답/오개념을 전 섹션 재독했다.
- 원고 Python을 직접 추출 실행해 A mean14.5/p9510/p99100/late1/20, B14.2/70/70/2/20을 확인했다. Q평균10/p905/p9555/누락10%·메모리10MiB초과, A/B여유+20/−30MiB·분류95/96%·작업90/80%·어두운80/60%와 A만 관문 통과가 맞다. 작은 합계에서 paired 우열이나 장기p99를 추정하지 않는다.
- PyTorch benchmark 공식 소스의 thread/완료 동기화 조건과 scikit 그룹 분할을 직접 확인한 근거와 일치한다. 모델forward와전체적용·조건별task/분류·선택에쓴자료와독립시험을 분리한다. 기존5.10/chapter14·6.6/chapter10의 실제 평가 설계 내용도 연결된다.
- 내용7항목 모두2점. 승인 SHA256: `9f0a7470e91d6448238843291af366d8cd356b6ec7af965f7eb0fa3612f6bd14`. 실제 모델/장치 벤치마크는 없으며 표준 Python 합성 통계만 실행했다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다. M19/M20/M21/M22/M27 총30개 current source/queue SHA 전수 일치도 확인했다.

### M30.01 독립 검수·운동 부호 보완 재검수 — 콘텐츠 통과

- 경로/가설은 실습1/Q1, 반전/토크·시간/센서 잔차는 실습2/Q2, 대안/독립 기준 비교는 실습3/Q3에 대응한다. 최초 토크 예는 α만으로 운동 방향을 알 수 없는데 운동 반대 저항이라고 해석해 보완 요청했다. 작성자가 같은 양의 축의τ/α와qdot>0·다른 항 제외를 입력으로 명시한 실제 수정본을 확인했다.
- 독립 계산: 반전 누적.02rad까지 미변화/.03첫변화, 이상 유격.02와 일치하나 실제 정확값은 미상이다. Iα=.03/잔여.05Nm·지연12/6mm·센서+2mm 및 Q12mm/순.04·잔여.06Nm가 맞다. 잔차를 순수 마찰/센서편향이나 실제 인과로 확정하지 않는다.
- MR저자8.9와 Tobin 원논문을 직접 대조했다. Thomson ball-screw 본문은 웹 timeout/직접접근 challenge로 열리지 않아 공식 검색 본문의 축방향 유격/하중반전 정의와 제품설명을 확인했다. 특정 볼스크루 정의를 모든 로봇 관절 측정법으로 확대하지 않는 서술이 적절하다. 기존6.1/chapter5·6.2/chapter6의 실제 RealityGap/정량진단 내용도 연결된다.
- 내용7항목 모두2점. 승인 SHA256: `84cb5a67e7f24dc8dc4f227e61571f1f067487481be34178c859b9430ca576c7`. 실제 장비/토크변경·원인 식별 실험은 없고 합성 잔차 계산이다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M30.02 1차 독립 검수 — 콘텐츠 통과

- 식별/랜덤화/수집의 선택은 실습1/Q1, 두계수 적합/범위는 실습2/Q2, 수집/독립 시험은 실습3/Q3에 대응한다. 양의 정상속도·다른항 제외·잔차/식별 가능성과 부분 답/오개념을 전 섹션 재독했다.
- 원고 표준 Python을 직접 추출 실행해 b=.020/c=.050·예측.130/잔차.020을 재현했다. 분모2/동일속도0의 비식별,독립 c/b 범위의ω2토크.07~.11Nm·Qb.02/c.06/예측.10Nm가 맞다. 측정속도오차/상관·검증행 선택 후 독립 시험의 한계를 명시한다.
- MIT저자 sysid를 직접 읽고 Tobin 원논문과 대조한 근거가 맞다. 적합/한단계·장기 simulation 검증과 랜덤화·실제전이를 구별하고 단위/행동계약 오류를 불확실성으로 덮지 않는다. 기존6.1/chapter5·5.4/chapter8의 실제 RealityGap/자료품질 연결도 맞다. 수식1개 remark block/KaTeX 실제 검사 통과다.
- 내용7항목 모두2점. 승인 SHA256: `d51a71bec866fc416d4f3ce1725d71340128f86843696d1ef3d47bfc52d91ff0`. 표준 Python의 합성 적합만 실행했으며 실제 장비 식별/학습·수집은 없다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M30.03 1차 독립 검수 — 콘텐츠 통과

- EMA/같은 실행시각 ensemble은 실습1/Q1, 수치/물리 단위 제한은 실습2/Q2, 교집합/경로·reset은 실습3/Q3에 대응한다. 첫 입력 초기화와 명시y0·실제관측/이전명령·각도/토크 별도 입력 및 부분 답/오개념을 전 섹션 재독했다.
- 기존 temporal_filters leaf를 직접 CPU 호출해 첫입력0 뒤EMA.25/.4375와 최신가중.6을 확인했다. oldest.342857/균등.466667·Q.4/.6, .01rad변화→.41→.405·토크.5Nm,이전.42의[.41,.43]와상한.405 교집합 없음·Q EMA.4/최종.225/토크.4가 맞다. 비볼록 원판의 두 끝점/평균 반례도 정확하다.
- 공식 LeRobot/original ACT의 oldest-index 방향은 앞서 직접 대조한 소스와 맞고 κln2는 교육용임을 명시한다. 교재 leaf의 age/상대시차 최신우선과 구분하며 값0만으로 유효성을 판정하지 않는다. 기존6.3/chapter7·6.4/chapter8의 실제 안정화/감독 계약 연결도 맞다. 수식1개 remark block/KaTeX 실제 검사 통과다.
- 내용7항목 모두2점. 승인 SHA256: `8eec671052fb3c63b3f07498e56868a414d80f3f91aa061410f73d6c4c22eaca`. 교육용 CPU 필터만 호출했으며 실제 정책/모터/안전 인증은 없다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M30.04 1차 독립 검수 — 콘텐츠 통과

- watchdog/세나이·단계는 실습1/Q1, 경계/관문 계산은 실습2/Q2, 승격/미상·복구는 실습3/Q3에 대응한다. 응용 상태와 ROS API 상태·replay/shadow/실제 실행, 공통 실패와 부분 답/오개념을 전 섹션 재독했다.
- 독립 Decimal 계산에서 첫 나이.120/.180·여유/초과.030s, 별도heartbeat.010/관측.230/명령.030s·관측.130초과, Qheartbeat.150경계통과/관측.200실패/명령.020통과가 맞다. 새heartbeat/봉투가 오래된 관측을 바꾸지 않고 입장TTL은 실제 정지를 뜻하지 않는다.
- ROS 시간/managed nodes 및 ros2_control Jazzy hardware lifecycle을 직접 대조했다. inactive/요청응답을 물리정지·전원차단으로 추론하지 않고 구현/driver·별도 결과를 요구한다. shadow의 계산 통과와폐루프성과·감독의공통프로세스실패를 구별하며 기존6.4/chapter8 실제 감독 계약/복구 내용도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `4c5c98ca994a1f003d15ac5f88cd577675936aa8eaf4aac6aa23abf2d4c02797`. 실제 ROS/장비·중단/승격·안전 인증 시험은 없고 합성 상태표다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M30.05 1차 독립 검수 — 콘텐츠 통과

- trial/성공·독립성은 실습1/Q1, Wilson/층별 가중은 실습2/Q2, paired/선택 근거는 실습3/Q3에 대응한다. Bernoulli/반복표집 해석·n0/근사와 부분 답/오개념을 전 섹션 재독했다.
- 독립 Python Wilson 계산:18/20[.698962,.972134],90/100[.825633,.944771],20/20[.838870,1],Q0/10[0,.277540]가 일치했다. 층별 A90/40 대B80/30%·합계44.5/75.5%와 공통비중65/55%, paired A18/B15·불일치4/1·차15%p·Q자율75%가 맞다. 표준화 비율에 원래n을 단일 이항처럼 붙이지 않고 개별구간 중첩으로 차이를 검정하지 않는다.
- NIST 공식 Wilson/이항 구간 설명을 직접 대조했다. 동일성공확률/독립가정·근사95%와 안전확률/참p확정의 차이를 정확히 제한한다. 기존6.6/chapter10·5.10/chapter14의 실제 평가설계 연결도 맞다. 수식2개 remark block/KaTeX 실제 검사 통과다.
- 내용7항목 모두2점. 승인 SHA256: `15a869b7f97870291040319875b4a1fada272f7634e8f40a37e1d73ab7a1d8ff`. 실제 trial/성능·안전 인증 시험은 없고 합성 통계 계산이다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다.

### M30.06 1차 독립 검수 — 콘텐츠 통과

- 추적 묶음/호환은 실습1/Q1, admission/단계별 근거는 실습2/Q2, 승격/rollback·리포트는 실습3/Q3에 대응한다. provenance/예시ID·파일동일성/현재유효성의 초출·부분 답/오개념을 전 섹션 재독했다.
- 독립 Decimal 계산 관측.120/초과.020s·명령.040/여유.010, Q관측.090/여유.010·명령.020/여유.030s가 맞다. 모형18/20·shadow조건18/20의 각각90%와 실제n0미시험을 구별하고36/40실물성공으로 합치지 않는다. schemaS1/S2·통계/장착 변경의 미상도 다른 관문이다.
- SLSA v1.2 provenance와 Docker digest 공식 자료를 직접 대조했다. 작은manifest를 SLSA준수로 부르지 않고 tag/digest·host/driver·장착/현재물리상태의 재현 범위를 나눈다. 기존6.5/chapter9 배포·6.8/chapter12 포트폴리오의 실제 내용 연결도 맞다.
- 내용7항목 모두2점. 승인 SHA256: `3d57a902a6ef9011b934d15872951ad851faf9f122d26c7213797a208d416656`. 실제 배포/장비/출판 파일 생성은 없고 합성 manifest/상태표와 리포트 설계다. 임시 승인 큐 atomic 갱신 완료이며 실제 웹/registry는 루트 별도다. M19/M20/M21/M22/M27/M30 총36개 current source/queue SHA 전수 일치도 확인했다.

### M32.01 1차 독립 검수 — 콘텐츠 통과

- 미션/지도/위치와 planner/controller 계약은 실습 1/Q1, 폭·경로·동적 시간/정지는 실습 2/Q2, 감독·인계와 리포트는 실습 3/Q3에 대응한다. 미집필 M17/M18의 용어를 본문에서 설명하고, 후보 그래프·시각식·정지 가정과 판정 입력을 모두 제공한다. 부분 답과 오개념 피드백도 목표별로 확인했다.
- 독립 Decimal 계산으로 필요 폭 0.7/0.9 m, 경로 4/6 m, 교차 시각 4 s, 2 s 대기 뒤 교차점 도착 6 s/장애물 y=0.5 m, 정지 거리 0.225 m와 Q2의 0.14 m가 일치했다. 한 교차 시각의 분리만으로 전체 충돌 회피를 승인하지 않는다.
- Nav2 Jazzy의 planner/controller/Collision Monitor 공식 원문을 직접 대조했다. 경로 생성·속도 명령·인계 결과를 구별하고 hard real-time 안전 인증을 주장하지 않는다. 기존 4.3 TF2 트리 설계와 6.5 End-to-End Pick & Place 배포의 실제 heading/내용 연결이 맞다. 수식 1개는 remark block 판정과 KaTeX 검사에 통과했다.
- 내용 7항목 모두 2점. 승인 SHA256: `af00672a45cf237c2229ac754bede89dfd590c5f3b6c5307a9b05fba2d7b063b`. 합성 요구사항/계산 검토이며 실제 Nav2·배달·안전 시험은 없다. 승인 큐를 원자적으로 갱신했고 웹 통합은 루트 별도다.

### M32.02 1차 독립 검수 — 콘텐츠 통과

- 장치/관측·정책/제어 계약은 실습 1/Q1, 역투영·복원/제한·시간 관문은 실습 2/Q2, 단계별/조건별 평가는 실습 3/Q3에 대응한다. IK/FK·경로/궤적을 보충하고, 실제 팔 없이 모든 계산/미상 판정을 제공된 입력으로 완결한다. 부분 답과 대표 오개념도 개별 풀이에 있다.
- 독립 Decimal 계산으로 camera (0.08,0,0.8)→base (0.38,0,1) m, 접근 z=1.05 m, 복원 0.4→변화 제한 0.39 rad, 관측 나이 85 ms/5 ms 초과가 일치했다. 조건별 80/50%와 합계 65%, Q2의 camera (0.1,0,0.5)→base (0.4,0,0.7) m·시간 여유 20 ms도 맞다.
- SOFollower 공식 코드의 body degree/정규 범위와 별도 gripper 범위, MTC 저자 단계 계획 자료를 직접 대조했다. 가상 rad adapter와 실제 driver 계약, 점/전체 자세·위치 잔차/전체 경로·수락/유지/배치 결과를 구별한다. 기존 3.5 안전한 텔레오퍼레이션 루프·5.5 정규화와 통계·6.5 배포의 heading/내용 연결도 맞다.
- 내용 7항목 모두 2점. 승인 SHA256: `357eefa6eeadd0806f80f787b89539e9009bf2c092fa2a26143d624b71ceb6f4`. 합성 입력/산술과 문서 대조이며 실제 팔·학습/추론·실증은 없다. 승인 큐를 원자적으로 갱신했고 웹 통합은 루트 별도다.

### M32.03 1차 독립 검수 — 콘텐츠 통과

- 전체 역할/frame·시각은 실습 1/Q1, 평면 변환·공동 파지점·시차/정적 분담은 실습 2/Q2, 전체 제약/감독·평가는 실습 3/Q3에 대응한다. configuration·순차/동시 동작의 기초를 보충하고 모든 계산 입력을 제공한다. 부분 답/오개념과 미상 후 필요한 근거도 확인했다.
- 독립 NumPy 계산으로 TCP (0.9,0.4) m, 로컬 보상 (0,+0.02) m, Q2 (1,0.2) m가 맞다. 두 물체 위치 0.43/0.39 m·차이 0.04 m, 평균 후 각 접점 오차 0.02 m, 시차 6/Q8 mm와 대칭 정적 지지 5 N/토크 1 N·m도 일치한다. 좌표 보상·정적 분담을 IK/동역학·실제 유지 성과로 확대하지 않는다.
- Modern Robotics 13.5와 Mobile ALOHA 저자 자료를 직접 대조했다. 베이스/팔의 연결과 연구 사례를 합성 표와 구별하고 개별 팔의 도달/수락을 공동 강체 제약이나 동시 정지로 바꾸지 않는다. 기존 4.3 TF·5.3 데이터·6.5 배포의 heading/의미가 맞고 수식 1개는 remark block/KaTeX 검사를 통과했다.
- 내용 7항목 모두 2점. 승인 SHA256: `7979508435a8225d1e3c329ff3cfff2a3c8e2766b6e4313813a980d90a068d35`. 합성 기하/정적 계산이며 실제 협응·학습/장비 실증은 없다. 승인 큐를 원자적으로 갱신했고 웹 통합은 루트 별도다.

### M32.04 1차 독립 검수 — 콘텐츠 통과

- 상태/접촉·국소 모형은 실습 1/Q1, 피드백/포화·Euler 한 단계는 실습 2/Q2, 회복/실패·감독/범위는 실습 3/Q3에 대응한다. 미집필 보행 선수를 요구하지 않고 제목의 선택 경로인 한 축 밸런싱 모형을 식/상태·가상 입력/단위/초기값부터 설명한다. 부분 답/오개념과 추가 근거도 개별 풀이에 있다.
- 원고의 완전한 표준 Python을 직접 추출해 CPU 실행했다. d=0/1에서 raw −0.9/u −0.5·다음 각도 0.1과 속도 −0.01/+0.09가 일치했다. Q2 raw −0.85/가속 −0.3/다음 (0.06,0.07), 무포화 특성근 −2±i도 독립 계산했다. 같은 이전 상태의 명시적 Euler와 연속 LTI·포화 모형을 구별한다.
- MIT 저자 humanoids/cart-pole 원문을 직접 대조했다. 접촉 전환·국소 안정성과 전체 비선형/실제 보행을 구별하고 가상 각가속도 입력을 motor torque로 부르지 않는다. 기존 2.3 강체 역학과 시뮬레이션 시간·6.2 정량 진단·6.4 감독기의 heading/내용 연결이 맞다. 수식 2개 remark block/KaTeX 검사도 통과했다.
- 내용 7항목 모두 2점. 승인 SHA256: `43ba40d8286fa57b0e610b52b20503269cfd5f2970b393bdca9e890f82e8b970`. 합성 한 단계의 CPU 계산이며 실제 휴머노이드·밸런싱/보행·안전 실증은 없다. 승인 큐를 원자적으로 갱신했고 웹 통합은 루트 별도다.

### M32.05 1차 독립 검수 — 콘텐츠 통과

- 관찰 가능한 요구/인터페이스는 실습 1/Q1, 합성 사례/추적 행렬은 실습 2/Q2, 실패/가설·재현 패키지는 실습 3/Q3에 대응한다. R1~R4와 S1·각 입력/관찰 결과를 모두 제공해 실제 프로그램/장비 없이 예상과 주어진 동작을 비교할 수 있다. 부분 답·대표 오개념도 목표별로 확인했다.
- 독립 Decimal 계산으로 age 40/80/90 ms와 Q2 85 ms, T5의 12 mm/2 mm 초과가 맞다. T1/T3/T4 통과·T2/T5/T6 실패와 3/6=50%는 요구 시험의 일치율이며 작업 성공률이 아니다. 모든 요구에 사례가 연결된 것과 전체 조건을 검증한 것을 구별하고 추가 사례를 이미 실행했다고 쓰지 않는다.
- NASA 공식 matrix의 고유 요구 ID/출처·검증 접근과 product realization의 verification/validation·이상/수정/재검증·근거 보존을 직접 대조했다. 교육 표를 NASA 준수/인증으로 부르지 않는다. 기존 6.8 포트폴리오 패키징·6.6 평가 설계의 실제 heading/내용 연결도 맞다.
- 내용 7항목 모두 2점. 승인 SHA256: `4a4bfcee6769b414c4df8df3dfa1836a453525b91cb93b00c5ff5825391bca1e`. 합성 요구/기록의 계산과 패키지 설계이며 실제 시험·새 검증 스크립트·출판/배포 실행은 없다. 승인 큐를 원자적으로 갱신했고 웹 통합은 루트 별도다.

### M32.06 1차 독립 검수 — 콘텐츠 통과

- 범위/근거·설계 설명은 실습 1/Q1, 가중 루브릭/필수 관문은 실습 2/Q2, 동료 검토·수정/재검증·개선은 실습 3/Q3에 대응한다. 루브릭/가중치·항목 수준과 차단 결함을 사전 정의하고 점수/가상 의견을 제공해 실제 메시지나 장비 없이 판단을 완결한다. 부분 답·오개념과 종료 조건도 확인했다.
- 독립 산술로 최초 70점/최저 항목 1, 수정 85점/최저 항목 3, Q2 73.75점/최저 항목 2, 발표 시간 180초가 맞다. 총점·모든 항목·미해결 차단 결함을 별도 관문으로 유지하며 가상 점수 개선을 실제 동료 검토/실증으로 부르지 않는다.
- NASA SWE-087 공식 자료는 web fetch timeout 뒤 urllib로 원문을 직접 읽어 preparation·결함 기록/수정·follow-up을 대조했다. 자기 검토/다른 사람의 읽기/독립 실행을 구별하며 작은 활동의 NASA 준수를 주장하지 않는다. 기존 6.8 포트폴리오 패키징·6.6 평가 설계의 heading/내용 연결도 맞다.
- 내용 7항목 모두 2점. 승인 SHA256: `2da915f5956c2d1df4ca760273d711e4b52e8cef7c14b0fd7b6a5ee0c8acab2e`. 가상 발표/검토 입력과 계산이며 실제 동료 메시지·장비/배포·출판 실행은 없다. 승인 큐를 원자적으로 갱신했고 웹 최종 검수는 루트 별도다.

## 최종 콘텐츠 판정과 지문 대조

E4의 M19/M20/M21/M22/M27/M30/M32 각 6개, 총 42개 단위는 내용 7항목을 모두 2점으로 통과했다. 원고별 결함 요청과 실제 보완/재검수 근거는 위 기록에 유지한다. OpenVLA-OFT/FAST의 기술 분류, 운동 방향이 빠졌던 토크 잔차 예제, 문장 경계 공백을 보완한 고정본만 최종 승인했다. 승인 후 새 근거 없는 원고 수정은 하지 않았다.

최종 42개 topicId의 정확한 범위·중복/누락 없음과 현재 원고 SHA256을 임시 독립 승인 큐 `/tmp/e4-approved-content.json`의 42개 값과 전수 대조해 모두 일치했다. 원고의 기하/시간·통계/정책 손실·관문 계산과 실행 범위는 단위별 근거에 한정된다. 미집필 주행·계획/보행/임베디드 선수를 기본 필수로 가정하지 않으며 제공된 입력/로그·계산/표와 기초 설명으로 장비 없는 경로를 완결한다. 실제 로봇·모델 학습/추론·배포/안전 실증을 승인한 것이 아니다.

기존 교재 최종 10개 파일도 `/tmp/e4-legacy-proposed.json`의 현재 지문과 전수 일치했다. 아래 표가 이전 부분 재승인 SHA를 포함한 최종 현행 승인값이다.

| 기존 파일 | 최종 승인 SHA256 |
|---|---|
| `ebook/book/00_frontmatter/how_to_use.md` | `478bd10e127bee98fa37f37e97a20eede9197cda83a09a49be8636875df0e163` |
| `ebook/book/01_physical_ai_isaac_ros2/chapter.md` | `0658d775a58fe696d5d9a2f74b3dda996ef1d399571448a7d46067f03685f76c` |
| `ebook/book/02_physx_simulation/chapter.md` | `046ff676a51a1cf529673af29f76532f742dee148d67289c869e32a3d616dd93` |
| `ebook/book/03_so101_kinematics_teleop/chapter.md` | `2a3930847f4239da32f60dc7554f4fdf5b4197e5694eb6e86499f3bf3d6929e7` |
| `ebook/book/03_so101_kinematics_teleop/code/safe_teleop_core.py` | `e24a9c037415c93e4d37ae493de9187f55a8cf7b811bd0036b528db5913907fc` |
| `ebook/book/04_sensor_data_pipeline/chapter.md` | `9440f558163e693c71c6925d3e39f063c6ab9e1c1387a8f58a7f3f218ac4eeb6` |
| `ebook/book/05_lerobot_smolvla/chapter.md` | `ef00906df80aa1ff5447cffa1967bdce09e69c97088f6900868f7aaa693e8459` |
| `ebook/book/05_lerobot_smolvla/code/closed_loop_20hz.py` | `e90f12a72fbe41ead9ee9f068499cf50af103bd225f20154292e922bc31d5c0f` |
| `ebook/book/06_sim2real_deployment/chapter.md` | `7f6a9c5db746e01dec7de67d2b1e483052e33d0e27ca0623bf7a959415ed7533` |
| `ebook/book/06_sim2real_deployment/code/safety_supervisor.py` | `1bcf6aca1fad053dd77c2a4de567bf61796252234d8b854d16e38ad17160672a` |

기준 inventory의 book 파일 142개를 전수 대조했다. 127개는 원래 SHA256과 동일하고 15개는 baseline SHA와 현재 SHA를 함께 보존한 승인 개정 registry와 일치하며, 승인 밖 변경/누락은 0개다. 최종 10개 중 Markdown 7개의 기존 `##` 제목/순서도 baseline commit과 전수 일치했다. 기존 별도 app 승인과 웹 공개 자산의 복사/연결·현재 registry 통합 검수는 루트 소유다.

콘텐츠 검수 상태는 **42개 콘텐츠 통과·웹 최종 별도**다. 루트가 마지막 111개 공개 빌드·실제 화면 전수/저장 복원과 최종 완료 판정을 수행한다. 이 검수에서는 PDF/EPUB/Pandoc/exporter·배포 명령, 실제 외부 메시지 발송, 장비 명령/설치·모델 다운로드를 실행하지 않았고 영구 교재 검증 스크립트를 추가하지 않았다.
