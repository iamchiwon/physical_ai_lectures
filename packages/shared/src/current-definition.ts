import { catalogData } from "./catalog-data";
import { catalogSchema, type Catalog } from "./catalog-schema";
import { currentStageData } from "./current-sequence-data";

export interface LearningStage { id: string; title: string; description: string; topicIds: string[]; milestoneIds: string[] }
export interface ConditionalPrerequisite { id: string; title: string; allOf: string[] }
export const conditionalPrerequisites: Record<string, ConditionalPrerequisite[]> = {
  "M32.03": [{ id: "dual-arm", title: "양팔 정책·실행 확장 선택", allOf: ["unit-m21-05-a"] }],
};
const unitId = (topic: string) => `unit-${topic.toLowerCase().replace(".", "-")}-a`;
const canonicalTitles: Record<string, string> = {
  "M00.05": "개발환경·수학·제어·ML 자기진단과 선행학습 분기",
  "M01.03": "C/C++ 확장·ABI·버퍼 소유권과 수명",
  "M01.04": "CMake·colcon·컴파일·링크·빌드 오류 진단",
  "M01.06": "Python 실험과 C++ 실행 경계·시간·데이터 계약",
};
const prerequisiteUpdates: Record<string, { allOf: string[]; anyOf?: string[]; supplemental: string[]; reason: string }> = {
  "M01.05": { allOf: ["M01.01", "M01.02"], supplemental: ["M01.03", "M01.04"], reason: "경로·환경·패키지 계약으로 Git과 의존성 고정에 진입합니다. C++ 빌드 작업은 S01의 ABI·CMake 기본 도구 경로를 함께 사용합니다." },
  "M05.01": { allOf: ["M01.05"], supplemental: ["M03.06"], reason: "재현 환경과 제공된 가상 노드로 시작합니다. 실제 장치 연결을 선택하면 BOM·배선·기계 한계도 확인합니다." },
  "M06.05": { allOf: ["M02.01", "M03.05", "M06.01"], supplemental: ["M06.04"], reason: "행렬·바퀴 구조·프레임으로 차동·옴니·메카넘 계산에 진입합니다. 팔 특이점은 별도 심화입니다." },
  "M07.05": { allOf: ["M07.01", "M07.02", "M07.03"], supplemental: ["M07.04"], reason: "관성·응답·피드백과 제한으로 기본 추종을 분석합니다. 주파수 안정성 설계는 후속 심화입니다." },
  "M12.01": { allOf: ["M01.02"], supplemental: ["M02.02", "M11.04", "M11.05"], reason: "배열·자료형·축 계약에서 제공된 픽셀과 고전적 국소 연산을 시작합니다. 3D 변환과 학습 모델 평가는 후속입니다." },
  "M12.05": { allOf: ["M12.01", "M02.04"], supplemental: ["M12.03", "M12.04", "M11.03", "M11.06"], reason: "제공된 검출·ID 기록과 확률 기초로 시간 연관·가림을 분석합니다. 신경망 검출·분할 학습은 별도 경로입니다." },
  "M13.01": { allOf: ["M02.01", "M02.05", "M12.02"], supplemental: ["M11.04"], reason: "좌표·거리·최소제곱·카메라 기하로 고전적 점군 처리를 시작합니다. 학습 기반 특징은 후속입니다." },
  "M13.05": { allOf: ["M06.01", "M12.02", "M14.01"], supplemental: ["M13.04"], reason: "프레임·핀홀·보정 계약으로 다중 시점 기하에 진입합니다. 학습 기반 3D 검출은 별도 심화입니다." },
  "M14.06": { allOf: ["M02.03", "M02.04", "M12.02", "M14.01", "M14.03"], supplemental: ["M14.05"], reason: "미분·분산·투영·프레임·시간으로 오차와 불확실성을 기록합니다. 다중모달 융합은 후속 심화입니다." },
  "M17.01": { allOf: ["M02.05", "M06.01", "M07.05"], supplemental: ["M06.02"], reason: "거리·프레임·추종 한계와 제공된 footprint로 모바일 기하 경로를 시작합니다. 팔 링크 FK는 조작 분기에서 추가합니다." },
  "M17.06": { allOf: ["M17.01", "M17.02", "M02.03", "M07.05"], supplemental: ["M17.05"], reason: "기하 경로·격자 탐색·미분·추종 제한으로 시간 궤적을 구성합니다. CHOMP/STOMP 전체 이수는 필수가 아닙니다." },
  "M21.06": { allOf: ["M11.06", "M20.06", "M21.01", "M21.02"], supplemental: ["M21.03", "M21.04", "M21.05"], reason: "평가·재수집·BC·행동 계약으로 기본 롤아웃을 분석합니다. ACT·Diffusion·양팔은 선택 정책별 후속 경로입니다." },
  "M22.01": { allOf: ["M11.04", "M20.03", "M21.01"], supplemental: ["M21.03"], reason: "학습·에피소드·기본 BC와 실행 상태의 역할로 LLM/VLM/VLA를 구분합니다. ACT 자체는 공통 필수가 아닙니다." },
  "M31.01": { allOf: ["M01.02", "M01.05"], anyOf: [], supplemental: ["M05.04", "M18.03", "M19.03", "M23.06", "M26.02", "M29.05", "M25.06"], reason: "작은 코드 변경의 환경·입출력·완료 기준으로 시작합니다. ROS·통합 과제 적용은 해당 분야 선수 뒤에 확장합니다." },
  "M32.03": { allOf: ["M30.06", "M18.06", "M19.06"], supplemental: ["M21.05"], reason: "배포·주행-조작 전환·모바일 조작으로 제공된 통합 과제를 설계합니다. 본문의 양팔 숫자 활동은 자립적으로 수행하고, 양팔 정책·실행 확장을 선택하면 M21.05를 추가 필수로 이수합니다." },
};

