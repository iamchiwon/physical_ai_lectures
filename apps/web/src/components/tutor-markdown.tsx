"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Button } from "@/components/ui/button";
import { normalizeMathDelimiters } from "@/lib/markdown-math";

interface TutorMarkdownProps {
  content: string;
  copyable?: boolean;
}

export function TutorMarkdown({ content, copyable = true }: TutorMarkdownProps) {
  const [copyState, setCopyState] = React.useState<"idle" | "copied" | "error">("idle");
  const resetTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => () => {
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
  }, []);

  const copyAnswer = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    if (resetTimerRef.current !== null) window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setCopyState("idle"), 2_000);
  };

  return (
    <>
      <div className="tutor-markdown">
        <ReactMarkdown
          remarkPlugins={[remarkCjkFriendly, remarkGfm, remarkMath]}
          rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false, trust: false }]]}
          components={{
            a: ({ children, ...props }) => <a {...props} target="_blank" rel="noreferrer">{children}</a>,
          }}
        >
          {normalizeMathDelimiters(content)}
        </ReactMarkdown>
      </div>
      {copyable ? <div className="mt-3 flex items-center justify-end border-t border-slate-100 pt-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-xs"
          onClick={() => void copyAnswer()}
          aria-label={copyState === "copied" ? "답변 복사 완료" : "AI 강사 답변 복사하기"}
        >
          {copyState === "copied" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copyState === "copied" ? "복사했어요" : copyState === "error" ? "복사 실패" : "복사하기"}
        </Button>
      </div> : null}
    </>
  );
}
