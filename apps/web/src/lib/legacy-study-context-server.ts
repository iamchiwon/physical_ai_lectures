import { bindingAvailability } from "@physical-ai/shared/catalog";
import { catalog, curriculumIndex, resourceHref, topicIndex } from "./curriculum";
import type { LegacyStudyContext } from "./legacy-study-context";

export function legacyStudyContextsFor(pathname: string): LegacyStudyContext[] {
  return catalog.units.flatMap((unit) => {
    const matches = Object.values(unit.slots).flat().some((binding) => {
      if (!bindingAvailability(binding, curriculumIndex).available) return false;
      const urls = "resourceId" in binding ? [resourceHref(curriculumIndex.resources.get(binding.resourceId)!)] : curriculumIndex.activities.get(binding.activityId)!.locator.entryUrls ?? [];
      return urls.some((url) => url.split(/[?#]/)[0]?.replace(/\/$/, "") === pathname.replace(/\/$/, ""));
    });
    return matches ? [{ id: unit.id, title: unit.title, moduleId: topicIndex.get(unit.topicId)!.moduleId, revision: unit.revision, catalogRevision: catalog.revision, trackIds: catalog.tracks.filter((track) => track.steps.some((step) => step.unitId === unit.id)).map((track) => track.id) }] : [];
  });
}
