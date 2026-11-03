import fs from "node:fs";
import path from "node:path";
import { bindingAvailability, unitReadiness, type CatalogUnit } from "@physical-ai/shared/catalog";
import { curriculumIndex, moduleIndex, topicIndex, moduleUnits, studyNavigationFor } from "@/lib/curriculum";
import { textbookUnits } from "@/lib/textbook";
import { courseModules } from "@/data/course";
import type { LessonDocument } from "@/lib/tutor-retrieval";

export function studyTutorResourceIds(unit: CatalogUnit) {
  const ids = new Set<string>();
  for (const binding of Object.values(unit.slots).flat()) {
    if (!bindingAvailability(binding, curriculumIndex).available) continue;
    if ("resourceId" in binding) ids.add(binding.resourceId);
    else {
      const activity = curriculumIndex.activities.get(binding.activityId)!;
      [...activity.resourceRefs, ...activity.explanationRefs, ...(activity.rubricRef ? [activity.rubricRef] : [])].forEach(id => ids.add(id));
    }
  }
  return [...ids].filter(id => { const r = curriculumIndex.resources.get(id); return r?.publication === "published" && r.integrity.status === "matched"; });
}
function documentFor(id: string): LessonDocument | null {
  const resource = curriculumIndex.resources.get(id)!;
  const locator = resource.locator;
  let content = "";
  if (locator.type === "textbook") content = textbookUnits.find(unit => unit.slug === locator.legacyUnitId)?.content ?? "";
  if (locator.type === "lesson" || locator.type === "inline") {
    const lesson = courseModules.flatMap(module => module.lessons).find(item => item.id === locator.lessonId);
    if (lesson) content = locator.type === "inline" ? JSON.stringify(lesson.quickCheck.find(check => check.id === locator.questionId) ?? "") : [lesson.summary, ...lesson.sections.map(section => [section.heading, section.body, ...(section.bullets ?? []), section.code ? `\n\`\`\`${section.code.language}\n${section.code.content}\n\`\`\`` : ""].filter(Boolean).join("\n"))].join("\n\n");
  }
  if (locator.type === "file" && /\.(md|py|cpp|hpp|h|yaml|yml|sh|xml|urdf|json|toml|txt)$/.test(locator.source)) {
    const root = path.resolve(process.cwd(), "../../ebook/book");
    const file = path.resolve(root, locator.source.replace(/^ebook\/book\//, ""));
    if (file.startsWith(root + path.sep) && fs.existsSync(file) && fs.statSync(file).size <= 256_000) {
      const raw = fs.readFileSync(file, "utf8");
      content = file.endsWith(".md") ? raw : `# 예제 파일: ${path.basename(file)}\n\n\`\`\`${path.extname(file).slice(1)}\n${raw}\n\`\`\``;
    }
  }
  return content ? { id, title: resource.title, content } : null;
}
export function studyTutorCorpus(unit: CatalogUnit) {
  const moduleId = topicIndex.get(unit.topicId)!.moduleId;
  const currentIds = studyTutorResourceIds(unit);
  const moduleIds = [...new Set(moduleUnits(moduleId).flatMap(studyTutorResourceIds))].filter(id => !currentIds.includes(id));
  const docs = (ids: string[]) => ids.map(documentFor).filter((doc): doc is LessonDocument => doc !== null);
  return { version: 1, unitId: unit.id, moduleId, resourceIds: currentIds, documents: docs(currentIds), moduleDocuments: docs(moduleIds) };
}
export function studyTutorProps(unit: CatalogUnit) {
  const moduleId = topicIndex.get(unit.topicId)!.moduleId;
  const readiness = unitReadiness(unit, curriculumIndex).state;
  const resourceIds = studyTutorResourceIds(unit);
  const learningContext = { version: 1 as const, unitId: unit.id, topicId: unit.topicId, moduleId, trackId: null, title: unit.title, readiness, activeResourceId: null, resourceIds };
  const sourceContent = `현재 신규 단위: ${unit.topicId} · ${unit.title}\n준비 상태: ${readiness}\n목표: ${unit.objectives.map(goal => goal.description).join(" / ")}\n미작성 범위: ${Object.entries(unit.gaps).map(([slot,gap]) => `${slot}: ${gap}`).join(" / ")}\n연결 자료는 기존 자료 또는 보충 참고이며 신규 단위 전체의 검수 통과를 뜻하지 않습니다. 현재 실습 파라미터·결과는 전달되지 않았습니다.`;
  return { lessonId: unit.id, lessonTitle: unit.title, chapterId: `module-${moduleId}`, chapterTitle: `${moduleId} · ${moduleIndex.get(moduleId)!.title}`, sourceContent, allowedTrackIds: studyNavigationFor(unit.id).contexts.map(context => context.id), corpusUrl: `/tutor-study/${unit.id}`, learningContext };
}
