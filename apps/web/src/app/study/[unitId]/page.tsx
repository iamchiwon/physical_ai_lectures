import { TelemetryConceptLab } from "@/components/telemetry-concept-lab";
import { ControlConceptLab } from "@/components/control-concept-lab";
import { WheelConceptLab } from "@/components/wheel-concept-lab";
import { ThresholdConceptLab } from "@/components/threshold-concept-lab";
import { ProjectionConceptLab } from "@/components/projection-concept-lab";
import { AuthoredMarkdown } from "@/components/authored-markdown";
import { AuthoredResponse, AuthoredCompletion } from "@/components/authored-response";
import { authoredForTopic } from "@/lib/authored";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CourseShell } from "@/components/course-shell";
import { Breadcrumbs, Prerequisites, ReadinessBadge } from "@/components/curriculum-parts";
import { StudyNavigation, StudyNavigationView } from "@/components/study-navigation";
import { catalog, curriculumIndex, moduleIndex, topicIndex, studyNavigationFor, topicAnchor } from "@/lib/curriculum";
import { studyResource } from "@/lib/study-resources";
import { StudyResourceLink } from "@/components/legacy-study-navigation";
import { TutorDrawer } from "@/components/tutor-drawer";
import { studyTutorProps } from "@/lib/study-tutor";
import { LearningLocation } from "@/components/learning-location";
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
  const authored = authoredForTopic(unit.topicId);
  const thresholdLab = Boolean(authored) && unit.topicId === "M11.05";
  const projectionLab = Boolean(authored) && ["M12.02", "M14.03", "M14.06"].includes(unit.topicId);
  const activityIds = [`authored:${unit.topicId}:practice`, ...[1, 2, 3].map(n => `authored:${unit.topicId}:q${n}`)];
  const readiness = unitReadiness(unit, curriculumIndex); const { base, contexts } = studyNavigationFor(unitId);
  return <CourseShell title={`${unit.topicId} · ${unit.title}`} description="단위별 목표·권장 선수와 자료 준비 상태를 확인하고, 공개된 본문과 활동을 읽고 준비 상태를 확인할 수 있습니다.">
    <main className="curriculum-content mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ title: "학습 홈", href: "/" }, { title: "전체 목차", href: "/curriculum/" }, { title: courseModule.id, href: `/modules/${courseModule.id}/#${topicAnchor(topic.id)}` }, { title: unit.topicId }]} />
      <section aria-labelledby="unit-status-title" className={`rounded-2xl border p-6 ${readiness.state === "tbd" ? "border-slate-200 bg-slate-100" : "border-blue-100 bg-blue-50"}`}>
        <ReadinessBadge state={readiness.state} /><h2 id="unit-status-title" className="mt-4 text-xl font-bold">{readiness.state === "tbd" ? "이 단위는 준비중입니다" : readiness.state === "partial" ? "관련 기존 자료부터 읽을 수 있습니다" : "학습 안내"}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{readiness.state === "tbd" ? "신규 목표를 가르치는 핵심 설명·활동은 아직 준비되지 않았습니다. 아래 목표·선수와 집필 예정 범위를 확인하세요. 참고 자료만 있어도 학습 준비 상태는 올라가지 않습니다." : readiness.state === "partial" ? "기존 공개 자료가 있으나 신규 목표·실습·평가 전체를 충족한 상태는 아닙니다. 연결된 원문과 부족한 범위를 함께 확인하세요." : "본문을 읽고 장비 없는 기본 실습·세 확인 문제와 해설로 이해를 확인하세요."}</p>
        <p className="mt-3 text-xs leading-6 text-slate-500">예상 학습 시간: {unit.estimatedMinutes === null ? "미정" : `${unit.estimatedMinutes}분`}. 이 페이지 방문이나 자료 열람으로 완료·숙달을 자동 부여하지 않습니다.</p>
        <a href="#study-navigation-title" className="mt-4 inline-block text-sm font-semibold text-blue-700">현재 경로·이전·다음 단위 확인 ↓</a>
      </section>
      <section aria-labelledby="unit-goals-title" className="mt-6 rounded-2xl border bg-white p-6"><h2 id="unit-goals-title" className="text-xl font-bold">학습 목표 {unit.definitionStatus === "pending" ? "초안" : ""}</h2><ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">{unit.objectives.map((goal) => <li key={goal.id}>{goal.description}</li>)}</ul><p className="mt-3 text-xs leading-6 text-slate-500">{unit.requirements.definitionStatus === "pending" ? "목표별 필수 활동과 평가 기준은 단위 집필 전에 확정합니다." : "아래 설명·실습·문제로 각 학습 목표를 확인하세요."}</p><Prerequisites unit={unit} /></section>
      <nav aria-label="설명 실습 평가 바로가기" className="my-6 flex flex-wrap gap-2">{catalogSlotNames.map((slot) => <a key={slot} className="rounded-lg border bg-white px-4 py-2 text-sm text-blue-700" href={`#${slot}`}>{slotLabels[slot]}</a>)}{authored && unit.topicId === "M06.05" ? <a className="rounded-lg border bg-white px-4 py-2 text-sm text-blue-700" href="#wheel-concept-lab">선택: 바퀴 모형</a> : null}{authored && ["M07.03", "M07.06"].includes(unit.topicId) ? <a className="rounded-lg border bg-white px-4 py-2 text-sm text-blue-700" href="#control-concept-lab">선택: 제어 모형</a> : null}{thresholdLab ? <a className="rounded-lg border bg-white px-4 py-2 text-sm text-blue-700" href="#threshold-concept-lab">선택: 임계값 모형</a> : null}{projectionLab ? <a className="rounded-lg border bg-white px-4 py-2 text-sm text-blue-700" href="#projection-concept-lab">선택: 투영·시각 모형</a> : null}</nav>
      <div className="space-y-5">{catalogSlotNames.map((slot) => {
        const resources = unit.slots[slot].filter(binding => !("resourceId" in binding ? binding.resourceId : binding.activityId).startsWith("authored:")).map(studyResource);
        return <section key={slot} id={slot} aria-labelledby={`${slot}-title`} className="rounded-2xl border bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 id={`${slot}-title`} className="text-xl font-bold">{slotLabels[slot]} <span className="text-xs font-normal text-slate-500">{requirementLabels[unit.requirements[slot].mode]}</span></h2><ReadinessBadge state={readiness.slots[slot]} /></div>
          <p className="mt-3 text-sm leading-7 text-slate-600">{unit.requirements[slot].reason}</p>
          {authored && slot === "explanation" ? <article id="authored-body" className="mt-6"><AuthoredMarkdown content={authored.body} /></article> : null}
          {authored && slot === "practice" ? <article id="authored-practice" className="mt-6"><AuthoredMarkdown content={authored.practice} /><AuthoredResponse key={`${activityIds[0]}:${unit.revision}`} activityId={activityIds[0]!} revision={unit.revision} solutionId="authored-practice-solution" solution={<AuthoredMarkdown content={authored.practiceSolution} />} /></article> : null}
          {authored && slot === "assessment" ? <div className="mt-6 space-y-8">{authored.questions.map((question, index) => <article key={`${unit.id}:${unit.revision}:${question.id}`} id={`authored-${question.id}`}><h3 className="mb-4 text-lg font-bold">확인 문제 Q{index + 1}</h3><AuthoredMarkdown content={question.prompt} /><AuthoredResponse key={`${unit.id}:${unit.revision}:${question.id}`} activityId={`authored:${unit.topicId}:${question.id}`} revision={unit.revision} solutionId={`authored-answer-${question.id}`} solution={<AuthoredMarkdown content={question.answer} />} /></article>)}</div> : null}
          {authored && resources.length ? <h3 className="mt-8 border-t pt-5 text-sm font-semibold">관련 기존 자료 · 보충해서 읽기</h3> : null}
          {!resources.length && !authored ? <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">{readiness.slots[slot] === "not_applicable" ? "별도 실습이 필요하지 않은 사유와 대체 이해 확인을 적용합니다." : "준비중 · 이 항목에 연결된 자료는 아직 없습니다."}</p> : resources.length ? <ul className="mt-5 space-y-3">{resources.map((resource) => <li key={resource.id} className="rounded-xl border border-slate-100 p-4">
            <p className="text-xs font-semibold text-blue-700">{resource.kind} · {authored ? "관련 기존 자료 · 보충 참고" : resource.role === "supplement" ? "보충 참고" : "학습 자료"}</p><h3 className="mt-2 text-sm font-semibold leading-7">{resource.title}</h3><p className="mt-2 text-xs leading-6 text-slate-500">{coverageLabels[resource.coverage]}</p><p className="mt-2 text-xs leading-6 text-slate-600">{resource.limitation}</p>{resource.feedback ? <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs leading-6 text-slate-600">{resource.feedback}</p> : null}
            {!resource.available ? <p role="status" className="mt-3 text-sm text-amber-900">자료 연결을 사용할 수 없습니다: {resource.reason}</p> : resource.links.length ? <ul className="mt-3 space-y-2">{resource.links.map((link) => <li key={link.href}><StudyResourceLink href={link.href} unitId={unit.id} trackIds={contexts.map((context) => context.id)} className="text-sm font-semibold text-blue-700 underline underline-offset-4">{link.title} ↗</StudyResourceLink></li>)}</ul> : <p className="mt-3 text-xs text-slate-500">독립 진입 화면이 없는 모형입니다. 위 한계를 확인하고 관련 실습 원고를 참고하세요.</p>}
          </li>)}</ul> : null}
          <div className="mt-5 border-t border-slate-100 pt-4"><h3 className="text-sm font-semibold">{authored ? "학습 범위와 한계" : "보완할 범위"}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{unit.gaps[slot]}</p></div>
        </section>;
      })}</div>
      {authored && ["M07.03", "M07.06"].includes(unit.topicId) ? <ControlConceptLab key={`${unit.id}:${unit.revision}:control-model`} /> : null}
      {authored && unit.topicId === "M06.05" ? <WheelConceptLab key={`${unit.id}:${unit.revision}:wheel-model`} /> : null}
      {authored && unit.topicId === "M34.01" ? <TelemetryConceptLab key={`${unit.id}:${unit.revision}:telemetry-model`} /> : null}
      {thresholdLab ? <ThresholdConceptLab key={`${unit.id}:${unit.revision}:threshold-model`} /> : null}
      {projectionLab ? <ProjectionConceptLab key={`${unit.id}:${unit.revision}:projection-model`} /> : null}
      {authored ? <><section id="authored-references" className="mt-6 rounded-2xl border bg-white p-5 sm:p-7"><h2 className="mb-4 text-xl font-bold">참고 자료</h2><AuthoredMarkdown content={authored.references} /></section><AuthoredCompletion unitId={unit.id} revision={unit.revision} catalogRevision={catalog.revision} readiness={readiness.state} activityIds={activityIds} /></> : null}
      <Suspense fallback={<StudyNavigationView navigation={{ ...base, context: null, notice: null }} />}><StudyNavigation base={base} contexts={contexts} /></Suspense>
      <p className="mt-6 text-xs leading-6 text-slate-500">신규 활동의 답안은 이 브라우저의 통합 학습 기록에 저장합니다. 기존 화면의 답안·진도는 원래 키를 유지합니다. AI 강사는 현재 단위의 준비 상태·부족한 범위와 연결된 실제 자료를 참고합니다.</p>
    </main>
    <LearningLocation unitId={unit.id} revision={unit.revision} catalogRevision={catalog.revision} trackIds={contexts.map((context) => context.id)} />
    <TutorDrawer {...studyTutorProps(unit)} />
  </CourseShell>;
}
