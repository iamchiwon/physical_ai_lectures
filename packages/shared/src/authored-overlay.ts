import type { Catalog, CatalogBinding } from "./catalog-schema";
import { bindingRevision, indexCatalog } from "./catalog-readiness";
export interface AuthoredMetadata {
  topicId: string; source: string; title: string; objectives: string[]; prerequisiteNote: string;
  sha256: string; reviewed: boolean; evidenceRef: string | null;
}
export interface LegacyRevision { source: string; baselineSha256: string; sha256: string; approved: boolean; reason: string; evidenceRef: string | null }
export interface DerivedReference { activityId: string; baselineSha256: string; sha256: string; approved: boolean }
const sourcePath = (source: string) => source.startsWith("ebook/") ? source : `ebook/book/${source}`;
/** Explicit current-source reviews add material; source files alone never grant readiness. */
export function applyAuthoredOverlay(base: Catalog, metadata: AuthoredMetadata[], revisions: LegacyRevision[] = [], derived: DerivedReference[] = []): Catalog {
  const result = structuredClone(base);
  for (const row of revisions) {
    for (const resource of result.resources) {
      if (sourcePath(resource.locator.source) !== row.source) continue;
      resource.revision = `sha256:${row.sha256}`;
      resource.integrity = { status: row.approved ? "matched" : "mismatch", evidence: row.approved ? `Approved revision: ${row.evidenceRef}` : "Source differs from preserved baseline without current approval" };
      if (resource.locator.type === "file") resource.locator.sha256 = row.sha256;
    }
    for (const activity of result.activities) if (sourcePath(activity.locator.source) === row.source) {
      activity.revision = `sha256:${row.sha256}`;
      activity.locator.sourceSha256 = row.sha256;
      activity.integrity = { status: row.approved ? "matched" : "mismatch", evidence: row.approved ? `Approved revision: ${row.evidenceRef}` : "Unreviewed source revision" };
    }
  }
  for (const reference of derived) {
    const activity = result.activities.find(activity => activity.id === reference.activityId);
    if (!activity) throw Error(`Missing derived activity: ${reference.activityId}`);
    activity.referenceSha256 = reference.sha256;
    activity.revision = `sha256:${reference.sha256}`;
    activity.integrity = { status: reference.approved ? "matched" : "mismatch", evidence: reference.approved ? "Reference regenerated from explicitly approved source revisions" : "Unreviewed derived reference change" };
  }
  const accepted = metadata.filter(item => item.reviewed && item.evidenceRef);
  for (const item of accepted) {
    const unit = result.units.find(unit => unit.topicId === item.topicId);
    if (!unit || item.objectives.length !== 3) throw Error(`Invalid authored topic: ${item.topicId}`);
    const revision = `sha256:${item.sha256}`;
    const oldGoal = unit.objectives[0]!.id;
    unit.objectives = item.objectives.map((description, i) => ({ id: i ? `${oldGoal}-${i + 1}` : oldGoal, description }));
    const goals = unit.objectives.map(goal => goal.id);
    unit.revision = revision; unit.definitionStatus = "confirmed";
    unit.prerequisites.definitionStatus = "confirmed"; unit.prerequisites.reason = item.prerequisiteNote;
    unit.requirements.definitionStatus = "confirmed";
    const href = `/study/${unit.id}/`;
    const resource = (section: string, title: string, anchor: string): string => {
      const id = `authored:resource:${item.topicId}:${section}`;
      result.resources.push({ id, kind: "authored-textbook", title, locator: { type: "authored", source: item.source, unitId: unit.id, section, publicUrl: `${href}#${anchor}`, sha256: item.sha256 },
        publication: "published", revision, integrity: { status: "matched", evidence: item.evidenceRef! },
        preservation: { disposition: "new-authored-content", reason: "Reviewed authored content; original legacy resources and IDs remain preserved" } });
      return id;
    };
    const body = resource("body", `${item.title} · 본문`, "authored-body");
    const practice = resource("practice", `${item.title} · 실습`, "authored-practice");
    const practiceSolution = resource("practiceSolution", `${item.title} · 실습 해설`, "authored-practice-solution");
    const refs = resource("references", `${item.title} · 참고 자료`, "authored-references");
    unit.slots.explanation.push({ resourceId: refs, role: "supplement", objectiveIds: goals, coverage: "none", review: { verdict: "unreviewed", reviewedRevision: null, evidenceRef: null } });
    const practiceId = `authored:${item.topicId}:practice`;
    const activityBase = { rubricRef: null, feedbackStatus: "authored" as const, persistence: { legacyId: null, storageKey: "physical-ai:learning:v2" }, publication: "published" as const,
      revision, integrity: { status: "matched" as const, evidence: item.evidenceRef! }, referenceSha256: item.sha256 };
    result.activities.push({ ...activityBase, id: practiceId, kind: "lab", title: `${item.title} · 관찰·계산 실습`, resourceRefs: [body, practice], explanationRefs: [practiceSolution],
      locator: { source: item.source, entryUrls: [`${href}#${practiceId}`], sourceSha256: item.sha256 }, limitation: "장비 없는 계산·기록 실습입니다. 입력·해설 비교는 명시적 자기검토이며 실제 실행·숙달을 자동 판정하지 않습니다." });
    const questionIds = [1, 2, 3].map(n => {
      const question = resource(`q${n}`, `${item.title} · Q${n}`, `authored-q${n}`), answer = resource(`answer-q${n}`, `${item.title} · Q${n} 해설`, `authored-answer-q${n}`);
      const id = `authored:${item.topicId}:q${n}`;
      result.activities.push({ ...activityBase, id, kind: "question", title: `${item.title} · 확인 문제 Q${n}`, resourceRefs: [body, question], explanationRefs: [answer],
        locator: { source: item.source, entryUrls: [`${href}#${id}`], sourceSha256: item.sha256 }, limitation: "서술답안·해설 비교·자기검토 기록입니다. 작성·해설 열람을 정답·숙달로 자동 환산하지 않습니다." });
      return id;
    });
    const bind = (id: string, objectiveIds: string[], isActivity: boolean): CatalogBinding => ({ ...(isActivity ? { activityId: id } : { resourceId: id }), role: "primary", objectiveIds, coverage: "full", review: { verdict: "passed", reviewedRevision: null, evidenceRef: item.evidenceRef } });
    const explanation = bind(body, goals, false), practical = bind(practiceId, goals, true);
    const assessment = questionIds.map((id, i) => bind(id, [goals[i]!], true));
    const index = indexCatalog(result);
    for (const binding of [explanation, practical, ...assessment]) binding.review.reviewedRevision = bindingRevision(binding, index);
    unit.slots.explanation.unshift(explanation); unit.slots.practice.unshift(practical); unit.slots.assessment.unshift(...assessment);
    unit.requirements.explanation = { mode: "required", reason: "세 목표에 대응하는 검수된 설명·예제를 읽습니다.", objectiveIds: goals, activityIds: [] };
    unit.requirements.practice = { mode: "required", reason: "장비 없는 실습을 수행하고 관찰·계산 근거를 해설과 비교합니다.", objectiveIds: goals, activityIds: [practiceId] };
    unit.requirements.assessment = { mode: "required", reason: "목표별 세 서술문항에 답하고 해설·판정 기준으로 자기검토합니다.", objectiveIds: goals, activityIds: questionIds };
    unit.gaps = { explanation: "기본 설명·예제가 준비되었습니다. 기존 보충 자료의 범위와 구별하세요.", practice: "기본 실습은 장비 없이 수행합니다. 실제 장비·GPU 실증을 완료했다는 뜻은 아닙니다.", assessment: "서술답안과 해설이 준비되었습니다. 자기검토와 학습 완료는 숙달 인증과 별개입니다." };
    const topic = result.topics.find(topic => topic.id === item.topicId)!; topic.objectives = structuredClone(unit.objectives);
  }
  if (accepted.length || revisions.length) {
    const signature = [...accepted.map(item => item.sha256), ...revisions.map(item => `${item.sha256}:${item.approved}`), ...derived.map(item => `${item.sha256}:${item.approved}`)].join(":");
    let digest = 2166136261;
    for (const char of signature) digest = Math.imul(digest ^ char.charCodeAt(0), 16777619);
    result.revision = `${base.revision}+authored-${(digest >>> 0).toString(16)}`;
  }
  return result;
}
