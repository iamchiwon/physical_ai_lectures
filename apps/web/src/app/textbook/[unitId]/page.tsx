import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseShell } from "@/components/course-shell";
import { TextbookMarkdown } from "@/components/textbook-markdown";
import { TutorDrawer } from "@/components/tutor-drawer";
import { courseModules } from "@/data/course";
import { textbookUnits, textbookExamples, exercisesForUnit } from "@/lib/textbook";
import { WrittenExercises } from "@/components/written-exercises";
import { TextbookLab } from "@/components/textbook-lab";

export async function generateMetadata({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const unit = textbookUnits.find((item) => item.slug === unitId);
  return { title: unit ? `${unit.title} | 교재 본문` : "교재 본문" };
}

export function generateStaticParams() {
  return textbookUnits.map((unit) => ({ unitId: unit.slug }));
}

export default async function TextbookPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const index = textbookUnits.findIndex((unit) => unit.slug === unitId);
  const unit = textbookUnits[index];
  if (!unit) notFound();
  const previous = textbookUnits[index - 1];
  const next = textbookUnits[index + 1];
  const lessons = courseModules.find((module) => module.number === unit.chapter)?.lessons ?? [];
  const examples = textbookExamples(unit);
  const exercises = exercisesForUnit(unit);
  return (
    <CourseShell>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <nav className="mb-5 flex flex-wrap gap-4 text-sm text-blue-700"><Link href="/textbook/">교재 전체 목차</Link><span>{unit.group}</span><a href={`/textbook-assets/${unit.source}`} download>원고 다운로드</a></nav>
        {exercises.length && !exercises[0]!.id.endsWith("-report") ? <><h1 className="mb-5 text-3xl font-bold">{unit.title}</h1><details className="rounded-xl border bg-white p-5"><summary className="cursor-pointer font-semibold">문제 전체와 원문 안내 보기</summary><TextbookMarkdown unit={unit} /></details></> : <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-10"><TextbookMarkdown unit={unit} /></article>}
        {unit.source.includes("/labs/") ? <TextbookLab source={unit.source} chapter={unit.chapter} /> : null}
        {exercises.length ? <WrittenExercises exercises={exercises} /> : null}
        {examples.length ? <details className="mt-6 rounded-xl border bg-white p-4"><summary className="cursor-pointer font-bold">이 장의 예제 코드·설정 파일 ({examples.length})</summary><ul className="mt-3 space-y-2 text-sm">{examples.map((file) => <li key={file}><a className="break-all text-blue-700 underline" href={`/textbook-assets/${file}`} download>{file.split("/code/")[1]}</a></li>)}</ul></details> : null}
        <nav aria-label="교재 읽기 이동" className="mt-6 grid gap-4 sm:grid-cols-2">
          {previous ? <Link className="rounded-xl border bg-white p-4 text-blue-700" href={`/textbook/${previous.slug}/`}>← {previous.title}</Link> : <span />}
          {next ? <Link className="rounded-xl border bg-white p-4 text-blue-700" href={`/textbook/${next.slug}/`}>{next.title} →</Link> : null}
        </nav>
        {lessons.length ? <section className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5"><h2 className="font-bold">이 장의 자가 점검·가상실습</h2><ul className="mt-3 space-y-2">{lessons.map((lesson) => <li key={lesson.id}><Link className="text-blue-700 underline" href={`/learn/${lesson.id}/`}>{lesson.title}</Link></li>)}</ul></section> : null}
      </main>
      <TutorDrawer lessonId={unit.slug} lessonTitle={unit.title} contextSummary={unit.content.slice(0, 3900)} />
    </CourseShell>
  );
}
