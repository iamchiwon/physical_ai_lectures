import { z } from "zod";
import { groundLearnerUpdates, learnerUpdateSchema } from "@physical-ai/shared";

const generationSchema = z.object({
  answer: z.string().min(1).max(32_000),
  learnerUpdates: z.array(learnerUpdateSchema).max(3),
});
export const TUTOR_RESPONSE_FORMAT = {
  type: "json_schema",
  json_schema: { name: "adaptive_tutor", strict: true, schema: z.toJSONSchema(generationSchema) },
};

const answerSchema = z.object({ answer: z.string().trim().min(1).max(32_000) });

export function parseTutorOutput(text: string, question: string, truncated = false) {
  const trimmed = text.trim();
  const fenced = /^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/i.exec(trimmed);
  const candidate = fenced ? fenced[1]!.trim() : trimmed;
  let payload: unknown;
  try { payload = JSON.parse(candidate); }
  catch {
    // Some free models ignore the JSON instruction. Keep a plain Markdown answer but no state update.
    // Never expose incomplete JSON or its internal learner assessment in a chat bubble.
    if (/^[{\[]/.test(candidate) || /^```json\b/i.test(trimmed) || /"learnerUpdates"\s*:/.test(trimmed)) throw new Error("Invalid tutor output format");
    return { answer: trimmed, learnerUpdates: [] };
  }
  const parsed = answerSchema.safeParse(payload);
  if (!parsed.success) throw new Error("Invalid tutor answer envelope");
  const updates = (payload as Record<string, unknown>).learnerUpdates;
  return {
    answer: parsed.data.answer,
    learnerUpdates: truncated ? [] : groundLearnerUpdates(updates, question),
  };
}
