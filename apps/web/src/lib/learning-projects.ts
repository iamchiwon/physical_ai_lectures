import p1Starter from "./project-starter-data.json";
import p2Starter from "./p2-starter-data.json";
import p3Starter from "./p3-starter-data.json";
import p4Starter from "./p4-starter-data.json";
type LearningProject = { id: string; stageId: string; title: string; goal: string; topics: string[]; outputs: string[]; checks: string[]; starter: typeof p1Starter | null };
/** Project guides and executable packages have separate availability. */
export const learningProjects: LearningProject[] = [
  { id: "P1", starter: p1Starter, stageId: "S02", title: "비전 추적과 가상 제어", goal: "색 기반 검출 결과를 제한된 가상 제어 명령과 연결하고 관측 상실을 판정합니다.", topics: ["M05.01", "M05.02", "M12.01"], outputs: ["검출·제어 노드의 입력/출력과 단위 계약", "대상 상실·오래된 관측·명령 제한의 비교 기록", "고정 입력 재생과 직접 실행의 구분"], checks: ["잘못된 픽셀 축이나 오래된 관측을 명령에 사용하지 않는가", "대상 상실 이후의 명령과 복귀 조건을 설명하는가"] },
  { id: "P2", starter: p2Starter, stageId: "S05", title: "지도 기반 이송과 장애물 대응", goal: "시뮬레이션의 지도·위치추정·경로·도착을 연결하고 실패 조건을 비교합니다.", topics: ["M09.01", "M09.04", "M15.02", "M17.02", "M18.03", "M18.04"], outputs: ["world/model·시계·TF·지도 버전의 실행 명세", "waypoint 미션과 장애물 변화 비교표", "도착·중단·실패 및 재생 가능한 원본 로그"], checks: ["지도 로드와 위치추정·도착을 따로 확인하는가", "TF/clock 오류와 동적 장애물 실패를 분리하는가"] },
  { id: "P3", starter: p3Starter, stageId: "S09", title: "물류 작업과 다중 로봇 통합", goal: "주행·팔 조작과 공유 자원의 작업 상태를 연결합니다.", topics: ["M18.05", "M19.06", "M18.06"], outputs: ["로봇/프레임/요청 ID와 작업 단계 계약", "통행 예약·실제 점유·취소·부분 성공의 사건표", "주행에서 조작·수납·재개로 전환하는 검증 근거"], checks: ["예약 만료를 물리적 퇴장으로 오인하지 않는가", "주행 성공과 조작 완료·수납·다음 주행 승인을 분리하는가"] },
  { id: "P4", starter: p4Starter, stageId: "S10", title: "학습 정책·트윈·현장 전이 평가", goal: "작은 BC 정책과 상태 관제를 연결하고 조건 변화·지연·배포 버전을 평가합니다.", topics: ["M20.06", "M21.06", "M25.06", "M27.06", "M30.05", "M30.06", "M34.01", "M34.02", "M34.03"], outputs: ["학습/평가 분할과 관측·행동·버전 명세", "상태 대시보드와 시각·좌표·데이터 누락 기록", "기준 대비 조건 변화 실험·제한 실행·롤백 보고서"], checks: ["데이터 누수와 실패한 실행의 분모 누락을 확인하는가", "가상 조건 변화 평가와 실제 Sim2Real 실증을 구분하는가"] },
];
