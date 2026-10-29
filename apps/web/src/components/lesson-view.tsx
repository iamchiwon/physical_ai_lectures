import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpenCheck, CheckCircle2, ChevronRight, Clock3, Code2, Lightbulb, Menu, Sparkles, Target } from "lucide-react";
import type { CourseModule, Lesson } from "@/data/types";
import { QuizCard } from "@/components/quiz-card";
import { TutorDrawer } from "@/components/tutor-drawer";
import { VirtualLab } from "@/components/virtual-lab";
import { LessonCompleteButton } from "@/components/progress-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LessonViewProps {
  lesson: Lesson;
  module: CourseModule;
  modules: CourseModule[];
  previous: Lesson | undefined;
  next: Lesson | undefined;
}

const calloutStyle = {
  concept: { icon: Lightbulb, className: "border-blue-200 bg-blue-50/80 text-blue-950", iconClass: "text-blue-600" },
  tip: { icon: Sparkles, className: "border-emerald-200 bg-emerald-50/80 text-emerald-950", iconClass: "text-emerald-600" },
  warning: { icon: AlertTriangle, className: "border-amber-200 bg-amber-50/80 text-amber-950", iconClass: "text-amber-600" },
};

export function LessonView({ lesson, module, modules, previous, next }: LessonViewProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <details className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 lg:hidden">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold"><Menu className="size-5 text-blue-600" />커리큘럼 열기</summary>
        <CurriculumNav modules={modules} currentLessonId={lesson.id} className="mt-4 max-h-80 overflow-auto border-t border-slate-100 pt-4" />
      </details>

      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="mb-4 text-xs font-bold uppercase tracking-[.18em] text-slate-400">Course outline</p>
            <CurriculumNav modules={modules} currentLessonId={lesson.id} />
          </div>
        </aside>

        <main className="min-w-0">
          <nav aria-label="현재 위치" className="mb-5 flex flex-wrap items-center gap-1 text-sm text-slate-500">
            <Link href="/" className="hover:text-blue-700">학습 홈</Link><ChevronRight className="size-4" />
            <span>모듈 {module.number}</span><ChevronRight className="size-4" />
            <span className="text-slate-700">{lesson.title}</span>
          </nav>

          <article>
            <header className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-6 sm:p-8">
              <div className="flex flex-wrap gap-2"><Badge>모듈 {module.number}</Badge><Badge className="bg-slate-100 text-slate-600">{lesson.difficulty}</Badge><Badge className="bg-slate-100 text-slate-600"><Clock3 className="mr-1 size-3" />{lesson.duration}분</Badge></div>
              <h1 className="mt-5 text-balance text-3xl font-bold tracking-tight sm:text-4xl">{lesson.title}</h1>
              <p className="mt-4 max-w-3xl text-pretty leading-7 text-slate-600">{lesson.summary}</p>
              <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-blue-100">
                <p className="flex items-center gap-2 font-bold text-slate-900"><Target className="size-5 text-blue-600" />이 레슨을 마치면</p>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-600 sm:grid-cols-2">
                  {lesson.objectives.map((objective) => <li key={objective} className="flex items-start gap-2"><CheckCircle2 className="mt-1 size-4 shrink-0 text-blue-500" />{objective}</li>)}
                </ul>
              </div>
            </header>

            <div className="mt-8 space-y-10">
              {lesson.sections.map((section, index) => {
                const callout = section.callout ? calloutStyle[section.callout.tone] : null;
                const CalloutIcon = callout?.icon;
                return (
                  <section key={`${section.heading}-${index}`} className="scroll-mt-24">
                    <div className="mb-4 flex items-center gap-3"><span className="grid size-7 place-items-center rounded-lg bg-blue-600 text-xs font-bold text-white">{index + 1}</span><h2 className="text-2xl font-bold tracking-tight">{section.heading}</h2></div>
                    {section.body ? <p className="text-pretty text-[1.02rem] leading-8 text-slate-700">{section.body}</p> : null}
                    {section.bullets?.length ? <ul className="mt-4 space-y-2.5 rounded-2xl border border-slate-200 bg-white p-5 text-slate-700">{section.bullets.map((bullet) => <li key={bullet} className="flex items-start gap-2.5 leading-7"><CheckCircle2 className="mt-1.5 size-4 shrink-0 text-blue-500" />{bullet}</li>)}</ul> : null}
                    {section.callout && callout && CalloutIcon ? <Card className={`mt-5 shadow-none ${callout.className}`}><CardContent className="flex items-start gap-3 p-5"><CalloutIcon className={`mt-0.5 size-5 shrink-0 ${callout.iconClass}`} /><div><p className="font-bold">{section.callout.title}</p><p className="mt-1 text-sm leading-6 opacity-85">{section.callout.body}</p></div></CardContent></Card> : null}
                    {section.code ? <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100"><div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400"><span className="flex items-center gap-2"><Code2 className="size-4" />{section.code.language}</span>{section.code.caption ? <span>{section.code.caption}</span> : null}</div><pre className="overflow-x-auto p-4 text-sm leading-6"><code>{section.code.content}</code></pre></div> : null}
                  </section>
                );
              })}
            </div>

            <VirtualLab lessonId={lesson.id} />

            <section className="mt-12 scroll-mt-24" id="quick-check">
              <div className="mb-5"><p className="text-sm font-semibold text-blue-700">바로 확인하기</p><h2 className="mt-1 flex items-center gap-2 text-2xl font-bold"><BookOpenCheck className="size-6 text-blue-600" />자가 점검</h2><p className="mt-2 text-sm leading-6 text-slate-500">틀려도 괜찮습니다. 해설을 읽고 개념을 다시 연결하는 것이 목표입니다.</p></div>
              <QuizCard lessonId={lesson.id} questions={lesson.quickCheck} />
            </section>

            <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="font-bold">레슨을 마쳤나요?</p><p className="mt-1 text-sm text-slate-500">완료 표시 후 다음 작은 단위로 이동하세요.</p></div>
              <LessonCompleteButton lessonId={lesson.id} nextLessonId={next?.id} />
            </div>

            <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="레슨 이동">
              {previous ? <Button asChild variant="outline" size="lg" className="h-auto justify-start py-4"><Link href={`/learn/${previous.id}`}><ArrowLeft className="size-4" /><span className="min-w-0 text-left"><span className="block text-xs font-normal text-slate-400">이전 레슨</span><span className="block truncate">{previous.title}</span></span></Link></Button> : <span />}
              {next ? <Button asChild variant="outline" size="lg" className="h-auto justify-end py-4"><Link href={`/learn/${next.id}`}><span className="min-w-0 text-right"><span className="block text-xs font-normal text-slate-400">다음 레슨</span><span className="block truncate">{next.title}</span></span><ArrowRight className="size-4" /></Link></Button> : null}
            </nav>
          </article>
        </main>
      </div>

      <TutorDrawer lessonId={lesson.id} lessonTitle={lesson.title} contextSummary={`${lesson.summary}\n핵심어: ${lesson.keywords.join(", ")}`} />
    </div>
  );
}

function CurriculumNav({ modules, currentLessonId, className = "" }: { modules: CourseModule[]; currentLessonId: string; className?: string }) {
  return (
    <nav aria-label="과정 목차" className={className}>
      <div className="space-y-5">
        {modules.map((module) => (
          <section key={module.id}>
            <p className="mb-2 text-xs font-bold text-slate-500">{module.number}. {module.title}</p>
            <ul className="space-y-1">
              {module.lessons.map((item) => {
                const active = item.id === currentLessonId;
                return <li key={item.id}><Link aria-current={active ? "page" : undefined} href={`/learn/${item.id}`} className={`block rounded-lg px-3 py-2 text-sm leading-5 transition ${active ? "bg-blue-600 font-semibold text-white" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"}`}>{item.title}</Link></li>;
              })}
            </ul>
          </section>
        ))}
      </div>
    </nav>
  );
}
