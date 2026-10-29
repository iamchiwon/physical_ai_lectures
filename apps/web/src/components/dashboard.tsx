import Link from "next/link";
import { ArrowRight, Bot, Sparkles, Target } from "lucide-react";
import type { CourseModule, CourseStats, Lesson } from "@/data/types";
import { ModuleCard } from "@/components/module-card";
import { DashboardProgress } from "@/components/progress-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardProps {
  modules: CourseModule[];
  stats: CourseStats;
  firstLesson: Lesson;
}

export function Dashboard({ modules, stats, firstLesson }: DashboardProps) {
  return (
    <main>
      <section className="border-b border-blue-100 bg-gradient-to-br from-white via-blue-50 to-sky-100/70">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_.7fr] lg:px-8 lg:py-20">
          <div>
            <Badge className="mb-5 bg-white text-blue-700 shadow-sm ring-1 ring-blue-100">교과서 기반 자기주도 학습</Badge>
            <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              로봇 제어를 <span className="text-blue-600">작은 성공</span>으로 나누어 배웁니다
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-slate-600">
              Physical AI, Isaac Sim, ROS 2, SO-101, LeRobot와 Sim2Real을 짧은 레슨으로 익히고 곧바로 자가 점검하세요. 막히는 순간에는 AI 강사가 답 대신 이해의 실마리를 제공합니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href={`/learn/${firstLesson.id}`}>첫 레슨 시작하기 <ArrowRight className="size-4" /></Link></Button>
              <Button asChild size="lg" variant="outline"><a href="#curriculum">커리큘럼 보기</a></Button>
            </div>
          </div>

          <DashboardProgress lessonCount={stats.lessonCount} totalMinutes={stats.totalMinutes} questionCount={stats.questionCount} firstLessonId={firstLesson.id} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="flex items-start gap-4 p-5"><span className="rounded-xl bg-blue-50 p-3 text-blue-600"><Target className="size-5" /></span><div><p className="font-bold">오늘의 목표</p><p className="mt-1 text-sm leading-6 text-slate-500">첫 레슨을 읽고 자가 점검 2문항을 완료하세요.</p></div></CardContent></Card>
          <Card><CardContent className="flex items-start gap-4 p-5"><span className="rounded-xl bg-violet-50 p-3 text-violet-600"><Bot className="size-5" /></span><div><p className="font-bold">AI 강사와 함께</p><p className="mt-1 text-sm leading-6 text-slate-500">정답보다 먼저 비유·질문·힌트로 개념을 연결합니다.</p></div></CardContent></Card>
          <Card><CardContent className="flex items-start gap-4 p-5"><span className="rounded-xl bg-amber-50 p-3 text-amber-600"><Sparkles className="size-5" /></span><div><p className="font-bold">평가 현황</p><p className="mt-1 text-sm leading-6 text-slate-500">레슨별 점검 결과를 모아 취약 개념을 확인합니다.</p></div></CardContent></Card>
        </div>
      </section>

      <section id="curriculum" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div><p className="text-sm font-semibold text-blue-700">전체 학습 경로</p><h2 className="mt-2 text-3xl font-bold tracking-tight">6개 모듈, {stats.lessonCount}개의 작은 레슨</h2></div>
          <p className="max-w-md text-sm leading-6 text-slate-500">각 레슨은 개념 설명, 적용 예시, 즉시 피드백이 있는 점검으로 구성됩니다.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => <ModuleCard key={module.id} module={module} />)}
        </div>
      </section>
    </main>
  );
}
