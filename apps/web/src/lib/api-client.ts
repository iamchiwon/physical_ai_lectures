import {
  assessmentResponseSchema,
  tutorSummaryResponseSchema,
  type TutorSummaryRequest,
  type AssessmentRequest,
  tutorResponseSchema,
  type TutorRequest,
  type TutorResponse,
} from "@physical-ai/shared";

export async function evaluateAnswer(input: AssessmentRequest, signal?: AbortSignal) {
  const payload = await requestJson("/v1/assessment", { method: "POST", body: JSON.stringify(input), signal: signal ?? null });
  const result = assessmentResponseSchema.safeParse(payload);
  if (!result.success) throw new Error("평가 응답을 읽을 수 없습니다. 답안은 유지되니 잠시 후 다시 평가해 주세요.");
  if (input.context?.trim() && result.data.mode !== "self-review" && result.data.lessonContextIncluded !== true) {
    throw new Error("평가 서비스에서 본문 문맥 전달을 확인하지 못했습니다. 이 평가 결과는 사용하지 않습니다. 답안은 저장했으니 해설과 비교하거나 잠시 후 다시 확인해 주세요.");
  }
  return result.data;
}

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, "") ?? "";

export function isApiConfigured() {
  return configuredApiBaseUrl.length > 0;
}

function apiUrl(path: string) {
  if (!configuredApiBaseUrl) {
    throw new Error("학습 API 주소가 설정되지 않았습니다. NEXT_PUBLIC_API_BASE_URL을 확인해 주세요.");
  }
  return `${configuredApiBaseUrl}${path}`;
}

async function requestJson(path: string, init?: RequestInit): Promise<unknown> {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (init?.body) headers.set("Content-Type", "application/json");
  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
  });
  const payload = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) {
    throw new Error(payload?.error ?? `학습 API 요청에 실패했습니다. (${response.status})`);
  }
  return payload;
}

export async function askTutor(input: TutorRequest, signal?: AbortSignal): Promise<TutorResponse> {
  return tutorResponseSchema.parse(await requestJson("/v1/tutor", {
    method: "POST",
    body: JSON.stringify(input),
    signal: signal ?? null,
  }));
}


export async function summarizeTutor(input: TutorSummaryRequest, signal?: AbortSignal) {
  return tutorSummaryResponseSchema.parse(await requestJson("/v1/tutor/summary", { method:"POST", body:JSON.stringify(input), signal: signal ?? null }));
}

export async function supportsLearningContext(signal?: AbortSignal): Promise<boolean> {
  try {
    const health = await requestJson("/v1/health", { signal: signal ?? null }) as { supportedContextVersions?: number[] };
    return Array.isArray(health.supportedContextVersions) && health.supportedContextVersions.includes(1);
  } catch { return false; }
}
