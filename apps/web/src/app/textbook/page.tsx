import Link from "next/link";
import { CourseShell } from "@/components/course-shell";
import { ReadinessBadge } from "@/components/curriculum-parts";
import { glossary } from "@/lib/textbook";
import { buildTextbookIndex } from "@/lib/textbook-index";
import { GlossaryPractice } from "@/components/glossary-practice";

export const metadata = { title: "교재 본문·실습·확인 문제 | Physical AI 로봇 제어 실무" };

export default function TextbookIndex() {
  const index = buildTextbookIndex();
  return <CourseShell title="교재 본문·실습·확인 문제" description="모듈별 상세 교재를 읽고, 기존 6장 응용 교재의 로봇 제어·학습·실증으로 연결합니다.">
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <Link href="/curriculum/" className="inline-block font-semibold text-blue-700">34모듈·204소주제 통합 목차 →</Link>
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm leading-7 text-slate-700">
        <p><strong>상세 교재 {index.authoredCount}개 단위</strong>와 <strong>기존 응용 교재 {index.legacyCount}개 읽기 절</strong>을 함께 제공합니다. 단위와 읽기 절은 서로 다른 구조이므로 완료 수로 합산하지 않습니다.</p>
        <nav aria-label="교재 종류 바로가기" className="mt-3 flex flex-wrap gap-x-5 gap-y-2 font-semibold text-blue-700"><a href="#foundation-textbook">상세 교재</a><a href="#legacy-textbook">기존 6장 응용 교재</a><a href="#glossary-practice">용어 복습</a></nav>
      </div>
      <section id="foundation-textbook" aria-labelledby="foundation-textbook-title" className="space-y-5">
        <div><h2 id="foundation-textbook-title" className="text-2xl font-bold text-blue-950">상세 교재</h2><p className="mt-3 text-sm leading-7 text-slate-600">검수를 마친 단위의 본문·장비 없는 실습·확인 문제와 개별 해설을 바로 읽을 수 있습니다. 답안과 자기검토를 기록한 뒤 준비된 단위의 학습 완료를 직접 선택합니다.</p></div>
        {!index.authoredCount ? <p className="rounded-xl bg-slate-100 p-5 text-sm leading-7 text-slate-600">상세 교재는 준비중입니다. 전체 목차에서 목표와 현재 연결된 자료를 확인하세요.</p> : index.foundations.map(module => <section key={module.id} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h3 className="text-lg font-bold text-blue-950">{module.id} · {module.title}</h3>
          <ol className="mt-4 divide-y divide-slate-100">{module.units.map(unit => <li key={unit.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap items-center gap-3"><ReadinessBadge state={unit.state} /><Link className="min-w-0 font-semibold leading-7 text-blue-800 underline underline-offset-4" href={unit.href}>{unit.topicId} · {unit.title}</Link></div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm leading-7 text-blue-700"><Link href={`${unit.href}#authored-body`}>본문 {unit.bodies}편</Link><Link href={`${unit.href}#authored-practice`}>실습 {unit.practices}개·해설</Link><Link href={`${unit.href}#assessment`}>확인 문제 {unit.questions}개·개별 해설</Link></div>
          </li>)}</ol>
        </section>)}
      </section>
      <section id="legacy-textbook" aria-labelledby="legacy-textbook-title" className="space-y-5">
        <div><h2 id="legacy-textbook-title" className="text-2xl font-bold text-blue-950">기존 6장 응용 교재</h2><p className="mt-3 text-sm leading-7 text-slate-600">실습 준비·안전과 기존 6장의 {index.legacyCount}개 읽기 절입니다. 원래 본문·실습·문제 URL과 답안 기록을 유지하며 상세 교재와 연결합니다.</p></div>
        {index.legacy.map(group => <section key={group.title} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"><h3 className="mb-4 text-lg font-bold text-blue-950">{group.title}</h3><ol className="grid gap-2">{group.units.map(unit => <li key={unit.href}><Link className="block rounded-lg px-3 py-2 leading-7 text-blue-700 hover:bg-blue-50" href={unit.href}>{unit.title}</Link></li>)}</ol></section>)}
      </section>
      <GlossaryPractice terms={glossary} />
    </main>
  </CourseShell>;
}
