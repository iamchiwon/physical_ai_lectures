import { z } from "zod";

const id = z.string().min(1);
const ids = z.array(id);
const text = z.string().min(1);
const definition = z.enum(["pending", "confirmed"]);
const objective = z.strictObject({ id, description: text });
const review = z.strictObject({
  verdict: z.enum(["unreviewed", "passed", "needs_revision"]),
  reviewedRevision: text.nullable(), evidenceRef: text.nullable(),
}).refine((v) => v.verdict !== "passed" || Boolean(v.reviewedRevision && v.evidenceRef), "Passed review needs revision and evidence");
const bindingFields = {
  role: z.enum(["primary", "supplement"]), objectiveIds: ids,
  coverage: z.enum(["none", "partial", "full"]), review,
};
export const catalogBindingSchema = z.union([
  z.strictObject({ ...bindingFields, resourceId: id }),
  z.strictObject({ ...bindingFields, activityId: id }),
]);
const requirement = z.strictObject({
  mode: z.enum(["required", "optional", "not_applicable"]), reason: text,
  objectiveIds: ids, activityIds: ids,
});
const locator = z.discriminatedUnion("type", [
  z.strictObject({ type: z.literal("authored"), source: text, unitId: id, section: text, publicUrl: text, sha256: text }),
  z.strictObject({ type: z.literal("textbook"), legacyUnitId: id, source: text, legacyUrl: text,
    baselineCommit: text, baselineFileSha256: text }),
  z.strictObject({ type: z.literal("lesson"), lessonId: id, source: text, legacyUrl: text,
    baselineCommit: text, baselineFileSha256: text }),
  z.strictObject({ type: z.literal("file"), source: text, publicUrl: text, sha256: text }),
  z.strictObject({ type: z.literal("inline"), lessonId: id, questionId: id, source: text,
    legacyUrl: text, baselineCommit: text, baselineFileSha256: text }),
]);
export const catalogResourceSchema = z.strictObject({
  id, kind: z.enum(["legacy-textbook", "legacy-lesson", "file", "image", "explanation", "authored-textbook"]),
  title: text, locator, publication: z.enum(["published", "draft"]), revision: text,
  integrity: z.strictObject({ status: z.enum(["matched", "unchecked", "mismatch", "missing"]), evidence: text }),
  preservation: z.strictObject({ disposition: text, reason: text }),
}).refine((r) => ({ "legacy-textbook": "textbook", "legacy-lesson": "lesson", file: "file", image: "file", explanation: "inline", "authored-textbook": "authored" })[r.kind] === r.locator.type, "Resource kind/locator mismatch");
export const catalogActivitySchema = z.strictObject({
  id, kind: z.enum(["question", "report", "quick-check", "lab", "browser-model", "glossary"]),
  title: text, resourceRefs: ids, rubricRef: id.nullable(), explanationRefs: ids,
  feedbackStatus: z.enum(["authored", "context-only", "pending"]),
  persistence: z.strictObject({ legacyId: id.nullable(), storageKey: id.nullable() }),
  locator: z.strictObject({ source: text, entryUrls: z.array(text), sourceSha256: text }),
  publication: z.enum(["published", "draft"]), revision: text,
  integrity: z.strictObject({ status: z.enum(["matched", "unchecked", "mismatch", "missing"]), evidence: text }),
  limitation: text, referenceSha256: text.nullable(),
});
export const catalogUnitSchema = z.strictObject({
  id: id.max(120), topicId: id, title: text, revision: text,
  definitionStatus: definition, objectives: z.array(objective).min(1),
  prerequisites: z.strictObject({ allOf: ids, anyOf: ids, definitionStatus: definition, reason: text, supplementalUnitIds: ids }),
  requirements: z.strictObject({ definitionStatus: definition, explanation: requirement, practice: requirement, assessment: requirement }),
  slots: z.strictObject({ explanation: z.array(catalogBindingSchema), practice: z.array(catalogBindingSchema), assessment: z.array(catalogBindingSchema) }),
  gaps: z.strictObject({ explanation: text, practice: text, assessment: text }),
  estimatedMinutes: z.number().positive().nullable(),
});
const catalogShape = z.strictObject({
  schemaVersion: z.literal(1), revision: text,
  areas: z.array(z.strictObject({ id, title: text, moduleIds: ids })),
  tracks: z.array(z.strictObject({ id, title: text, description: text, steps: z.array(z.strictObject({ id, unitId: id, required: z.boolean() })) })),
  modules: z.array(z.strictObject({ id, title: text, areaId: id, topicIds: ids, objectives: z.array(objective).min(1), prerequisiteNote: text })),
  topics: z.array(z.strictObject({ id, moduleId: id, title: text, unitIds: ids, objectives: z.array(objective).min(1) })),
  units: z.array(catalogUnitSchema), resources: z.array(catalogResourceSchema), activities: z.array(catalogActivitySchema),
  aliases: z.array(z.union([
    z.strictObject({ kind: z.literal("legacy-resource-id"), legacyId: id, canonicalId: id }),
    z.strictObject({ kind: z.literal("legacy-activity-id"), legacyId: id, canonicalId: id }),
    z.strictObject({ kind: z.literal("url"), legacyUrl: text, targetUrl: text }),
  ])),
});
export type Catalog = z.infer<typeof catalogShape>;
export type CatalogUnit = Catalog["units"][number];
export type CatalogResource = Catalog["resources"][number];
export type CatalogActivity = Catalog["activities"][number];
export type CatalogBinding = z.infer<typeof catalogBindingSchema>;
export type Readiness = "ready" | "partial" | "tbd";
export type SlotName = "explanation" | "practice" | "assessment";
export const catalogSlotNames: SlotName[] = ["explanation", "practice", "assessment"];

