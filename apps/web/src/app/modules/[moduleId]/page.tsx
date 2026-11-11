import { pageMetadata } from "@/lib/seo";
import { pageForPath } from "@/lib/seo-content";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseShell } from "@/components/course-shell";
import { Breadcrumbs, Prerequisites, ReadinessBadge, ReadinessCounts } from "@/components/curriculum-parts";
import { catalog, curriculumIndex, curriculumReadiness, moduleIndex, moduleUnits, primaryReading, topicAnchor } from "@/lib/curriculum";
import { unitReadiness } from "@physical-ai/shared/catalog";

export function generateStaticParams() { return catalog.modules.map(({ id }) => ({ moduleId: id })); }
export async function generateMetadata({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  if (!moduleIndex.has(moduleId)) notFound();
  return pageMetadata(pageForPath(`/modules/${moduleId}/`));
}
export default async function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params; const courseModule = moduleIndex.get(moduleId); if (!courseModule) notFound();
  const area = catalog.areas.find((area) => area.id === courseModule.areaId)!;
  return <CourseShell title={`${courseModule.id} · ${courseModule.title}`} description="모듈 목표와 소주제별 준비 상태·권장 선수를 확인하세요.">
    <main className="curriculum-content mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumbs currentHref={`/modules/${moduleId}/`} items={[{ title: "학습 홈", href: "/" }, { title: "전체 목차", href: "/curriculum/" }, { title: area.title, href: `/curriculum/#${area.id}` }, { title: courseModule.id }]} />
      <section className="rounded-2xl border bg-white p-6"><ReadinessCounts counts={curriculumReadiness.modules[moduleId]!.counts} /><h2 className="mt-5 text-xl font-bold">모듈 목표</h2><ul className="mt-3 space-y-2 text-sm leading-7 text-slate-700">{courseModule.objectives.map((goal) => <li key={goal.id}>{goal.description}</li>)}</ul><p className="mt-4 text-sm leading-7 text-slate-600">원안의 선수 안내: {courseModule.prerequisiteNote}. 실제 보충은 아래 소주제별 권장 선수를 참고하세요.</p></section>
      <nav aria-label="이 모듈의 소주제" className="my-6 flex flex-wrap gap-2">{courseModule.topicIds.map((id) => <a key={id} href={`#${topicAnchor(id)}`} className="rounded-lg border bg-white px-3 py-2 text-sm text-blue-700">{id}</a>)}</nav>
      <div className="space-y-5">{moduleUnits(moduleId).map((unit) => {
        const reading = primaryReading(unit);
        const readiness = unitReadiness(unit, curriculumIndex).state;
        return <section key={unit.id} id={topicAnchor(unit.topicId)} aria-labelledby={`${unit.id}-title`} className="rounded-2xl border bg-white p-5 sm:p-7">
          <ReadinessBadge state={readiness} /><h2 id={`${unit.id}-title`} className="mt-3 text-xl font-bold leading-8"><span className="mr-3 font-mono text-blue-700">{unit.topicId}</span>{unit.title}</h2>
          <p className="mt-4 text-xs font-semibold text-slate-500">{readiness === "ready" ? "학습 목표" : "학습 목표 초안"}</p>
          <ul className="mt-2 text-sm leading-7 text-slate-700">{unit.objectives.map((goal) => <li key={goal.id}>{goal.description}</li>)}</ul>
          <Link href={`/study/${unit.id}/`} className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">학습 단위 열기 →</Link>
          <Prerequisites unit={unit} />
          <p className="mt-4 text-sm leading-7 text-slate-600">{readiness === "ready" ? "학습 범위" : "보완 예정"}: {unit.gaps.explanation}</p>
          {reading ? <Link className="mt-4 inline-block text-sm font-semibold leading-7 text-blue-700 underline underline-offset-4" href={reading.href}>{reading.kind === "authored-textbook" ? "교재 본문" : reading.kind === "legacy-lesson" ? "관련 기존 요약" : "관련 기존 본문"}: {reading.title}</Link> : <p className="mt-4 text-sm text-slate-500">핵심 설명은 준비중입니다. 목표와 선수 안내부터 확인할 수 있습니다.</p>}
        </section>;
      })}</div>
      <Link href={`/curriculum/#${area.id}`} className="mt-8 inline-block font-semibold text-blue-700">← 전체 목차의 {area.title} 영역</Link>
    </main>
  </CourseShell>;
}
