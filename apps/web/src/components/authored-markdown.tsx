import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { normalizeMathDelimiters } from "@/lib/markdown-math";

/** Build-time Markdown renderer. Only interactive response controls become client components. */
export function AuthoredMarkdown({ content, scrollTables = false }: { content: string; scrollTables?: boolean }) {
  return <div className="textbook-copy tutor-markdown"><ReactMarkdown
    remarkPlugins={[remarkCjkFriendly, remarkGfm, remarkMath]}
    rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false, trust: false }]]}
    components={{
      table: ({ children }) => scrollTables ? <div role="region" aria-label="표 · 가로 스크롤" tabIndex={0} className="max-w-full overflow-x-auto rounded-lg focus-visible:outline-2 focus-visible:outline-blue-600"><table className="min-w-[42rem]">{children}</table></div> : <table>{children}</table>,
      a: ({ href, children }) => <a href={href} {...(href?.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>{children}</a> }}
  >{normalizeMathDelimiters(content)}</ReactMarkdown></div>;
}
