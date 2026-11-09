import Link from "next/link";
import { learningStages, topicIndex, unitLink, curriculumReadiness } from "@/lib/curriculum";
import { ReadinessBadge, ReadinessCounts } from "@/components/curriculum-parts";
import { learningProjects } from "@/lib/learning-projects";

export function LearningStages({ compact = false }: { compact?: boolean }) {
  return <section id="learning-sequence" aria-labelledby="learning-sequence-title" className="my-8">
    <h2 id="learning-sequence-title" className="text-2xl font-bold text-blue-950">학습 단계별 순서</h2>
    <p className="mt-3 text-sm leading-7 text-slate-600">일반 코딩 경험을 바탕으로 환경·도구부터 로봇 시스템 통합까지 연결합니다. Python·C/C++ 문법 입문은 포함하지 않습니다. 이미 아는 내용은 확인 후 건너뛸 수 있습니다.</p>
    <Link href="/tracks/track-main/" className="mt-3 inline-block font-semibold text-blue-700 underline underline-offset-4">공통 과정의 추천 순서로 시작하기 →</Link>
    <div className="mt-5 space-y-3">{learningStages.filter(stage => !compact || stage.id.startsWith("S")).map(stage => {
      const units = stage.topicIds.flatMap(id => topicIndex.get(id)!.unitIds.map(unitLink));
      const counts = units.reduce((sum, unit) => { sum[unit.state]++; return sum; }, { ready: 0, partial: 0, tbd: 0 });
      return <details key={stage.id} id={`stage-${stage.id}`} className="rounded-2xl border border-slate-200 bg-white" open={!compact && stage.id === "S00"}>
        <summary className="cursor-pointer p-5"><span className="font-mono text-sm text-blue-700">{stage.id}</span><span className="ml-3 font-semibold leading-7">{stage.title}</span><span className="mt-2 block text-xs text-slate-500">{units.length}개 단위 {stage.id.startsWith("A") ? "· 전문화 선택" : "· 공통 과정"}</span><ReadinessCounts counts={counts} /></summary>
        <div className="border-t p-5"><p className="text-sm leading-7 text-slate-600">{stage.description}</p>
          {stage.id === "S11" ? <p className="mt-2 text-sm leading-7 text-slate-600">모바일·팔·이동 조작 중 과제를 선택하고 재현 패키지와 발표로 마무리합니다. 모든 과제 변형의 제출을 요구하지 않습니다.</p> : null}
          <ol className="mt-4 divide-y divide-slate-100">{units.map(unit => <li key={unit.id} className="py-3"><div className="flex flex-wrap items-center gap-2"><ReadinessBadge state={unit.state} /><Link href={`${unit.href}${stage.id.startsWith("S") ? "?track=track-main" : ""}`} className="min-w-0 text-sm leading-7 text-blue-800 underline underline-offset-4">{unit.topicId} · {unit.title}</Link></div></li>)}</ol>
          {stage.milestoneIds.map(id => { const project = learningProjects.find(project => project.id === id)!; return <div key={id} className="mt-4 rounded-xl bg-blue-50 p-4"><Link href={`/projects/${id}/`} className="font-semibold text-blue-800">{id} · {project.title} →</Link><p className="mt-2 text-xs leading-6 text-slate-600">{project.starter ? "장비 없는 실행 자료·입력·실패 해설과 수행 근거 기록을 제공합니다." : "프로젝트 목표·선수·평가 안내를 읽을 수 있습니다. 실행 패키지는 준비중입니다."}</p></div>; })}
        </div>
      </details>;
    })}</div>
    {compact ? <Link href="/curriculum/#learning-sequence" className="mt-4 inline-block font-semibold text-blue-700">전문화 선택까지 전체 단계 보기 →</Link> : <p className="mt-4 text-xs leading-6 text-slate-500">집필 상태와 학습 완료는 별개입니다. 단계는 기간이나 주차를 뜻하지 않으며, 준비중인 단위는 전체 계획에 포함됩니다. 현재 상세 교재 {curriculumReadiness.overall.counts.ready}개.</p>}
  </section>;
}
