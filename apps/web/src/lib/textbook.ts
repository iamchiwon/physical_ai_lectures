import fs from "node:fs";
import path from "node:path";

// Build-time only: every reading page is exported as static HTML.
const bookRoot = path.resolve(process.cwd(), "../../ebook/book");

export interface TextbookUnit {
  slug: string;
  title: string;
  group: string;
  chapter: number;
  source: string;
  content: string;
}

export interface WrittenExercise {
  id: string;
  question: string;
  reference: string;
}

function filesIn(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(absolute) : [absolute];
  }).sort();
}

function order(source: string) {
  if (source.startsWith("00_frontmatter/")) return ["title.md", "preface.md", "how_to_use.md", "environment.md", "safety.md"].indexOf(path.basename(source));
  if (source.endsWith("/divider.md")) return 0;
  if (source.endsWith("/chapter.md")) return 1;
  if (source.includes("/labs/")) return 2;
  return 3;
}

export const textbookUnits: TextbookUnit[] = filesIn(bookRoot)
  .filter((file) => {
    const source = path.relative(bookRoot, file).split(path.sep).join("/");
    return file.endsWith(".md") && path.basename(file) !== "README.md"
      && !source.endsWith("/divider.md") && !source.includes("/exercises/solutions.md") && !source.endsWith("/project_rubric.md")
      && !source.startsWith("appendices/")
      && (!source.startsWith("00_frontmatter/") || /\/(environment|safety)\.md$/.test(source));
  })
  .sort((a, b) => {
    const relativeA = path.relative(bookRoot, a);
    const relativeB = path.relative(bookRoot, b);
    return relativeA.split(path.sep)[0]!.localeCompare(relativeB.split(path.sep)[0]!) || order(relativeA) - order(relativeB) || a.localeCompare(b);
  })
  .flatMap((file) => {
    const source = path.relative(bookRoot, file).split(path.sep).join("/");
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split(/(?<=\n)/);
    const chunks: string[] = [];
    let current = "";
    let fence: string | null = null;
    for (const line of lines) {
      const marker = line.match(/^\s*(`{3,}|~{3,})/);
      if (marker) {
        if (!fence) fence = marker[1]!;
        else if (marker[1]![0] === fence[0] && marker[1]!.length >= fence.length) fence = null;
      }
      if (!fence && /^## /.test(line) && current.trim()) {
        chunks.push(current);
        current = "";
      }
      current += line;
    }
    if (current) chunks.push(current);
    if (chunks.join("") !== content) throw new Error(`Textbook content loss: ${source}`);
    const folder = source.split("/")[0]!;
    const chapter = Number(folder.match(/^0([1-6])_/)?.[1] ?? 0);
    const group = chapter ? `${chapter}장` : "실습 준비와 안전";
    return chunks.map((chunk, index) => ({
      slug: `${source.replace(/\.md$/, "").replaceAll("/", "--")}-${index + 1}`,
      title: (chunk.match(/^#{1,6} (.+)$/m)?.[1] ?? chunk.match(/<h1[^>]*>(.*?)<\/h1>/)?.[1] ?? chunk.match(/<p class="chapter-divider-title">(.*?)<\/p>/)?.[1] ?? path.basename(file, ".md")).replace(/\s*\{[^}]+\}\s*$/, ""),
      group,
      chapter,
      source,
      content: chunk,
    }));
  });

export const glossary = fs.readFileSync(path.join(bookRoot, "appendices/glossary.md"), "utf8")
  .split("\n").filter((line) => line.startsWith("|")).slice(2)
  .map((line) => { const cells = line.split("|"); return { term: cells[1]!.trim(), description: cells[2]!.trim() }; });

export function exercisesForUnit(unit: TextbookUnit): WrittenExercise[] {
  const isQuestions = /확인문제|연습문제/.test(unit.title);
  const isProject = /프로젝트|구현 과제/.test(unit.title);
  const isLab = unit.source.includes("/labs/");
  if (!isQuestions && !isProject && !isLab) return [];
  const folder = unit.source.split("/")[0]!;
  const answersPath = path.join(bookRoot, folder, "exercises/solutions.md");
  const rubricPath = path.join(bookRoot, folder, "exercises/project_rubric.md");
  const solutions = fs.existsSync(answersPath) ? fs.readFileSync(answersPath, "utf8") : "";
  const rubric = fs.existsSync(rubricPath) ? fs.readFileSync(rubricPath, "utf8") : "";
  const context = textbookUnits.filter((item) => item.chapter === unit.chapter && /요약|안전|트러블슈팅/.test(item.title)).map((item) => item.content).join("\n").slice(0, 6000);
  if (isLab || (isProject && !isQuestions)) return [{ id: `${unit.slug}-report`, question: `${isLab ? "실습 보고서" : "프로젝트 제출"}: 아래 과제의 결과, 수행 과정, 관찰한 실패와 원인, 개선안 및 안전 조건을 설명하세요.\n\n${unit.content}`.slice(0, 15000), reference: `${rubric}\n${context}`.slice(0, 15000) }];
  const numbered = [...unit.content.matchAll(/^(\d+)\.\s+(.+(?:\n(?!\d+\. |#{1,6} |\s*$).+)*)/gm)];
  return numbered.map((match, index) => {
    const answer = /확인문제/.test(unit.title) ? solutions.match(new RegExp(`^${match[1]}\\. (.+(?:\\n(?!\\d+\\. |\\s*$).+)*)`, "m"))?.[1] : undefined;
    const keywords = [...new Set(match[2]!.match(/[A-Za-z][\w-]{2,}|[가-힣]{2,}/g) ?? [])];
    const relevant = textbookUnits.filter((item) => item.chapter === unit.chapter && item.source.endsWith("/chapter.md") && item.slug !== unit.slug)
      .map((item) => ({ item, score: keywords.filter((word) => item.content.toLowerCase().includes(word.toLowerCase())).length }))
      .sort((a, b) => b.score - a.score).slice(0, 2).map(({ item }) => item.content).join("\n").slice(0, 8500);
    return { id: `${unit.slug}-q${index + 1}`, question: match[2]!, reference: [answer ? `교재 해설: ${answer}` : "교재에 개별 모범답안이 없는 문제입니다. 관련 개념을 바탕으로 평가하고 추론한 해설임을 표시하세요.", relevant, context].join("\n").slice(0, 15000) };
  });
}

export function chapterStart(chapter: number) {
  return textbookUnits.find((unit) => unit.chapter === chapter && unit.source.endsWith("/chapter.md"));
}

export function textbookExamples(unit: TextbookUnit) {
  if (!unit.chapter) return [];
  const directory = unit.source.split("/")[0]!;
  return filesIn(path.join(bookRoot, directory)).filter((file) => file.includes(`${path.sep}code${path.sep}`) && !file.endsWith(".pyc") && !file.endsWith(".DS_Store")).map((file) => path.relative(bookRoot, file).split(path.sep).join("/"));
}

export function textbookLink(url: string, unit: TextbookUnit): string {
  if (/^(https?:|mailto:|tel:)/i.test(url)) return url;
  if (url.startsWith("#")) {
    const anchor = url.slice(1);
    const target = textbookUnits.find((item) => item.group === unit.group && item.content.includes(`{#${anchor}}`));
    if (!target && /solutions|project-rubric/.test(anchor)) {
      const exercisePage = textbookUnits.find((item) => item.chapter === unit.chapter && (anchor.includes("solutions") ? /확인문제/.test(item.title) : /프로젝트/.test(item.title)));
      if (exercisePage) return `/textbook/${exercisePage.slug}/#written-exercises`;
    }
    return target ? `/textbook/${target.slug}/#${anchor}` : url;
  }
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(unit.source), url));
  if (resolved.startsWith("../")) return "";
  const target = textbookUnits.find((item) => item.source === resolved);
  return target ? `/textbook/${target.slug}/` : `/textbook-assets/${resolved}`;
}
