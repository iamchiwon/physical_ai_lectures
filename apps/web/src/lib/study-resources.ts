import { bindingAvailability } from "@physical-ai/shared/catalog";
import type { CatalogBinding } from "@physical-ai/shared/catalog";
import { curriculumIndex, resourceHref } from "@/lib/curriculum";

/** Only publish links after validating their bindings and all activity dependencies. */
export function studyResource(binding: CatalogBinding) {
  const availability = bindingAvailability(binding, curriculumIndex);
  const common = { role: binding.role, coverage: binding.coverage, available: availability.available, reason: availability.reason };
  if ("resourceId" in binding) {
    const resource = curriculumIndex.resources.get(binding.resourceId);
    const kind = resource?.kind === "legacy-textbook" ? "기존 상세 본문" : resource?.kind === "legacy-lesson" ? "기존 요약 레슨" : resource?.kind === "image" ? "그림 자료" : "코드·원본 파일";
    return { ...common, id: binding.resourceId, title: resource?.title ?? "참조 자산 없음", kind,
      links: resource && availability.available ? [{ href: resourceHref(resource), title: "자료 열기" }] : [],
      limitation: resource?.kind === "file" ? "파일 다운로드는 코드 실행·실습 완료를 뜻하지 않습니다." : "기존 자료의 관련 범위이며 신규 목표 전체의 품질 검수는 아직 진행하지 않았습니다." };
  }
  const activity = curriculumIndex.activities.get(binding.activityId);
  const kinds = { question: "기존 서술 문항", report: "기존 보고서", "quick-check": "기존 요약 점검", lab: "기존 실습 원고", "browser-model": "브라우저 계산 모형", glossary: "용어 복습" };
  return { ...common, id: binding.activityId, title: activity?.kind === "report" ? "실습 보고서 · 기존 원고와 평가 안내" : activity?.title ?? "참조 활동 없음", kind: activity ? kinds[activity.kind] : "활동",
    links: availability.available ? [...new Set(activity?.locator.entryUrls ?? [])].map((href) => ({ href, title: "기존 활동 위치 열기" })) : [],
    limitation: `${activity?.limitation ?? "활동 참조 확인이 필요합니다."}${activity?.feedbackStatus === "context-only" ? " 개별 해설·루브릭은 아직 보강이 필요합니다." : ""}` };
}
