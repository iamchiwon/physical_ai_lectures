import {
  learnerIdSchema,
  progressUpsertSchema,
  type ProgressSnapshot,
} from "@physical-ai/shared";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "../db";
import { learningProgress } from "../db/schema";
import type { Bindings } from "../env";

export const progressRoutes = new Hono<{ Bindings: Bindings }>();

async function readProgress(env: Bindings, learnerId: string): Promise<ProgressSnapshot> {
  const rows = await createDb(env)
    .select()
    .from(learningProgress)
    .where(eq(learningProgress.learnerId, learnerId))
    .orderBy(desc(learningProgress.updatedAt));

  const completedLessons: string[] = [];
  const quizScores: Record<string, number> = {};
  let lastLessonId: string | null = null;
  let latestTimestamp: number | null = null;

  for (const row of rows) {
    if (row.completed) completedLessons.push(row.lessonId);
    if (row.bestQuizScore > 0) quizScores[row.lessonId] = row.bestQuizScore;
    if (row.lastVisited && !lastLessonId) lastLessonId = row.lessonId;
    const timestamp = row.updatedAt.getTime();
    if (latestTimestamp === null || timestamp > latestTimestamp) latestTimestamp = timestamp;
  }

  return {
    learnerId,
    completedLessons,
    quizScores,
    lastLessonId,
    updatedAt: latestTimestamp === null ? null : new Date(latestTimestamp).toISOString(),
  };
}

progressRoutes.get("/progress/:learnerId", async (c) => {
  const parsedLearnerId = learnerIdSchema.safeParse(c.req.param("learnerId"));
  if (!parsedLearnerId.success) return c.json({ error: "학습자 식별자를 확인해 주세요." }, 400);
  return c.json(await readProgress(c.env, parsedLearnerId.data));
});

progressRoutes.put("/progress/:learnerId", async (c) => {
  const parsedLearnerId = learnerIdSchema.safeParse(c.req.param("learnerId"));
  if (!parsedLearnerId.success) return c.json({ error: "학습자 식별자를 확인해 주세요." }, 400);

  const parsed = progressUpsertSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "학습 진도 데이터를 확인해 주세요." }, 400);

  const learnerId = parsedLearnerId.data;
  const payload = parsed.data;
  const lessonIds = new Set([
    ...payload.completedLessons,
    ...Object.keys(payload.quizScores),
    ...(payload.lastLessonId ? [payload.lastLessonId] : []),
  ]);
  const completed = new Set(payload.completedLessons);
  const now = Date.now();
  const statements: D1PreparedStatement[] = [
    c.env.DB.prepare("UPDATE learning_progress SET last_visited = 0 WHERE learner_id = ?1").bind(learnerId),
  ];

  for (const lessonId of lessonIds) {
    statements.push(
      c.env.DB.prepare(`
        INSERT INTO learning_progress
          (learner_id, lesson_id, completed, best_quiz_score, last_visited, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6)
        ON CONFLICT (learner_id, lesson_id) DO UPDATE SET
          completed = MAX(learning_progress.completed, excluded.completed),
          best_quiz_score = MAX(learning_progress.best_quiz_score, excluded.best_quiz_score),
          last_visited = excluded.last_visited,
          updated_at = excluded.updated_at
      `).bind(
        learnerId,
        lessonId,
        completed.has(lessonId) ? 1 : 0,
        payload.quizScores[lessonId] ?? 0,
        payload.lastLessonId === lessonId ? 1 : 0,
        now,
      ),
    );
  }

  if (payload.attempt) {
    statements.push(
      c.env.DB.prepare(`
        INSERT INTO quiz_attempts
          (learner_id, lesson_id, score, total_questions, attempted_at)
        VALUES (?1, ?2, ?3, ?4, ?5)
      `).bind(
        learnerId,
        payload.attempt.lessonId,
        payload.attempt.score,
        payload.attempt.totalQuestions,
        now,
      ),
    );
  }

  await c.env.DB.batch(statements);
  return c.json(await readProgress(c.env, learnerId));
});
