import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseShell } from "@/components/course-shell";
import { Breadcrumbs, Prerequisites, ReadinessBadge } from "@/components/curriculum-parts";
import { StudyNavigation, StudyNavigationView } from "@/components/study-navigation";
import { catalog, curriculumIndex, moduleIndex, topicIndex, studyNavigationFor, topicAnchor } from "@/lib/curriculum";
import { studyResource } from "@/lib/study-resources";
import { catalogSlotNames, unitReadiness } from "@physical-ai/shared/catalog";

export function generateStaticParams() { return catalog.units.map(({ id }) => ({ unitId: id })); }
export async function generateMetadata({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params; const unit = curriculumIndex.units.get(unitId);
  return { title: unit ? `${unit.topicId} · ${unit.title}` : "학습 단위 없음", alternates: { canonical: `/study/${unitId}/` } };
}
const slotLabels = { explanation: "설명", practice: "실습", assessment: "평가·해설" };
const requirementLabels = { required: "필수", optional: "선택", not_applicable: "해당 없음" };
const coverageLabels = { none: "목표 충족 범위 없음", partial: "목표 일부 관련", full: "설명 범위 충족 · 전체 단위 검수와 별개" };
export default async function StudyPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params; const unit = curriculumIndex.units.get(unitId); if (!unit) notFound();
  const topic = topicIndex.get(unit.topicId)!; const courseModule = moduleIndex.get(topic.moduleId)!;
  const readiness = unitReadiness(unit, curriculumIndex); const { base, contexts } = studyNavigationFor(unitId);
  return <CourseShell title={`${unit.topicId} · ${unit.title}`} description="단위별 목표·권장 선수와 자료 준비 상태를 확인하고, 연결된 기존 자료를 읽을 수 있습니다.">
    <main className="curriculum-content mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ title: "학습 홈", href: "/" }, { title: "전체 목차", href: "/curriculum/" }, { title: courseModule.id, href: `/modules/${courseModule.id}/#${topicAnchor(topic.id)}` }, { title: unit.topicId }]} />
      <section aria-labelledby="unit-status-title" className={`rounded-2xl border p-6 ${readiness.state === "tbd" ? "border-slate-200 bg-slate-100" : "border-blue-100 bg-blue-50"}`}>
        <ReadinessBadge state={readiness.state} /><h2 id="unit-status-title" className="mt-4 text-xl font-bold">{readiness.state === "tbd" ? "이 단위는 준비 예정입니다" : readiness.state === "partial" ? "관련 기존 자료부터 읽을 수 있습니다" : "기본 학습 자료가 준비되었습니다"}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{readiness.state === "tbd" ? "신규 목표를 가르치는 핵심 설명·활동은 아직 준비되지 않았습니다. 아래 목표·선수와 집필 예정 범위를 확인하세요. 참고 자료만 있어도 학습 준비 상태는 올라가지 않습니다." : readiness.state === "partial" ? "기존 공개 자료가 있으나 신규 목표·실습·평가 전체를 충족한 상태는 아닙니다. 연결된 원문과 부족한 범위를 함께 확인하세요." : "필수 슬롯의 목표와 검수 기준이 충족되었습니다."}</p>
        <p className="mt-3 text-xs leading-6 text-slate-500">예상 학습 시간: {unit.estimatedMinutes === null ? "미정" : `${unit.estimatedMinutes}분`}. 이 페이지 방문이나 자료 열람으로 완료·숙달을 자동 부여하지 않습니다.</p>
        <a href="#study-navigation-title" className="mt-4 inline-block text-sm font-semibold text-blue-700">현재 경로·이전·다음 단위 확인 ↓</a>
      </section>
      <section aria-labelledby="unit-goals-title" className="mt-6 rounded-2xl border bg-white p-6"><h2 id="unit-goals-title" className="text-xl font-bold">학습 목표 {unit.definitionStatus === "pending" ? "초안" : ""}</h2><ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">{unit.objectives.map((goal) => <li key={goal.id}>{goal.description}</li>)}</ul><p className="mt-3 text-xs leading-6 text-slate-500">{unit.requirements.definitionStatus === "pending" ? "목표별 필수 활동과 평가 기준은 단위 집필 전에 확정합니다." : "단위 요구 사항이 확정되어 있습니다."}</p><Prerequisites unit={unit} /></section>
      <nav aria-label="설명 실습 평가 바로가기" className="my-6 flex flex-wrap gap-2">{catalogSlotNames.map((slot) => <a key={slot} className="rounded-lg border bg-white px-4 py-2 text-sm text-blue-700" href={`#${slot}`}>{slotLabels[slot]}</a>)}</nav>
      <div className="space-y-5">{catalogSlotNames.map((slot) => {
        const resources = unit.slots[slot].map(studyResource);
        return <section key={slot} id={slot} aria-labelledby={`${slot}-title`} className="rounded-2xl border bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 id={`${slot}-title`} className="text-xl font-bold">{slotLabels[slot]} <span className="text-xs font-normal text-slate-500">{requirementLabels[unit.requirements[slot].mode]}</span></h2><ReadinessBadge state={readiness.slots[slot]} /></div>
          <p className="mt-3 text-sm leading-7 text-slate-600">{unit.requirements[slot].reason}</p>
          {!resources.length ? <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">{readiness.slots[slot] === "not_applicable" ? "별도 실습이 필요하지 않은 사유와 대체 이해 확인을 적용합니다." : "TBD · 이 슬롯에 연결된 자료는 아직 없습니다."}</p> : <ul className="mt-5 space-y-3">{resources.map((resource) => <li key={resource.id} className="rounded-xl border border-slate-100 p-4">
            <p className="text-xs font-semibold text-blue-700">{resource.kind} · {resource.role === "supplement" ? "보충 참고" : "학습 자료"}</p><h3 className="mt-2 text-sm font-semibold leading-7">{resource.title}</h3><p className="mt-2 text-xs leading-6 text-slate-500">{coverageLabels[resource.coverage]}</p><p className="mt-2 text-xs leading-6 text-slate-600">{resource.limitation}</p>
            {!resource.available ? <p role="status" className="mt-3 text-sm text-amber-900">자료 연결을 사용할 수 없습니다: {resource.reason}</p> : resource.links.length ? <ul className="mt-3 space-y-2">{resource.links.map((link, i) => <li key={link.href}><Link href={link.href} className="text-sm font-semibold text-blue-700 underline underline-offset-4">{link.title}{resource.links.length > 1 ? ` ${i + 1}` : ""} ↗</Link></li>)}</ul> : <p className="mt-3 text-xs text-slate-500">독립 진입 화면이 없는 모형입니다. 위 한계를 확인하고 관련 실습 원고를 참고하세요.</p>}
          </li>)}</ul>}
          <div className="mt-5 border-t border-slate-100 pt-4"><h3 className="text-sm font-semibold">보완할 범위</h3><p className="mt-2 text-sm leading-7 text-slate-600">{unit.gaps[slot]}</p></div>
        </section>;
      })}</div>
      <Suspense fallback={<StudyNavigationView navigation={{ ...base, context: null, notice: null }} />}><StudyNavigation base={base} contexts={contexts} /></Suspense>
      <p className="mt-6 text-xs leading-6 text-slate-500">실습·문제는 기존 화면에서 수행할 수 있습니다. AI 강사는 기존 자료 화면의 실제 본문을 참고하며, 이 신규 단위 페이지에는 아직 연결되어 있지 않습니다.</p>
    </main>
  </CourseShell>;
}
