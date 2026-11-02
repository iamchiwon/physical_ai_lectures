import { z } from "zod";

export const learnerUpdateSchema = z.object({
  topic: z.string().trim().min(1).max(80),
  understanding: z.enum(["unknown", "new", "guided", "independent"]),
  known: z.string().trim().max(120),
  difficulty: z.string().trim().max(160),
  strategy: z.string().trim().max(160),
  confidence: z.enum(["low", "medium", "high"]),
  evidenceKind: z.enum(["self_report", "demonstration", "question"]),
  evidenceQuote: z.string().trim().min(2).max(160),
});
export type LearnerUpdate = z.infer<typeof learnerUpdateSchema>;
export const learnerTopicSchema = learnerUpdateSchema.extend({
  evidenceTurnIds: z.array(z.string().min(1).max(120)).min(1).max(3),
});
export const learnerStateSchema = z.array(learnerTopicSchema).max(12);
export type LearnerTopic = z.infer<typeof learnerTopicSchema>;

function normalize(text: string) { return text.replace(/\s+/g, " ").trim().toLowerCase(); }

// Evidence must be an actual quote from this learner's question, never from an AI answer.
export function groundLearnerUpdates(value: unknown, question: string): LearnerUpdate[] {
  if (!Array.isArray(value)) return [];
  const result: LearnerUpdate[] = [];
  for (const candidate of value.slice(0, 3)) {
    const parsed = learnerUpdateSchema.safeParse(candidate);
    if (!parsed.success || !normalize(question).includes(normalize(parsed.data.evidenceQuote))) continue;
    const update = parsed.data;
    result.push(update.evidenceKind === "question"
      ? { ...update, understanding: "unknown", confidence: "low", known: "" }
      : update);
  }
  return result;
}

export interface LearnerEvidenceTurn {
  id: string;
  question: string;
  status: string;
  mode?: string | undefined;
  learnerUpdates?: LearnerUpdate[] | undefined;
}
export function deriveLearnerState(turns: LearnerEvidenceTurn[]): LearnerTopic[] {
  const topics = new Map<string, LearnerTopic>();
  for (const turn of turns) {
    if (turn.status !== "answered" || turn.mode === "demo") continue;
    for (const update of groundLearnerUpdates(turn.learnerUpdates, turn.question)) {
      const key = normalize(update.topic);
      const previous = topics.get(key);
      // A recent explicit correction replaces the previous assessment for the same topic.
      // A bare question is not evidence to overwrite an established self-report/demonstration.
      if (update.evidenceKind === "question" && previous && previous.evidenceKind !== "question") continue;
      const ids = [...new Set([...(previous?.evidenceTurnIds ?? []), turn.id])].slice(-3);
      topics.delete(key);
      topics.set(key, { ...update, evidenceTurnIds: ids });
    }
  }
  return [...topics.values()].reverse();
}

export function selectLearnerState(state: LearnerTopic[], currentTopic: string): LearnerTopic[] {
  const context = normalize(currentTopic);
  const score = (item: LearnerTopic) => {
    const topic = normalize(item.topic);
    const words = topic.split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 1);
    return (context.includes(topic) ? 10 : 0) + words.filter((word) => context.includes(word)).length * 2
      + (/선호|설명 방식|배경|preference/.test(topic) ? 3 : 0);
  };
  return state.map((item, index) => ({ item, index, score: score(item) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 12).map(({ item }) => item);
}
