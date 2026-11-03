import { catalog, curriculumIndex, moduleUnits } from "@/lib/curriculum";
import { unitReadiness } from "@physical-ai/shared/catalog";
import { authoredForTopic } from "@/lib/authored";
import { textbookUnits } from "@/lib/textbook";

/** Build-time table of contents. Counts come from the actual published document and retained routes. */
export function buildTextbookIndex() {
  const foundations = catalog.modules.filter(module => /^M0[0-3]$/.test(module.id)).map(module => ({
    id: module.id, title: module.title,
    units: moduleUnits(module.id).flatMap(unit => {
      const document = authoredForTopic(unit.topicId);
      return document ? [{ id: unit.id, topicId: unit.topicId, title: unit.title, href: `/study/${unit.id}/`, state: unitReadiness(unit, curriculumIndex).state,
        bodies: document.body.trim() ? 1 : 0, practices: document.practice.trim() ? 1 : 0, questions: document.questions.length }] : [];
    }),
  })).filter(module => module.units.length);
  const legacy = [...new Set(textbookUnits.map(unit => unit.group))].map(title => ({ title,
    units: textbookUnits.filter(unit => unit.group === title).map(unit => ({ title: unit.title, href: `/textbook/${unit.slug}/` })),
  }));
  return { foundations, legacy, authoredCount: foundations.reduce((sum, module) => sum + module.units.length, 0), legacyCount: legacy.reduce((sum, group) => sum + group.units.length, 0) };
}
