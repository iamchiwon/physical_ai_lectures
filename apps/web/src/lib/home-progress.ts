export const LEGACY_PROGRESS_KEY = "physical-ai-study-progress-v1";
export interface LegacyProgress {
  completedLessons: string[];
  quizScores: Record<string, number>;
  lastLessonId: string | null;
}
export const emptyLegacyProgress: LegacyProgress = { completedLessons: [], quizScores: {}, lastLessonId: null };

export function parseLegacyProgress(raw: string | null): { progress: LegacyProgress; notice: string | null } {
  if (raw === null) return { progress: emptyLegacyProgress, notice: null };
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid progress");
    const parsed = value as Record<string, unknown>;
    if (!Array.isArray(parsed.completedLessons) || !parsed.quizScores || typeof parsed.quizScores !== "object" || Array.isArray(parsed.quizScores)
      || !(parsed.lastLessonId === null || typeof parsed.lastLessonId === "string")) throw new Error("Invalid progress");
    const completedLessons = parsed.completedLessons.filter((id): id is string => typeof id === "string");
    const scores = Object.entries(parsed.quizScores).filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]) && entry[1] >= 0 && entry[1] <= 100);
    const invalid = completedLessons.length !== parsed.completedLessons.length || scores.length !== Object.keys(parsed.quizScores).length;
    return { progress: { completedLessons, quizScores: Object.fromEntries(scores), lastLessonId: parsed.lastLessonId },
      notice: invalid ? "일부 학습 기록을 읽지 못했습니다. 저장된 원본은 유지했습니다." : null };
  } catch {
    return { progress: emptyLegacyProgress, notice: "저장된 학습 기록을 읽지 못했습니다. 원본을 유지했으니 기존 레슨이나 교재에서 학습을 계속하세요." };
  }
}

export function legacyProgressSummary(progress: LegacyProgress, lessons: { id: string; title: string }[]) {
  const known = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const completed = new Set(progress.completedLessons.filter((id) => known.has(id))).size;
  const lastLesson = progress.lastLessonId ? known.get(progress.lastLessonId) ?? null : null;
  return { completed, lastLesson, unknownLastLesson: Boolean(progress.lastLessonId && !lastLesson) };
}
