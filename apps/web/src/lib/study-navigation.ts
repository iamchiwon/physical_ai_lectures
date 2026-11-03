import type { Readiness } from "@physical-ai/shared/catalog";

export interface StudyNeighbor { id: string; title: string; topicId: string; state: Readiness }
export interface StudyOrder { previous: StudyNeighbor | null; next: StudyNeighbor | null }
export interface StudyTrackContext extends StudyOrder { id: string; title: string; stepId: string; position: number; total: number; required: boolean }
export function studyHref(id: string, trackId?: string) {
  return `/study/${encodeURIComponent(id)}/${trackId ? `?track=${encodeURIComponent(trackId)}` : ""}`;
}
export function resolveStudyNavigation(base: StudyOrder, contexts: StudyTrackContext[], trackValues: string[]) {
  if (!trackValues.length) return { ...base, context: null, notice: null };
  const context = trackValues.length === 1 ? contexts.find((item) => item.id === trackValues[0]) ?? null : null;
  if (!context) return { ...base, context: null, notice: "추천 경로가 없거나 이 단위를 포함하지 않습니다. 전체 목차 순서로 이동합니다." };
  return { previous: context.previous, next: context.next, context, notice: null };
}
