import { tutorRequestSchema, assessmentRequestSchema, tutorSummaryRequestSchema } from "@physical-ai/shared";
import { Hono } from "hono";
import type { Bindings } from "../env";
import { answerTutorQuestion, assessAnswer, summarizeConversation } from "../services/ai";

export const aiRoutes = new Hono<{ Bindings: Bindings }>();

aiRoutes.post("/assessment", async (c) => {
  const parsed = assessmentRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "문제와 답안을 확인해 주세요. 답안은 1~8,000자입니다." }, 400);
  try { return c.json(await assessAnswer(c.env, parsed.data)); }
  catch { return c.json({ error: "평가를 완료하지 못했습니다. 답안은 유지되니 잠시 후 다시 시도해 주세요." }, 502); }
});

aiRoutes.post("/tutor", async (c) => {
  const parsed = tutorRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "질문과 현재 단원 정보를 확인해 주세요." }, 400);
  return c.json(await answerTutorQuestion(c.env, parsed.data));
});

aiRoutes.post("/tutor/summary", async (c) => {
  const parsed = tutorSummaryRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "요약할 대화 형식을 확인해 주세요." }, 400);
  try { return c.json(await summarizeConversation(c.env, parsed.data)); }
  catch { return c.json({ error: "대화 요약을 완료하지 못했습니다. 기존 대화와 요약은 유지됩니다." }, 502); }
});
