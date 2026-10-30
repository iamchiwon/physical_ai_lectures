import { DEFAULT_GEMINI_MODEL } from "@physical-ai/shared";
import type { Bindings } from "../env";

export const DIAGNOSTICS_VERSION = "2026-10-30.1";
type Operation = "tutor" | "assessment";
type RecordValue = Record<string, unknown>;
function object(value: unknown): RecordValue {
  return value !== null && typeof value === "object" ? value as RecordValue : {};
}
function known(value: unknown, allowed: readonly string[]) {
  return typeof value === "string" && allowed.includes(value) ? value : "OTHER";
}

// Never log provider messages: they may echo prompts, keys, user data or URLs.
function providerDiagnostics(payload: unknown) {
  const error = object(object(payload).error);
  const message = typeof error.message === "string" ? error.message.toLowerCase() : "";
  const hints: string[] = [];
  if (/api.?key/.test(message)) hints.push("CHECK_API_KEY");
  if (/expired/.test(message)) hints.push("CREDENTIAL_EXPIRED");
  if (/leaked|blocked/.test(message)) hints.push("CREDENTIAL_BLOCKED");
  if (/permission|denied|forbidden/.test(message)) hints.push("CHECK_API_PERMISSIONS");
  if (/quota|rate.limit|resource.exhausted/.test(message)) hints.push("CHECK_QUOTA_OR_RATE_LIMIT");
  if (/model/.test(message) && /not found|not supported|unsupported|not available/.test(message)) hints.push("CHECK_MODEL_AVAILABILITY");
  if (/thinking/.test(message)) hints.push("CHECK_THINKING_CONFIG_COMPATIBILITY");
  if (/invalid json|unknown name|invalid argument|not supported|unsupported/.test(message)) hints.push("CHECK_REQUEST_CONFIGURATION");
  const details = Array.isArray(error.details) ? error.details : [];
  const reasons = details.map((detail) => known(object(detail).reason, [
    "API_KEY_INVALID", "API_KEY_EXPIRED", "API_KEY_SERVICE_BLOCKED", "API_KEY_HTTP_REFERRER_BLOCKED", "API_KEY_IP_ADDRESS_BLOCKED", "SERVICE_DISABLED", "BILLING_DISABLED", "RATE_LIMIT_EXCEEDED", "QUOTA_EXCEEDED", "CONSUMER_INVALID", "ACCESS_TOKEN_EXPIRED", "API_KEY_NOT_FOUND",
  ])).filter((value) => value !== "OTHER");
  return {
    providerStatus: known(error.status, ["INVALID_ARGUMENT", "UNAUTHENTICATED", "PERMISSION_DENIED", "NOT_FOUND", "RESOURCE_EXHAUSTED", "FAILED_PRECONDITION", "INTERNAL", "UNAVAILABLE", "DEADLINE_EXCEEDED"]),
    providerReasons: [...new Set(reasons)].slice(0, 5),
    hints,
  };
}

export function logMissingKey(operation: Operation) {
  console.warn({ event: "gemini_key_missing", diagnosticsVersion: DIAGNOSTICS_VERSION, operation, requestId: crypto.randomUUID(), apiKeyConfigured: false, fallback: operation === "tutor" ? "demo" : "self-review" });
}

export async function generateGeminiText(env: Bindings, operation: Operation, body: unknown, timeoutMs: number) {
  const model = env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
  const started = Date.now();
  const fields = {
    diagnosticsVersion: DIAGNOSTICS_VERSION,
    operation,
    requestId: crypto.randomUUID(),
    model: /^gemini-[a-z0-9.-]{1,100}$/.test(model) ? model : "INVALID_MODEL_CONFIG",
    apiKeyConfigured: Boolean(env.GEMINI_API_KEY),
    timeoutMs,
  };
  let stage = "fetch";
  let upstreamStatus: number | undefined;
  let diagnosed = false;
  const fail = (details: RecordValue) => {
    diagnosed = true;
    console.warn({ event: "gemini_request_failed", ...fields, stage, elapsedMs: Date.now() - started, upstreamStatus, fallback: operation === "tutor" ? "demo" : "error", ...details });
  };
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY! },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    upstreamStatus = response.status;
    stage = "read_response";
    let payload: unknown;
    try { payload = await response.json(); }
    catch (cause) {
      if (cause instanceof Error && ["TimeoutError", "AbortError"].includes(cause.name)) throw cause;
      fail({ failure: "INVALID_JSON_RESPONSE" });
      throw new Error("Gemini response is not JSON");
    }
    if (!response.ok) {
      fail({ failure: "UPSTREAM_HTTP_ERROR", ...providerDiagnostics(payload) });
      throw new Error(`Gemini API ${response.status}`);
    }
    stage = "extract_text";
    const root = object(payload);
    const candidates = Array.isArray(root.candidates) ? root.candidates : [];
    const candidate = object(candidates[0]);
    const content = object(candidate.content);
    const parts = Array.isArray(content.parts) ? content.parts : [];
    const answer = parts.map(object).filter((part) => part.thought !== true).map((part) => typeof part.text === "string" ? part.text : "").join("").trim();
    const finishReason = known(candidate.finishReason, ["STOP", "MAX_TOKENS", "SAFETY", "RECITATION", "BLOCKLIST", "PROHIBITED_CONTENT", "SPII", "OTHER", "MALFORMED_RESPONSE"]);
    const blockReason = known(object(root.promptFeedback).blockReason, ["SAFETY", "BLOCKLIST", "PROHIBITED_CONTENT", "OTHER"]);
    if (!answer) {
      fail({ failure: "EMPTY_TEXT_RESPONSE", finishReason, blockReason, candidateCount: candidates.length });
      throw new Error("Empty Gemini text response");
    }
    const event = { event: "gemini_request_completed", ...fields, stage, upstreamStatus, elapsedMs: Date.now() - started, finishReason, truncated: finishReason === "MAX_TOKENS" };
    if (finishReason === "MAX_TOKENS") console.warn(event);
    else console.info(event);
    return answer;
  } catch (cause) {
    if (!diagnosed) fail({ failure: cause instanceof Error && ["TimeoutError", "AbortError"].includes(cause.name) ? "REQUEST_TIMEOUT" : "NETWORK_OR_RUNTIME_ERROR", errorType: cause instanceof TypeError ? "TypeError" : cause instanceof SyntaxError ? "SyntaxError" : "Error" });
    // Do not propagate arbitrary upstream error messages to logs or clients.
    throw new Error("Gemini request failed; see structured diagnostics");
  }
}
