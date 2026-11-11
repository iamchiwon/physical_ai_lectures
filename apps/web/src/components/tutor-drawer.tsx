"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import * as Dialog from "@radix-ui/react-dialog";
import { Bot, LoaderCircle, Send, Sparkles, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { readingFocus } from "@/lib/tutor-reading-focus";
import type { LearningContext } from "@physical-ai/shared";
import { useTutor } from "@/components/tutor-provider";

interface TutorDrawerProps {
  lessonId: string;
  lessonTitle: string;
  chapterId: string;
  chapterTitle: string;
  sourceContent: string;
  corpusUrl?: string;
  allowedTrackIds?: string[];
  learningContext?: LearningContext;
}
const suggestedQuestions = ["이 개념을 로봇 사례로 쉽게 비유해 주세요.","제가 꼭 구분해야 할 핵심 개념은 무엇인가요?","이 내용을 이해했는지 확인할 질문을 내 주세요."];
const TutorMarkdown = dynamic(() => import("@/components/tutor-markdown").then((module) => module.TutorMarkdown));

export function TutorDrawer({ lessonId, lessonTitle, chapterId, chapterTitle, sourceContent, corpusUrl, learningContext, allowedTrackIds }: TutorDrawerProps) {
  const {state,store,submitQuestion,resetConversation}=useTutor();
  const {turns,loading,drawerOpen,draft:question}=state;
  const [selection,setSelection]=React.useState({lessonId:"",text:""});
  const selectedText=selection.lessonId===lessonId?selection.text:"";
  const [resetOpen,setResetOpen]=React.useState(false);
  const [resetScope,setResetScope]=React.useState<"chapter"|"all">("chapter");
  const [visibleCount,setVisibleCount]=React.useState(40);
  const cancelRef=React.useRef<HTMLButtonElement>(null);
  const conversationEndRef=React.useRef<HTMLDivElement>(null);
  const scopeLabel = chapterId.startsWith("module-") ? "현재 모듈" : "현재 기존 챕터";
  const chapterCount=turns.filter((turn)=>turn.chapterId===chapterId).length;
  const resetCount=resetScope==="chapter"?chapterCount:turns.length;
  React.useEffect(()=>{
    document.body.classList.toggle("tutor-drawer-open",drawerOpen);
    return ()=>document.body.classList.remove("tutor-drawer-open");
  },[drawerOpen]);
  React.useEffect(()=>{ if(drawerOpen) conversationEndRef.current?.scrollIntoView({behavior:"smooth",block:"nearest"}); },[turns,loading,drawerOpen]);
  React.useEffect(()=>{
    const capture=()=>{
      const value=window.getSelection();
      const anchor=value?.anchorNode?.parentElement;
      const focus=value?.focusNode?.parentElement;
      const text=value?.toString().trim()??"";
      if(text.length>=2&&anchor?.closest("main")&&focus?.closest("main"))setSelection({lessonId,text:text.slice(0,2000)});
    };
    document.addEventListener("selectionchange",capture);
    return ()=>document.removeEventListener("selectionchange",capture);
  },[lessonId]);
  const handleTutorSubmit=(event:React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    const values = new URLSearchParams(window.location.search).getAll("track");
    const currentContext = learningContext ? { ...learningContext, trackId: values.length === 1 && allowedTrackIds?.includes(values[0]!) ? values[0]! : null } : undefined;
    void submitQuestion(question,{id:lessonId,title:lessonTitle,chapterId,chapterTitle,sourceContent,corpusUrl,learningContext:currentContext,focus:readingFocus(selectedText)});
  };
  const handleQuestionKeyDown=(event:React.KeyboardEvent<HTMLTextAreaElement>)=>{
    if(event.key!=="Enter"||(!event.ctrlKey&&!event.metaKey)||event.nativeEvent.isComposing) return;
    event.preventDefault();event.currentTarget.form?.requestSubmit();
  };
  return (
    <Sheet modal={false} open={drawerOpen} onOpenChange={(open)=>store.update({drawerOpen:open})}>
      <SheetTrigger asChild><Button type="button" size="lg" className="fixed bottom-5 right-5 z-40 rounded-full shadow-xl shadow-blue-200" aria-label="AI 강사님 열기"><Sparkles className="size-5" /> AI 강사님</Button></SheetTrigger>
      <SheetContent showOverlay={false} aria-describedby="tutor-description" onInteractOutside={(event)=>event.preventDefault()}>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><Bot className="size-5 text-blue-600" /> AI 강사님</SheetTitle>
          <SheetDescription id="tutor-description">{lessonTitle}을 함께 풀어봅니다. 다른 챕터의 대화도 이어집니다.</SheetDescription>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-slate-500">이 브라우저에 저장 · {turns.length}회 대화{state.memory?" · 이전 대화 요약 사용":""}</span>
            <Button type="button" size="sm" variant="outline" disabled={!state.hydrated||!turns.length} onClick={()=>{setResetScope(chapterCount?"chapter":"all");setResetOpen(true);}}><Trash2 className="size-3.5" /> 대화 초기화</Button>
          </div>
        </SheetHeader>
        <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
          {!state.hydrated?<p className="text-sm text-slate-500">저장된 대화를 불러오고 있어요…</p>:null}
          {state.storageNotice?<p role="alert" className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{state.storageNotice}</p>:null}
          {state.hydrated&&!turns.length?<div className="rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-slate-700">
            <p className="font-bold text-blue-900">어디에서 막혔나요?</p><p className="mt-1">핵심부터 쉽게 설명하고, 질문과 반응에 맞춰 설명 수준을 조절해 드리겠습니다. 챕터를 이동하거나 새로고침해도 대화를 이어갈 수 있습니다.</p>
            <div className="mt-4 grid gap-2">{suggestedQuestions.map((suggestion)=><button key={suggestion} type="button" onClick={()=>store.update({draft:suggestion})} className="rounded-xl border border-blue-100 bg-white p-3 text-left text-sm text-blue-800 hover:border-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">{suggestion}</button>)}</div>
          </div>:null}
          {turns.length>visibleCount?<Button type="button" variant="outline" size="sm" onClick={()=>setVisibleCount((count)=>count+40)}>이전 대화 더 보기 ({turns.length-visibleCount})</Button>:null}
          {turns.slice(-visibleCount).map((turn)=><div key={turn.id} className="space-y-3 [content-visibility:auto] [contain-intrinsic-size:auto_160px]">
            <p className="text-center text-xs text-slate-400">{turn.chapterTitle} · {turn.lessonTitle}</p>
            <div className="ml-8 min-w-0 max-w-full"><div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500"><UserRound className="size-3.5" /> 나</div><div className="min-w-0 max-w-full whitespace-pre-wrap break-words rounded-2xl bg-blue-600 p-3 text-sm leading-6 text-white [overflow-wrap:anywhere]">{turn.question}</div></div>
            {turn.answer?<div className="mr-8 min-w-0 max-w-full"><div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-500"><Bot className="size-3.5 text-blue-600" /> AI 강사님 {turn.mode==="demo"?<span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">데모</span>:null}</div><div className="min-w-0 max-w-full break-words rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]"><TutorMarkdown content={turn.answer} /></div></div>:turn.status==="failed"?<p className="text-xs text-slate-500">답변을 받지 못한 질문입니다. 다시 전송할 수 있습니다.</p>:null}
          </div>)}
          {loading?<div className="flex items-center gap-2 text-sm text-slate-500" role="status"><LoaderCircle className="size-4 animate-spin" />{state.phase==="summarizing"?"이전 대화의 핵심을 정리하고 있어요…":state.phase==="retrieving"?"질문에 필요한 본문을 찾아보고 있어요…":"이전 대화를 참고해 설명을 준비하고 있어요…"}</div>:null}
          {state.contextNotice?<p role="status" className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{state.contextNotice}</p>:null}
          {state.error?<div role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{state.error}</div>:null}
          <div ref={conversationEndRef} />
        </div>
        <form onSubmit={handleTutorSubmit} className="shrink-0 border-t border-slate-100 bg-white p-4">
          {selectedText?<div className="mb-2 flex items-center justify-between gap-2 text-xs text-blue-700"><span className="truncate">선택한 본문 참고: {selectedText.slice(0,70)}</span><Button type="button" variant="ghost" size="sm" onClick={()=>setSelection({lessonId,text:""})}>해제</Button></div>:null}
          <label htmlFor={`tutor-question-${lessonId}`} className="sr-only">AI 강사님께 질문</label>
          <Textarea id={`tutor-question-${lessonId}`} value={question} onChange={(event)=>store.update({draft:event.target.value})} onKeyDown={handleQuestionKeyDown} placeholder="예: 방금 설명한 개념을 다른 사례로 설명해 주세요." maxLength={1200} disabled={loading||!state.hydrated} className="min-h-20" />
          <div className="mt-2 flex items-center justify-between gap-3"><span className="text-xs text-slate-400">{question.length} / 1200 · Ctrl/Cmd+Enter로 전송</span><Button type="submit" disabled={loading||!state.hydrated||question.trim().length<2}><Send className="size-4" /> 질문하기</Button></div>
        </form>
        <Dialog.Root open={resetOpen} onOpenChange={setResetOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-[70] bg-slate-950/40" />
            <Dialog.Content role="alertdialog" onOpenAutoFocus={(event)=>{event.preventDefault();cancelRef.current?.focus();}} className="fixed left-1/2 top-1/2 z-[80] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <Dialog.Title className="text-lg font-bold text-slate-950">대화를 초기화할까요?</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-6 text-slate-600">선택한 범위의 질문·답변, 관련 요약과 학습자 상태를 이 브라우저에서 삭제합니다. <strong className="text-rose-700">삭제한 대화는 되돌릴 수 없습니다.</strong></Dialog.Description>
              <fieldset className="mt-5 space-y-3"><legend className="sr-only">초기화 범위</legend>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3"><input type="radio" name="tutor-reset-scope" value="chapter" checked={resetScope==="chapter"} onChange={()=>setResetScope("chapter")} className="mt-1" /><span className="text-sm"><span className="block font-semibold">{scopeLabel}의 대화만 ({chapterCount}회)</span><span className="mt-1 block text-xs leading-5 text-slate-500">{chapterTitle}에서 나눈 대화를 삭제합니다. 다른 학습 범위의 대화는 유지합니다.{chapterId.startsWith("module-") ? " 연결된 과거 기존 챕터의 대화도 별도 범위로 남습니다." : ""}</span></span></label>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3"><input type="radio" name="tutor-reset-scope" value="all" checked={resetScope==="all"} onChange={()=>setResetScope("all")} className="mt-1" /><span className="text-sm"><span className="block font-semibold">전체 대화 ({turns.length}회)</span><span className="mt-1 block text-xs leading-5 text-slate-500">모든 챕터의 질문·답변, 누적 요약과 학습자 상태를 삭제합니다.</span></span></label>
              </fieldset>
              <div className="mt-5 flex justify-end gap-2"><Button ref={cancelRef} type="button" variant="outline" onClick={()=>setResetOpen(false)}>취소</Button><Button type="button" disabled={!resetCount} className="bg-rose-600 hover:bg-rose-700" onClick={()=>{resetConversation(resetScope==="chapter"?chapterId:undefined);setResetOpen(false);}}>삭제하기 ({resetCount}회)</Button></div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </SheetContent>
    </Sheet>
  );
}
