import { z } from "zod";

export const DEFAULT_GEMINI_MODEL = "gemini-flash-latest";

const lessonIdSchema = z.string().trim().min(1).max(120);

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

export const errorResponseSchema = z.object({ error: z.string() });

export type TutorRequest = z.infer<typeof tutorRequestSchema>;
export type TutorResponse = z.infer<typeof tutorResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export const assessmentRequestSchema = z.object({
  question: z.string().trim().min(2).max(16000),
  answer: z.string().trim().min(10).max(8000),
  reference: z.string().max(16000),
});
export const assessmentResponseSchema = z.object({
  feedback: z.string(),
  mode: z.enum(["gemini", "self-review"]),
});
export type AssessmentRequest = z.infer<typeof assessmentRequestSchema>;
