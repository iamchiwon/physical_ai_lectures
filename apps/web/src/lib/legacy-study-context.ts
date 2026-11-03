import { studyHref } from "./study-navigation";

export interface LegacyStudyContext { id: string; title: string; moduleId: string; revision: string; catalogRevision: string; trackIds: string[] }
export function legacyStudyHref(href: string, unitId: string, trackId?: string) {
  if (!/^\/(learn|textbook)\//.test(href)) return href;
  const url = new URL(href, "https://classroom.invalid");
  url.searchParams.set("from", unitId);
  if (trackId) url.searchParams.set("track", trackId); else url.searchParams.delete("track");
  return url.pathname + url.search + url.hash;
}
export function resolveLegacyStudyContext(contexts: LegacyStudyContext[], from: string[], tracks: string[]) {
  const unit = from.length === 1 ? contexts.find((item) => item.id === from[0]) : undefined;
  if (!unit) return null;
  const trackId = tracks.length === 1 && unit.trackIds.includes(tracks[0]!) ? tracks[0] : undefined;
  return { ...unit, href: studyHref(unit.id, trackId), trackId: trackId ?? null };
}

/** Preserve an explicit origin across old reading links; destination validates membership. */
export function forwardLegacyStudyHref(href: string, from: string[], tracks: string[]) {
  const unitId = from.length === 1 && /^unit-[a-z0-9-]+$/.test(from[0]!) ? from[0] : undefined;
  if (!unitId) return href;
  const trackId = tracks.length === 1 && /^track-[a-z0-9-]+$/.test(tracks[0]!) ? tracks[0] : undefined;
  return legacyStudyHref(href, unitId, trackId);
}
