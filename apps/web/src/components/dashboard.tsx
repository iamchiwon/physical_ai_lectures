import Link from "next/link";
import { ArrowDown, ArrowRight, BookOpen, Check, ChevronDown, Compass, Layers3 } from "lucide-react";
import { HomeProgress } from "@/components/home-progress";
import { Button } from "@/components/ui/button";
import { homeCatalog } from "@/lib/home-catalog";

interface DashboardProps {
  lessons: { id: string; title: string }[];
}

function StatusCounts({ counts }: { counts: { ready: number; partial: number; tbd: number } }) {
  return <span className="flex flex-wrap gap-x-3 gap-y-1 text-xs leading-5">
    {counts.ready > 0 ? <span className="text-emerald-800">준비됨 {counts.ready}</span> : null}
    <span className="text-blue-800">일부 준비 {counts.partial}</span><span className="text-slate-600">TBD {counts.tbd}</span>
  </span>;
}

export function Dashboard({ lessons }: DashboardProps) {
  const { totals, areas, tracks, readings } = homeCatalog;
  return (
    <main className="home-content">
      <section className="border-b border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-sky-100/70">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_.8fr] lg:px-8 lg:py-18">
          <div>
            <p className="text-xs font-bold tracking-[.16em] text-blue-700">PHYSICAL AI · 한국어 자습 과정</p>
            <h1 className="mt-5 max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">로봇을 이해하고,<br /><span className="text-blue-600">나의 경로로</span> 배웁니다.</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">기초 공학에서 인지·제어·학습·실증까지.<br className="hidden sm:block" /> 로봇팔, 모바일, 휴머노이드 등 관심 분야를 고르고 필요한 기초부터 연결하세요.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg"><a href="#tracks">추천 경로 고르기 <ArrowDown className="size-4" aria-hidden="true" /></a></Button>
              <Button asChild size="lg" variant="outline"><a href="#curriculum">전체 목차 살펴보기</a></Button>
            </div>
            <p className="mt-5 text-sm leading-6 text-slate-500">모든 모듈을 순서대로 이수할 필요는 없습니다.<br />장비 없는 개념·로그 분석이 기본이며 GPU·실물 실습은 별도 환경이 필요합니다.</p>
          </div>
          <aside aria-labelledby="availability-title" className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl shadow-blue-950/10">
            <div className="border-b border-white/10 px-6 py-6 sm:px-8">
              <p className="text-xs font-semibold tracking-widest text-sky-300">과정 전체 계획</p>
              <dl className="mt-5 grid grid-cols-3 gap-3">
                {[['모듈', totals.modules], ['소주제', totals.topics], ['추천 경로', totals.tracks]].map(([label, value]) => <div key={label}><dd className="text-3xl font-bold tabular-nums sm:text-4xl">{value}</dd><dt className="mt-2 text-xs text-slate-300">{label}</dt></div>)}
              </dl>
            </div>
            <div className="px-6 py-6 sm:px-8">
              <h2 id="availability-title" className="text-sm font-bold">현재 자료 준비 현황</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-slate-300">준비됨</dt><dd className="font-bold tabular-nums">{totals.ready}</dd></div>
                <div className="flex justify-between"><dt className="text-sky-200">일부 준비 · 기존 자료 연결</dt><dd className="font-bold tabular-nums text-sky-200">{totals.partial}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-300">준비 예정 · TBD</dt><dd className="font-bold tabular-nums">{totals.tbd}</dd></div>
              </dl>
              <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-6 text-slate-300">{totals.ready === 0 ? "전체 목표와 활동을 충족한 준비 완료 단위는 아직 없습니다. 일부 준비 자료부터 읽을 수 있습니다." : "단위별 준비 상태를 확인하고 학습을 시작하세요."} 전체 과정의 예상 시간은 미정입니다.</p>
            </div>
          </aside>
        </div>
      </section>

      <nav aria-label="홈 학습 메뉴" className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-2 px-4 py-4 text-sm font-semibold text-slate-600 sm:px-6 lg:px-8">
          <a href="#tracks">추천 경로</a><a href="#available">지금 읽을 자료</a><a href="#curriculum">전체 목차</a><Link href="/textbook/">기존 교재 전체 <span aria-hidden="true">↗</span></Link>
        </div>
      </nav>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <section aria-labelledby="start-title" className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 sm:p-8">
          <Compass className="size-6 text-blue-600" aria-hidden="true" />
          <h2 id="start-title" className="mt-4 text-xl font-bold">처음 오셨나요?</h2>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li className="flex gap-3"><span className="font-bold text-blue-600">01</span><span>관심 있는 분야의 경로를 고릅니다.</span></li>
            <li className="flex gap-3"><span className="font-bold text-blue-600">02</span><span>기초 지식과 권장 선수를 확인합니다. 코딩·수학·제어를 모두 안다고 가정하지 않습니다.</span></li>
            <li className="flex gap-3"><span className="font-bold text-blue-600">03</span><span>기존 본문을 읽고 요약·실습·문제로 이해를 확인합니다.</span></li>
          </ol>
          <p className="mt-4 text-xs leading-5 text-slate-600">학습 진단·기초 브리지는 M00~M04에 계획되어 있습니다. 미작성 부분은 아래 목차에 TBD로 표시합니다.</p>
        </section>
        <HomeProgress lessons={lessons} />
      </div>

      <section id="tracks" aria-labelledby="tracks-title" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-xs font-bold tracking-widest text-blue-700">관심 분야에서 시작하기</p>
        <h2 id="tracks-title" className="mt-2 text-3xl font-bold tracking-tight">목표에 맞는 여섯 가지 경로</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">공통 기초를 공유하고 전문 분야로 나뉩니다. 필요한 선수 지식은 경로 앞에 보충해 두었습니다. 선수는 권장 안내이며, 단위별 목표·선수 조건은 집필 과정에서 확정합니다.</p>
        <div className="mt-7 grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tracks.map((track, i) => <article key={track.id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-bold tracking-widest text-blue-600">PATH {String(i + 1).padStart(2, '0')}</p>
            <h3 className="mt-3 text-lg font-bold leading-7">{track.title}</h3>
            <p className="mt-3 min-h-18 text-sm leading-6 text-slate-600">{track.introduction}</p>
            <p className="mt-4 text-xs text-slate-500">필수 {track.required}단위 · 선택 {track.optional}단위</p>
            <div className="mt-2"><StatusCounts counts={track.counts} /></div>
            <details className="mt-5 border-t border-slate-100 pt-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-blue-700"><span>{track.title} 경로 개요</span><ChevronDown aria-hidden="true" className="size-4 shrink-0" /></summary>
              <p className="mt-4 text-xs leading-6 text-slate-500">필수 경로에서 만나는 모듈 순서입니다. 같은 모듈의 일부 기초를 먼저 보충할 수 있습니다.</p>
              <ol className="mt-3 space-y-2 text-xs leading-6 text-slate-600">{track.sequence.map((module) => <li key={module.id}><span className="mr-2 font-mono text-blue-700">{module.id}</span>{module.title}</li>)}</ol>
              <a className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700" href="#available">연결된 기존 자료 보기 <ArrowRight aria-hidden="true" className="size-4" /></a>
            </details>
          </article>)}
        </div>
        <p className="mt-4 text-xs leading-6 text-slate-500">준비 현황은 각 경로의 필수 단위 기준입니다. 여러 경로가 같은 단위를 공유하므로 합산하지 않습니다.</p>
      </section>

      <section id="available" aria-labelledby="available-title" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold tracking-widest text-blue-700">기존 자료부터 읽기</p><h2 id="available-title" className="mt-2 text-3xl font-bold tracking-tight">지금 펼쳐볼 수 있는 내용</h2></div>
          <Link href="/textbook/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">기존 6장 교재 전체 <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">아래는 일부 준비 소주제와 관련된 기존 교재의 상세 본문입니다. 원문은 읽을 수 있지만, 신규 소주제의 설명·실습·평가 전체가 완성된 상태는 아닙니다.</p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">{readings.map((item) => <article key={item.topicId} className="flex min-w-0 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <span className="mt-1 rounded-xl bg-blue-50 p-2.5 text-blue-700"><BookOpen className="size-5" aria-hidden="true" /></span>
          <div className="min-w-0"><p className="text-xs font-semibold text-blue-700">{item.topicId} · 일부 준비</p><h3 className="mt-2 font-bold leading-7">{item.title}</h3><Link href={item.reading.href} className="mt-2 block text-sm leading-6 text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-blue-700">관련 본문: {item.reading.title}</Link></div>
        </article>)}</div>
        <p className="mt-4 flex items-start gap-2 text-xs leading-6 text-slate-500"><Check className="mt-1 size-4 shrink-0" aria-hidden="true" />본문의 로컬 코드·GPU·실물 실습과 브라우저 계산 모형은 실행 환경과 검증 범위가 다릅니다.</p>
      </section>

      <section id="curriculum" aria-labelledby="curriculum-title" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Layers3 className="size-6 text-blue-600" aria-hidden="true" />
        <h2 id="curriculum-title" className="mt-3 text-3xl font-bold tracking-tight">전체 목차 한눈에 보기</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">7개 영역, {totals.modules}개 모듈, {totals.topics}개 소주제의 전체 계획입니다. 영역을 펼쳐 모듈과 준비 현황을 확인하세요. TBD는 자료 준비 예정이며, 일부 준비 모듈에서는 관련 기존 본문을 열 수 있습니다.</p>
        <div className="mt-6 space-y-3">{areas.map((area, i) => <details key={area.id} className="rounded-2xl border border-slate-200 bg-white" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:px-6"><span className="flex items-center gap-4"><span className="font-mono text-sm text-blue-700">0{i + 1}</span><span className="font-bold">{area.title} <span className="ml-1 text-xs font-normal text-slate-500">{area.modules.length}모듈</span></span></span><ChevronDown className="size-4 shrink-0 text-slate-500" aria-hidden="true" /></summary>
          <ul className="divide-y divide-slate-100 border-t border-slate-100 px-5 sm:px-6">{area.modules.map((module) => <li key={module.id} className="flex flex-col justify-between gap-3 py-5 sm:flex-row sm:items-center">
            <div className="min-w-0"><h3 className="text-sm font-semibold leading-7"><span className="mr-3 font-mono text-blue-700">{module.id}</span>{module.title}</h3><div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1"><span className="text-xs text-slate-500">{module.topics}소주제</span><StatusCounts counts={module.counts} /></div></div>
            {module.reading ? <Link href={module.reading.href} aria-label={`${module.id} ${module.title} 관련 본문 읽기`} className="shrink-0 text-sm font-semibold text-blue-700">관련 본문 읽기 <span aria-hidden="true">↗</span></Link> : <span className="text-xs text-slate-500">본문 준비 예정</span>}
          </li>)}</ul>
        </details>)}</div>
        <p className="mt-4 text-xs leading-6 text-slate-500">M33 선택 체험은 본선의 필수 선수가 아닙니다. 기존 요약 레슨과 상세 본문은 원래 위치에서 계속 이용할 수 있습니다.</p>
      </section>
    </main>
  );
}
