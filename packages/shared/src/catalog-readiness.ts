import { catalogSlotNames } from "./catalog-schema";
import type { Catalog, CatalogActivity, CatalogBinding, CatalogUnit, Readiness, SlotName } from "./catalog-schema";

export interface CatalogIndex {
  resources: Map<string, Catalog["resources"][number]>;
  activities: Map<string, CatalogActivity>;
  units: Map<string, CatalogUnit>;
}
export function indexCatalog(catalog: Catalog): CatalogIndex {
  return {
    resources: new Map(catalog.resources.map((v) => [v.id, v])),
    activities: new Map(catalog.activities.map((v) => [v.id, v])),
    units: new Map(catalog.units.map((v) => [v.id, v])),
  };
}
const activityRefs = (a: CatalogActivity) => [...new Set([...a.resourceRefs, ...a.explanationRefs, ...(a.rubricRef ? [a.rubricRef] : [])])];

/** Review fingerprint includes dependencies so changed solutions invalidate activity reviews. */
export function bindingRevision(binding: CatalogBinding, index: CatalogIndex): string | null {
  if ("resourceId" in binding) return index.resources.get(binding.resourceId)?.revision ?? null;
  const a = index.activities.get(binding.activityId);
  if (!a || activityRefs(a).some((id) => !index.resources.has(id))) return null;
  return JSON.stringify([a.revision, ...activityRefs(a).sort().map((id) => [id, index.resources.get(id)!.revision])]);
}
export function bindingAvailability(binding: CatalogBinding, index: CatalogIndex): { available: boolean; reason: string | null } {
  if (binding.review.verdict === "needs_revision") return { available: false, reason: "연결 검수 보완 필요" };
  const asset = "resourceId" in binding ? index.resources.get(binding.resourceId) : index.activities.get(binding.activityId);
  if (!asset) return { available: false, reason: "참조 자산 없음" };
  if (asset.publication !== "published" || asset.integrity.status !== "matched") return { available: false, reason: "미공개 또는 무결성 미확인" };
  if ("activityId" in binding) {
    const a = index.activities.get(binding.activityId)!;
    if (activityRefs(a).some((id) => {
      const r = index.resources.get(id);
      return !r || r.publication !== "published" || r.integrity.status !== "matched";
    })) return { available: false, reason: "활동의 본문·해설 참조 무효" };
  }
  return { available: true, reason: null };
}
function passed(b: CatalogBinding, index: CatalogIndex): boolean {
  return b.role === "primary" && b.coverage === "full" && bindingAvailability(b, index).available
    && b.review.verdict === "passed" && Boolean(b.review.evidenceRef)
    && b.review.reviewedRevision === bindingRevision(b, index);
}
function assessmentFeedback(b: CatalogBinding, index: CatalogIndex): boolean {
  if (!("activityId" in b)) return false;
  const a = index.activities.get(b.activityId);
  return Boolean(a && ["question", "report", "quick-check"].includes(a.kind) && a.feedbackStatus === "authored"
    && a.explanationRefs.length && (a.kind !== "report" || a.rubricRef));
}
export function unitReadiness(unit: CatalogUnit, index: CatalogIndex): {
  state: Readiness; slots: Record<SlotName, Readiness | "not_applicable">;
} {
  const slots = {} as Record<SlotName, Readiness | "not_applicable">;
  const defined = unit.definitionStatus === "confirmed" && unit.requirements.definitionStatus === "confirmed"
    && unit.prerequisites.definitionStatus === "confirmed";
  let hasPrimary = false;
  for (const slot of catalogSlotNames) {
    const requirement = unit.requirements[slot];
    if (requirement.mode === "not_applicable") { slots[slot] = "not_applicable"; continue; }
    const valid = unit.slots[slot].filter((b) => b.role === "primary" && b.coverage !== "none" && bindingAvailability(b, index).available);
    hasPrimary ||= valid.length > 0;
    const reviewed = valid.filter((b) => passed(b, index) && (slot !== "assessment" || assessmentFeedback(b, index)));
    const covers = requirement.objectiveIds.length > 0 && requirement.objectiveIds.every((goal) => reviewed.some((b) => b.objectiveIds.includes(goal)));
    const activities = requirement.activityIds.every((id) => reviewed.some((b) => "activityId" in b && b.activityId === id));
    const unresolved = unit.slots[slot].some((b) => b.role === "primary"
      && (!bindingAvailability(b, index).available
        || (b.review.verdict === "passed" && b.review.reviewedRevision !== bindingRevision(b, index))));
    slots[slot] = defined && covers && activities && !unresolved ? "ready" : valid.length ? "partial" : "tbd";
  }
  const ready = defined && catalogSlotNames.every((s) => unit.requirements[s].mode !== "required" || slots[s] === "ready");
  return { state: ready ? "ready" : hasPrimary ? "partial" : "tbd", slots };
}

/** IDs are deduplicated; optional track steps must be excluded by the caller. */
export function summarizeReadiness(unitIds: string[], index: CatalogIndex) {
  const counts = { ready: 0, partial: 0, tbd: 0 };
  const uniqueIds = [...new Set(unitIds)];
  for (const id of uniqueIds) {
    const unit = index.units.get(id);
    counts[unit ? unitReadiness(unit, index).state : "tbd"]++;
  }
  const state: Readiness = uniqueIds.length && counts.ready === uniqueIds.length ? "ready"
    : counts.partial || counts.ready ? "partial" : "tbd";
  return { state, counts, total: uniqueIds.length, definitionError: !uniqueIds.length || uniqueIds.some((id) => !index.units.has(id)) };
}

export function catalogReadiness(catalog: Catalog) {
  const index = indexCatalog(catalog);
  const topicIds = new Map(catalog.topics.map((t) => [t.id, t.unitIds]));
  const moduleIds = new Map(catalog.modules.map((m) => [m.id, m.topicIds.flatMap((id) => topicIds.get(id) ?? [])]));
  return {
    overall: summarizeReadiness(catalog.units.map((u) => u.id), index),
    topics: Object.fromEntries(catalog.topics.map((t) => [t.id, summarizeReadiness(t.unitIds, index)])),
    modules: Object.fromEntries(catalog.modules.map((m) => [m.id, summarizeReadiness(moduleIds.get(m.id) ?? [], index)])),
    areas: Object.fromEntries(catalog.areas.map((a) => [a.id, summarizeReadiness(a.moduleIds.flatMap((id) => moduleIds.get(id) ?? []), index)])),
    tracks: Object.fromEntries(catalog.tracks.map((t) => [t.id, summarizeReadiness(t.steps.filter((s) => s.required).map((s) => s.unitId), index)])),
  };
}
