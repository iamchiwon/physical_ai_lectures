"use client";

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { LearningResume, useLearningState, type ResumeUnit } from "@/components/learning-location";
import { useProgress } from "@/components/progress-provider";
import { legacyProgressSummary } from "@/lib/home-progress";
import { Button } from "@/components/ui/button";

export function HomeProgress({ lessons, units = [] }: { lessons: { id: string; title: string }[]; units?: ResumeUnit[] }) {
  const learning = useLearningState();
  const hasLocation = learning.hydrated && Boolean(learning.data.lastLocation);
  const { hydrated, completedLessons, quizScores, lastLessonId, storageNotice } = useProgress();
  const { completed, lastLesson, unknownLastLesson } = legacyProgressSummary({ completedLessons, quizScores, lastLessonId }, lessons);
  return (
    <section aria-labelledby="continue-title" className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <p className="text-xs font-bold tracking-widest text-blue-700">나의 학습</p>
      <h2 id="continue-title" className="mt-2 text-xl font-bold">{hasLocation ? "읽던 통합 단위에서 계속하세요" : hydrated && lastLesson ? "읽던 요약에서 계속하세요" : "내 속도로 시작하세요"}</h2>
      <LearningResume units={units} />
      <div aria-live="polite" className="mt-3">
        {!hydrated ? <p className="text-sm text-slate-600">이 브라우저의 학습 기록을 확인하고 있습니다.</p> : <>
          {storageNotice ? <p role="status" className="mb-3 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-900">{storageNotice}</p> : null}
          {unknownLastLesson ? <p className="mb-3 text-sm leading-6 text-slate-600">마지막 요약 레슨을 찾을 수 없습니다. 기존 기록은 유지했으니 아래에서 읽을 자료를 선택하세요.</p> : null}
          {!hasLocation && lastLesson ? <>
            <p className="text-base font-semibold leading-7 text-slate-900">{lastLesson.title}</p>
            <Button asChild className="mt-4"><Link href={`/learn/${lastLesson.id}/`}>기존 요약 이어 학습 <ArrowRight aria-hidden="true" className="size-4" /></Link></Button>
          </> : !hasLocation ? <>
            <p className="text-sm leading-6 text-slate-600">처음이라면 폐루프의 개념을 읽고, 관심 있는 경로를 골라보세요.</p>
            <Button asChild variant="outline" className="mt-4"><a href="#available"><BookOpen aria-hidden="true" className="size-4" />지금 읽을 자료 선택</a></Button>
          </> : null}
          <p className="mt-4 text-sm text-slate-600">기존 요약 완료 <strong className="text-slate-950">{completed} / {lessons.length}</strong></p>
        </>}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500">이 브라우저의 요약 레슨 기록입니다. 전체 204소주제의 완료·숙달로 환산하지 않습니다.</p>
    </section>
  );
}