/** Structural errors fail catalog registration; availability/review failures are reported by readiness. */
export const catalogSchema = catalogShape.superRefine((c, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: "custom", message });
  const unique = (values: string[], label: string) => {
    if (new Set(values).size !== values.length) fail(`Duplicate ${label}`);
  };
  for (const key of ["areas", "tracks", "modules", "topics", "units", "resources", "activities"] as const) {
    unique(c[key].map((v) => v.id), key);
    if (!c[key].length) fail(`Empty ${key}`);
  }
  unique([...c.resources, ...c.activities].map((v) => v.id), "asset IDs");
  const areas = new Map(c.areas.map((v) => [v.id, v]));
  const modules = new Map(c.modules.map((v) => [v.id, v]));
  const topics = new Map(c.topics.map((v) => [v.id, v]));
  const units = new Map(c.units.map((v) => [v.id, v]));
  const resources = new Map(c.resources.map((v) => [v.id, v]));
  const activities = new Map(c.activities.map((v) => [v.id, v]));
  const children = (childIds: string[], label: string, valid: (id: string) => boolean) => {
    unique(childIds, label);
    if (!childIds.length || childIds.some((child) => !valid(child))) fail(`Invalid children: ${label}`);
  };
  for (const a of c.areas) children(a.moduleIds, a.id, (id) => modules.get(id)?.areaId === a.id);
  for (const m of c.modules) {
    if (!areas.get(m.areaId)?.moduleIds.includes(m.id)) fail(`Invalid area parent: ${m.id}`);
    children(m.topicIds, m.id, (id) => topics.get(id)?.moduleId === m.id);
  }
  for (const t of c.topics) {
    if (!modules.get(t.moduleId)?.topicIds.includes(t.id)) fail(`Invalid module parent: ${t.id}`);
    children(t.unitIds, t.id, (id) => units.get(id)?.topicId === t.id);
  }
  const graph = new Map<string, string[]>();
  for (const u of c.units) {
    if (!topics.get(u.topicId)?.unitIds.includes(u.id)) fail(`Invalid topic parent: ${u.id}`);
    const goals = new Set(u.objectives.map((g) => g.id));
    unique(u.objectives.map((g) => g.id), `objectives ${u.id}`);
    const prereqs = [...u.prerequisites.allOf, ...u.prerequisites.anyOf];
    unique(prereqs, `prerequisites ${u.id}`);
    for (const ref of [...prereqs, ...u.prerequisites.supplementalUnitIds]) if (!units.has(ref) || ref === u.id) fail(`Invalid prerequisite: ${u.id} -> ${ref}`);
    graph.set(u.id, prereqs);
    if (u.requirements.explanation.mode !== "required" || u.requirements.assessment.mode !== "required") fail(`Explanation/assessment required: ${u.id}`);
    for (const slot of catalogSlotNames) {
      const req = u.requirements[slot];
      if (!req.objectiveIds.length || req.objectiveIds.some((g) => !goals.has(g))) fail(`Invalid requirement objectives: ${u.id}/${slot}`);
      if ((slot === "explanation" || slot === "assessment") && [...goals].some((g) => !req.objectiveIds.includes(g))) fail(`Uncovered requirement objective: ${u.id}/${slot}`);
      if (req.activityIds.some((a) => !activities.has(a))) fail(`Missing required activity: ${u.id}/${slot}`);
      if (req.activityIds.some((id) => !u.slots[slot].some((b) => "activityId" in b && b.activityId === id && b.role === "primary"))) fail(`Unbound required activity: ${u.id}/${slot}`);
      if (req.mode === "not_applicable" && u.requirements.definitionStatus !== "confirmed") fail(`Unconfirmed not_applicable: ${u.id}`);
      for (const b of u.slots[slot]) {
        if (!b.objectiveIds.length || b.objectiveIds.some((g) => !goals.has(g))) fail(`Invalid binding objectives: ${u.id}`);
        if ("resourceId" in b ? !resources.has(b.resourceId) : !activities.has(b.activityId)) fail(`Missing binding: ${u.id}`);
        if (slot !== "explanation" && "resourceId" in b && b.role === "primary") fail(`Practice/assessment needs an activity: ${u.id}`);
      }
    }
  }
  const visitGraph = (edges: Map<string, string[]>, label: string) => {
    const visiting = new Set<string>(), visited = new Set<string>();
    const visit = (key: string) => {
      if (visiting.has(key)) { fail(`Cycle in ${label}: ${key}`); return; }
      if (visited.has(key)) return;
      visiting.add(key);
      for (const next of edges.get(key) ?? []) visit(next);
      visiting.delete(key); visited.add(key);
    };
    for (const key of edges.keys()) visit(key);
  };
  visitGraph(graph, "prerequisites");
  for (const a of c.activities) {
    for (const ref of [...a.resourceRefs, ...a.explanationRefs, ...(a.rubricRef ? [a.rubricRef] : [])]) if (!resources.has(ref)) fail(`Missing activity resource: ${a.id} -> ${ref}`);
  }
  for (const t of c.tracks) {
    unique(t.steps.map((s) => s.id), `steps ${t.id}`);
    unique(t.steps.map((s) => s.unitId), `track units ${t.id}`);
    if (!t.steps.some((s) => s.required)) fail(`No required steps: ${t.id}`);
    const seen = new Set<string>(), requiredSeen = new Set<string>();
    for (const s of t.steps) {
      const u = units.get(s.unitId);
      if (!u) { fail(`Missing track unit: ${s.unitId}`); continue; }
      const preceding = s.required ? requiredSeen : seen;
      if (u.prerequisites.allOf.some((p) => !preceding.has(p)) || (u.prerequisites.anyOf.length > 0 && !u.prerequisites.anyOf.some((p) => preceding.has(p)))) fail(`Track prerequisite order: ${t.id}/${s.unitId}`);
      // An optional visit cannot satisfy a mandatory prerequisite.
      seen.add(s.unitId);
      if (s.required) requiredSeen.add(s.unitId);
    }
  }
  const aliasGraphs = new Map<string, Map<string, string[]>>();
  for (const a of c.aliases) {
    const from = "legacyUrl" in a ? a.legacyUrl : a.legacyId;
    const to = "targetUrl" in a ? a.targetUrl : a.canonicalId;
    let edges = aliasGraphs.get(a.kind);
    if (!edges) { edges = new Map(); aliasGraphs.set(a.kind, edges); }
    if (edges.has(from) || from === to) fail(`Ambiguous/self alias: ${from}`);
    edges.set(from, [to]);
  }
  for (const [kind, edges] of aliasGraphs) {
    visitGraph(edges, `aliases ${kind}`);
    if (kind === "url") {
      const urls = new Set([
        "/", "/curriculum/", ...c.modules.map((m) => `/modules/${m.id}/`),
        ...c.tracks.map((t) => `/tracks/${t.id}/`), ...c.units.map((u) => `/study/${u.id}/`),
        ...c.resources.map((r) => "publicUrl" in r.locator ? r.locator.publicUrl : r.locator.legacyUrl),
      ]);
      for (const [from] of edges) {
        const seen = new Set<string>(); let target = from;
        while (edges.has(target) && !seen.has(target)) { seen.add(target); target = edges.get(target)![0]!; }
        if (!urls.has(target)) fail(`Missing URL alias target: ${from}`);
      }
      continue;
    }
    const targets = kind === "legacy-resource-id" ? resources : activities;
    for (const [from] of edges) {
      const seen = new Set<string>(); let target = from;
      while (edges.has(target) && !seen.has(target)) { seen.add(target); target = edges.get(target)![0]!; }
      if (!targets.has(target)) fail(`Missing alias target: ${from}`);
    }
  }
});
