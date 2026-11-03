import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { authoredMetadata, type AuthoredMetadata } from "@physical-ai/shared/catalog";
import { parseAuthoredMarkdown } from "@physical-ai/shared/authored";
import type { AuthoredDocument } from "@physical-ai/shared/authored";

const root = path.resolve(process.cwd(), "../..");
export function authoredForTopic(topicId: string, metadata: readonly AuthoredMetadata[] = authoredMetadata, workspaceRoot: string = root): (AuthoredDocument & { sha256: string; source: string }) | null {
  const item = metadata.find(item => item.topicId === topicId && item.reviewed);
  if (!item) return null;
  const expected = `ebook/curriculum/${topicId.split(".")[0]}/${topicId}.md`;
  if (!/^M\d{2}\.\d{2}$/.test(topicId) || item.source !== expected) throw Error("Invalid authored source path");
  const file = path.resolve(workspaceRoot, item.source);
  if (!file.startsWith(path.join(workspaceRoot, "ebook/curriculum") + path.sep) || !fs.lstatSync(file).isFile()) throw Error("Invalid authored source path");
  const raw = fs.readFileSync(file, "utf8");
  if (createHash("sha256").update(raw).digest("hex") !== item.sha256) throw Error(`Authored content changed after metadata generation: ${topicId}`);
  const document = parseAuthoredMarkdown(raw);
  if (document.title !== item.title) throw Error(`Authored metadata title mismatch: ${topicId}`);
  return { ...document, sha256: item.sha256, source: item.source };
}
export function authoredSection(topicId: string, section: string, readDocument: (topicId: string) => AuthoredDocument | null = authoredForTopic) {
  const doc = readDocument(topicId);
  if (!doc) return "";
  if (section === "body") return doc.body;
  if (section === "practice") return doc.practice;
  if (section === "practiceSolution") return doc.practiceSolution;
  if (section === "references") return doc.references;
  const answer = /^answer-/.test(section);
  const question = doc.questions.find(question => question.id === section.replace(/^answer-/, ""));
  return question ? answer ? question.answer : question.prompt : "";
}
