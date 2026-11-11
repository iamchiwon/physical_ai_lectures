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
export interface LearningSnapshot { data: LearningState; hydrated: boolean; notice: string | null; blocked: boolean; raw: string | null; unsavedChanges: boolean }
const empty = (): LearningState => ({ schemaVersion: 2, catalogRevision: "uninitialized", unitProgress: {}, activityRecords: {}, lastLocation: null, migrations: [] });
export function createLearningStore(storage: () => Pick<Storage, "getItem" | "setItem" | "removeItem">) {
  let snapshot: LearningSnapshot = { data: empty(), hydrated: false, notice: null, blocked: false, raw: null, unsavedChanges: false };
  const initial = snapshot;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((fn) => fn());
  function restore(raw: string | null) {
    try {
      const data = raw === null ? empty() : learningStateSchema.parse(JSON.parse(raw));
      snapshot = { data, hydrated: true, notice: null, blocked: false, raw, unsavedChanges: false };
    } catch {
      snapshot = { ...snapshot, hydrated: true, raw, blocked: true, notice: "신규 학습 기록의 형식을 읽을 수 없습니다. 손상되었거나 더 새로운 버전일 수 있어 원본을 덮어쓰지 않습니다. 원본을 내려받아 보관한 후 이 기록만 초기화할 수 있습니다." };
    }
    notify();
  }
  function commit(data: LearningState, interactive = false) {
    snapshot = { ...snapshot, data, unsavedChanges: snapshot.unsavedChanges || interactive };
    if (snapshot.blocked) { notify(); return false; }
    const raw = JSON.stringify(data);
    try {
      learningStateSchema.parse(data);
      if (new TextEncoder().encode(raw).length > LEARNING_STORAGE_BUDGET) throw Error("budget");
      if (storage().getItem(LEARNING_STORAGE_KEY) !== snapshot.raw) {
        snapshot = { ...snapshot, blocked: true, notice: "다른 탭에서 학습 기록이 바뀌었습니다. 덮어쓰지 않았으니 현재 입력을 복사한 뒤 새로고침해 최신 기록을 확인하세요." }; notify(); return false;
      }
      storage().setItem(LEARNING_STORAGE_KEY, raw);
      snapshot = { ...snapshot, raw, notice: null, unsavedChanges: false }; notify(); return true;
    } catch { snapshot = { ...snapshot, notice: "신규 학습 기록을 저장하지 못했습니다. 용량 한도는 512 KiB입니다. 현재 기록은 메모리에 유지하며 기존 답안·진도·대화는 지우지 않습니다." }; notify(); return false; }
  }
  return {
    getSnapshot: () => snapshot, getServerSnapshot: () => initial,
    subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
    hydrate() {
      if (snapshot.hydrated) return;
      try { restore(storage().getItem(LEARNING_STORAGE_KEY)); }
      catch { snapshot = { ...snapshot, hydrated: true, blocked: true, notice: "학습 저장소를 읽을 수 없습니다. 브라우저 저장 설정을 확인하세요. 원본은 유지합니다." }; notify(); }
    },
    receiveStorage(raw: string | null) {
      if (snapshot.unsavedChanges) {
        snapshot = { ...snapshot, raw, blocked: true, notice: "다른 탭의 학습 기록이 변경되었습니다. 저장되지 않은 현재 답안·완료 기록은 이 화면에 유지했습니다. 현재 입력을 복사하거나 기록을 내려받아 보관한 뒤 새로고침하세요." }; notify(); return;
      }
      restore(raw);
    },
    view(unitId: string, contentRevision: string, catalogRevision: string, trackId: string | null = null) {
      if (!snapshot.hydrated) return;
      const last = snapshot.data.lastLocation;
      if (last?.unitId === unitId && last.trackId === trackId && snapshot.data.unitProgress[unitId]?.contentRevision === contentRevision) return;
      const previous = snapshot.data.unitProgress[unitId];
      const data: LearningState = { ...snapshot.data, catalogRevision,
        unitProgress: { ...snapshot.data.unitProgress, [unitId]: { viewed: true, completedAt: previous?.completedAt ?? null, contentRevision: previous?.completedAt ? previous.contentRevision : contentRevision } },
        lastLocation: { unitId, trackId, activityId: null, updatedAt: new Date().toISOString() } };
      commit(data);
    },
    saveActivity(activityId: string, revision: string, answer: string, selfReviewed = false) {
      if (!snapshot.hydrated || !identity.safeParse(activityId).success || !identity.safeParse(revision).success || answer.length > 8000) return false;
      const records = { ...snapshot.data.activityRecords };
      const previous = records[activityId];
      if (previous && previous.revision !== revision) records[`${activityId}@${previous.revision}`] = previous;
      records[activityId] = { revision, answer, evidence: selfReviewed ? "self-reviewed" : "", ...(selfReviewed && previous?.revision === revision && previous.answer === answer && previous.feedback ? { feedback: previous.feedback } : {}) };
      return commit({ ...snapshot.data, activityRecords: records }, true);
    },
    saveFeedback(activityId: string, revision: string, answer: string, feedback: string) {
      const record = snapshot.data.activityRecords[activityId];
      if (!snapshot.hydrated || snapshot.blocked || !feedback.trim() || feedback.length > 16000
        || record?.revision !== revision || record.answer !== answer) return false;
      return commit({ ...snapshot.data, activityRecords: { ...snapshot.data.activityRecords, [activityId]: { ...record, feedback } } }, true);
    },
    complete(unitId: string, contentRevision: string, catalogRevision: string, readiness: string, activityIds: string[]) {
      if (!snapshot.hydrated || readiness !== "ready") return false;
      if (!activityIds.length || activityIds.some(id => { const record = snapshot.data.activityRecords[id]; return !record || record.revision !== contentRevision || !record.answer?.trim() || record.evidence !== "self-reviewed"; })) {
        snapshot = { ...snapshot, notice: "실습과 세 문항의 답안을 저장하고 해설과 비교해 자기검토를 기록한 뒤 학습 완료를 선택하세요." }; notify(); return false;
      }
      const previous = snapshot.data.unitProgress[unitId];
      const unitProgress = { ...snapshot.data.unitProgress };
      if (previous?.completedAt && previous.contentRevision !== contentRevision) unitProgress[`${unitId}@${previous.contentRevision}`] = previous;
      unitProgress[unitId] = { viewed: true, completedAt: previous?.contentRevision === contentRevision && previous.completedAt ? previous.completedAt : new Date().toISOString(), contentRevision };
      return commit({ ...snapshot.data, catalogRevision, unitProgress }, true);
    },
    reset() {
      try { storage().removeItem(LEARNING_STORAGE_KEY); snapshot = { data: empty(), hydrated: true, notice: null, blocked: false, raw: null, unsavedChanges: false }; }
      catch { snapshot = { ...snapshot, notice: "신규 학습 기록을 초기화하지 못했습니다. 다른 기록은 유지됩니다." }; }
      notify();
    },
  };
}
export const learningStore = createLearningStore(() => window.localStorage);
