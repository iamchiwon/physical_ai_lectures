import { catalog } from "@/lib/curriculum";
import { bindingAvailability, indexCatalog, unitReadiness, type Catalog } from "@physical-ai/shared/catalog";
import type { AuthoredDocument } from "@physical-ai/shared/authored";
import { authoredForTopic } from "@/lib/authored";
import { textbookUnits } from "@/lib/textbook";

/** Build-time table of contents. Counts come from the actual published document and retained routes. */
export function buildTextbookIndex(source: Catalog = catalog, readDocument: (topicId: string) => AuthoredDocument | null = authoredForTopic) {
  const index = indexCatalog(source);
  const foundations = source.modules.map(module => ({
    id: module.id, title: module.title,
    units: source.units.filter(unit => module.topicIds.includes(unit.topicId)).flatMap(unit => {
      const publishedBody = unit.slots.explanation.some(binding => "resourceId" in binding && binding.role === "primary" && index.resources.get(binding.resourceId)?.kind === "authored-textbook" && bindingAvailability(binding, index).available);
      if (!publishedBody) return [];
      const document = readDocument(unit.topicId);
      return document ? [{ id: unit.id, topicId: unit.topicId, title: unit.title, href: `/study/${unit.id}/`, state: unitReadiness(unit, index).state,
        bodies: document.body.trim() ? 1 : 0, practices: document.practice.trim() ? 1 : 0, questions: document.questions.length }] : [];
    }),
  })).filter(module => module.units.length);
  const legacy = [...new Set(textbookUnits.map(unit => unit.group))].map(title => ({ title,
    units: textbookUnits.filter(unit => unit.group === title).map(unit => ({ title: unit.title, href: `/textbook/${unit.slug}/` })),
  }));
  return { foundations, legacy, authoredCount: foundations.reduce((sum, module) => sum + module.units.length, 0), legacyCount: legacy.reduce((sum, group) => sum + group.units.length, 0) };
}
