import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { normalizeMathDelimiters } from "@/lib/markdown-math";

/** Build-time Markdown renderer. Only interactive response controls become client components. */
export function AuthoredMarkdown({ content }: { content: string }) {
  return <div className="textbook-copy tutor-markdown"><ReactMarkdown
    remarkPlugins={[remarkCjkFriendly, remarkGfm, remarkMath]}
    rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false, trust: false }]]}
    components={{ a: ({ href, children }) => <a href={href} {...(href?.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>{children}</a> }}
  >{normalizeMathDelimiters(content)}</ReactMarkdown></div>;
}
