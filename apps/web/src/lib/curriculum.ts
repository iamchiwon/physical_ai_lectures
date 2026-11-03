import { bindingAvailability, catalog, catalogReadiness, indexCatalog, unitReadiness } from "@physical-ai/shared/catalog";
import { studyHref } from "./study-navigation";
import type { Catalog, CatalogUnit, Readiness } from "@physical-ai/shared/catalog";

export { catalog };
export const curriculumIndex = indexCatalog(catalog);
export const curriculumReadiness = catalogReadiness(catalog);
export const moduleIndex = new Map(catalog.modules.map((item) => [item.id, item]));
export const topicIndex = new Map(catalog.topics.map((item) => [item.id, item]));
export const trackIndex = new Map(catalog.tracks.map((item) => [item.id, item]));
export const stateLabels: Record<Readiness | "not_applicable", string> = { ready: "준비됨", partial: "일부 준비", tbd: "TBD · 준비 예정", not_applicable: "별도 실습 해당 없음" };
export function topicAnchor(topicId: string) { return `topic-${topicId.replace('.', '-')}`; }
export function unitOverviewHref(id: string) {
  const unit = curriculumIndex.units.get(id)!;
  const topic = topicIndex.get(unit.topicId)!;
  return `/modules/${topic.moduleId}/#${topicAnchor(topic.id)}`;
}
export function unitLink(id: string) {
  const unit = curriculumIndex.units.get(id)!;
  return { id, title: unit.title, topicId: unit.topicId, href: studyHref(id), state: unitReadiness(unit, curriculumIndex).state };
}
export type UnitLink = ReturnType<typeof unitLink>;
export function moduleUnits(id: string) {
  return moduleIndex.get(id)!.topicIds.flatMap((topicId) => topicIndex.get(topicId)!.unitIds.map((id) => curriculumIndex.units.get(id)!));
}
export function prerequisiteLinks(unit: CatalogUnit) {
  return { allOf: unit.prerequisites.allOf.map(unitLink), anyOf: unit.prerequisites.anyOf.map(unitLink) };
}
export function resourceHref(resource: Catalog["resources"][number]) {
  return resource.locator.type === "file" ? resource.locator.publicUrl : resource.locator.legacyUrl;
}
export function primaryReading(unit: CatalogUnit) {
  for (const binding of unit.slots.explanation) {
    if (!("resourceId" in binding) || binding.role !== "primary" || binding.coverage === "none" || !bindingAvailability(binding, curriculumIndex).available) continue;
    const resource = curriculumIndex.resources.get(binding.resourceId)!;
    if (resource.locator.type === "textbook" || resource.locator.type === "lesson") return { href: resourceHref(resource), title: resource.title, kind: resource.kind };
  }
  return null;
}

export function studyNavigationFor(unitId: string) {
  const neighbor = (id: string | undefined) => {
    if (!id) return null;
    const { id: stableId, title, topicId, state } = unitLink(id);
    return { id: stableId, title, topicId, state };
  };
  const sequence = catalog.modules.flatMap((item) => moduleUnits(item.id).map((unit) => unit.id));
  const position = sequence.indexOf(unitId);
  const base = { previous: neighbor(sequence[position - 1]), next: neighbor(sequence[position + 1]) };
  const contexts = catalog.tracks.flatMap((track) => {
    const i = track.steps.findIndex((step) => step.unitId === unitId);
    if (i < 0) return [];
    const step = track.steps[i]!;
    return [{ id: track.id, title: track.title, stepId: step.id, position: i + 1, total: track.steps.length, required: step.required,
      previous: neighbor(track.steps[i - 1]?.unitId), next: neighbor(track.steps[i + 1]?.unitId) }];
  });
  return { base, contexts };
}
