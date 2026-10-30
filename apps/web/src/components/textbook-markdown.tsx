import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkCjkFriendly from "remark-cjk-friendly";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Children, type ReactNode } from "react";
import { textbookLink, type TextbookUnit } from "@/lib/textbook";

function prepareMarkdown(content: string) {
  // Pandoc fences and TeX delimiters used by the ebook, preserving code verbatim.
  return content.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`)|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|^:::[^\n]*$|<h1[^>]*>.*?<\/h1>|<p[^>]*>.*?<\/p>|<img[^>]*\/>|\{\.chapter-divider-image\}/gm,
    (match: string, code: string | undefined, display: string | undefined, inline: string | undefined) => {
      if (code) return code;
      if (display !== undefined) return `\n$$\n${display}\n$$\n`;
      if (inline !== undefined) return `$${inline}$`;
      if (match.startsWith("<h1")) return `# ${match.replace(/<[^>]+>/g, "")}\n`;
      if (match.startsWith("<p")) return `${match.replace(/<[^>]+>/g, "")}\n`;
      if (match.startsWith("<img")) return `![${match.match(/alt="([^"]*)"/)?.[1] ?? ""}](${match.match(/src="([^"]*)"/)?.[1] ?? ""})`;
      return "";
    });
}

export function TextbookMarkdown({ unit }: { unit: TextbookUnit }) {
  const heading = (children: ReactNode) => {
    const parts = Children.toArray(children);
    const text = parts.filter((part) => typeof part === "string").join("");
    return {
      id: text.match(/\{#([^}]+)\}/)?.[1],
      children: parts.map((part) => typeof part === "string" ? part.replace(/\s*\{[^}]+\}\s*$/, "") : part),
    };
  };
  return (
    <div className="textbook-copy tutor-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkCjkFriendly, remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false, trust: false }]]}
        urlTransform={(url) => textbookLink(url, unit)}
        components={{
          h1: ({ children }) => <h1 {...heading(children)} />,
          h2: ({ children }) => <h2 {...heading(children)} />,
          h3: ({ children }) => <h3 {...heading(children)} />,
          a: ({ children, href }) => <a href={href} {...(href?.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>{children}</a>,
        }}
      >{prepareMarkdown(unit.content.replace(/^---\n[\s\S]*?\n---\n/, ""))}</ReactMarkdown>
    </div>
  );
}
