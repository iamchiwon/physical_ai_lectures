import { z } from "zod";

export const LEARNING_STORAGE_KEY = "physical-ai:learning:v2";
export const LEARNING_STORAGE_BUDGET = 512 * 1024;
const identity = z.string().min(1).max(160);
const timestamp = z.string().datetime();
export const learningStateSchema = z.object({
  schemaVersion: z.literal(2), catalogRevision: identity,
  unitProgress: z.record(identity, z.object({ viewed: z.boolean(), completedAt: timestamp.nullable(), contentRevision: identity })),
  activityRecords: z.record(identity, z.object({ revision: identity, answer: z.string().max(8000).optional(), feedback: z.string().max(16000).optional(), evidence: z.string().max(4000).optional() })),
  lastLocation: z.object({ unitId: identity, trackId: identity.nullable(), activityId: identity.nullable(), updatedAt: timestamp }).nullable(),
  migrations: z.array(z.object({ source: identity, at: timestamp })).max(100),
});
export type LearningState = z.infer<typeof learningStateSchema>;
export interface LearningSnapshot { data: LearningState; hydrated: boolean; notice: string | null; blocked: boolean; raw: string | null }
const empty = (): LearningState => ({ schemaVersion: 2, catalogRevision: "uninitialized", unitProgress: {}, activityRecords: {}, lastLocation: null, migrations: [] });
export function createLearningStore(storage: () => Pick<Storage, "getItem" | "setItem" | "removeItem">) {
  let snapshot: LearningSnapshot = { data: empty(), hydrated: false, notice: null, blocked: false, raw: null };
  const initial = snapshot;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((fn) => fn());
  function restore(raw: string | null) {
    try {
      const data = raw === null ? empty() : learningStateSchema.parse(JSON.parse(raw));
      snapshot = { data, hydrated: true, notice: null, blocked: false, raw };
    } catch {
      snapshot = { ...snapshot, hydrated: true, raw, blocked: true, notice: "신규 학습 기록의 형식을 읽을 수 없습니다. 손상되었거나 더 새로운 버전일 수 있어 원본을 덮어쓰지 않습니다. 원본을 내려받아 보관한 후 이 기록만 초기화할 수 있습니다." };
    }
    notify();
  }
  return {
    getSnapshot: () => snapshot, getServerSnapshot: () => initial,
    subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
    hydrate() {
      if (snapshot.hydrated) return;
      try { restore(storage().getItem(LEARNING_STORAGE_KEY)); }
      catch { snapshot = { ...snapshot, hydrated: true, blocked: true, notice: "학습 저장소를 읽을 수 없습니다. 브라우저 저장 설정을 확인하세요. 원본은 유지합니다." }; notify(); }
    },
    receiveStorage(raw: string | null) { restore(raw); },
    view(unitId: string, contentRevision: string, catalogRevision: string, trackId: string | null = null) {
      if (!snapshot.hydrated) return;
      const last = snapshot.data.lastLocation;
      if (last?.unitId === unitId && last.trackId === trackId && snapshot.data.unitProgress[unitId]?.contentRevision === contentRevision) return;
      const previous = snapshot.data.unitProgress[unitId];
      const data: LearningState = { ...snapshot.data, catalogRevision,
        unitProgress: { ...snapshot.data.unitProgress, [unitId]: { viewed: true, completedAt: previous?.completedAt ?? null, contentRevision: previous?.completedAt ? previous.contentRevision : contentRevision } },
        lastLocation: { unitId, trackId, activityId: null, updatedAt: new Date().toISOString() } };
      snapshot = { ...snapshot, data };
      if (!snapshot.blocked) {
        const raw = JSON.stringify(data);
        try {
          if (new TextEncoder().encode(raw).length > LEARNING_STORAGE_BUDGET) throw Error("budget");
          if (storage().getItem(LEARNING_STORAGE_KEY) !== snapshot.raw) {
            snapshot = { ...snapshot, blocked: true, notice: "다른 탭에서 학습 기록이 바뀌었습니다. 덮어쓰지 않았으니 페이지를 새로고침해 최신 기록을 확인하세요." }; notify(); return;
          }
          storage().setItem(LEARNING_STORAGE_KEY, raw);
          snapshot = { ...snapshot, raw, notice: null };
        } catch { snapshot = { ...snapshot, notice: "신규 학습 기록을 저장하지 못했습니다. 용량 한도는 512 KiB입니다. 현재 기록은 메모리에 유지하며 기존 답안·진도·대화는 지우지 않습니다." }; }
      }
      notify();
    },
    reset() {
      try { storage().removeItem(LEARNING_STORAGE_KEY); snapshot = { data: empty(), hydrated: true, notice: null, blocked: false, raw: null }; }
      catch { snapshot = { ...snapshot, notice: "신규 학습 기록을 초기화하지 못했습니다. 다른 기록은 유지됩니다." }; }
      notify();
    },
  };
}
export const learningStore = createLearningStore(() => window.localStorage);
