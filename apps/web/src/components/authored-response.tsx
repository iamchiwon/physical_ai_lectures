"use client";

import { useState, type ReactNode } from "react";
import { useLearningState } from "@/components/learning-location";
import { learningStore } from "@/lib/learning-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AuthoredResponse({ activityId, revision, solution, solutionId }: { activityId: string; revision: string; solution: ReactNode; solutionId: string }) {
  const snapshot = useLearningState();
  const record = snapshot.data.activityRecords[activityId];
  const [draft, setDraft] = useState<{ value: string; base: string } | null>(null);
  const answer = draft?.value ?? record?.answer ?? "";
  const conflict = draft !== null && draft.base !== JSON.stringify(record ?? null);
  const current = record?.revision === revision;
  const reviewed = draft === null && current && record.evidence === "self-reviewed";
  const save = (review: boolean) => {
    learningStore.saveActivity(activityId, revision, answer, review);
    setDraft(null);
  };
  return <div id={activityId} className="mt-5 rounded-xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5">
    <label htmlFor={`${activityId}-answer`} className="block text-sm font-semibold">나의 답안·관찰 근거</label>
    <Textarea id={`${activityId}-answer`} value={answer} disabled={!snapshot.hydrated} maxLength={8000} onChange={event => setDraft(previous => ({ value: event.target.value, base: previous?.base ?? JSON.stringify(record ?? null) }))} className="mt-3 min-h-36" placeholder="결론과 판단 근거, 계산 과정·단위, 관찰과 실패 원인을 적어보세요." />
    <div className="mt-3 flex flex-wrap items-center gap-3"><Button type="button" disabled={!snapshot.hydrated || !answer.trim()} onClick={() => save(false)}>답안 저장</Button><span className="text-xs text-slate-500">{answer.length} / 8,000자 · 이 브라우저에 저장</span></div>
    {record && !current ? <p className="mt-3 text-sm leading-6 text-amber-900">이전 내용 버전의 답안을 보관하고 있습니다. 현재 설명·해설과 비교해 다시 저장하세요. 이전 버전 기록도 유지합니다.</p> : null}
    {draft !== null ? <p className="mt-3 text-xs text-slate-600">수정 중입니다. 답안 저장을 선택하면 이 브라우저에 기록합니다.</p> : current && record?.answer ? <p className="mt-3 text-xs text-slate-600">{reviewed ? "자기검토를 기록했습니다. 정답·숙달을 자동 판정한 결과는 아닙니다." : "답안을 기록했습니다. 해설과 비교해 자기검토하세요."}</p> : null}
    {conflict ? <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-950"><p>다른 탭의 저장 답안이 바뀌었습니다. 현재 수정 중인 입력은 유지했습니다. 저장하기 전에 두 답안을 비교하고 필요한 내용을 복사해 보관하세요.</p><details className="mt-2"><summary className="cursor-pointer">다른 탭의 저장 답안 확인</summary><p className="mt-2 whitespace-pre-wrap">{record?.answer ?? "저장된 답안 없음"}</p></details></div> : null}
    {snapshot.notice ? <p role="status" className="mt-3 text-sm leading-6 text-amber-900">{snapshot.notice}</p> : null}
    <details className="mt-5 rounded-xl border bg-white p-4"><summary className="cursor-pointer font-semibold">해설·판정 기준과 비교하기</summary><div id={solutionId} className="mt-4">{solution}</div></details>
    <Button type="button" variant="outline" className="mt-4 h-auto whitespace-normal text-left" disabled={!snapshot.hydrated || !answer.trim() || reviewed} onClick={() => save(true)}>{reviewed ? "자기검토 기록됨" : "해설과 비교해 자기검토 기록"}</Button>
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
