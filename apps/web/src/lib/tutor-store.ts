import { z } from "zod";
import { conversationTurnSchema, type ConversationMemory, type ConversationTurn } from "@physical-ai/shared";

export const TUTOR_STORAGE_KEY = "physical-ai:tutor:v1";
const storedTurnSchema = conversationTurnSchema.omit({ answer: true }).extend({
  answer: z.string().max(32_000).optional(),
  status: z.enum(["pending", "answered", "failed"]),
  mode: z.enum(["openrouter", "gemini", "demo"]).optional(),
  model: z.string().max(200).optional(),
});
export type StoredTutorTurn = z.infer<typeof storedTurnSchema>;
const storedSchema = z.object({
  version: z.literal(1),
  turns: z.array(storedTurnSchema),
  memory: z.object({content:z.string().max(6000),throughId:z.string().max(120)}).nullable(),
});
export interface TutorState {
  turns: StoredTutorTurn[];
  memory: ConversationMemory | null;
  hydrated: boolean;
  loading: boolean;
  phase: "answering" | "summarizing";
  drawerOpen: boolean;
  draft: string;
  error: string | null;
  storageNotice: string | null;
  contextNotice: string | null;
  epoch: number;
}
const INITIAL: TutorState = { turns: [], memory: null, hydrated: false, loading: false, phase: "answering", drawerOpen: false, draft: "", error: null, storageNotice: null, contextNotice: null, epoch: 0 };
export function successfulTurns(turns: StoredTutorTurn[]): ConversationTurn[] {
  return turns.filter((turn) => turn.status === "answered" && turn.mode !== "demo" && Boolean(turn.answer)).map((turn) => ({ id:turn.id, chapterId:turn.chapterId, chapterTitle:turn.chapterTitle, lessonId:turn.lessonId, lessonTitle:turn.lessonTitle, question:turn.question, answer:turn.answer! }));
}
export function createTutorStore(storage: () => Pick<Storage, "getItem" | "setItem" | "removeItem">) {
  let state = INITIAL;
  const listeners = new Set<() => void>();
  function notify() { listeners.forEach((listener) => listener()); }
  function persist() {
    try {
      if (!state.turns.length && !state.memory) storage().removeItem(TUTOR_STORAGE_KEY);
      else storage().setItem(TUTOR_STORAGE_KEY, JSON.stringify({ version:1, turns:state.turns, memory:state.memory }));
      state = {...state, storageNotice:null};
    } catch { state = {...state, storageNotice:"브라우저에 대화를 저장하지 못했습니다. 현재 화면에서는 유지되지만 새로고침하면 최근 변경이 사라질 수 있습니다."}; }
  }
  function restore(raw: string | null) {
    const parsed = raw ? storedSchema.parse(JSON.parse(raw)) : { turns:[], memory:null };
    const turns = parsed.turns.map((turn): StoredTutorTurn => turn.status === "pending" ? {...turn,status:"failed"} : turn);
    const memory = parsed.memory && successfulTurns(turns).some((turn) => turn.id === parsed.memory!.throughId) ? parsed.memory : null;
    return { turns, memory };
  }
  return {
    getSnapshot: () => state,
    getServerSnapshot: () => INITIAL,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    hydrate() {
      if (state.hydrated) return;
      try { state = {...state,...restore(storage().getItem(TUTOR_STORAGE_KEY)),hydrated:true}; }
      catch { state = {...state,hydrated:true,storageNotice:"저장된 대화를 읽지 못했습니다. 이 화면에서 새 대화를 시작할 수 있지만 이전 기록은 복원되지 않았습니다."}; }
      notify();
    },
    update(patch: Partial<TutorState>, save = false) {
      state = {...state,...patch};
      if (save) persist();
      notify();
    },
    reset(chapterId?: string) {
      const turns = chapterId ? state.turns.filter((turn) => turn.chapterId !== chapterId).map((turn): StoredTutorTurn => turn.status === "pending" ? {...turn,status:"failed"} : turn) : [];
      // A global summary can contain any chapter: invalidate it rather than retaining deleted facts.
      state = {...state, turns, memory:null, epoch:state.epoch+1, loading:false, draft:"", error:null, contextNotice:null};
      persist();
      if (state.storageNotice) state = {...state,storageNotice:"초기화 내용을 저장하지 못했습니다. 새로고침하면 삭제 전 대화가 다시 나타날 수 있습니다. 브라우저의 사이트 저장소 설정을 확인해 주세요."};
      notify();
    },
    receiveStorage(raw: string | null) {
      try {
        state = {...state,...restore(raw),epoch:state.epoch+1,loading:false,error:null,contextNotice:"다른 탭에서 변경한 대화를 불러왔습니다.",storageNotice:null};
      } catch { state = {...state,storageNotice:"다른 탭의 대화 저장 형식이 올바르지 않아 현재 대화를 유지했습니다."}; }
      notify();
    },
  };
}
export type TutorStore = ReturnType<typeof createTutorStore>;
