"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { evaluateAnswer } from "@/lib/api-client";
import type { WrittenExercise } from "@/lib/textbook";

const TutorMarkdown = dynamic(() => import("@/components/tutor-markdown").then((module) => module.TutorMarkdown));

export function WrittenExercises({ exercises }: { exercises: WrittenExercise[] }) {
  return <section id="written-exercises" className="mt-8 space-y-6" aria-label="답안 작성과 평가"><h2 className="text-2xl font-bold">직접 답하고 피드백 받기</h2><p className="text-sm leading-6 text-slate-600">답안은 이 브라우저에 저장됩니다. AI 평가는 학습을 위한 피드백이며 실제 코드 실행이나 장비 동작을 검증하지 않습니다.</p>{exercises.map((exercise, index) => <Exercise key={exercise.id} exercise={exercise} index={index} />)}</section>;
}

function Exercise({ exercise, index }: { exercise: WrittenExercise; index: number }) {
  const [answer, setAnswer] = React.useState("");
  const [ready, setReady] = React.useState(false);
  const [feedback, setFeedback] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const storageKey = `physical-ai-answer-${exercise.id}`;
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setAnswer(localStorage.getItem(storageKey) ?? ""); } catch { /* Storage can be unavailable. */ }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);
  React.useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(storageKey, answer); } catch { /* The current draft remains usable. */ }
  }, [answer, ready, storageKey]);
  const assess = async () => {
    if (busy || answer.trim().length < 10) return;
    setBusy(true);
    setError("");
    setSubmitted(true);
    try {
      const result = await evaluateAnswer({ question: exercise.question, answer, reference: exercise.reference });
      setFeedback(result.feedback);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "평가를 완료하지 못했습니다."); }
    finally { setBusy(false); }
  };
  return <div className="rounded-2xl border border-blue-100 bg-white p-5">
    <h3 className="mb-3 font-bold">{index + 1}. {exercise.id.endsWith("-report") ? "수행 결과와 근거" : "연습문제"}</h3>
    {!exercise.id.endsWith("-report") ? <TutorMarkdown content={exercise.question} copyable={false} /> : <p className="mb-3 text-sm text-slate-600">위 과제를 수행하고 설정값, 관찰 결과, 해석과 개선안을 작성하세요. 실제 장비 없이 한 경우 가상실습 결과임을 명시하세요.</p>}
    <label htmlFor={exercise.id} className="mt-4 block text-sm font-semibold">나의 답안</label>
    <Textarea id={exercise.id} className="mt-2 min-h-40" maxLength={8000} value={answer} disabled={!ready || busy} onChange={(event) => { setAnswer(event.target.value); setFeedback(""); setSubmitted(false); }} placeholder="결론뿐 아니라 판단 근거, 계산 과정과 단위, 가정을 함께 적어보세요." />
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3"><span className="text-xs text-slate-500">{answer.length} / 8,000자 · 최소 10자</span><Button disabled={!ready || busy || answer.trim().length < 10} onClick={() => void assess()}>{busy ? "평가하고 있어요…" : "답안 평가받기"}</Button></div>
    {error ? <p className="mt-3 text-sm text-rose-700" role="alert">{error}</p> : null}
    {feedback ? <div className="mt-5 rounded-xl bg-blue-50 p-4" role="status"><h4 className="mb-3 font-bold">내 답안에 대한 피드백</h4><TutorMarkdown content={feedback} /></div> : null}
    {submitted && exercise.reference ? <details className="mt-4 rounded-xl border p-4"><summary className="cursor-pointer font-bold">교재 해설·평가 기준과 비교하기</summary><div className="mt-3"><TutorMarkdown content={exercise.reference} copyable={false} /></div></details> : null}
  </div>;
}
