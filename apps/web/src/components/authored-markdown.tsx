import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { normalizeMathDelimiters } from "@/lib/markdown-math";

/** Build-time Markdown renderer. Only interactive response controls become client components. */
export function AuthoredMarkdown({ content, scrollTables = false }: { content: string; scrollTables?: boolean }) {
  return <div className="textbook-copy tutor-markdown"><ReactMarkdown
    remarkPlugins={[remarkCjkFriendly, [remarkGfm, { singleTilde: false }], remarkMath]}
    rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false, trust: false }]]}
    components={{
      table: ({ children }) => scrollTables ? <div role="region" aria-label="표 · 가로 스크롤" tabIndex={0} className="max-w-full overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-blue-600"><table className="min-w-[42rem]">{children}</table></div> : <table>{children}</table>,
      a: ({ href, children }) => <a href={href} {...(href?.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>{children}{href?.startsWith("/textbook-visuals/") ? <span className="block text-xs not-italic">그림 원본 크기로 보기</span> : null}</a> }}
  >{normalizeMathDelimiters(content)}</ReactMarkdown></div>;
}
