import {
  DEFAULT_GEMINI_LIVE_MODEL,
  DEFAULT_GEMINI_MODEL,
  type TutorRequest,
  type TutorResponse,
  type VoiceSessionRequest,
  type VoiceSessionResponse,
} from "@physical-ai/shared";
import type { Bindings } from "../env";

const tutorInstructions = `당신은 컴퓨터공학 전공 졸업(예정)자를 위한 Physical AI 로봇 제어 자습 과정의 한국어 AI 강사다.
학습자가 스스로 개념을 연결하게 돕고, 정답만 즉시 제시하지 않는다. 질문에서 막힌 지점을 짚고, 짧은 비유나 로봇 사례, 유도 질문, 2~3개 핵심 정리 순으로 설명한다. 전문용어에는 영어를 병기한다. 실제 로봇 질문에는 사람·장비 안전, 정지 수단, 낮은 속도와 제한된 환경에서의 검증을 우선한다.`;

function createDemoAnswer({ question, lesson }: TutorRequest) {
  const context = lesson.contextSummary.replace(/\s+/g, " ").slice(0, 480);
  return `막힌 지점부터 짚어볼게요. “${question}”이라는 질문은 ${lesson.title}에서 개념과 실제 로봇 동작이 어떻게 이어지는지 확인하려는 질문으로 보여요.

작은 이동 로봇을 떠올려 보세요. 센서가 로봇의 ‘눈’이라면, 제어기는 관측한 값과 목표의 차이를 보고 다음 행동을 고르는 ‘두뇌’입니다. 이 단원의 맥락은 다음과 같습니다: ${context}

스스로 확인해 볼까요? 목표값과 현재값의 차이가 갑자기 커졌을 때, 로봇의 제어 입력은 어떤 방향으로 달라져야 할까요?

핵심 정리
• 센서 값은 상태를 관측하는 근거입니다.
• 제어기는 목표와 현재 상태의 차이를 행동으로 바꿉니다.
• 실제 로봇에서는 낮은 속도, 비상 정지, 제한된 시험 공간을 먼저 확보해야 합니다.

(현재는 Gemini 연결 없이 동작하는 데모 설명입니다.)`;
}

function extractText(payload: unknown) {
  const response = payload as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return response.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
}

export async function answerTutorQuestion(env: Bindings, request: TutorRequest): Promise<TutorResponse> {
  const model = env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
  if (!env.GEMINI_API_KEY) {
    return { answer: createDemoAnswer(request), mode: "demo", model };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: tutorInstructions }] },
          contents: [{
            role: "user",
            parts: [{
              text: `현재 단원 ID: ${request.lesson.id}\n현재 단원 제목: ${request.lesson.title}\n단원 요약과 핵심어:\n${request.lesson.contextSummary}\n\n학습자 질문:\n${request.question}`,
            }],
          }],
          generationConfig: { maxOutputTokens: 700, temperature: 0.5 },
        }),
        signal: AbortSignal.timeout(25_000),
      },
    );
    if (!response.ok) throw new Error(`Gemini API ${response.status}`);
    const answer = extractText(await response.json());
    if (!answer) throw new Error("empty Gemini response");
    return { answer, mode: "gemini", model };
  } catch (error) {
    console.warn("Tutor API fallback to demo mode", error);
    return { answer: createDemoAnswer(request), mode: "demo", model };
  }
}

export async function createVoiceSession(env: Bindings, request: VoiceSessionRequest): Promise<VoiceSessionResponse> {
  if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY_NOT_CONFIGURED");

  const model = env.GEMINI_LIVE_MODEL ?? DEFAULT_GEMINI_LIVE_MODEL;
  const instruction = `당신은 Physical AI 로봇 제어 과정의 한국어 AI 강사다. 현재 단원은 “${request.lessonTitle}”이며, 단원 맥락은 다음과 같다: ${request.contextSummary} 정답을 바로 주기보다 짧은 비유, 유도 질문, 핵심 정리 순으로 학습자의 이해를 돕는다. 전문용어는 영어를 병기하고 실제 로봇 안전을 우선한다.`;
  const now = Date.now();
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/auth_tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
    body: JSON.stringify({
      uses: 1,
      expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
      newSessionExpireTime: new Date(now + 60 * 1000).toISOString(),
      liveConnectConstraints: {
        model: `models/${model}`,
        config: {
          sessionResumption: {},
          responseModalities: ["AUDIO"],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: { parts: [{ text: instruction }] },
        },
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) throw new Error(`Gemini auth token API ${response.status}`);
  const token = await response.json() as { name?: string; expireTime?: string };
  if (!token.name) throw new Error("EMPTY_EPHEMERAL_TOKEN");
  return { token: token.name, expireTime: token.expireTime, model };
}
