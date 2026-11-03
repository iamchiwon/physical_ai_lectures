import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseShell } from "@/components/course-shell";
import { Breadcrumbs, Prerequisites, ReadinessBadge, ReadinessCounts } from "@/components/curriculum-parts";
import { catalog, curriculumIndex, curriculumReadiness, trackIndex, unitLink } from "@/lib/curriculum";

export function generateStaticParams() { return catalog.tracks.map(({ id }) => ({ trackId: id })); }
export async function generateMetadata({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params; return { title: trackIndex.get(trackId)?.title ?? "경로 없음" };
}
export default async function TrackPage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params; const track = trackIndex.get(trackId); if (!track) notFound();
  return <CourseShell title={track.title} description="권장 선수 순서에 따라 기초에서 전문 분야로 이동하는 추천 경로입니다. 준비중인 항목도 전체 계획에 표시합니다.">
    <main className="curriculum-content mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ title: "학습 홈", href: "/" }, { title: "추천 경로", href: "/curriculum/#tracks" }, { title: track.title }]} />
      <section className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-5"><ReadinessCounts counts={curriculumReadiness.tracks[trackId]!.counts} /><p className="mt-3 text-sm leading-7 text-slate-600">필수 {track.steps.filter((step) => step.required).length}단위 · 선택 {track.steps.filter((step) => !step.required).length}단위. 집계는 중복을 제거한 필수 단위 기준입니다. 이미 아는 선수는 직접 넘어갈 수 있으며 방문을 완료·숙달로 기록하지 않습니다.</p><p className="mt-2 text-sm leading-7 text-slate-600">{track.description}</p><a href="#optional" className="mt-3 inline-block text-sm font-semibold text-blue-700">선택 심화 확인 ↓</a></section>
      {[true, false].map((required) => <section key={String(required)} id={required ? "required" : "optional"} aria-labelledby={`${required}-title`} className="mb-10"><h2 id={`${required}-title`} className="mb-4 text-2xl font-bold">{required ? "기본 추천 순서" : "선택 심화"}</h2>
        {!track.steps.some((step) => step.required === required) ? <p className="text-sm leading-7 text-slate-500">별도로 등록된 선택 심화는 없습니다. 다른 분야는 전체 목차에서 살펴볼 수 있습니다.</p> : <ol className="space-y-3">{track.steps.filter((step) => step.required === required).map((step, i) => {
          const link = unitLink(step.unitId); const unit = curriculumIndex.units.get(step.unitId)!;
          return <li key={step.id} id={step.id} className="rounded-2xl border bg-white p-5 target:border-blue-500 target:ring-2 target:ring-blue-200"><div className="flex flex-wrap items-center gap-3"><span className="font-mono text-sm text-slate-500">{String(i + 1).padStart(2, '0')}</span><ReadinessBadge state={link.state} /><span className="text-xs text-slate-500">{required ? "필수" : "선택"}</span></div><h3 className="mt-3 text-base font-bold leading-7"><Link href={`${link.href}?track=${track.id}`} className="text-blue-800">{link.topicId} · {link.title} →</Link></h3><details className="mt-3"><summary className="cursor-pointer text-sm text-slate-600">권장 선수 확인</summary><Prerequisites unit={unit} /></details></li>;
        })}</ol>}
      </section>)}
      <Link href="/curriculum/#tracks" className="font-semibold text-blue-700">← 다른 추천 경로 보기</Link>
    </main>
  </CourseShell>;
}
