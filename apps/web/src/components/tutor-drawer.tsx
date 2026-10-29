"use client";

import * as React from "react";
import type { LiveServerMessage, Session } from "@google/genai";
import {
  Bot,
  LoaderCircle,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Send,
  Sparkles,
  UserRound,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { askTutor as requestTutor, createVoiceSession, getVoiceStatus, isApiConfigured } from "@/lib/api-client";

interface TutorDrawerProps {
  lessonId: string;
  lessonTitle: string;
  contextSummary: string;
}

interface TutorMessage {
  id: string;
  role: "student" | "tutor";
  content: string;
  demo?: boolean;
  model?: string;
}

interface SpeechRecognitionResultEventLike extends Event {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type VoiceTransport = "idle" | "native" | "fallback";

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return window.btoa(binary);
}

function base64ToPcm(data: string) {
  const binary = window.atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  const sampleCount = Math.floor(bytes.byteLength / 2);
  const samples = new Float32Array(sampleCount);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let index = 0; index < sampleCount; index += 1) samples[index] = view.getInt16(index * 2, true) / 32768;
  return samples;
}

function downsampleToPcm16(input: Float32Array, inputRate: number, outputRate = 16_000) {
  const ratio = inputRate / outputRate;
  const length = Math.max(1, Math.floor(input.length / ratio));
  const pcm = new Int16Array(length);
  for (let outputIndex = 0; outputIndex < length; outputIndex += 1) {
    const start = Math.floor(outputIndex * ratio);
    const end = Math.min(input.length, Math.floor((outputIndex + 1) * ratio));
    let sum = 0;
    for (let inputIndex = start; inputIndex < end; inputIndex += 1) sum += input[inputIndex] ?? 0;
    const value = Math.max(-1, Math.min(1, sum / Math.max(1, end - start)));
    pcm[outputIndex] = value < 0 ? value * 32768 : value * 32767;
  }
  return new Uint8Array(pcm.buffer);
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

const suggestedQuestions = [
  "이 개념을 로봇 사례로 쉽게 비유해 주세요.",
  "제가 꼭 구분해야 할 핵심 개념은 무엇인가요?",
  "이 내용을 이해했는지 확인할 질문을 내 주세요.",
];

export function TutorDrawer({ lessonId, lessonTitle, contextSummary }: TutorDrawerProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [messages, setMessages] = React.useState<TutorMessage[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = React.useState(false);
  const [listening, setListening] = React.useState(false);
  const [voiceConversation, setVoiceConversation] = React.useState(false);
  const [voiceTransport, setVoiceTransport] = React.useState<VoiceTransport>("idle");
  const [voiceStatus, setVoiceStatus] = React.useState("음성 대화를 시작할 수 있어요.");
  const [nativeVoiceConfigured, setNativeVoiceConfigured] = React.useState(false);
  const [autoSpeak, setAutoSpeak] = React.useState(true);
  const [interimTranscript, setInterimTranscript] = React.useState("");
  const [liveInputTranscript, setLiveInputTranscript] = React.useState("");
  const [liveOutputTranscript, setLiveOutputTranscript] = React.useState("");
  const [voiceModel, setVoiceModel] = React.useState("gemini-3.8-live");
  const conversationEndRef = React.useRef<HTMLDivElement>(null);
  const recognitionRef = React.useRef<SpeechRecognitionLike | null>(null);
  const liveSessionRef = React.useRef<Session | null>(null);
  const microphoneStreamRef = React.useRef<MediaStream | null>(null);
  const captureContextRef = React.useRef<AudioContext | null>(null);
  const captureProcessorRef = React.useRef<ScriptProcessorNode | null>(null);
  const playbackContextRef = React.useRef<AudioContext | null>(null);
  const playbackTimeRef = React.useRef(0);
  const playbackSourcesRef = React.useRef(new Set<AudioBufferSourceNode>());
  const liveInputTranscriptRef = React.useRef("");
  const liveOutputTranscriptRef = React.useRef("");
  const voiceConversationRef = React.useRef(false);
  const loadingRef = React.useRef(false);

  React.useEffect(() => {
    voiceConversationRef.current = voiceConversation;
  }, [voiceConversation]);

  React.useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  React.useEffect(() => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    const playbackSources = playbackSourcesRef.current;
    const capabilityCheck = window.setTimeout(() => {
      setSpeechSupported(Boolean(Recognition && window.speechSynthesis));
    }, 0);
    if (isApiConfigured()) void getVoiceStatus()
      .then((result) => {
        if (result.model) setVoiceModel(result.model);
        setNativeVoiceConfigured(Boolean(result.configured));
      })
      .catch(() => undefined);
    return () => {
      window.clearTimeout(capabilityCheck);
      recognitionRef.current?.abort();
      liveSessionRef.current?.close();
      microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
      captureProcessorRef.current?.disconnect();
      void captureContextRef.current?.close();
      playbackSources.forEach((source) => source.stop());
      void playbackContextRef.current?.close();
      window.speechSynthesis?.cancel();
    };
  }, []);

  React.useEffect(() => {
    document.body.classList.toggle("tutor-drawer-open", drawerOpen);
    return () => document.body.classList.remove("tutor-drawer-open");
  }, [drawerOpen]);

  React.useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  const speakAnswer = React.useCallback((answer: string) => {
    if (!autoSpeak || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(answer.replace(/[•*#`]/g, ""));
    utterance.lang = "ko-KR";
    utterance.rate = 1;
    utterance.onend = () => {
      if (voiceConversationRef.current && !loadingRef.current) {
        window.setTimeout(() => recognitionRef.current?.start(), 250);
      }
    };
    window.speechSynthesis.speak(utterance);
  }, [autoSpeak]);

  const submitQuestion = React.useCallback(async (rawQuestion: string) => {
    const trimmedQuestion = rawQuestion.trim();
    if (!trimmedQuestion || loadingRef.current) return;

    const studentMessage: TutorMessage = { id: crypto.randomUUID(), role: "student", content: trimmedQuestion };
    setMessages((current) => [...current, studentMessage]);
    setQuestion("");
    setInterimTranscript("");
    setError(null);
    setLoading(true);
    loadingRef.current = true;

    try {
      const result = await requestTutor({
        question: trimmedQuestion,
        lesson: { id: lessonId, title: lessonTitle, contextSummary },
      });
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "tutor",
        content: result.answer!,
        demo: result.mode === "demo",
        model: result.model,
      }]);
      speakAnswer(result.answer);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "잠시 후 다시 질문해 주세요.");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [contextSummary, lessonId, lessonTitle, speakAnswer]);

  const stopNativePlayback = React.useCallback(() => {
    playbackSourcesRef.current.forEach((source) => {
      try { source.stop(); } catch { /* already stopped */ }
    });
    playbackSourcesRef.current.clear();
    playbackTimeRef.current = playbackContextRef.current?.currentTime ?? 0;
  }, []);

  const playNativeAudio = React.useCallback(async (base64: string, mimeType?: string) => {
    if (!autoSpeak) return;
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;
    const context = playbackContextRef.current ?? new AudioContextClass({ sampleRate: 24_000 });
    playbackContextRef.current = context;
    if (context.state === "suspended") await context.resume();
    const samples = base64ToPcm(base64);
    const sampleRate = Number(mimeType?.match(/rate=(\d+)/)?.[1] ?? 24_000);
    const buffer = context.createBuffer(1, samples.length, sampleRate);
    buffer.copyToChannel(samples, 0);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    const startAt = Math.max(context.currentTime + 0.02, playbackTimeRef.current);
    source.start(startAt);
    playbackTimeRef.current = startAt + buffer.duration;
    playbackSourcesRef.current.add(source);
    source.onended = () => playbackSourcesRef.current.delete(source);
  }, [autoSpeak]);

  const handleLiveMessage = React.useCallback((message: LiveServerMessage) => {
    const content = message.serverContent;
    if (!content) return;
    if (content.interrupted) stopNativePlayback();

    const inputText = content.inputTranscription?.text ?? content.interimInputTranscription?.text;
    if (inputText) {
      liveInputTranscriptRef.current = inputText;
      setLiveInputTranscript(inputText);
    }
    const outputText = content.outputTranscription?.text;
    if (outputText) {
      liveOutputTranscriptRef.current += outputText;
      setLiveOutputTranscript(liveOutputTranscriptRef.current);
    }

    for (const part of content.modelTurn?.parts ?? []) {
      if (part.inlineData?.data && part.inlineData.mimeType?.startsWith("audio/")) {
        void playNativeAudio(part.inlineData.data, part.inlineData.mimeType);
      }
    }

    if (content.turnComplete) {
      const studentText = liveInputTranscriptRef.current.trim();
      const tutorText = liveOutputTranscriptRef.current.trim();
      if (studentText || tutorText) {
        setMessages((current) => [
          ...current,
          ...(studentText ? [{ id: crypto.randomUUID(), role: "student" as const, content: studentText }] : []),
          ...(tutorText ? [{ id: crypto.randomUUID(), role: "tutor" as const, content: tutorText, model: voiceModel }] : []),
        ]);
      }
      liveInputTranscriptRef.current = "";
      liveOutputTranscriptRef.current = "";
      setLiveInputTranscript("");
      setLiveOutputTranscript("");
      setVoiceStatus("연결됨 · 다음 질문을 듣고 있어요.");
    }
  }, [playNativeAudio, stopNativePlayback, voiceModel]);

  const stopNativeConversation = React.useCallback(() => {
    try { liveSessionRef.current?.sendRealtimeInput({ audioStreamEnd: true }); } catch { /* socket may already be closed */ }
    liveSessionRef.current?.close();
    liveSessionRef.current = null;
    microphoneStreamRef.current?.getTracks().forEach((track) => track.stop());
    microphoneStreamRef.current = null;
    captureProcessorRef.current?.disconnect();
    captureProcessorRef.current = null;
    if (captureContextRef.current) void captureContextRef.current.close();
    captureContextRef.current = null;
    stopNativePlayback();
    setListening(false);
    setVoiceTransport("idle");
  }, [stopNativePlayback]);

  const startNativeConversation = React.useCallback(async () => {
    setVoiceStatus("안전한 음성 세션을 준비하고 있어요…");
    const tokenResult = await createVoiceSession({ lessonId, lessonTitle, contextSummary });

    const { GoogleGenAI, Modality } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: tokenResult.token });
    const model = tokenResult.model ?? voiceModel;
    const session = await ai.live.connect({
      model,
      config: {
        responseModalities: [Modality.AUDIO],
        sessionResumption: {},
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: `당신은 Physical AI 로봇 제어 과정의 한국어 AI 강사다. 현재 단원은 “${lessonTitle}”이며, 단원 맥락은 다음과 같다: ${contextSummary} 정답을 바로 주기보다 짧은 비유, 유도 질문, 핵심 정리 순으로 학습자의 이해를 돕는다. 전문용어는 영어를 병기하고 실제 로봇 안전을 우선한다.`,
      },
      callbacks: {
        onopen: () => setVoiceStatus("Gemini Live 연결됨 · 질문을 말해 주세요."),
        onmessage: handleLiveMessage,
        onerror: () => {
          setError("Gemini Live 음성 연결에 오류가 발생했습니다.");
          setVoiceStatus("연결 오류");
        },
        onclose: () => {
          if (voiceConversationRef.current) setVoiceStatus("음성 연결이 종료되었습니다.");
        },
      },
    });
    liveSessionRef.current = session;
    setVoiceModel(model);

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
    microphoneStreamRef.current = stream;
    const context = new AudioContext();
    captureContextRef.current = context;
    const source = context.createMediaStreamSource(stream);
    const processor = context.createScriptProcessor(4096, 1, 1);
    const silentOutput = context.createGain();
    silentOutput.gain.value = 0;
    captureProcessorRef.current = processor;
    processor.onaudioprocess = (event) => {
      if (!liveSessionRef.current || !voiceConversationRef.current) return;
      const pcm = downsampleToPcm16(event.inputBuffer.getChannelData(0), context.sampleRate);
      liveSessionRef.current.sendRealtimeInput({
        audio: { data: bytesToBase64(pcm), mimeType: "audio/pcm;rate=16000" },
      });
    };
    source.connect(processor);
    processor.connect(silentOutput);
    silentOutput.connect(context.destination);
    setVoiceTransport("native");
    setListening(true);
    setVoiceStatus("Gemini Live 연결됨 · 질문을 말해 주세요.");
  }, [contextSummary, handleLiveMessage, lessonId, lessonTitle, voiceModel]);

  const stopListening = React.useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const startListening = React.useCallback(() => {
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      setError("이 브라우저는 음성 인식을 지원하지 않습니다. 텍스트 질문을 이용해 주세요.");
      return;
    }
    window.speechSynthesis?.cancel();
    recognitionRef.current?.abort();
    const recognition = new Recognition();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (!result) continue;
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) finalText += transcript;
        else interimText += transcript;
      }
      setInterimTranscript(interimText);
      if (finalText.trim()) {
        setQuestion(finalText.trim());
        if (voiceConversationRef.current) void submitQuestion(finalText);
      }
    };
    recognition.onerror = (event) => {
      setListening(false);
      if (event.error !== "aborted" && event.error !== "no-speech") {
        setError(event.error === "not-allowed" ? "마이크 권한이 필요합니다. 브라우저 주소창의 마이크 권한을 허용해 주세요." : `음성을 인식하지 못했습니다: ${event.error}`);
      }
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setError(null);
    setListening(true);
    try {
      recognition.start();
    } catch {
      setListening(false);
    }
  }, [submitQuestion]);

  const toggleVoiceConversation = async () => {
    if (voiceConversation) {
      setVoiceConversation(false);
      voiceConversationRef.current = false;
      if (voiceTransport === "native") stopNativeConversation();
      else stopListening();
      window.speechSynthesis?.cancel();
      setVoiceStatus("음성 대화가 종료되었습니다.");
      return;
    }
    setVoiceConversation(true);
    voiceConversationRef.current = true;
    setAutoSpeak(true);
    setError(null);
    if (nativeVoiceConfigured && navigator.mediaDevices) {
      try {
        await startNativeConversation();
        return;
      } catch (nativeError) {
        stopNativeConversation();
        setError(`${nativeError instanceof Error ? nativeError.message : "Gemini Live 연결 실패"} 브라우저 음성 모드로 전환합니다.`);
      }
    }
    setVoiceTransport("fallback");
    setVoiceStatus("브라우저 음성 모드 · 질문을 말해 주세요.");
    startListening();
  };

  const handleTutorSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitQuestion(question);
  };

  return (
    <Sheet modal={false} open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetTrigger asChild>
        <Button type="button" size="lg" className="fixed bottom-5 right-5 z-40 rounded-full shadow-xl shadow-blue-200" aria-label="AI 강사님 열기">
          <Sparkles className="size-5" /> AI 강사님
        </Button>
      </SheetTrigger>
      <SheetContent
        showOverlay={false}
        aria-describedby="tutor-description"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><Bot className="size-5 text-blue-600" /> AI 강사님</SheetTitle>
          <SheetDescription id="tutor-description">{lessonTitle}을 학습자의 눈높이에 맞춰 함께 풀어봅니다.</SheetDescription>
        </SheetHeader>

        <div className="border-b border-blue-100 bg-blue-50/70 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant={voiceConversation ? "default" : "outline"} onClick={() => void toggleVoiceConversation()} disabled={!speechSupported && !nativeVoiceConfigured}>
              {voiceConversation ? <PhoneOff className="size-4" /> : <PhoneCall className="size-4" />}
              {voiceConversation ? "음성 대화 종료" : "음성 대화 시작"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => { setAutoSpeak((current) => !current); if (autoSpeak) stopNativePlayback(); }} aria-pressed={autoSpeak}>
              {autoSpeak ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
              {autoSpeak ? "답변 읽기 켬" : "답변 읽기 끔"}
            </Button>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            {nativeVoiceConfigured ? `${voiceModel} native speech-to-speech를 우선 사용하고, 연결할 수 없으면 브라우저 음성 모드로 자동 전환합니다.` : speechSupported ? "API 키가 없어 브라우저 음성 인식·읽어주기 모드로 동작합니다." : "현재 브라우저에서는 음성 대화를 지원하지 않아 텍스트 질문만 사용할 수 있습니다."}
          </p>
          {voiceConversation ? <p className="mt-1 text-xs font-bold text-blue-700" role="status">{voiceStatus}</p> : null}
          {voiceTransport === "native" && (liveInputTranscript || liveOutputTranscript) ? (
            <div className="mt-2 space-y-1 rounded-xl border border-blue-100 bg-white p-2 text-xs leading-5 text-slate-600" aria-live="polite">
              {liveInputTranscript ? <p><strong className="text-blue-800">나:</strong> {liveInputTranscript}</p> : null}
              {liveOutputTranscript ? <p><strong className="text-blue-800">AI 강사:</strong> {liveOutputTranscript}</p> : null}
            </div>
          ) : null}
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
          {messages.length === 0 ? (
            <div className="rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-slate-700">
              <p className="font-bold text-blue-900">어디에서 막혔나요?</p>
              <p className="mt-1">정답만 알려드리기보다 비유와 질문으로 스스로 이해하도록 도와드릴게요.</p>
              <div className="mt-4 grid gap-2">
                {suggestedQuestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => setQuestion(suggestion)} className="rounded-xl border border-blue-100 bg-white p-3 text-left text-sm text-blue-800 transition-colors hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {messages.map((message) => (
            <div key={message.id} className={message.role === "student" ? "ml-8" : "mr-8"}>
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                {message.role === "student" ? <UserRound className="size-3.5" /> : <Bot className="size-3.5 text-blue-600" />}
                {message.role === "student" ? "나" : "AI 강사님"}
                {message.demo ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">데모</span> : null}
              </div>
              <div className={message.role === "student" ? "whitespace-pre-wrap rounded-2xl bg-blue-600 p-3 text-sm leading-6 text-white" : "whitespace-pre-wrap rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700"}>
                {message.content}
              </div>
            </div>
          ))}

          {loading ? <div className="flex items-center gap-2 text-sm text-slate-500" role="status"><LoaderCircle className="size-4 animate-spin" /> 이해하기 쉬운 설명을 준비하고 있어요…</div> : null}
          {error ? <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</div> : null}
          <div ref={conversationEndRef} />
        </div>

        <form onSubmit={handleTutorSubmit} className="border-t border-slate-100 bg-white p-4">
          <label htmlFor={`tutor-question-${lessonId}`} className="sr-only">AI 강사님께 질문</label>
          <Textarea id={`tutor-question-${lessonId}`} value={interimTranscript || question} onChange={(event) => { setInterimTranscript(""); setQuestion(event.target.value); }} placeholder="예: 피드백 제어가 왜 필요한가요?" maxLength={1200} disabled={loading || listening} className="min-h-20" />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">{(interimTranscript || question).length} / 1200</span>
            <div className="flex gap-2">
              <Button type="button" size="icon" variant={listening && voiceTransport !== "native" ? "default" : "outline"} onClick={listening ? stopListening : startListening} disabled={!speechSupported || loading || voiceTransport === "native"} aria-label={listening ? "음성 입력 중지" : "음성으로 질문"}>
                {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </Button>
              <Button type="submit" disabled={loading || listening || question.trim().length < 2}><Send className="size-4" /> 질문하기</Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
