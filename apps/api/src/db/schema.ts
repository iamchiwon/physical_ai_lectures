import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const learningProgress = sqliteTable(
  "learning_progress",
  {
    learnerId: text("learner_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    bestQuizScore: integer("best_quiz_score").notNull().default(0),
    lastVisited: integer("last_visited", { mode: "boolean" }).notNull().default(false),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.learnerId, table.lessonId] }),
    index("learning_progress_learner_updated_idx").on(table.learnerId, table.updatedAt),
  ],
);

export const quizAttempts = sqliteTable(
  "quiz_attempts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    learnerId: text("learner_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    score: integer("score").notNull(),
    totalQuestions: integer("total_questions").notNull(),
    attemptedAt: integer("attempted_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [index("quiz_attempts_learner_lesson_idx").on(table.learnerId, table.lessonId)],
);

export type LearningProgressRow = typeof learningProgress.$inferSelect;
export type NewLearningProgressRow = typeof learningProgress.$inferInsert;
export type QuizAttemptRow = typeof quizAttempts.$inferSelect;
