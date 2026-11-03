import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { authoredMetadata } from "@physical-ai/shared/catalog";
import { parseAuthoredMarkdown } from "@physical-ai/shared/authored";
import type { AuthoredDocument } from "@physical-ai/shared/authored";

const root = path.resolve(process.cwd(), "../..");
export function authoredForTopic(topicId: string): (AuthoredDocument & { sha256: string; source: string }) | null {
  const item = authoredMetadata.find(item => item.topicId === topicId && item.reviewed);
  if (!item) return null;
  const file = path.resolve(root, item.source);
  if (!file.startsWith(path.join(root, "ebook/curriculum") + path.sep)) throw Error("Invalid authored source path");
  const raw = fs.readFileSync(file, "utf8");
  if (createHash("sha256").update(raw).digest("hex") !== item.sha256) throw Error(`Authored content changed after metadata generation: ${topicId}`);
  return { ...parseAuthoredMarkdown(raw), sha256: item.sha256, source: item.source };
}
export function authoredSection(topicId: string, section: string) {
  const doc = authoredForTopic(topicId);
  if (!doc) return "";
  if (section === "body") return doc.body;
  if (section === "practice") return doc.practice;
  if (section === "practiceSolution") return doc.practiceSolution;
  if (section === "references") return doc.references;
  const answer = /^answer-/.test(section);
  const question = doc.questions.find(question => question.id === section.replace(/^answer-/, ""));
  return question ? answer ? question.answer : question.prompt : "";
}