/** Reorder the same steps, preserving IDs, membership and required/optional meaning. */
function orderedSteps(steps: Catalog["tracks"][number]["steps"], units: Catalog["units"], rank: Map<string, number>) {
  const byId = new Map(units.map(unit => [unit.id, unit]));
  const remaining = [...steps].sort((a, b) => (rank.get(a.unitId) ?? Infinity) - (rank.get(b.unitId) ?? Infinity));
  const ordered: typeof remaining = [], seen = new Set<string>(), requiredSeen = new Set<string>();
  while (remaining.length) {
    const next = remaining.findIndex(step => {
      const p = byId.get(step.unitId)!.prerequisites, available = step.required ? requiredSeen : seen;
      return p.allOf.every(id => available.has(id)) && (!p.anyOf.length || p.anyOf.some(id => available.has(id)));
    });
    if (next < 0) throw Error(`Current sequence cannot satisfy track prerequisites: ${remaining.map(step => step.unitId).join(", ")}`);
    const [step] = remaining.splice(next, 1); ordered.push(step!); seen.add(step!.unitId); if (step!.required) requiredSeen.add(step!.unitId);
  }
  return ordered;
}

const plannedOperations = [
  ["M34.01", "관제 텔레메트리·상태/이벤트·읽기 전용 대시보드", ["M05.01", "M05.02"]],
  ["M34.02", "3D 장면과 로봇 상태의 좌표·시간·버전 동기화", ["M34.01", "M06.01", "M14.03"]],
  ["M34.03", "운영 UI의 요청·권한·확인·취소·감사 기록", ["M34.01", "M22.06", "M30.04"]],
] as const;

