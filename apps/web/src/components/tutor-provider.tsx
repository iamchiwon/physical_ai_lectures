"use client";

import * as React from "react";
import { afterMemory, buildTutorContext, selectSummaryChunk, TUTOR_MAX_HISTORY, TUTOR_RECENT_TURNS } from "@physical-ai/shared";
import { askTutor, summarizeTutor } from "@/lib/api-client";
import { createTutorStore, successfulTurns, TUTOR_STORAGE_KEY, type TutorState, type TutorStore } from "@/lib/tutor-store";

export interface TutorLesson { id:string; title:string; chapterId:string; chapterTitle:string; contextSummary:string }
interface TutorContextValue {
  state: TutorState;
  store: TutorStore;
  submitQuestion: (question:string,lesson:TutorLesson) => Promise<void>;
  resetConversation: (chapterId?:string) => void;
}
const TutorContext = React.createContext<TutorContextValue | null>(null);
// Reserve more instruction space on the client; the Worker independently enforces the final budget.
const INSTRUCTION_RESERVE = "x".repeat(2400);
export function TutorProvider({ children }: {children:React.ReactNode}) {
  const [store] = React.useState(() => createTutorStore(() => window.localStorage));
  const state = React.useSyncExternalStore(store.subscribe,store.getSnapshot,store.getServerSnapshot);
  const controller = React.useRef<AbortController | null>(null);
  React.useEffect(() => {
    store.hydrate();
    const onStorage = (event:StorageEvent) => {
      if (event.storageArea === window.localStorage && (event.key === TUTOR_STORAGE_KEY || event.key === null)) {
        controller.current?.abort(); store.receiveStorage(event.newValue);
      }
    };
    window.addEventListener("storage",onStorage);
    return () => { window.removeEventListener("storage",onStorage); controller.current?.abort(); };
  },[store]);

  const resetConversation = React.useCallback((chapterId?:string) => { controller.current?.abort(); store.reset(chapterId); },[store]);
  const submitQuestion = React.useCallback(async (rawQuestion:string,lesson:TutorLesson) => {
    const question = rawQuestion.trim();
    const before = store.getSnapshot();
    if (!before.hydrated || before.loading || question.length < 2 || question.length > 1200) return;
    controller.current?.abort();
    const abort = new AbortController(); controller.current = abort;
    const epoch = before.epoch;
    const current = () => store.getSnapshot().epoch === epoch && !abort.signal.aborted;
    const id = crypto.randomUUID();
    store.update({turns:[...before.turns,{id,chapterId:lesson.chapterId,chapterTitle:lesson.chapterTitle,lessonId:lesson.id,lessonTitle:lesson.title,question,status:"pending"}],draft:"",loading:true,phase:"answering",error:null,contextNotice:null},true);
    try {
      const completed = successfulTurns(before.turns);
      let memory = before.memory;
      let history = afterMemory(completed,memory);
      let summaryFailed = false;
      // Usually one summary is enough; cap recovery work after repeated failures to two API calls.
      for (let batch=0; batch<2; batch++) {
        const preview = buildTutorContext(INSTRUCTION_RESERVE,lesson,question,memory?.content ?? "",history);
        if (!preview.omittedTurns && !preview.truncated) break;
        const older = history.slice(0,Math.max(0,history.length-TUTOR_RECENT_TURNS));
        if (!older.length) break;
        const chunk = selectSummaryChunk(memory?.content ?? "",older);
        if (!chunk.length) break;
        store.update({phase:"summarizing"});
        try {
          const result = await summarizeTutor({previousSummary:memory?.content ?? "",turns:chunk},abort.signal);
          if (!current()) return;
          memory = {content:result.summary,throughId:chunk[chunk.length-1]!.id};
          // Commit coverage only after success, independently of the subsequent answer.
          store.update({memory},true);
          history = afterMemory(completed,memory);
        } catch {
          if (!current()) return;
          summaryFailed = true; break;
        }
      }
      const context = buildTutorContext(INSTRUCTION_RESERVE,lesson,question,memory?.content ?? "",history);
      // Send only the suffix that fits. Keep full raw turns locally for future summary recovery.
      const selected = history.slice(Math.max(context.omittedTurns,history.length-TUTOR_MAX_HISTORY));
      store.update({phase:"answering",contextNotice:summaryFailed ? "이전 대화 요약에 실패해 기존 요약과 최근 대화를 우선 참고합니다. 원본 대화는 보존되며 다음 질문에서 요약을 다시 시도합니다." : context.omittedTurns || context.truncated ? "대화 길이 제한으로 기존 요약과 최근 대화 일부를 참고합니다. 원본 대화는 보존됩니다." : null});
      const result = await askTutor({question,lesson,history:selected,summary:memory?.content ?? ""},abort.signal);
      if (!current()) return;
      const snapshot=store.getSnapshot();
      store.update({turns:snapshot.turns.map((turn)=>turn.id===id?{...turn,answer:result.answer,status:"answered",mode:result.mode,model:result.model}:turn),contextNotice:result.contextLimited && !snapshot.contextNotice ? "입력 길이 제한으로 최근 대화 일부만 참고했습니다. 원본 대화는 보존됩니다." : snapshot.contextNotice},true);
    } catch (error) {
      if (!current()) return;
      const snapshot=store.getSnapshot();
      store.update({turns:snapshot.turns.map((turn)=>turn.id===id?{...turn,status:"failed"}:turn),draft:snapshot.draft || question,error:error instanceof Error ? error.message : "답변을 받지 못했습니다. 다시 질문해 주세요."},true);
    } finally { if (current()) store.update({loading:false}); }
  },[store]);
  const value=React.useMemo(()=>({state,store,submitQuestion,resetConversation}),[state,store,submitQuestion,resetConversation]);
  return <TutorContext.Provider value={value}>{children}</TutorContext.Provider>;
}
export function useTutor() {
  const value=React.useContext(TutorContext);
  if (!value) throw new Error("TutorProvider is required");
  return value;
}
