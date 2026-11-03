import Link from "next/link";
import { CourseShell } from "@/components/course-shell";
import { Breadcrumbs, ReadinessCounts } from "@/components/curriculum-parts";
import { catalog, curriculumReadiness, moduleIndex, topicIndex } from "@/lib/curriculum";

export const metadata = { title: "전체 목차 · 34모듈 204소주제" };
export default function CurriculumPage() {
  return <CourseShell title="전체 목차" description="34개 모듈·204개 소주제를 살펴보고, 필요한 기초와 관심 분야를 선택하세요. TBD도 전체 학습 계획에 포함됩니다.">
    <main className="curriculum-content mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ title: "학습 홈", href: "/" }, { title: "전체 목차" }]} />
      <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-5"><ReadinessCounts counts={curriculumReadiness.overall.counts} /><p className="mt-2 text-sm leading-7 text-slate-600">일부 준비는 관련 기존 자료가 있다는 뜻이며 신규 목표·실습·평가 전체의 완성을 뜻하지 않습니다. 선수는 접근 잠금이 아닌 권장 안내입니다.</p><Link className="mt-3 inline-block font-semibold text-blue-700" href="#tracks">분야별 추천 경로 선택 ↓</Link></div>
      <nav aria-label="영역 바로가기" className="mb-6 flex flex-wrap gap-2">{catalog.areas.map((area) => <a key={area.id} href={`#${area.id}`} className="rounded-lg border bg-white px-3 py-2 text-sm text-slate-700">{area.title}</a>)}</nav>
      {catalog.areas.map((area) => <section key={area.id} id={area.id} aria-labelledby={`${area.id}-title`} className="mb-10">
        <h2 id={`${area.id}-title`} className="mb-4 text-2xl font-bold">{area.title}</h2>
        <div className="space-y-3">{area.moduleIds.map((id) => {
          const courseModule = moduleIndex.get(id)!;
          return <details key={id} className="rounded-2xl border bg-white" open={id === "M00"}>
            <summary className="cursor-pointer p-5"><span className="ml-2 font-semibold"><span className="mr-3 font-mono text-blue-700">{id}</span>{courseModule.title}</span><span className="ml-6 mt-2 block"><ReadinessCounts counts={curriculumReadiness.modules[id]!.counts} /></span></summary>
            <div className="border-t p-5"><Link className="font-semibold text-blue-700 underline underline-offset-4" href={`/modules/${id}/`}>모듈 목표·선수 조건 보기 →</Link><ol className="mt-4 divide-y divide-slate-100">{courseModule.topicIds.map((topicId) => {
              const topic = topicIndex.get(topicId)!;
              return <li key={topicId} className="py-3"><Link href={`/study/${topic.unitIds[0]}/`} className="block text-sm leading-7 text-slate-800 hover:text-blue-700"><span className="mr-3 font-mono text-blue-700">{topic.id}</span>{topic.title}</Link><ReadinessCounts counts={curriculumReadiness.topics[topicId]!.counts} /></li>;
            })}</ol></div>
          </details>;
        })}</div>
      </section>)}
      <section id="tracks" aria-labelledby="tracks-title"><h2 id="tracks-title" className="text-2xl font-bold">분야별 추천 경로</h2><p className="mt-3 text-sm leading-7 text-slate-600">필요한 선수 기초를 앞에 보충했습니다. 선택 심화는 기본 준비도 집계에서 제외합니다. M33 체험은 본선 필수가 아닙니다.</p><div className="mt-5 grid gap-4 sm:grid-cols-2">{catalog.tracks.map((track) => <Link key={track.id} href={`/tracks/${track.id}/`} className="rounded-2xl border bg-white p-5"><h3 className="font-bold text-blue-800">{track.title} →</h3><p className="my-2 text-sm text-slate-600">필수 {track.steps.filter((step) => step.required).length}단위 · 선택 {track.steps.filter((step) => !step.required).length}단위</p><ReadinessCounts counts={curriculumReadiness.tracks[track.id]!.counts} /></Link>)}</div></section>
    </main>
  </CourseShell>;
}
