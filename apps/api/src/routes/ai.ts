import {
  DEFAULT_GEMINI_LIVE_MODEL,
  tutorRequestSchema,
  voiceSessionRequestSchema,
  type VoiceStatusResponse,
} from "@physical-ai/shared";
import { Hono } from "hono";
import type { Bindings } from "../env";
import { answerTutorQuestion, createVoiceSession } from "../services/gemini";

export const aiRoutes = new Hono<{ Bindings: Bindings }>();

aiRoutes.post("/tutor", async (c) => {
  const parsed = tutorRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "질문과 현재 단원 정보를 확인해 주세요." }, 400);
  return c.json(await answerTutorQuestion(c.env, parsed.data));
});

aiRoutes.get("/voice/session", (c) => {
  const response: VoiceStatusResponse = {
    provider: "google",
    configured: Boolean(c.env.GEMINI_API_KEY),
    model: c.env.GEMINI_LIVE_MODEL ?? DEFAULT_GEMINI_LIVE_MODEL,
    transport: "gemini-live-native-audio-with-browser-fallback",
    message: "Gemini Live native audio를 우선 사용하고, 연결할 수 없으면 브라우저 음성 인식과 음성 합성으로 자동 전환합니다.",
  };
  return c.json(response);
});

aiRoutes.post("/voice/session", async (c) => {
  const parsed = voiceSessionRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "현재 레슨 정보를 확인해 주세요." }, 400);
  if (!c.env.GEMINI_API_KEY) {
    return c.json({ error: "Gemini API 키가 설정되지 않아 브라우저 음성 모드로 동작합니다." }, 503);
  }

  try {
    return c.json(await createVoiceSession(c.env, parsed.data));
  } catch (error) {
    console.warn("Gemini ephemeral token request failed", error);
    return c.json({ error: "음성 대화 세션을 준비하지 못했습니다." }, 502);
  }
});
