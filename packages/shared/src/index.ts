import { z } from "zod";
import { learnerStateSchema, learnerUpdateSchema } from "./learner-state";

export const DEFAULT_OPENROUTER_MODEL = "openrouter/free";

const lessonIdSchema = z.string().trim().min(1).max(120);

export const conversationTurnSchema = z.object({
  id: z.string().min(1).max(120),
  chapterId: z.string().min(1).max(120),
  chapterTitle: z.string().min(1).max(200),
  lessonId: lessonIdSchema,
  lessonTitle: z.string().min(1).max(200),
  question: z.string().min(2).max(1200),
  answer: z.string().min(1).max(32_000),
  referenceContext: z.string().max(4000).optional(),
});
export const tutorSummaryRequestSchema = z.object({
  previousSummary: z.string().max(6000).default(""),
  turns: z.array(conversationTurnSchema).min(1).max(24),
});
export const tutorSummaryResponseSchema = z.object({ summary: z.string().min(1).max(6000) });
export type TutorSummaryRequest = z.infer<typeof tutorSummaryRequestSchema>;

export const learningContextSchema = z.object({
  version: z.literal(1), unitId: z.string().max(120), topicId: z.string().max(120), moduleId: z.string().max(120),
  trackId: z.string().max(120).nullable(), title: z.string().max(200), readiness: z.enum(["ready", "partial", "tbd"]),
  activeResourceId: z.string().max(200).nullable(), resourceIds: z.array(z.string().max(200)).max(500),
});
export type LearningContext = z.infer<typeof learningContextSchema>;

export const tutorRequestSchema = z.object({
  learningContext: learningContextSchema.optional(),
  question: z.string().trim().min(2).max(1200),
  lookupComplete: z.boolean().default(false),
  learnerState: learnerStateSchema.default([]),
  history: z.array(conversationTurnSchema).max(24).default([]),
  summary: z.string().max(6000).default(""),
  lesson: z.object({
    id: lessonIdSchema,
    title: z.string().trim().min(1).max(200),
    contextSummary: z.string().max(4000).default(""),
  }),
});

// Keep the legacy mode readable while Pages and Worker deployments roll out separately.
export const tutorResponseSchema = z.object({
  answer: z.string(),
  mode: z.enum(["openrouter", "gemini", "demo"]),
  model: z.string(),
  contextLimited: z.boolean().optional(),
  lookupQuery: z.string().max(160).optional(),
  learnerUpdates: z.array(learnerUpdateSchema).max(3).optional(),
});

export const errorResponseSchema = z.object({ error: z.string() });

export type TutorRequest = z.input<typeof tutorRequestSchema>;
export type TutorResponse = z.infer<typeof tutorResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export const assessmentRequestSchema = z.object({
  question: z.string().trim().min(2).max(16000),
  answer: z.string().trim().min(10).max(8000),
  reference: z.string().max(16000),
});
export const assessmentResponseSchema = z.object({
  feedback: z.string(),
  mode: z.enum(["openrouter", "gemini", "self-review"]),
});
export type AssessmentRequest = z.infer<typeof assessmentRequestSchema>;

export * from "./tutor-context";

export * from "./learner-state";
export * from "./tutor-prompts";
