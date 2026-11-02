"use client";

import * as React from "react";
import { afterMemory, buildTutorContext, selectLearnerState, TUTOR_INSTRUCTIONS, selectSummaryChunk, TUTOR_MAX_HISTORY, TUTOR_RECENT_TURNS } from "@physical-ai/shared";
import { retrieveLessonContext, type LessonDocument, type ReadingFocus } from "@/lib/tutor-retrieval";
import { askTutor, summarizeTutor } from "@/lib/api-client";
import { createTutorStore, successfulTurns, TUTOR_STORAGE_KEY, type TutorState, type TutorStore } from "@/lib/tutor-store";

export interface TutorLesson { id:string; title:string; chapterId:string; chapterTitle:string; sourceContent:string; focus?:ReadingFocus }
interface TutorContextValue {
  state: TutorState;
  store: TutorStore;
  submitQuestion: (question:string,lesson:TutorLesson) => Promise<void>;
  resetConversation: (chapterId?:string) => void;
}
const TutorContext = React.createContext<TutorContextValue | null>(null);
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
      const documents:LessonDocument[] = [{id:lesson.id,title:lesson.title,content:lesson.sourceContent}];
      const initialReference=retrieveLessonContext(question,documents,lesson.focus);
      let requestLesson={id:lesson.id,title:lesson.title,contextSummary:initialReference.text};
      const completed = successfulTurns(before.turns);
      let memory = before.memory;
      let history = afterMemory(completed,memory);
      const learnerState = selectLearnerState(before.learnerState, `${lesson.title} ${question}`);
      let summaryFailed = false;
      // Usually one summary is enough; cap recovery work after repeated failures to two API calls.
      for (let batch=0; batch<2; batch++) {
        const preview = buildTutorContext(TUTOR_INSTRUCTIONS,requestLesson,question,memory?.content ?? "",history,learnerState);
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
      const context = buildTutorContext(TUTOR_INSTRUCTIONS,requestLesson,question,memory?.content ?? "",history,learnerState);
      // Send only the suffix that fits. Keep full raw turns locally for future summary recovery.
      const selected = history.slice(Math.max(context.omittedTurns,history.length-TUTOR_MAX_HISTORY));
      store.update({phase:"answering",contextNotice:summaryFailed ? "이전 대화 요약에 실패해 기존 요약과 최근 대화를 우선 참고합니다. 원본 대화는 보존되며 다음 질문에서 요약을 다시 시도합니다." : context.omittedTurns || context.truncated ? "대화 길이 제한으로 기존 요약과 최근 대화 일부를 참고합니다. 원본 대화는 보존됩니다." : null});
      let result = await askTutor({question,lesson:requestLesson,history:selected,summary:memory?.content ?? "",learnerState},abort.signal);
      if (!current()) return;
      if (result.lookupQuery && result.mode !== "demo") {
        store.update({phase:"retrieving"});
        let corpus=documents;
        try {
          if (/^chapter-[0-6]$/.test(lesson.chapterId)) {
            const response=await fetch(`/tutor-content/${lesson.chapterId}.json`,{signal:abort.signal});
            if(!response.ok)throw new Error("Lesson corpus unavailable");
            const value:unknown=await response.json();
            if(!Array.isArray(value)||!value.every(item=>item&&typeof item.id==="string"&&typeof item.title==="string"&&typeof item.content==="string"))throw new Error("Invalid lesson corpus");
            corpus=value;
          }
        } catch { if(!current())return; }
        const additional=retrieveLessonContext(`${question} ${result.lookupQuery}`,corpus,lesson.focus);
        requestLesson={...requestLesson,contextSummary:`[본문 추가 조회 완료: ${additional.state}]\n${additional.text || "질문에 해당하는 본문을 찾지 못했습니다. 필요한 코드나 문장을 확인해 주세요."}`.slice(0,4000)};
        if(!current())return;
        store.update({phase:"answering"});
        result=await askTutor({question,lesson:requestLesson,history:selected,summary:memory?.content ?? "",learnerState,lookupComplete:true},abort.signal);
      }
      if (!current()) return;
      const snapshot=store.getSnapshot();
      store.update({turns:snapshot.turns.map((turn)=>turn.id===id?{...turn,answer:result.answer,referenceContext:requestLesson.contextSummary,status:"answered",mode:result.mode,model:result.model,learnerUpdates:result.learnerUpdates ?? []}:turn),contextNotice:result.contextLimited && !snapshot.contextNotice ? "입력 길이 제한으로 최근 대화 일부만 참고했습니다. 원본 대화는 보존됩니다." : snapshot.contextNotice},true);
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
