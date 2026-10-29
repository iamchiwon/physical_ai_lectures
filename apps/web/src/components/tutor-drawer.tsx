"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import {
  Bot,
  LoaderCircle,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { askTutor as requestTutor } from "@/lib/api-client";

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

const suggestedQuestions = [
  "이 개념을 로봇 사례로 쉽게 비유해 주세요.",
  "제가 꼭 구분해야 할 핵심 개념은 무엇인가요?",
  "이 내용을 이해했는지 확인할 질문을 내 주세요.",
];

const TutorMarkdown = dynamic(() => import("@/components/tutor-markdown").then((module) => module.TutorMarkdown));

export function TutorDrawer({ lessonId, lessonTitle, contextSummary }: TutorDrawerProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [question, setQuestion] = React.useState("");
  const [messages, setMessages] = React.useState<TutorMessage[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const conversationEndRef = React.useRef<HTMLDivElement>(null);
  const loadingRef = React.useRef(false);

  React.useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  React.useEffect(() => {
    document.body.classList.toggle("tutor-drawer-open", drawerOpen);
    return () => document.body.classList.remove("tutor-drawer-open");
  }, [drawerOpen]);

  React.useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, loading]);

  const submitQuestion = React.useCallback(async (rawQuestion: string) => {
    const trimmedQuestion = rawQuestion.trim();
    if (trimmedQuestion.length < 2 || loadingRef.current) return;

    const studentMessage: TutorMessage = { id: crypto.randomUUID(), role: "student", content: trimmedQuestion };
    setMessages((current) => [...current, studentMessage]);
    setQuestion("");
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
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "잠시 후 다시 질문해 주세요.");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [contextSummary, lessonId, lessonTitle]);

  const handleTutorSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitQuestion(question);
  };

  const handleQuestionKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || (!event.ctrlKey && !event.metaKey) || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
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

        <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
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
            <div key={message.id} className={message.role === "student" ? "ml-8 min-w-0 max-w-full" : "mr-8 min-w-0 max-w-full"}>
              <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                {message.role === "student" ? <UserRound className="size-3.5" /> : <Bot className="size-3.5 text-blue-600" />}
                {message.role === "student" ? "나" : "AI 강사님"}
                {message.demo ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">데모</span> : null}
              </div>
              <div className={message.role === "student" ? "min-w-0 max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-2xl bg-blue-600 p-3 text-sm leading-6 text-white" : "min-w-0 max-w-full break-words [overflow-wrap:anywhere] rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700"}>
                {message.role === "tutor" ? <TutorMarkdown content={message.content} /> : message.content}
              </div>
            </div>
          ))}

          {loading ? <div className="flex items-center gap-2 text-sm text-slate-500" role="status"><LoaderCircle className="size-4 animate-spin" /> 이해하기 쉬운 설명을 준비하고 있어요…</div> : null}
          {error ? <div className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</div> : null}
          <div ref={conversationEndRef} />
        </div>

        <form onSubmit={handleTutorSubmit} className="shrink-0 border-t border-slate-100 bg-white p-4">
          <label htmlFor={`tutor-question-${lessonId}`} className="sr-only">AI 강사님께 질문</label>
          <Textarea id={`tutor-question-${lessonId}`} value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={handleQuestionKeyDown} placeholder="예: 피드백 제어가 왜 필요한가요?" maxLength={1200} disabled={loading} className="min-h-20" />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">{question.length} / 1200 · Ctrl/Cmd+Enter로 전송</span>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading || question.trim().length < 2}><Send className="size-4" /> 질문하기</Button>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
