import { z } from "zod";

export const DEFAULT_GEMINI_MODEL = "gemini-flash-latest";
export const DEFAULT_GEMINI_LIVE_MODEL = "gemini-3.8-live";

const lessonIdSchema = z.string().trim().min(1).max(120);
export const learnerIdSchema = z.string().trim().min(12).max(128).regex(/^[A-Za-z0-9_-]+$/);
const scoreSchema = z.number().int().min(0).max(100);

export const tutorRequestSchema = z.object({
  question: z.string().trim().min(2).max(1200),
  lesson: z.object({
    id: lessonIdSchema,
    title: z.string().trim().min(1).max(200),
    contextSummary: z.string().trim().min(1).max(4000),
  }),
});

export const tutorResponseSchema = z.object({
  answer: z.string(),
  mode: z.enum(["gemini", "demo"]),
  model: z.string(),
});

export const voiceStatusResponseSchema = z.object({
  provider: z.literal("google"),
  configured: z.boolean(),
  model: z.string(),
  transport: z.literal("gemini-live-native-audio-with-browser-fallback"),
  message: z.string(),
});

export const voiceSessionRequestSchema = z.object({
  lessonId: lessonIdSchema,
  lessonTitle: z.string().trim().min(1).max(200),
  contextSummary: z.string().trim().min(1).max(4000),
});

export const voiceSessionResponseSchema = z.object({
  token: z.string(),
  expireTime: z.string().optional(),
  model: z.string(),
});

export const quizAttemptSchema = z.object({
  lessonId: lessonIdSchema,
  score: scoreSchema,
  totalQuestions: z.number().int().min(1).max(200),
});

export const progressUpsertSchema = z.object({
  completedLessons: z.array(lessonIdSchema).max(500),
  quizScores: z.record(lessonIdSchema, scoreSchema),
  lastLessonId: lessonIdSchema.nullable(),
  attempt: quizAttemptSchema.optional(),
});

export const progressSnapshotSchema = z.object({
  learnerId: learnerIdSchema,
  completedLessons: z.array(lessonIdSchema),
  quizScores: z.record(lessonIdSchema, scoreSchema),
  lastLessonId: lessonIdSchema.nullable(),
  updatedAt: z.string().nullable(),
});

export const errorResponseSchema = z.object({ error: z.string() });

export type TutorRequest = z.infer<typeof tutorRequestSchema>;
export type TutorResponse = z.infer<typeof tutorResponseSchema>;
export type VoiceStatusResponse = z.infer<typeof voiceStatusResponseSchema>;
export type VoiceSessionRequest = z.infer<typeof voiceSessionRequestSchema>;
export type VoiceSessionResponse = z.infer<typeof voiceSessionResponseSchema>;
export type QuizAttempt = z.infer<typeof quizAttemptSchema>;
export type ProgressUpsert = z.infer<typeof progressUpsertSchema>;
export type ProgressSnapshot = z.infer<typeof progressSnapshotSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
