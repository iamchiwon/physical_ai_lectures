import Link from "next/link";
import { ArrowDown, ArrowRight, BookOpen, Check, ChevronDown, Compass, Layers3 } from "lucide-react";
import { LearningStages } from "@/components/learning-stages";
import { HomeProgress } from "@/components/home-progress";
import { Button } from "@/components/ui/button";
import { catalog, curriculumIndex, stateLabels } from "@/lib/curriculum";
import { unitReadiness } from "@physical-ai/shared/catalog";
import { homeCatalog } from "@/lib/home-catalog";

interface DashboardProps {
  lessons: { id: string; title: string }[];
}

function StatusCounts({ counts }: { counts: { ready: number; partial: number; tbd: number } }) {
  const pending = counts.partial + counts.tbd;
  return pending > 0 ? <span className="text-xs leading-5 text-slate-600">준비중 {pending}</span> : null;
}

export function Dashboard({ lessons }: DashboardProps) {
  const { totals, areas, tracks, readings } = homeCatalog;
  return (
    <main className="home-content">
      <section className="border-b border-blue-100 bg-gradient-to-br from-white via-blue-50/60 to-sky-100/70">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_.8fr] lg:px-8 lg:py-18">
          <div>
            <p className="text-xs font-bold tracking-[.16em] text-blue-700">PHYSICAL AI · 한국어 자습 과정</p>
            <h1 className="mt-5 max-w-3xl text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">코딩 경험에서,<br /><span className="text-blue-600">로봇 시스템 구현으로</span> 이어갑니다.</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">실행 환경과 도구에서 인지·제어·학습·통합까지.<br className="hidden sm:block" /> 공통 학습 순서로 시작하고 목표에 맞는 전문 분야로 확장하세요.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href="/tracks/track-main/">공통 과정 시작하기 <ArrowDown className="size-4" aria-hidden="true" /></Link></Button>
              <Button asChild size="lg" variant="outline"><a href="/curriculum/#learning-sequence">학습 순서 살펴보기</a></Button>
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
              <h2 id="availability-title" className="text-sm font-bold">교재 현황</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-slate-300">상세 교재</dt><dd className="font-bold tabular-nums">{totals.ready}</dd></div>
                <div className="flex justify-between"><dt className="text-sky-200">준비중</dt><dd className="font-bold tabular-nums text-sky-200">{totals.partial + totals.tbd}</dd></div>
              </dl>
              <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-6 text-slate-300">{totals.ready === 0 ? "상세 교재는 준비중입니다. 연결된 기존 자료부터 읽을 수 있습니다." : "교재를 읽고 실습과 문제로 학습을 시작하세요."} 전체 과정의 예상 시간은 미정입니다.</p>
            </div>
          </aside>
        </div>
      </section>

      <nav aria-label="홈 학습 메뉴" className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-2 px-4 py-4 text-sm font-semibold text-slate-600 sm:px-6 lg:px-8">
          <a href="#tracks">추천 경로</a><a href="#available">지금 읽을 자료</a><a href="/curriculum/">전체 목차</a><Link href="/textbook/">기존 교재 전체 <span aria-hidden="true">↗</span></Link>
        </div>
      </nav>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <section aria-labelledby="start-title" className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 sm:p-8">
          <Compass className="size-6 text-blue-600" aria-hidden="true" />
          <h2 id="start-title" className="mt-4 text-xl font-bold">처음 오셨나요?</h2>
          <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
            <li className="flex gap-3"><span className="font-bold text-blue-600">01</span><span>공통 과정 또는 목표 분야의 경로를 고릅니다.</span></li>
            <li className="flex gap-3"><span className="font-bold text-blue-600">02</span><span>일반 코딩 경험을 바탕으로 개발 환경·빌드 도구와 필요한 로봇·수학 선수를 확인합니다.</span></li>
            <li className="flex gap-3"><span className="font-bold text-blue-600">03</span><span>단위별 실습·문제로 확인하고 단계별 프로젝트로 기술을 연결합니다.</span></li>
          </ol>
          <p className="mt-4 text-xs leading-5 text-slate-600">Python·C/C++의 일반 문법은 선수 지식으로 봅니다. 환경·패키지·CMake 등 AI·로봇 도구 사용에 필요한 내용부터 연결하며 미집필 항목은 준비중으로 표시합니다.</p>
        </section>
        <HomeProgress lessons={lessons} units={catalog.units.map((unit) => ({ id: unit.id, title: unit.title, revision: unit.revision, state: stateLabels[unitReadiness(unit, curriculumIndex).state], readiness: unitReadiness(unit, curriculumIndex).state, trackIds: catalog.tracks.filter((track) => track.steps.some((step) => step.unitId === unit.id)).map((track) => track.id) }))} />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><LearningStages compact /></div>
      <section id="tracks" aria-labelledby="tracks-title" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-xs font-bold tracking-widest text-blue-700">관심 분야에서 시작하기</p>
        <h2 id="tracks-title" className="mt-2 text-3xl font-bold tracking-tight">공통 과정과 분야별 경로</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">통합 시스템을 순서대로 배우려면 공통 과정을, 특정 분야가 목표라면 전문 경로를 선택하세요. 선수는 권장 안내이며 일부 심화·프로젝트 실행 패키지는 준비중입니다.</p>
        <div className="mt-7 grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tracks.map((track, i) => <article key={track.id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-bold tracking-widest text-blue-600">PATH {String(i + 1).padStart(2, '0')}</p>
            <h3 className="mt-3 text-lg font-bold leading-7">{track.title}</h3>
            <p className="mt-3 min-h-18 text-sm leading-6 text-slate-600">{track.introduction}</p>
            <p className="mt-4 text-xs text-slate-500">필수 {track.required}단위 · 선택 {track.optional}단위</p>
            <div className="mt-2"><StatusCounts counts={track.counts} /></div>
            <Link href={`/tracks/${track.id}/`} className="mt-4 inline-block text-sm font-semibold text-blue-700">전체 추천 순서 보기 →</Link>
            <details className="mt-5 border-t border-slate-100 pt-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold text-blue-700"><span>{track.title} 경로 개요</span><ChevronDown aria-hidden="true" className="size-4 shrink-0" /></summary>
              <p className="mt-4 text-xs leading-6 text-slate-500">필수 경로에서 만나는 모듈 순서입니다. 같은 모듈의 일부 기초를 먼저 보충할 수 있습니다.</p>
              <ol className="mt-3 space-y-2 text-xs leading-6 text-slate-600">{track.sequence.map((module) => <li key={module.id}><span className="mr-2 font-mono text-blue-700">{module.id}</span>{module.title}</li>)}</ol>
              <a className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700" href="#available">공개된 학습 자료 보기 <ArrowRight aria-hidden="true" className="size-4" /></a>
            </details>
          </article>)}
        </div>
        <p className="mt-4 text-xs leading-6 text-slate-500">준비 현황은 각 경로의 필수 단위 기준입니다. 여러 경로가 같은 단위를 공유하므로 합산하지 않습니다.</p>
      </section>

      <section id="available" aria-labelledby="available-title" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold tracking-widest text-blue-700">교재와 함께 학습하기</p><h2 id="available-title" className="mt-2 text-3xl font-bold tracking-tight">지금 펼쳐볼 수 있는 내용</h2></div>
          <Link href="/textbook/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">기존 6장 교재 전체 <ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">상세 교재는 본문·기본 실습·문제·해설을 함께 제공합니다. 준비중인 단위도 관련 기존 원문을 읽을 수 있습니다.</p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">{readings.map((item) => <article key={item.topicId} className="flex min-w-0 items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <span className="mt-1 rounded-xl bg-blue-50 p-2.5 text-blue-700"><BookOpen className="size-5" aria-hidden="true" /></span>
          <div className="min-w-0"><p className="text-xs font-semibold text-blue-700">{item.topicId}{stateLabels[item.state] ? ` · ${stateLabels[item.state]}` : ""}</p><h3 className="mt-2 font-bold leading-7"><Link href={`/study/${item.unitId}/`}>{item.title} →</Link></h3><Link href={item.reading.href} className="mt-2 block text-sm leading-6 text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-blue-700">관련 본문: {item.reading.title}</Link></div>
        </article>)}</div>
        <p className="mt-4 flex items-start gap-2 text-xs leading-6 text-slate-500"><Check className="mt-1 size-4 shrink-0" aria-hidden="true" />본문의 로컬 코드·GPU·실물 실습과 브라우저 계산 모형은 실행 환경과 검증 범위가 다릅니다.</p>
      </section>

      <section id="curriculum" aria-labelledby="curriculum-title" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Layers3 className="size-6 text-blue-600" aria-hidden="true" />
        <h2 id="curriculum-title" className="mt-3 text-3xl font-bold tracking-tight">전체 목차 한눈에 보기</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">{areas.length}개 영역, {totals.modules}개 모듈, {totals.topics}개 소주제의 전체 계획입니다. 영역을 펼쳐 모듈과 준비 현황을 확인하세요. 미완료 항목은 준비중으로 표시하며, 연결된 기존 본문은 열 수 있습니다.</p>
        <div className="mt-6 space-y-3">{areas.map((area, i) => <details key={area.id} className="rounded-2xl border border-slate-200 bg-white" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:px-6"><span className="flex items-center gap-4"><span className="font-mono text-sm text-blue-700">0{i + 1}</span><span className="font-bold">{area.title} <span className="ml-1 text-xs font-normal text-slate-500">{area.modules.length}모듈</span></span></span><ChevronDown className="size-4 shrink-0 text-slate-500" aria-hidden="true" /></summary>
          <ul className="divide-y divide-slate-100 border-t border-slate-100 px-5 sm:px-6">{area.modules.map((module) => <li key={module.id} className="flex flex-col justify-between gap-3 py-5 sm:flex-row sm:items-center">
            <div className="min-w-0"><h3 className="text-sm font-semibold leading-7"><span className="mr-3 font-mono text-blue-700">{module.id}</span>{module.title}</h3><div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1"><span className="text-xs text-slate-500">{module.topics}소주제</span><StatusCounts counts={module.counts} /></div></div>
            {module.reading ? <Link href={module.reading.href} aria-label={`${module.id} ${module.title} 관련 본문 읽기`} className="shrink-0 text-sm font-semibold text-blue-700">관련 본문 읽기 <span aria-hidden="true">↗</span></Link> : <span className="text-xs text-slate-500">준비중</span>}
          </li>)}</ul>
        </details>)}</div>
        <Link href="/curriculum/" className="mt-5 inline-block font-semibold text-blue-700">{totals.topics}소주제 전체 목차 열기 →</Link>
        <p className="mt-4 text-xs leading-6 text-slate-500">M33 선택 체험은 본선의 필수 선수가 아닙니다. 기존 요약 레슨과 상세 본문은 원래 위치에서 계속 이용할 수 있습니다.</p>
      </section>
    </main>
  );
}
