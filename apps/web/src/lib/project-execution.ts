type EvidenceItem = { id: string; title: string; prompt: string; reference: string };
type ExecutionGuide = { description: string; commands: string; evidence: EvidenceItem[]; aiLinks: { href: string; title: string }[] };
const p1Evidence: EvidenceItem[] = [
          { id: "inputs", title: "입력·환경과 두 실행 보고서", prompt: "Python/platform·source/config/input SHA와 재생/폐루프 실행 범위를 적으세요.", reference: "고정 재생11행·합성 폐루프20스텝을 구분하고 실제 입력/설정/코드를 연결합니다. reference를 자신의 실행으로 제출하지 않습니다." },
          { id: "failures", title: "상실·시간·축과 복귀", prompt: "LOST·STALE·INVALID·AMBIGUOUS의 관찰과 2회 관측 후 복귀 근거를 적으세요.", reference: "나이100ms는 유효,101ms부터 만료입니다. 관측 상실/실패 후 첫 정상 관측은0명령, 두 번째부터 재개합니다. 0명령의 서로 다른 이유를 비교합니다." },
          { id: "feedback", title: "명령 제한과 피드백 비교", prompt: "오른쪽/왼쪽 명령 제한과 기본/gain0 폐루프의 차이를 설명하세요.", reference: "폭7·중심3에서 x5/x1 오차±2/3, 제한 명령±0.25입니다. 기본20스텝 마지막 관측 오차0, gain0은2/3에 머무르는 작은 합성 모형입니다." },
          { id: "scope", title: "판정·미확인·다음 확인", prompt: "이번 근거가 입증한 범위와 실제 ROS/카메라/실물에서 미확인인 항목을 적으세요.", reference: "입력/명령 계약과 합성 피드백의 근거만 확인합니다. 실제 센서 잡음·통신 지연·물리/안전 성능을 검증한 것으로 확대하지 않습니다." },
        ];
export const projectExecutionGuides: Record<string, ExecutionGuide> = {
 P1: {
  description: "RGB 마커와 제한된 가상 명령을 Python 표준 라이브러리로 실행합니다. 고정 기록 재생과 합성 폐루프를 따로 비교하며 실제 ROS·카메라·모터·물리 안전을 검증한 결과는 아닙니다.",
  commands: "python --version\npython runner.py --mode replay --input frames.json --output replay.json\npython runner.py --mode closed-loop --steps 20 --output closed-loop.json",
  evidence: p1Evidence,
  aiLinks: [{href:"/study/unit-m12-01-a/?track=track-main",title:"영상·배열 단위의 AI 강사"},{href:"/study/unit-m05-02-a/?track=track-main",title:"노드·메시지 단위의 AI 강사"}],
 },
 P2: {
  description: "작은 격자 모형에서 지도·제공 위치/TF·경로·두 waypoint의 도착을 구분합니다. 일시·영구 장애물과 시각·지도 오류를 비교하며 실제 ROS/Nav2·SLAM·물리·실물 안전을 검증한 결과는 아닙니다.",
  commands: "python --version\npython runner.py --mode simulate --scenario nominal --output nominal.json\npython runner.py --mode replay --input nominal.json --output replay.json\npython runner.py --scenario temporary-block --output temporary.json\npython runner.py --scenario permanent-block --output blocked.json\npython runner.py --scenario missing-tf --output missing-tf.json\npython runner.py --scenario stale --output stale.json\npython runner.py --scenario wrong-map --output wrong-map.json",
  evidence: [
   {id:"inputs",title:"환경·원관측과 두 실행 모드",prompt:"Python/platform·source/config/casebook SHA, simulate와 replay의 명령·새 결과를 연결하세요.",reference:"제공 reference를 자신의 실행으로 제출하지 않습니다. simulate의 원관측으로 replay가 같은 결정열을 만드는지 확인하고 환경/입력 지문을 비교합니다."},
   {id:"states",title:"지도·위치·경로·도착의 구분",prompt:"초기 odom→map 변환, 정상 8칸 이동과 두 waypoint의 관측된 도착·전체 성공을 적으세요.",reference:"odom(-1,2)에 제공 이동(+1,0)을 더해 map(0,2)입니다. GOAL_REACHED1회와 최종 SUCCEEDED1회를 구분합니다. 지도 로드·경로 생성만으로 도착을 세지 않습니다."},
   {id:"failures",title:"장애물·TF·시각·지도 오류",prompt:"일시/영구 막힘의 대기·복귀/중단, TF없음·101ms·지도 개정 오류의 다른 이유를 비교하세요.",reference:"일시 막힘은 WAITING2회 뒤 성공, 영구 막힘은 세 번째 경로 없음에서 BLOCKED입니다. 무효 세 사례는 tick1부터 INVALID/0이동으로 종료합니다. 100ms는 별도 정상 경계이며 누락/중복·frame 조건도 확인합니다."},
   {id:"scope",title:"판정·미확인과 다음 확인",prompt:"점 격자·제공 정확 pose/점유·고정 재생에서 확인한 범위와 실제 ROS/센서/물리에서 미확인을 적으세요.",reference:"이 기본 경로는 추상 셀 전이와 관측 계약의 실행 근거입니다. 실제 위치추정·Nav2·footprint/연속 충돌·동역학·안전 실증이나 실물 운전 승인으로 확대하지 않습니다."},
  ],
  aiLinks: [{href:"/study/unit-m09-04-a/?track=track-main",title:"프레임·시계 단위의 AI 강사"},{href:"/study/unit-m18-04-a/?track=track-main",title:"waypoint·작업 상태 단위의 AI 강사"}],
 },
};
