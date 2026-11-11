"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";
import { useLearningState } from "@/components/learning-location";
import { learningStore } from "@/lib/learning-store";
import { evaluateAnswer, isApiConfigured } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const TutorMarkdown = dynamic(() => import("@/components/tutor-markdown").then(module => module.TutorMarkdown));

export function AuthoredResponse({ activityId, revision, question, reference, context, solution, solutionId }: {
  activityId: string; revision: string; question: string; reference: string; context: string; solution: ReactNode; solutionId: string;
}) {
  const snapshot = useLearningState();
  const record = snapshot.data.activityRecords[activityId];
  const [draft, setDraft] = useState<{ value: string; base: string } | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requestEpoch = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const answer = draft?.value ?? record?.answer ?? "";
  const conflict = draft !== null && draft.base !== JSON.stringify(record ?? null);
  const current = record?.revision === revision;
  const reviewed = draft === null && current && record.evidence === "self-reviewed";
  const unlocked = snapshot.hydrated && (attempted || Boolean(record?.answer?.trim()));
  const feedback = draft === null && current && !busy ? record.feedback : undefined;

  useEffect(() => () => { requestEpoch.current++; controller.current?.abort(); }, []);

  const check = async () => {
    if (!snapshot.hydrated || busy || !answer.trim()) return;
    const submittedAnswer = answer;
    const epoch = ++requestEpoch.current;
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setAttempted(true);
    setError("");
    // Persist first: assessment failure must never discard the learner's answer.
    if (!learningStore.saveActivity(activityId, revision, submittedAnswer, false)) {
      setDraft({ value: submittedAnswer, base: JSON.stringify(learningStore.getSnapshot().data.activityRecords[activityId] ?? null) });
      setError("답안을 저장하지 못했습니다. 현재 입력을 복사해 보관한 뒤 저장 상태를 확인해 주세요.");
      return;
    }
    setDraft(null);
    setBusy(true);
    try {
      if (!isApiConfigured()) throw new Error("평가 서비스를 사용할 수 없습니다. 답안은 저장했으며 해설·판정 기준과 비교하거나 잠시 후 다시 확인할 수 있습니다.");
      const result = await evaluateAnswer({ question, answer: submittedAnswer, reference, context }, request.signal);
      if (requestEpoch.current !== epoch) return;
      if (!result.feedback.trim() || result.feedback.length > 16000) throw new Error("평가 결과를 읽을 수 없습니다. 답안은 저장했으니 다시 확인해 주세요.");
      if (!learningStore.saveFeedback(activityId, revision, submittedAnswer, result.feedback)) {
        setError("평가 중 저장 답안이 바뀌었거나 결과를 저장하지 못했습니다. 최신 답안을 확인한 뒤 다시 확인해 주세요.");
      }
    } catch (cause) {
      if (requestEpoch.current === epoch) setError(cause instanceof Error ? cause.message : "평가를 완료하지 못했습니다. 답안은 저장했으니 다시 확인해 주세요.");
    } finally {
      if (requestEpoch.current === epoch) setBusy(false);
    }
  };

  return <div id={activityId} className="mt-5 rounded-xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5">
    <label htmlFor={`${activityId}-answer`} className="block text-sm font-semibold">나의 답안·관찰 근거</label>
    <Textarea id={`${activityId}-answer`} value={answer} disabled={!snapshot.hydrated} maxLength={8000} onChange={event => {
      requestEpoch.current++;
      controller.current?.abort();
      setBusy(false);
      setError("");
      setDraft(previous => ({ value: event.target.value, base: previous?.base ?? JSON.stringify(record ?? null) }));
    }} className="mt-3 min-h-36" placeholder="결론과 판단 근거, 계산 과정·단위, 관찰과 실패 원인을 적어보세요." />
    <div className="mt-3 flex flex-wrap items-center gap-3"><Button type="button" disabled={!snapshot.hydrated || busy || !answer.trim()} aria-busy={busy} onClick={() => void check()}><span>{busy ? "확인 중" : "확인하기"}</span>{busy ? <LoaderCircle aria-hidden="true" className="size-4 shrink-0 animate-spin motion-reduce:animate-none" /> : null}</Button><span className="text-xs text-slate-500">{answer.length} / 8,000자 · 확인하면 이 브라우저에 저장</span></div>
    {record && !current ? <p className="mt-3 text-sm leading-6 text-amber-900">이전 내용 버전의 답안을 보관하고 있습니다. 현재 설명·해설과 비교해 다시 확인하세요. 이전 버전 기록도 유지합니다.</p> : null}
    {draft !== null ? <p className="mt-3 text-xs text-slate-600">수정 중입니다. 확인하기를 선택하면 수정한 답안을 저장하고 다시 평가합니다.</p> : current && record?.answer ? <p className="mt-3 text-xs text-slate-600">{reviewed ? "해설과 비교한 자기검토를 기록했습니다." : "답안을 기록했습니다. 평가 결과와 해설을 비교하고 답안을 수정해 다시 확인할 수 있습니다."}</p> : null}
    {conflict ? <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-950"><p>다른 탭의 저장 답안이 바뀌었습니다. 현재 수정 중인 입력은 유지했습니다. 확인하기 전에 두 답안을 비교하고 필요한 내용을 복사해 보관하세요.</p><details className="mt-2"><summary className="cursor-pointer">다른 탭의 저장 답안 확인</summary><p className="mt-2 whitespace-pre-wrap">{record?.answer ?? "저장된 답안 없음"}</p></details></div> : null}
    {snapshot.notice ? <p role="status" className="mt-3 text-sm leading-6 text-amber-900">{snapshot.notice}</p> : null}
    {busy ? <p role="status" className="mt-4 text-sm leading-6 text-slate-700">답안을 저장했습니다. 해설·판정 기준과 비교하고 있습니다.</p> : null}
    {error ? <p role="alert" className="mt-4 text-sm leading-6 text-rose-700">{error}</p> : null}
    {feedback ? <section aria-label="답안 확인 결과" role="status" className="mt-5 rounded-xl bg-white p-4"><h4 className="mb-3 font-semibold">답안 확인 결과</h4><TutorMarkdown content={feedback} /><p className="mt-3 text-xs leading-6 text-slate-500">제공된 본문·과제·해설을 기준으로 한 학습 피드백입니다. 자료가 부족하면 판정을 유보하며 실제 실행·숙달 인증과 구분합니다.</p></section> : null}
    {unlocked ? <details className="mt-5 rounded-xl border bg-white p-4"><summary className="cursor-pointer font-semibold">해설·판정 기준과 비교하기</summary><div id={solutionId} className="mt-4">{solution}</div></details> : <p id={solutionId} className="mt-5 rounded-xl border bg-white p-4 text-sm leading-7 text-slate-600">답안을 작성하고 확인하기를 한 번 선택하면 해설·판정 기준을 열어볼 수 있습니다.</p>}
    <Button type="button" variant="outline" className="mt-4 h-auto whitespace-normal text-left" disabled={!snapshot.hydrated || !unlocked || busy || draft !== null || !current || !answer.trim() || reviewed} onClick={() => learningStore.saveActivity(activityId, revision, answer, true)}>{reviewed ? "자기검토 기록됨" : "해설과 비교해 자기검토 기록"}</Button>
  </div>;
}

export function AuthoredCompletion({ unitId, revision, catalogRevision, readiness, activityIds }: { unitId: string; revision: string; catalogRevision: string; readiness: string; activityIds: string[] }) {
  const snapshot = useLearningState();
  const record = snapshot.data.unitProgress[unitId];
  const completed = record?.contentRevision === revision && Boolean(record.completedAt);
  const allReviewed = activityIds.every(id => { const record = snapshot.data.activityRecords[id]; return record?.revision === revision && record.answer?.trim() && record.evidence === "self-reviewed"; });
  return <section aria-labelledby="authored-completion-title" className="mt-7 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:p-7">
    <h2 id="authored-completion-title" className="text-lg font-bold">학습 확인</h2>
    <p className="mt-3 text-sm leading-7 text-slate-700">실습과 세 문항의 답안을 해설과 비교한 뒤, 이 단위의 학습 완료를 직접 기록할 수 있습니다. 자기검토·학습 완료는 자동 채점이나 숙달 인증과 별개입니다.</p>
    {record?.completedAt && record.contentRevision !== revision ? <p className="mt-3 text-sm text-amber-900">과거 버전의 완료 기록은 보존했습니다. 현재 버전의 설명과 답안을 다시 확인하세요.</p> : null}
    <Button type="button" className="mt-4" disabled={!snapshot.hydrated || readiness !== "ready" || !allReviewed || completed} onClick={() => learningStore.complete(unitId, revision, catalogRevision, readiness, activityIds)}>{completed ? "현재 버전 학습 완료" : "이 단위 학습 완료 기록"}</Button>
    {!completed && !allReviewed ? <p className="mt-3 text-xs leading-6 text-slate-600">실습1개·확인 문제3개의 답안을 저장하고 각각 자기검토를 기록하세요.</p> : null}
    {snapshot.notice ? <p role="status" className="mt-3 text-sm text-amber-900">{snapshot.notice}</p> : null}
  </section>;
}
