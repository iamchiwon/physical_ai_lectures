import { tutorRequestSchema } from "@physical-ai/shared";
import { Hono } from "hono";
import type { Bindings } from "../env";
import { answerTutorQuestion } from "../services/gemini";

export const aiRoutes = new Hono<{ Bindings: Bindings }>();

aiRoutes.post("/tutor", async (c) => {
  const parsed = tutorRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "질문과 현재 단원 정보를 확인해 주세요." }, 400);
  return c.json(await answerTutorQuestion(c.env, parsed.data));
});
