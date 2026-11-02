import { DEFAULT_OPENROUTER_MODEL } from "@physical-ai/shared";
import type { Bindings } from "../env";

export const DIAGNOSTICS_VERSION = "2026-11-02.4";
type Operation = "tutor" | "assessment" | "summary";
type RecordValue = Record<string, unknown>;
type GenerationInput = {
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature: number;
  maxTokens?: number;
  responseFormat?: Record<string, unknown>;
};
function object(value: unknown): RecordValue {
  return value !== null && typeof value === "object" ? value as RecordValue : {};
}
function known(value: unknown, allowed: readonly string[]) {
  return typeof value === "string" && allowed.includes(value) ? value : "OTHER";
}
function safeModel(value: unknown) {
  return typeof value === "string" && /^[a-z0-9._-]+\/[a-z0-9._:-]{1,160}$/i.test(value) ? value : undefined;
}

// Only accept explicitly free routes. A mistaken paid model setting must never make a request.
export function isFreeModel(model: string) {
  return Boolean(safeModel(model)) && (model === "openrouter/free" || model.endsWith(":free"));
}

// Provider messages/metadata may echo credentials, prompts, user data or URLs: never log them.
function providerDiagnostics(payload: unknown, httpStatus: number) {
  const error = object(object(payload).error);
  const code = typeof error.code === "number" ? error.code : Number(error.code);
  const status = [400, 401, 402, 403, 404, 408, 422, 429, 500, 502, 503, 504].includes(code) ? code : httpStatus;
  const hint: Record<number, string> = {
    400: "CHECK_REQUEST_CONFIGURATION", 401: "CHECK_API_KEY", 402: "CHECK_ACCOUNT_CREDITS",
    403: "CHECK_ACCOUNT_OR_PROVIDER_PERMISSIONS", 404: "CHECK_MODEL_AVAILABILITY",
    408: "PROVIDER_TIMEOUT", 422: "CHECK_REQUEST_CONFIGURATION", 429: "CHECK_QUOTA_OR_RATE_LIMIT",
    500: "PROVIDER_UNAVAILABLE", 502: "PROVIDER_UNAVAILABLE", 503: "CHECK_FREE_MODEL_AVAILABILITY", 504: "PROVIDER_TIMEOUT",
  };
  return { providerCode: hint[status] ? status : "OTHER", hints: hint[status] ? [hint[status]] : [] };
}

export function logMissingKey(operation: Operation) {
  console.warn({ event: "openrouter_key_missing", diagnosticsVersion: DIAGNOSTICS_VERSION, operation, requestId: crypto.randomUUID(), apiKeyConfigured: false, fallback: operation === "tutor" ? "demo" : operation === "summary" ? "keep_previous_summary" : "self-review" });
}

export async function generateOpenRouterText(env: Bindings, operation: Operation, input: GenerationInput, timeoutMs = 60_000) {
  const model = env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
  const started = Date.now();
  const fields = {
    diagnosticsVersion: DIAGNOSTICS_VERSION,
    operation,
    requestId: crypto.randomUUID(),
    model: safeModel(model) ?? "INVALID_MODEL_CONFIG",
    apiKeyConfigured: Boolean(env.OPENROUTER_API_KEY?.trim()),
    timeoutMs,
  };
  let stage = "validate_config";
  let upstreamStatus: number | undefined;
  let diagnosed = false;
  const fail = (details: RecordValue) => {
    diagnosed = true;
    console.warn({ event: "openrouter_request_failed", ...fields, stage, elapsedMs: Date.now() - started, upstreamStatus, fallback: operation === "tutor" ? "demo" : "error", ...details });
  };
  try {
    if (!isFreeModel(model)) {
      fail({ failure: "NON_FREE_MODEL_BLOCKED", hints: ["USE_OPENROUTER_FREE_OR_FREE_VARIANT"] });
      throw new Error("Only free models are allowed");
    }
    stage = "fetch";
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.OPENROUTER_API_KEY?.trim()}` },
      body: JSON.stringify({
        model,
        messages: input.messages,
        temperature: input.temperature,
        max_tokens: input.maxTokens ?? 4096,
        ...(input.responseFormat ? { response_format: input.responseFormat } : {}),
        stream: false,
        // Leave room for the visible answer instead of spending the whole budget on reasoning.
        reasoning: { effort: "low", exclude: true },
        // A second cost guard: only endpoints with zero token prices are eligible.
        provider: { max_price: { prompt: 0, completion: 0 }, ...(input.responseFormat ? { require_parameters: true } : {}) },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    upstreamStatus = response.status;
    stage = "read_response";
    let payload: unknown;
    try { payload = await response.json(); }
    catch (cause) {
      if (cause instanceof Error && ["TimeoutError", "AbortError"].includes(cause.name)) throw cause;
      fail({ failure: "INVALID_JSON_RESPONSE" });
      throw new Error("Invalid provider response");
    }
    const root = object(payload);
    if (!response.ok || root.error) {
      fail({ failure: "UPSTREAM_HTTP_ERROR", ...providerDiagnostics(payload, response.status) });
      throw new Error("Provider returned an error");
    }
    stage = "extract_text";
    const choices = Array.isArray(root.choices) ? root.choices : [];
    const choice = object(choices[0]);
    const message = object(choice.message);
    const usage = object(root.usage);
    const tokenCount = (value: unknown) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= 10_000_000 ? value : undefined;
    const completionTokens = tokenCount(usage.completion_tokens);
    const reasoningTokens = tokenCount(object(usage.completion_tokens_details).reasoning_tokens);
    const text = typeof message.content === "string" ? message.content.trim() : "";
    const finishReason = known(choice.finish_reason, ["stop", "length", "content_filter", "error", "tool_calls"]);
    if (finishReason === "error" || finishReason === "content_filter" || !text) {
      fail({ failure: "EMPTY_OR_FAILED_TEXT_RESPONSE", finishReason, choiceCount: choices.length, completionTokens, reasoningTokens });
      throw new Error("No usable answer returned");
    }
    const event = { event: "openrouter_request_completed", ...fields, stage, upstreamStatus, elapsedMs: Date.now() - started, finishReason, truncated: finishReason === "length", completionTokens, reasoningTokens };
    if (finishReason === "length") console.warn(event);
    else console.info(event);
    // Return only final content, never reasoning/reasoning_details.
    return { text, model: safeModel(root.model) ?? model, truncated: finishReason === "length" };
  } catch (cause) {
    if (!diagnosed) fail({ failure: cause instanceof Error && ["TimeoutError", "AbortError"].includes(cause.name) ? "REQUEST_TIMEOUT" : "NETWORK_OR_RUNTIME_ERROR", errorType: cause instanceof TypeError ? "TypeError" : "Error" });
    throw new Error("OpenRouter request failed; see structured diagnostics");
  }
}
