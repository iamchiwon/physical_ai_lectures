/** Normalize TeX delimiters while keeping fenced and inline code unchanged. */
export function normalizeMathDelimiters(content: string) {
  return content.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`)|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g,
    (_match: string, code: string | undefined, display: string | undefined, inline: string | undefined) => {
      if (code) return code;
      return display !== undefined ? `\n$$\n${display}\n$$\n` : `$${inline}$`;
    });
}
