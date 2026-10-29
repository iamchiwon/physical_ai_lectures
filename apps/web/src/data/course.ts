import type {
  CourseModule,
  CourseStats,
  MultipleChoiceCheck,
  ShortAnswerCheck,
} from "./types";

const mc = (
  id: string,
  question: string,
  options: string[],
  answer: number,
  explanation: string,
): MultipleChoiceCheck => ({ id, type: "multiple-choice", question, options, answer, explanation });

const sa = (
  id: string,
  question: string,
  answer: string,
  acceptedKeywords: string[],
  explanation: string,
): ShortAnswerCheck => ({ id, type: "short-answer", question, answer, acceptedKeywords, explanation });

export const courseModules: CourseModule[] = [
  {
    id: "physical-ai-foundations",
    number: 1,
    title: "Physical AI와 시뮬레이션 기반",
    summary: "Physical AI의 폐루프 관점, OpenUSD 장면 구조, ROS 2 통신 계약을 연결한다.",
    lessons: [
      {
        id: "physical-ai-loop",
        chapter: 1,
        order: 1,
        title: "상태·관측·행동으로 보는 Physical AI",
        duration: 14,
        difficulty: "입문",
        summary: "로봇이 제한된 관측으로 행동하고 그 행동이 다음 관측을 바꾸는 이유를 이해한다.",
        objectives: ["상태(state)와 관측(observation)을 구분한다.", "인지-정책-안전-행동 폐루프를 설명한다."],
        sections: [
          {
            heading: "세계의 상태와 로봇의 관측",
            body: "서랍 속 물체의 실제 자세는 상태지만 로봇은 카메라와 엔코더라는 제한된 관측만 받는다. 가림이나 센서 노이즈가 있으면 한 시점의 관측만으로 상태를 완전히 알 수 없다.",
            callout: { title: "처음 잡아야 할 구분", body: "세계에는 실제 상태가 있고 정책에는 제한된 관측만 들어온다. 이전 관측과 행동의 이력은 보이지 않는 상태를 추정하는 단서다.", tone: "concept" },
          },
          {
            heading: "폐루프가 필요한 이유",
            body: "정책의 출력은 곧바로 모터에 전달되지 않는다. 안전 필터와 저수준 제어기를 거쳐 환경을 바꾸고, 센서가 그 결과를 다시 측정한다.",
            bullets: ["인지: 원시 센서를 정책 입력으로 변환", "정책: 목표나 짧은 행동 청크 제안", "안전: 관절·속도·작업공간 제한", "피드백: 실행 결과를 다음 판단에 반영"],
          },
        ],
        quickCheck: [
          mc("c1l1q1", "카메라에서 가려진 물체의 실제 자세는 무엇에 해당하는가?", ["관측", "상태", "행동", "보상"], 1, "실제 세계에 존재하지만 센서가 모두 보지 못할 수 있는 값은 상태다."),
          sa("c1l1q2", "학습 정책의 출력을 바로 모터 명령으로 쓰면 안 되는 이유를 한 가지 쓰세요.", "물리 한계와 충돌을 보장하지 않으므로 안전 필터가 필요하다.", ["안전", "관절", "충돌", "속도", "제한"], "학습 정책은 후보 행동을 제안하지만 물리적 안전 계약은 별도 계층이 강제해야 한다."),
        ],
        keywords: ["Physical AI", "POMDP", "state", "observation", "closed loop"],
      },
      {
        id: "openusd-scene-model",
        chapter: 1,
        order: 2,
        title: "OpenUSD 장면을 비파괴적으로 구성하기",
        duration: 16,
        difficulty: "중급",
        summary: "Stage, Layer, Prim의 역할과 override 기반 실험 구성을 익힌다.",
        objectives: ["Stage·Layer·Prim의 관계를 설명한다.", "원본 자산과 실험별 변경을 분리한다."],
        sections: [
          { heading: "장면 그래프의 세 단위", body: "Stage는 합성된 장면 전체, Layer는 의견(opinion)을 담는 파일 단위, Prim은 장면 안의 주소 가능한 객체다.", bullets: ["Prim path는 안정적인 식별 계약이다.", "Attribute는 값, Relationship은 다른 Prim과의 연결을 표현한다."] },
          { heading: "원본을 덮어쓰지 않는 실험", body: "로봇 자산, 작업 환경, 실험 override를 서로 다른 Layer로 나누면 동일 자산으로 여러 조건을 재현할 수 있다.", callout: { title: "실무 규칙", body: "실험 스크립트가 원본 USD를 직접 수정하게 두지 말고 변경 의도를 별도 Layer에 기록한다.", tone: "tip" } },
        ],
        quickCheck: [
          mc("c1l2q1", "실험마다 물체 위치만 바꿀 때 가장 적절한 방법은?", ["원본 자산을 매번 수정", "별도 override Layer 작성", "모든 Prim 삭제 후 재생성", "렌더 이미지에 좌표 기록"], 1, "별도 Layer는 원본을 보존하면서 변경 이력과 재현성을 제공한다."),
          sa("c1l2q2", "Stage와 Prim의 차이를 짧게 설명하세요.", "Stage는 합성된 장면 전체이고 Prim은 장면 안의 개별 객체다.", ["장면", "전체", "객체", "노드"], "Stage는 컨테이너/결과이고 Prim은 그 안에서 경로로 식별되는 구성 요소다."),
        ],
        keywords: ["OpenUSD", "Stage", "Layer", "Prim", "override"],
      },
      {
        id: "ros2-interface-contracts",
        chapter: 1,
        order: 3,
        title: "ROS 2 인터페이스와 QoS 계약",
        duration: 15,
        difficulty: "입문",
        summary: "Topic, Service, Action을 데이터 흐름에 맞게 선택하고 QoS를 계약으로 다룬다.",
        objectives: ["세 통신 방식을 구분한다.", "publisher와 subscriber의 QoS 호환성을 점검한다."],
        sections: [
          { heading: "흐름으로 인터페이스 고르기", bullets: ["Topic: 지속적인 비동기 데이터 스트림", "Service: 짧은 요청-응답", "Action: 오래 걸리며 피드백·취소가 필요한 목표"] },
          { heading: "QoS는 튜닝값이 아니라 계약", body: "Reliability, durability, history가 서로 맞지 않으면 노드가 실행 중이어도 데이터가 연결되지 않을 수 있다.", callout: { title: "센서 데이터 힌트", body: "고주기 카메라에서는 오래된 프레임을 완벽히 재전송하는 것보다 최신 프레임을 받는 편이 유용할 수 있다.", tone: "tip" } },
        ],
        quickCheck: [
          mc("c1l3q1", "진행률 표시와 취소가 필요한 20초 Pick-and-place에 적절한 것은?", ["Topic", "Service", "Action", "Parameter"], 2, "Action은 goal, feedback, result, cancel 의미를 함께 제공한다."),
          mc("c1l3q2", "30 fps 카메라 영상에 가장 자연스러운 인터페이스는?", ["Topic", "Service", "Action", "Lifecycle"], 0, "카메라 영상은 지속적으로 발생하는 비동기 스트림이다."),
        ],
        keywords: ["ROS 2", "Topic", "Service", "Action", "QoS"],
      },
    ],
  },
  {
    id: "physx-simulation",
    number: 2,
    title: "PhysX 강체 물리 시뮬레이션",
    summary: "좌표변환, 이산 시간 물리, 충돌과 물리 파라미터 튜닝을 실험 관점으로 익힌다.",
    lessons: [
      {
        id: "frames-and-transforms",
        chapter: 2,
        order: 1,
        title: "좌표계와 동차 변환 읽기",
        duration: 18,
        difficulty: "중급",
        summary: "변환의 방향과 곱셈 순서를 문장처럼 읽어 프레임 오류를 줄인다.",
        objectives: ["A_from_B 변환의 의미를 설명한다.", "변환 체인을 오른쪽부터 적용한다."],
        sections: [
          { heading: "pose는 위치와 방향의 쌍", body: "동차 변환은 회전 R과 이동 t를 하나의 4×4 행렬로 묶는다. 이름은 target_from_source처럼 방향이 드러나야 한다." },
          { heading: "점에 가까운 변환부터", body: "world_from_table · table_from_object · p_object는 Object 점을 먼저 Table로, 그다음 World로 옮긴다.", callout: { title: "첨자 검사법", body: "인접한 source와 target 프레임 이름이 이어지는지 확인하면 잘못된 곱셈 순서를 빠르게 찾을 수 있다.", tone: "concept" } },
        ],
        quickCheck: [
          mc("c2l1q1", "world_from_camera가 있을 때 월드 점을 카메라 좌표로 옮기려면?", ["그대로 곱한다", "역변환을 사용한다", "전치만 한다", "이동을 제거한다"], 1, "주어진 변환의 방향과 필요한 좌표 표현의 방향이 반대이므로 역변환이 필요하다."),
          sa("c2l1q2", "변환 체인을 어느 쪽부터 적용하는지 쓰세요.", "점 또는 벡터에 가장 가까운 오른쪽 변환부터 적용한다.", ["오른쪽", "가까운"], "행렬 곱 표기에서는 오른쪽 연산이 먼저 적용된다."),
        ],
        keywords: ["frame", "pose", "homogeneous transform", "quaternion"],
      },
      {
        id: "physics-time-and-stability",
        chapter: 2,
        order: 2,
        title: "Physics step과 solver 안정성",
        duration: 17,
        difficulty: "중급",
        summary: "렌더 주기와 물리 주기를 구분하고 불안정 접촉을 체계적으로 진단한다.",
        objectives: ["physics step과 render frame을 구분한다.", "solver iteration보다 먼저 볼 원인을 찾는다."],
        sections: [
          { heading: "이산 시간으로 움직이는 세계", body: "시뮬레이터는 연속 운동을 작은 Δt 단위로 적분한다. 작은 step은 빠른 접촉을 더 잘 포착하지만 계산량이 늘어난다." },
          { heading: "iteration만 높이지 않기", bullets: ["충돌 형상이 지나치게 복잡한가?", "질량비가 비현실적으로 큰가?", "controller gain이나 stiffness가 과도한가?", "매 frame pose를 순간이동시키고 있지 않은가?"], callout: { title: "증상과 원인을 분리", body: "접촉 폭발은 solver 부족이 아니라 잘못된 모델이나 제어 입력의 결과일 수 있다.", tone: "warning" } },
        ],
        quickCheck: [
          mc("c2l2q1", "빠른 물체가 얇은 벽을 통과할 때 먼저 관련 있는 주기는?", ["UI refresh", "render frame", "physics step", "로그 저장 주기"], 2, "충돌 판정은 물리 step에서 일어난다."),
          sa("c2l2q2", "solver iteration을 늘리기 전에 확인할 항목 한 가지를 쓰세요.", "질량비, 충돌 형상, contact offset, controller gain 또는 순간이동을 확인한다.", ["질량", "충돌", "contact", "gain", "stiffness", "순간이동"], "모델과 입력이 비현실적이면 반복 횟수만으로 근본 문제가 해결되지 않는다."),
        ],
        keywords: ["PhysX", "timestep", "solver", "stability", "rigid body"],
      },
      {
        id: "collision-and-material-tuning",
        chapter: 2,
        order: 3,
        title: "충돌·마찰 파라미터 튜닝",
        duration: 19,
        difficulty: "심화",
        summary: "visual mesh와 collision proxy를 분리하고 측정 가능한 실험으로 물성을 맞춘다.",
        objectives: ["충돌 근사 선택 기준을 말한다.", "한 번에 하나의 파라미터만 바꾸는 실험을 설계한다."],
        sections: [
          { heading: "보이는 형상과 부딪히는 형상", body: "고해상도 visual mesh를 그대로 충돌에 쓰면 계산 비용과 불안정성이 커진다. primitive, convex hull, decomposition을 목적에 맞게 선택한다." },
          { heading: "관찰량부터 고정", bullets: ["기울기에서 미끄러지기 시작하는 임계각", "낙하 후 반발 높이", "그리퍼 접촉 성공률", "penetration과 physics step time"], callout: { title: "튜닝 원칙", body: "seed와 초기조건을 고정하고 한 번에 한 변수만 바꿔야 원인과 결과를 연결할 수 있다.", tone: "tip" } },
        ],
        quickCheck: [
          mc("c2l3q1", "정교한 시각 메시를 충돌 형상으로 그대로 쓰는 주된 문제는?", ["색상이 바뀐다", "계산량과 접촉 불안정성이 커진다", "질량이 0이 된다", "카메라가 멈춘다"], 1, "충돌 계산에는 목적에 맞는 단순 proxy가 보통 더 안정적이다."),
          sa("c2l3q2", "마찰 튜닝에서 한 번에 여러 값을 바꾸면 안 되는 이유는?", "어떤 변경이 결과를 만들었는지 원인을 분리할 수 없기 때문이다.", ["원인", "분리", "인과", "비교"], "통제 실험은 파라미터와 관찰량의 관계를 식별하기 위한 기본 조건이다."),
        ],
        keywords: ["collision proxy", "CCD", "friction", "material", "parameter tuning"],
      },
    ],
  },
  {
    id: "so101-teleoperation",
    number: 3,
    title: "SO-101 기구학과 텔레오퍼레이션",
    summary: "기구학 모델, DLS 역기구학, Leader-Follower 안전 계약을 연결한다.",
    lessons: [
      {
        id: "kinematic-model-and-fk",
        chapter: 3,
        order: 1,
        title: "URDF에서 순기구학까지",
        duration: 18,
        difficulty: "중급",
        summary: "링크·관절·구동기를 구분하고 변환 체인으로 엔드이펙터 자세를 구한다.",
        objectives: ["URDF joint의 핵심 필드를 찾는다.", "관절 순서가 FK 결과에 미치는 영향을 설명한다."],
        sections: [
          { heading: "세 개념을 섞지 않기", bullets: ["Link: 강체 좌표계와 형상", "Joint: 두 링크 사이 운동 제약", "Actuator: 명령을 물리 운동으로 만드는 구동 계층"] },
          { heading: "순기구학은 순서가 모델", body: "베이스에서 엔드이펙터까지 각 관절 변환을 순서대로 곱한다. 행렬 곱은 교환되지 않으므로 관절 순서나 축 부호가 달라지면 결과가 달라진다." },
        ],
        quickCheck: [
          mc("c3l1q1", "URDF에서 회전 관절 방향을 결정하는 필드는?", ["color", "axis", "material", "mesh scale만"], 1, "joint axis가 양의 관절 변화가 만드는 회전 방향을 정의한다."),
          sa("c3l1q2", "관절 변환의 곱 순서를 바꿀 수 없는 이유는?", "회전과 이동 행렬의 곱은 일반적으로 교환법칙이 성립하지 않기 때문이다.", ["교환", "순서", "행렬"], "기구 체인의 순서 자체가 로봇 구조를 표현한다."),
        ],
        keywords: ["SO-101", "URDF", "forward kinematics", "joint", "link"],
      },
      {
        id: "dls-inverse-kinematics",
        chapter: 3,
        order: 2,
        title: "DLS 역기구학의 직관",
        duration: 20,
        difficulty: "심화",
        summary: "특이점에서 관절 증분이 폭주하는 이유와 감쇠 λ의 역할을 이해한다.",
        objectives: ["자코비안이 작업공간 변화와 관절 변화를 연결함을 설명한다.", "감쇠와 추종 오차의 trade-off를 말한다."],
        sections: [
          { heading: "선형화된 작은 움직임", body: "자코비안 J(q)는 작은 관절 변화 Δq를 엔드이펙터 변화 Δx로 근사한다. 특이점에서는 어떤 방향의 움직임을 만들기 위해 매우 큰 Δq가 필요할 수 있다." },
          { heading: "λ는 브레이크", body: "Damped Least Squares의 λ는 관절 증분 폭주를 억제한다. λ가 크면 안정적이지만 목표 추종 오차가 늘 수 있다.", callout: { title: "정확도 설정이 아니다", body: "λ는 추종 오차와 관절 움직임 사이의 절충값이다. step clamp와 joint limit도 함께 필요하다.", tone: "concept" } },
        ],
        quickCheck: [
          mc("c3l2q1", "DLS의 λ를 크게 하면 일반적으로 어떻게 되는가?", ["관절 변화와 오차가 모두 0", "관절 변화는 작아지고 추종 오차는 늘 수 있음", "항상 더 빨리 수렴", "자코비안이 사라짐"], 1, "감쇠는 안정성을 높이지만 적극적인 추종을 줄인다."),
          sa("c3l2q2", "5-DoF 팔로 모든 6차원 pose 속도를 독립적으로 만들기 어려운 이유는?", "자코비안 rank가 최대 5여서 6차원 출력 공간 전체를 span할 수 없기 때문이다.", ["rank", "5", "6", "자유도"], "입력 자유도보다 독립 출력 차원이 더 크면 모든 목표를 동시에 만족시킬 수 없다."),
        ],
        keywords: ["Jacobian", "DLS", "inverse kinematics", "singularity", "damping"],
      },
      {
        id: "safe-leader-follower",
        chapter: 3,
        order: 3,
        title: "안전한 Leader-Follower 루프",
        duration: 17,
        difficulty: "중급",
        summary: "캘리브레이션 변환, 첫 프레임 정렬, watchdog으로 안전한 텔레오퍼레이션을 구성한다.",
        objectives: ["부호·순열·오프셋 변환을 구분한다.", "오래된 명령에 대한 안전 상태를 설계한다."],
        sections: [
          { heading: "값을 그대로 복사하지 않기", body: "같은 관절 이름이어도 장착 방향, 영점, 표현 범위가 다를 수 있다. Leader raw 값은 calibration, 부호/순열, offset을 거쳐 Follower 목표가 된다." },
          { heading: "첫 프레임과 오래된 프레임", bullets: ["Follower를 Leader 첫 자세로 제한 속도 정렬", "timestamp freshness 검사", "joint/velocity limit 적용", "timeout이면 현재 측정 자세 유지 또는 정지"], callout: { title: "watchdog", body: "마지막 명령을 무한히 반복하지 않는다. 새 입력이 없다는 사실 자체가 안전 상태 전이 조건이다.", tone: "warning" } },
        ],
        quickCheck: [
          mc("c3l3q1", "한 관절의 회전 방향이 반대일 때 우선 확인할 것은?", ["카메라 해상도", "부호·순열 변환", "ROS domain id", "렌더 재질"], 1, "관절 배열의 부호와 순서를 명시적으로 매핑해야 한다."),
          mc("c3l3q2", "Leader 메시지가 timeout을 넘겼을 때 적절한 동작은?", ["마지막 명령 계속 실행", "속도 두 배", "명령 거부 후 HOLD/정지", "캘리브레이션 삭제"], 2, "오래된 명령은 현재 상태를 반영하지 않으므로 안전 상태로 전환한다."),
        ],
        keywords: ["teleoperation", "Leader-Follower", "calibration", "watchdog", "JointState"],
      },
    ],
  },
  {
    id: "sensor-data-pipeline",
    number: 4,
    title: "멀티모달 센서 정합",
    summary: "카메라 기하, TF2, 시간 정합과 원본 기록으로 학습 데이터의 의미를 보존한다.",
    lessons: [
      {
        id: "camera-geometry",
        chapter: 4,
        order: 1,
        title: "카메라 내부·외부 파라미터",
        duration: 18,
        difficulty: "중급",
        summary: "픽셀과 광선의 관계, 카메라와 월드의 관계를 서로 다른 문제로 다룬다.",
        objectives: ["intrinsic K와 extrinsic [R|t]를 구분한다.", "depth 정의에 따라 역투영 결과가 달라짐을 안다."],
        sections: [
          { heading: "두 가지 질문", body: "내부 파라미터 K는 '픽셀이 어떤 광선인가'에 답하고 외부 파라미터 [R|t]는 '그 광선이 월드에서 어디를 향하는가'에 답한다.", callout: { title: "무엇을 다시 측정할까?", body: "해상도나 crop이 바뀌면 K를, 카메라 마운트를 다시 조립했다면 extrinsic을 먼저 의심한다.", tone: "concept" } },
          { heading: "depth의 뜻 확인", body: "센서 depth가 optical axis 방향 Z인지 카메라 중심부터의 Euclidean range인지 확인해야 한다. 화면 가장자리에서는 두 값이 다르다." },
        ],
        quickCheck: [
          mc("c4l1q1", "카메라 마운트를 다시 조립한 뒤 우선 재측정할 것은?", ["외부 파라미터", "이미지 파일명", "joint limit", "QoS depth"], 0, "카메라가 로봇/월드에 놓인 자세가 바뀌었으므로 extrinsic이 달라진다."),
          sa("c4l1q2", "내부 파라미터 K가 답하는 질문을 쓰세요.", "각 픽셀이 카메라 좌표에서 어떤 광선에 대응하는가이다.", ["픽셀", "광선", "초점", "주점"], "K는 초점거리와 주점 등 카메라 내부 투영 특성을 담는다."),
        ],
        keywords: ["camera intrinsic", "extrinsic", "projection", "depth", "OpenCV"],
      },
      {
        id: "tf2-frame-contract",
        chapter: 4,
        order: 2,
        title: "TF2 프레임 계약과 timestamp",
        duration: 16,
        difficulty: "중급",
        summary: "ROS body/optical frame 관례와 시간에 따른 TF 조회를 안전하게 다룬다.",
        objectives: ["TF 트리의 단일 parent 원칙을 설명한다.", "측정 시각의 transform을 조회한다."],
        sections: [
          { heading: "축 이름을 추측하지 않기", body: "ROS body frame은 x-forward, y-left, z-up이고 optical frame은 z-forward, x-right, y-down이다. 축 swap을 이름 없는 코드로 숨기지 않는다." },
          { heading: "현재 TF가 아니라 측정 시각 TF", body: "움직이는 로봇에서는 이미지가 촬영된 시각의 카메라 pose를 써야 한다. 최신 TF를 쓰면 시간 오차가 공간 오차로 바뀐다.", bullets: ["각 child frame은 parent 하나", "source와 target이 드러나는 이름", "lookup timeout과 extrapolation 오류 기록"] },
        ],
        quickCheck: [
          mc("c4l2q1", "움직이는 카메라 영상의 월드 투영에 쓸 TF 시각은?", ["프로그램 시작 시각", "이미지 측정 timestamp", "항상 현재 시각", "파일 저장 시각"], 1, "센서가 관측한 물리 상태와 같은 시각의 자세가 필요하다."),
          sa("c4l2q2", "한 child frame에 parent가 두 개면 안 되는 이유는?", "같은 프레임의 월드 자세가 두 경로로 정의되어 모순이나 순환이 생길 수 있기 때문이다.", ["모순", "두 경로", "트리", "순환"], "TF는 유일한 변환 경로를 갖는 트리 계약을 사용한다."),
        ],
        keywords: ["TF2", "frame", "optical frame", "timestamp", "REP 103"],
      },
      {
        id: "multirate-alignment",
        chapter: 4,
        order: 3,
        title: "멀티레이트 센서 시간 정합",
        duration: 19,
        difficulty: "심화",
        summary: "ApproximateTime과 보간의 차이를 이해하고 데이터 누출 없는 정렬을 설계한다.",
        objectives: ["측정·수신·처리 시각을 구분한다.", "실시간과 오프라인 보간의 차이를 설명한다."],
        sections: [
          { heading: "가까운 표본과 같은 시각의 값", body: "ApproximateTime은 허용 범위 안에서 가까운 메시지를 짝짓는다. 보간은 이미지 시각 양쪽의 관절 표본으로 같은 시각의 상태를 추정한다." },
          { heading: "실시간의 제약", body: "실시간 양방향 보간은 미래 표본을 기다리는 만큼 latency를 더한다. 오프라인에서는 양쪽 표본을 쓸 수 있지만 미래 행동이 학습 입력에 섞이지 않게 해야 한다.", callout: { title: "slop의 함정", body: "slop을 크게 하면 callback은 늘지만 서로 다른 물리 시각을 한 쌍으로 묶어 공간 정합 오차를 숨길 수 있다.", tone: "warning" } },
        ],
        quickCheck: [
          mc("c4l3q1", "실시간에서 이미지 뒤의 관절 표본을 기다려 보간할 때 생기는 비용은?", ["해상도 증가", "추가 지연", "마찰 감소", "TF parent 증가"], 1, "미래 표본이 도착할 때까지 기다려야 하므로 latency가 추가된다."),
          sa("c4l3q2", "slop을 지나치게 크게 하면 왜 데이터 품질이 나빠질 수 있나요?", "서로 다른 물리 시각의 센서 값을 한 쌍으로 묶기 때문이다.", ["다른", "시각", "오차", "짝"], "pair 수는 늘지만 시간 차이가 공간 오차로 나타날 수 있다."),
        ],
        keywords: ["ApproximateTime", "interpolation", "MCAP", "rosbag2", "data alignment"],
      },
    ],
  },
  {
    id: "lerobot-smolvla",
    number: 5,
    title: "LeRobot Dataset과 SmolVLA",
    summary: "모방학습 데이터, 정책 구조, LoRA 파인튜닝과 안전한 폐루프 추론을 익힌다.",
    lessons: [
      {
        id: "behavior-cloning-data",
        chapter: 5,
        order: 1,
        title: "행동 복제와 복구 데이터",
        duration: 17,
        difficulty: "중급",
        summary: "behavior cloning의 covariate shift를 이해하고 복구 가능한 데이터를 설계한다.",
        objectives: ["훈련과 배포의 관측 분포 차이를 설명한다.", "성공 궤적 외 복구 데이터의 가치를 말한다."],
        sections: [
          { heading: "작은 오차가 낯선 관측을 만든다", body: "전문가의 정상 경로만 학습한 정책이 배포 중 몇 mm 빗맞히면 훈련에서 드문 장면으로 이동한다. 낯선 장면의 다음 오차가 더 낯선 관측을 만든다." },
          { heading: "데이터 수집의 목표", bullets: ["시작 pose와 조명 다양화", "실패 직전과 실패 상태 구분", "살짝 어긋난 상태에서 돌아오는 recovery 예시", "closed-loop 실패 분포를 다음 수집 round에 반영"], callout: { title: "개수보다 분포", body: "성공 시연 수만 늘리지 말고 정책이 실제로 방문할 상태를 데이터에 포함한다.", tone: "concept" } },
        ],
        quickCheck: [
          mc("c5l1q1", "covariate shift를 줄이는 데 가장 직접적인 데이터는?", ["같은 성공 영상 복제", "오류 상태에서 정상으로 돌아오는 시연", "더 긴 파일명", "빈 episode"], 1, "복구 시연은 정책이 배포 중 만날 수 있는 이탈 상태를 포함한다."),
          sa("c5l1q2", "훈련 분포와 배포 분포가 달라지는 핵심 이유는?", "배포에서는 모델 자신의 행동이 다음 관측을 만들기 때문이다.", ["자신", "행동", "다음 관측", "정책"], "폐루프에서는 모델 오차가 이후 입력 분포까지 바꾼다."),
        ],
        keywords: ["behavior cloning", "covariate shift", "recovery", "demonstration"],
      },
      {
        id: "dataset-and-finetuning",
        chapter: 5,
        order: 2,
        title: "LeRobotDataset과 LoRA 파인튜닝",
        duration: 21,
        difficulty: "심화",
        summary: "feature schema와 episode 경계를 고정하고 LoRA의 비용·표현력 trade-off를 이해한다.",
        objectives: ["dataset schema의 action 의미를 명시한다.", "LoRA rank와 alpha의 역할을 구분한다."],
        sections: [
          { heading: "데이터셋은 파일 묶음이 아니라 계약", bullets: ["feature 이름·shape·dtype·unit", "action이 absolute인지 delta인지", "timestamp 정렬 정책", "episode 경계와 train/validation split", "finalize로 metadata와 index 완성"] },
          { heading: "저랭크 업데이트", body: "LoRA는 pretrained weight를 고정하고 작은 저랭크 행렬을 학습한다. rank가 높으면 표현력이 커질 수 있지만 메모리와 파라미터 수도 늘어난다.", callout: { title: "비교 기준", body: "trainable/total parameter와 task success를 함께 기록하고 full fine-tuning baseline과 비교한다.", tone: "tip" } },
        ],
        quickCheck: [
          mc("c5l2q1", "action schema에서 반드시 명시해야 할 정보는?", ["배경색만", "단위와 absolute/delta 의미", "GPU 이름만", "작성자 닉네임"], 1, "같은 숫자 배열도 단위와 의미가 다르면 호환되지 않는다."),
          mc("c5l2q2", "LoRA rank를 높일 때 일반적으로 증가하는 것은?", ["카메라 fps만", "업데이트 표현력과 학습 파라미터", "로봇 자유도", "dataset episode 수"], 1, "rank는 adapter의 용량과 비용을 함께 바꾼다."),
        ],
        keywords: ["LeRobotDataset", "schema", "SmolVLA", "LoRA", "fine-tuning"],
      },
      {
        id: "closed-loop-inference",
        chapter: 5,
        order: 3,
        title: "Action chunk와 20 Hz 폐루프",
        duration: 19,
        difficulty: "심화",
        summary: "action chunk를 재계획하고 temporal ensemble 뒤에도 안전 검사를 유지한다.",
        objectives: ["chunk size와 execution horizon을 구분한다.", "부드러운 출력과 안전한 출력의 차이를 설명한다."],
        sections: [
          { heading: "예측 길이와 실행 길이", body: "정책은 미래 H개 행동을 예측해도 그중 h개만 실행한 뒤 새 관측으로 재계획할 수 있다. h가 작을수록 폐루프성이 높지만 추론 부하가 커진다." },
          { heading: "평균화 뒤에도 안전 필터", body: "Temporal ensembling은 여러 chunk의 현재 행동 제안을 평균해 불연속을 줄인다. 그러나 관절 한계, 속도, 충돌, timestamp freshness를 보장하지 않는다.", bullets: ["schema·unit·finite 검사", "stale proposal 제거", "joint/workspace limit", "watchdog heartbeat"] },
        ],
        quickCheck: [
          mc("c5l3q1", "Temporal ensembling 후 생략할 수 없는 것은?", ["안전 한계 검사", "모든 timestamp", "관측 입력", "정책 모델"], 0, "평균화는 부드러움만 개선하며 물리 한계를 보장하지 않는다."),
          sa("c5l3q2", "값과 단위가 맞아도 오래된 action을 버려야 하는 이유는?", "현재 관측과 로봇 상태를 반영하지 않은 명령이기 때문이다.", ["현재", "상태", "관측", "오래"], "명령의 의미에는 값뿐 아니라 source timestamp freshness도 포함된다."),
        ],
        keywords: ["action chunk", "temporal ensembling", "closed loop", "watchdog", "latency"],
      },
    ],
  },
  {
    id: "sim2real-deployment",
    number: 6,
    title: "Sim2Real 배포와 실증",
    summary: "Reality Gap을 측정하고 단계적 승격, 안전 감독, 통계적 평가로 실물 배포를 완성한다.",
    lessons: [
      {
        id: "reality-gap-diagnostics",
        chapter: 6,
        order: 1,
        title: "Reality Gap을 원인 지도로 바꾸기",
        duration: 18,
        difficulty: "중급",
        summary: "성공률 하나가 아니라 시각·기하·동역학·구동·시간 오차로 진단한다.",
        objectives: ["Reality Gap 원인을 범주화한다.", "한 번에 한 범주를 바꾸는 진단 실험을 설계한다."],
        sections: [
          { heading: "하나의 점수로는 고칠 수 없다", body: "실물 성공률 저하를 관측, 명령 전달, 물리 반응 경로로 나눈다. 영상 위치는 맞지만 그리퍼가 늦게 닫힌다면 시각 랜덤화보다 지연과 구동을 측정해야 한다." },
          { heading: "측정 가능한 원인", bullets: ["시각: 조도·노출·색", "기하: intrinsic/extrinsic·프레임", "동역학: 질량·마찰·유연성", "구동: backlash·deadband", "시간: p50/p95/p99 latency와 jitter"], callout: { title: "진단 원칙", body: "한 번에 한 범주만 바꾸고 실패 로그를 남겨 원인과 처방을 연결한다.", tone: "concept" } },
        ],
        quickCheck: [
          mc("c6l1q1", "물체 위치 인식은 맞지만 그리퍼가 늦게 닫힐 때 먼저 볼 것은?", ["배경 texture만", "지연과 구동 경로", "LoRA rank만", "USD 색상"], 1, "관측보다 명령 전달과 구동 응답의 시간 경로가 의심된다."),
          sa("c6l1q2", "여러 파라미터를 한 번에 바꾸지 않는 이유는?", "실패 원인과 개선 효과를 분리해 식별하기 위해서다.", ["원인", "분리", "식별", "인과"], "통제된 변경이 있어야 관찰된 차이를 특정 원인과 연결할 수 있다."),
        ],
        keywords: ["Sim2Real", "Reality Gap", "latency", "backlash", "diagnostics"],
      },
      {
        id: "safety-supervisor",
        chapter: 6,
        order: 2,
        title: "단계적 승격과 안전 감독기",
        duration: 18,
        difficulty: "심화",
        summary: "dry-run부터 정상 운전까지 검증 증거에 따라 권한을 높이고 큰 위반은 거부한다.",
        objectives: ["승격 상태 머신을 설명한다.", "clamp와 HOLD를 상황에 맞게 선택한다."],
        sections: [
          { heading: "권한은 검증 뒤에", bullets: ["Dry-run: 명령을 기록만 함", "저속: 제한된 속도·작업공간", "제한 작업: 물체·조건을 좁혀 실행", "정상 운전: 승인된 계약 안에서 실행"] },
          { heading: "큰 위반은 숨기지 않기", body: "작업공간을 크게 벗어난 목표를 단순 clamp하면 정책 의도와 다른 경로가 생긴다. 명령을 거부하고 HOLD로 전환해 원인을 확인한다.", callout: { title: "재승격 조건", body: "정책, calibration, 안전 설정의 hash가 바뀌면 검증했던 계약도 바뀐다. 낮은 단계부터 다시 승인한다.", tone: "warning" } },
        ],
        quickCheck: [
          mc("c6l2q1", "목표가 작업공간을 크게 벗어났을 때 권장 동작은?", ["무조건 clamp 후 실행", "거부하고 HOLD", "속도 증가", "로그 삭제"], 1, "큰 위반을 clamp하면 의도하지 않은 경로를 만들 수 있다."),
          mc("c6l2q2", "calibration hash가 바뀌면 기존 승격 상태는?", ["그대로 유지", "낮은 단계에서 재검증", "항상 삭제만", "카메라만 재시작"], 1, "검증 대상 시스템 계약이 달라졌으므로 재승격이 필요하다."),
        ],
        keywords: ["safety supervisor", "HOLD", "workspace guard", "promotion", "hash"],
      },
      {
        id: "evaluation-and-evidence",
        chapter: 6,
        order: 3,
        title: "성공률 평가와 실증 패키지",
        duration: 20,
        difficulty: "심화",
        summary: "성공 정의, Wilson 신뢰구간, 층화 평가로 재현 가능한 실증 결과를 만든다.",
        objectives: ["실험 전 성공 기준을 고정한다.", "표본 수와 불확실성을 함께 보고한다."],
        sections: [
          { heading: "성공을 영상 인상으로 판단하지 않기", bullets: ["목표 영역 안에 완전히 놓임", "제한 시간 내 완료", "joint/workspace 위반 없음", "사람 개입·E-stop은 실패", "부분 성공은 별도 지표"] },
          { heading: "90%라는 숫자 뒤의 불확실성", body: "10회 중 9회와 100회 중 90회는 같은 점추정치지만 확신은 다르다. 작은 표본에서는 Wilson 구간을 함께 보고 조건별로 성공률을 층화한다.", callout: { title: "포트폴리오 증거", body: "코드·config hash, 원시 로그, 실패 사례, 환경 조건, 재현 명령을 함께 묶어야 결과가 검토 가능하다.", tone: "tip" } },
        ],
        quickCheck: [
          mc("c6l3q1", "성공률과 함께 반드시 보고할 정보로 가장 적절한 것은?", ["로봇 사진만", "표본 수와 신뢰구간", "평균 성공 영상", "작성자 선호"], 1, "점추정치만으로는 불확실성과 재현성을 판단하기 어렵다."),
          sa("c6l3q2", "조건을 층화해 평가하는 이유는?", "조명·위치·물체 조건별 실패가 전체 평균에 가려지는 것을 막기 위해서다.", ["조건", "평균", "실패", "가려"], "전체 평균이 같아도 특정 조건에서만 심각한 실패가 있을 수 있다."),
        ],
        keywords: ["evaluation", "Wilson interval", "stratified test", "evidence", "portfolio"],
      },
    ],
  },
];

export const allLessons = courseModules.flatMap((module) => module.lessons);

export function getLessonById(id: string) {
  return allLessons.find((lesson) => lesson.id === id);
}

export function getModuleByLessonId(id: string) {
  return courseModules.find((module) => module.lessons.some((lesson) => lesson.id === id));
}

export function getAdjacentLessons(id: string) {
  const index = allLessons.findIndex((lesson) => lesson.id === id);
  if (index < 0) return { previous: undefined, next: undefined };
  return {
    previous: index > 0 ? allLessons[index - 1] : undefined,
    next: index < allLessons.length - 1 ? allLessons[index + 1] : undefined,
  };
}

export function getCourseStats(): CourseStats {
  return {
    moduleCount: courseModules.length,
    lessonCount: allLessons.length,
    totalMinutes: allLessons.reduce((total, lesson) => total + lesson.duration, 0),
    questionCount: allLessons.reduce((total, lesson) => total + lesson.quickCheck.length, 0),
  };
}

export const courseStats = getCourseStats();
