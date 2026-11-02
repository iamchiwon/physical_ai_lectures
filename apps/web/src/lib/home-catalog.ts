import { bindingAvailability, catalog, catalogReadiness, indexCatalog } from "@physical-ai/shared/catalog";
import type { Catalog } from "@physical-ai/shared/catalog";

const introductions: Record<string, string> = {
  "track-mobile": "센서와 좌표계에서 시작해 지도·경로 계획·Nav2 미션으로 이어집니다.",
  "track-manipulation": "기구학과 로봇팔 제어를 익히고 시연 데이터·모방학습·VLA로 확장합니다.",
  "track-humanoid": "제어와 시뮬레이션을 바탕으로 강화학습·보행·전신 제어를 배웁니다.",
  "track-embedded": "전원·MCU·드라이버를 이해하고 밸런싱 로봇과 시스템 통합으로 연결합니다.",
  "track-autonomous-vehicle": "카메라·LiDAR·위치추정과 차량의 계획·제어를 하나의 실험으로 묶습니다.",
  "track-digital-twin": "로봇 비전과 물리 자산을 연결해 합성데이터·접촉·트윈 품질을 살펴봅니다.",
};
const preferredReadings: Record<string, string> = {
  "M10.03": "02_physx_simulation--chapter-10",
  "M20.03": "05_lerobot_smolvla--chapter-7",
};
const startingTopics = ["M00.01", "M06.02", "M10.03", "M14.03", "M20.03", "M30.04"];

/** Build-time projection. Never pass the full catalog or its validation schema to client components. */
export function buildHomeCatalog(source: Catalog) {
  const index = indexCatalog(source);
  const readiness = catalogReadiness(source);
  const modules = new Map(source.modules.map((m) => [m.id, m]));
  const topics = new Map(source.topics.map((t) => [t.id, t]));
  function readingFor(unitIds: string[], preferredLegacyUnitId?: string) {
    let fallback: { href: string; title: string } | null = null;
    for (const id of unitIds) {
      const unit = index.units.get(id);
      if (!unit) continue;
      for (const binding of unit.slots.explanation) {
        if (!("resourceId" in binding) || binding.role !== "primary" || binding.coverage === "none" || !bindingAvailability(binding, index).available) continue;
        const resource = index.resources.get(binding.resourceId);
        if (resource?.locator.type === "textbook") {
          const reading = { href: resource.locator.legacyUrl, title: resource.title };
          if (!preferredLegacyUnitId || resource.locator.legacyUnitId === preferredLegacyUnitId) return reading;
          fallback ??= reading;
        }
      }
    }
    return fallback;
  }
  return {
    totals: { modules: source.modules.length, topics: source.topics.length, tracks: source.tracks.length, ...readiness.overall.counts },
    tracks: source.tracks.map((track) => {
      const required = track.steps.filter((s) => s.required);
      const moduleIds = [...new Set(required.flatMap((step) => {
        const unit = index.units.get(step.unitId);
        const topic = unit ? topics.get(unit.topicId) : undefined;
        return topic ? [topic.moduleId] : [];
      }))];
      return {
        id: track.id, title: track.title, introduction: introductions[track.id] ?? track.description,
        required: required.length, optional: track.steps.length - required.length,
        counts: readiness.tracks[track.id]!.counts,
        sequence: moduleIds.map((id) => ({ id, title: modules.get(id)!.title })),
      };
    }),
    areas: source.areas.map((area) => ({
      id: area.id, title: area.title,
      modules: area.moduleIds.map((id) => {
        const courseModule = modules.get(id)!;
        return { id, title: courseModule.title, topics: courseModule.topicIds.length, counts: readiness.modules[id]!.counts,
          reading: readingFor(courseModule.topicIds.flatMap((id) => topics.get(id)?.unitIds ?? [])) };
      }),
    })),
    readings: startingTopics.flatMap((id) => {
      const topic = topics.get(id);
      const reading = topic ? readingFor(topic.unitIds, preferredReadings[id]) : null;
      return topic && reading ? [{ topicId: topic.id, title: topic.title, reading }] : [];
    }),
  };
}
export const homeCatalog = buildHomeCatalog(catalog);
