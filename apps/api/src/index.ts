import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Bindings } from "./env";
import { aiRoutes } from "./routes/ai";
import { progressRoutes } from "./routes/progress";

const app = new Hono<{ Bindings: Bindings }>();

app.use("/v1/*", cors({
  origin: (origin, c) => {
    const allowedOrigins = c.env.ALLOWED_ORIGINS.split(",").map((value: string) => value.trim()).filter(Boolean);
    return allowedOrigins.includes(origin) ? origin : "";
  },
  allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
  allowHeaders: ["Content-Type"],
  maxAge: 86_400,
}));

app.get("/v1/health", (c) => c.json({ status: "ok", service: "physical-ai-learning-api" }));
app.route("/v1", aiRoutes);
app.route("/v1", progressRoutes);

app.notFound((c) => c.json({ error: "요청한 API 경로를 찾을 수 없습니다." }, 404));
app.onError((error, c) => {
  console.error("Unhandled Worker error", error);
  return c.json({ error: "서버 요청을 처리하지 못했습니다." }, 500);
});

export default app;
