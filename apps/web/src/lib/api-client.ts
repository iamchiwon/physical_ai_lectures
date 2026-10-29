import {
  progressSnapshotSchema,
  tutorResponseSchema,
  voiceSessionResponseSchema,
  voiceStatusResponseSchema,
  type ProgressSnapshot,
  type ProgressUpsert,
  type TutorRequest,
  type TutorResponse,
  type VoiceSessionRequest,
  type VoiceSessionResponse,
  type VoiceStatusResponse,
} from "@physical-ai/shared";

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

export async function getVoiceStatus(): Promise<VoiceStatusResponse> {
  return voiceStatusResponseSchema.parse(await requestJson("/v1/voice/session"));
}

export async function createVoiceSession(input: VoiceSessionRequest): Promise<VoiceSessionResponse> {
  return voiceSessionResponseSchema.parse(await requestJson("/v1/voice/session", {
    method: "POST",
    body: JSON.stringify(input),
  }));
}

export async function getProgress(learnerId: string): Promise<ProgressSnapshot> {
  return progressSnapshotSchema.parse(await requestJson(`/v1/progress/${encodeURIComponent(learnerId)}`));
}

export async function putProgress(learnerId: string, input: ProgressUpsert): Promise<ProgressSnapshot> {
  return progressSnapshotSchema.parse(await requestJson(`/v1/progress/${encodeURIComponent(learnerId)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  }));
}