/** Historical catalog is immutable; current titles, entry prerequisites and sequence are a separate definition. */
export function applyCurrentDefinition(base: Catalog): Catalog {
  const result = structuredClone(base);
  for (const unit of result.units) {
    unit.title = canonicalTitles[unit.topicId] ?? unit.title;
    const update = prerequisiteUpdates[unit.topicId];
    if (update) unit.prerequisites = { ...unit.prerequisites, allOf: update.allOf.map(unitId), anyOf: update.anyOf?.map(unitId) ?? unit.prerequisites.anyOf, supplementalUnitIds: update.supplemental.map(unitId), reason: update.reason };
  }
  for (const topic of result.topics) topic.title = canonicalTitles[topic.id] ?? topic.title;
  const tools = result.modules.find(module => module.id === "M01")!;
  tools.title = "AI·로봇 실행 환경·패키지·네이티브 빌드";
  tools.prerequisiteNote = "일반적인 코딩이 가능한 학습자의 도구·실행 환경 경로입니다. 언어 문법 입문은 포함하지 않습니다.";
  tools.objectives = [{ id: tools.objectives[0]!.id, description: "패키지·배열·네이티브 ABI·CMake/colcon 빌드와 AI·로봇 실행 경계의 계약을 진단한다." }];
  if (result.modules.some(module => module.id === "M34")) throw Error("Current definition already applied");
  const operationGoal = "objective-m34-overview";
  result.areas.find(area => area.id === "area-validation")!.moduleIds.push("M34");
  result.modules.push({ id: "M34", title: "운영·관제 UI와 로봇 상태 계약", areaId: "area-validation", topicIds: plannedOperations.map(row => row[0]), objectives: [{ id: operationGoal, description: "관제 상태·동기화·요청 감독의 계약을 설계한다." }], prerequisiteNote: "S10의 운영·관제 계획 단위이며 원고와 실행 패키지는 준비중입니다." });
  for (const [topicId, title, prerequisites] of plannedOperations) {
    const id = unitId(topicId), objectives = [{ id: `objective-${topicId.toLowerCase().replace(".", "-")}`, description: `${title}의 입력·판정·한계를 설명한다.` }];
    const requirement = { mode: "required" as const, reason: "준비중 · 원고와 활동을 집필하고 독립 검수해야 합니다.", objectiveIds: objectives.map(goal => goal.id), activityIds: [] };
    result.topics.push({ id: topicId, moduleId: "M34", title, unitIds: [id], objectives });
    result.units.push({ id, topicId, title, revision: "planned-kant-2026-11-06", definitionStatus: "pending", objectives, prerequisites: { allOf: prerequisites.map(unitId), anyOf: [], supplementalUnitIds: [], definitionStatus: "pending", reason: "계획 선수이며 상세 원고와 함께 검수해야 합니다." }, requirements: { definitionStatus: "pending", explanation: structuredClone(requirement), practice: structuredClone(requirement), assessment: structuredClone(requirement) }, slots: { explanation: [], practice: [], assessment: [] }, gaps: { explanation: "준비중 · 상세 본문이 아직 없습니다.", practice: "준비중 · 실습·실행 패키지가 아직 없습니다.", assessment: "준비중 · 문항·해설이 아직 없습니다." }, estimatedMinutes: null });
  }
  const topics = currentStageData.flatMap(stage => [...stage.topicIds]);
  if (new Set(topics).size !== result.topics.length || topics.some(id => !result.topics.some(topic => topic.id === id))) throw Error("Current stages must cover each topic exactly once");
  const rank = new Map(topics.map((topic, index) => [unitId(topic), index]));
  const all = orderedSteps(result.units.map(unit => ({ id: unit.id, unitId: unit.id, required: true })), result.units, rank);
  result.units.sort((a, b) => all.findIndex(step => step.unitId === a.id) - all.findIndex(step => step.unitId === b.id));
  result.topics.sort((a, b) => result.units.findIndex(unit => unit.topicId === a.id) - result.units.findIndex(unit => unit.topicId === b.id));
  for (const track of result.tracks) track.steps = orderedSteps(track.steps, result.units, rank);
  const mainTopics = new Set<string>(currentStageData.filter(stage => stage.id.startsWith("S")).flatMap(stage => [...stage.topicIds]));
  const optional = new Set(["M32.01", "M32.02", "M32.03"]);
  const mainSteps = result.units.filter(unit => mainTopics.has(unit.topicId)).map(unit => ({ id: `main:${unit.id}`, unitId: unit.id, required: !optional.has(unit.topicId) }));
  result.tracks.unshift({ id: "track-main", title: "일반 AI·로봇 공통 과정", description: "일반 코딩 가능자의 S00~S11 공통 경로입니다. 세 캡스톤 변형은 선택하며 재현 패키지와 검토는 필수입니다. 심화 분기의 조건부 선수는 별도로 확인합니다.", steps: orderedSteps(mainSteps, result.units, rank) });
  result.revision = `${base.revision}+kant-2026-11-06`;
  return result;
}
export const currentDefinitionCatalog = catalogSchema.parse(applyCurrentDefinition(catalogSchema.parse(catalogData)));
export const learningSequence = currentDefinitionCatalog.units.map(unit => unit.topicId);
export const learningStages: LearningStage[] = currentStageData.map(stage => ({ ...stage, topicIds: learningSequence.filter(topic => (stage.topicIds as readonly string[]).includes(topic)), milestoneIds: [...stage.milestoneIds] }));
