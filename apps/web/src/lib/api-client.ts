import {
  assessmentResponseSchema,
  type AssessmentRequest,
  tutorResponseSchema,
  type TutorRequest,
  type TutorResponse,
} from "@physical-ai/shared";

export async function evaluateAnswer(input: AssessmentRequest) {
  return assessmentResponseSchema.parse(await requestJson("/v1/assessment", { method: "POST", body: JSON.stringify(input) }));
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

export async function askTutor(input: TutorRequest): Promise<TutorResponse> {
  return tutorResponseSchema.parse(await requestJson("/v1/tutor", {
    method: "POST",
    body: JSON.stringify(input),
  }));
}

