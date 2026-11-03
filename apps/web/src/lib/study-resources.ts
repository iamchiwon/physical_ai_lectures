import { bindingAvailability } from "@physical-ai/shared/catalog";
import type { CatalogBinding } from "@physical-ai/shared/catalog";
import { curriculumIndex, resourceHref } from "@/lib/curriculum";

type StudyLink = { href: string; title: string };
const uniqueLinks = (links: StudyLink[]) => links.filter((link, index) => links.findIndex((item) => item.href === link.href) === index);

/** Original resources are referenced, never copied or assigned new completion IDs. */
export function studyResource(binding: CatalogBinding) {
  const availability = bindingAvailability(binding, curriculumIndex);
  const common = { role: binding.role, coverage: binding.coverage, available: availability.available, reason: availability.reason };
  if ("resourceId" in binding) {
    const resource = curriculumIndex.resources.get(binding.resourceId);
    const kind = resource?.kind === "legacy-textbook" ? "기존 상세 본문" : resource?.kind === "legacy-lesson" ? "기존 요약 레슨" : resource?.kind === "image" ? "그림 자료" : resource?.kind === "explanation" ? "기존 점검 해설" : "코드·원본 파일";
    return { ...common, id: binding.resourceId, title: resource?.title ?? "참조 자산 없음", kind,
      links: resource && availability.available ? [{ href: resourceHref(resource), title: resource.kind === "legacy-textbook" ? "관련 상세 절 읽기" : resource.kind === "legacy-lesson" ? "핵심 요약과 자가 점검 열기" : resource.kind === "image" ? "원본 그림 열기" : resource.kind === "explanation" ? "자가 점검과 해설 열기" : "코드·원본 파일 열기" }] : [],
      feedback: null,
      limitation: resource?.kind === "file" ? "파일 열람은 코드 실행·실습 완료를 뜻하지 않습니다." : resource?.kind === "legacy-lesson" ? "핵심 요약 레슨입니다. 자세한 유도·수식·코드는 연결된 상세 본문을 함께 읽으세요." : "기존 자료의 관련 범위이며 신규 목표 전체의 품질 검수는 아직 진행하지 않았습니다." };
  }
  const activity = curriculumIndex.activities.get(binding.activityId);
  const kinds = { question: "기존 서술 문항", report: "기존 보고서", "quick-check": "기존 요약 점검", lab: "기존 실습 원고", "browser-model": "브라우저 계산 모형", glossary: "용어 복습" };
  const entryUrls = activity?.locator.entryUrls ?? [];
  const entryTitle = (href: string, title: string) => {
    if (entryUrls.length < 2) return title;
    const resource = [...curriculumIndex.resources.values()].find((item) => resourceHref(item).split("#")[0] === href.split("#")[0]);
    return `${title} · ${resource?.title ?? href.split("/").filter(Boolean).at(-1)}`;
  };
  const entries = entryUrls.map((href): StudyLink => {
    if ((activity?.kind === "question" || activity?.kind === "report") && activity.persistence.legacyId) return { href: `${href.split("#")[0]}#${activity.persistence.legacyId}`, title: activity.kind === "question" ? "이 문항 답안 작성·평가·해설" : "보고서 작성·평가 기준" };
    if (activity?.kind === "quick-check") return { href: `${href.split("#")[0]}#quick-check`, title: "요약 점검 풀고 해설 확인" };
    if (activity?.kind === "browser-model") return { href: `${href.split("#")[0]}#virtual-lab`, title: entryTitle(href, "브라우저 계산 모형 조작") };
    return { href, title: activity?.kind === "lab" ? "실습 절차·관찰·실패 안내 읽기" : "기존 활동 위치 열기" };
  });
  const feedbackRefs = activity ? [...activity.explanationRefs, ...(activity.rubricRef ? [activity.rubricRef] : [])] : [];
  const feedbackLinks = feedbackRefs.flatMap((id): StudyLink[] => {
    const resource = curriculumIndex.resources.get(id);
    // Inline quiz feedback remains in its original interactive flow.
    if (!resource || resource.locator.type === "inline") return [];
    return [{ href: resourceHref(resource), title: `${id === activity?.rubricRef ? "원본 평가 기준" : "원본 교재 해설"} · ${resource.title}` }];
  });
  const feedback = activity && ["question", "report", "quick-check"].includes(activity.kind) ? activity.feedbackStatus === "authored" ? "기존 교재 해설·평가 기준을 참고할 수 있습니다. 답안 평가 후 화면의 비교 항목도 확인하세요." : activity.feedbackStatus === "context-only" ? "개별 모범답안은 미작성입니다. 기존 관련 개념에 근거한 AI 피드백이며 추론한 해설을 구분해야 합니다." : "TBD · 개별 해설·평가 기준 보강이 필요합니다." : null;
  return { ...common, id: binding.activityId, title: activity?.kind === "report" ? "실습 보고서 · 기존 원고와 평가 안내" : activity?.title ?? "참조 활동 없음", kind: activity ? kinds[activity.kind] : "활동",
    links: availability.available ? uniqueLinks([...entries, ...feedbackLinks]) : [], feedback,
    limitation: `${activity?.limitation ?? "활동 참조 확인이 필요합니다."}${activity?.kind === "browser-model" ? " 브라우저 근사 계산이며 ROS·물리 엔진·GPU·실물 실행 결과가 아닙니다." : ""}${activity?.kind === "lab" ? " 연결된 원고의 환경·절차를 확인하세요. 원고 열람은 실습 수행을 뜻하지 않습니다." : ""}` };
}
