/** Shared pure parser: called by the metadata generator and build-time reader. */
export interface AuthoredDocument {
  title: string; objectives: string[]; prerequisiteNote: string;
  body: string; practice: string; practiceSolution: string;
  questions: { id: string; prompt: string; answer: string }[]; references: string;
}
const sectionNames = ["본문", "실습", "실습 해설", "확인 문제", "해설", "참고 자료"] as const;
function splitHeadings(text: string, level: number) {
  const sections = new Map<string, string>();
  let current = "", content: string[] = [], fence: string | null = null;
  for (const line of text.split("\n")) {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) { if (!fence) fence = marker; else if (marker[0] === fence[0] && marker.length >= fence.length) fence = null; }
    const match = !fence ? new RegExp(`^#{${level}} (.+?)\\s*$`).exec(line) : null;
    if (match) { if (current) { if (sections.has(current)) throw Error(`Duplicate authored heading: ${current}`); sections.set(current, content.join("\n").trim()); } current = match[1]!; content = []; }
    else content.push(line);
  }
  if (current) { if (sections.has(current)) throw Error(`Duplicate authored heading: ${current}`); sections.set(current, content.join("\n").trim()); }
  return sections;
}
export function parseAuthoredMarkdown(raw: string): AuthoredDocument {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (!match) throw Error("Authored content requires JSON frontmatter");
  const value: unknown = JSON.parse(match[1]!);
  if (!value || typeof value !== "object") throw Error("Invalid authored metadata");
  const meta = value as Record<string, unknown>;
  if (typeof meta.title !== "string" || !meta.title.trim() || typeof meta.prerequisiteNote !== "string" || !meta.prerequisiteNote.trim()
    || !Array.isArray(meta.objectives) || meta.objectives.length !== 3 || meta.objectives.some(goal => typeof goal !== "string" || !goal.trim())) throw Error("Authored title, three objectives and prerequisite note are required");
  const sections = splitHeadings(match[2]!, 2);
  if (sections.size !== sectionNames.length) throw Error("Authored document must use exactly the six agreed sections");
  for (const name of sectionNames) if (!sections.get(name)) throw Error(`Missing authored section: ${name}`);
  const prompts = splitHeadings(sections.get("확인 문제")!, 3), answers = splitHeadings(sections.get("해설")!, 3);
  if (prompts.size !== 3 || answers.size !== 3) throw Error("Exactly three authored prompts and answers are required");
  const questions = [1, 2, 3].map(n => {
    const key = (map: Map<string, string>) => [...map.keys()].find(key => new RegExp(`^Q${n}(?:\\b|[. :：])`).test(key));
    const prompt = prompts.get(key(prompts) ?? ""), answer = answers.get(key(answers) ?? "");
    if (!prompt || !answer) throw Error(`Authored Q${n} prompt and answer are required`);
    return { id: `q${n}`, prompt, answer };
  });
  return { title: meta.title, objectives: meta.objectives as string[], prerequisiteNote: meta.prerequisiteNote,
    body: sections.get("본문")!, practice: sections.get("실습")!, practiceSolution: sections.get("실습 해설")!, questions, references: sections.get("참고 자료")! };
}
