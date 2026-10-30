import Link from "next/link";
import { CourseShell } from "@/components/course-shell";
import { textbookUnits, glossary } from "@/lib/textbook";
import { GlossaryPractice } from "@/components/glossary-practice";

export const metadata = { title: "설명·실습·연습문제 | Physical AI 로봇 제어 실무" };

export default function TextbookIndex() {
  const groups = [...new Set(textbookUnits.map((unit) => unit.group))];
  return (
    <CourseShell title="설명·실습·연습문제" description="개념을 읽고, 가상실습으로 관찰하고, 직접 답안을 작성해 피드백을 받습니다.">
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <p className="text-slate-600">{textbookUnits.length}개 학습 단위 · 교재의 개념 설명을 기반으로 실습과 평가를 함께 제공합니다.</p>
        {groups.map((group) => <section key={group} className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-bold text-blue-950">{group}</h2>
          <ol className="grid gap-2">{textbookUnits.filter((unit) => unit.group === group).map((unit) => <li key={unit.slug}><Link className="block rounded-lg px-3 py-2 text-blue-700 hover:bg-blue-50" href={`/textbook/${unit.slug}/`}>{unit.title}</Link></li>)}</ol>
        </section>)}
        <GlossaryPractice terms={glossary} />
      </main>
    </CourseShell>
  );
}
