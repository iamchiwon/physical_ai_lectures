import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const bundle = await build({ entryPoints: ['packages/shared/src/catalog.ts'], bundle: true, platform: 'node', format: 'esm', write: false });
let shared;
try { shared = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`); }
catch (error) { throw new Error(JSON.stringify(error.issues ?? error.message)); }
const { legacyCatalog: catalog, catalogSchema, indexCatalog, unitReadiness, bindingRevision, bindingAvailability, summarizeReadiness, catalogReadiness } = shared;
const mapping = JSON.parse(fs.readFileSync('doc/v2/inventory/content-mapping.json', 'utf8'));
const baseline = JSON.parse(fs.readFileSync('doc/v2/inventory/legacy-content.json', 'utf8'));
const curriculum = fs.readFileSync('doc/integrated_curriculum.md', 'utf8');
const clone = () => structuredClone(catalog);
const revisions = JSON.parse(fs.readFileSync('doc/v2/inventory/legacy-revisions.json','utf8')).files;
const hash = (path) => {
  const current = createHash('sha256').update(fs.readFileSync(path)).digest('hex');
  const approval = revisions.find(row => row.source === path);
  if (!approval) return current;
  assert.equal(current, approval.sha256, `stale approved source: ${path}`);
  assert.ok(approval.reason && fs.existsSync(approval.evidenceRef));
  const historical = baseline.bookFiles.find(file => `ebook/book/${file.source}` === path);
  const registered = catalog.activities.find(activity => activity.locator.source === path)?.locator.sourceSha256 ?? catalog.resources.find(resource => resource.locator.source === path)?.locator.baselineFileSha256;
  assert.equal(approval.baselineSha256, historical?.sha256 ?? registered, `baseline rewrite: ${path}`);
  return approval.baselineSha256;
};

test('34/204 IDs, titles, order and stable units match curriculum and A03 exactly', () => {
  const modules = [...curriculum.matchAll(/^### (M\d+)\. (.+)$/gm)].map((m) => [m[1], m[2]]);
  const topics = [...curriculum.matchAll(/^\d+\. `(M\d+\.\d+)` (.+)$/gm)].map((m) => [m[1], m[2]]);
  assert.equal(catalog.areas.length, 7);
  assert.equal(modules.length, 34); assert.equal(topics.length, 204);
  assert.deepEqual(catalog.modules.map((m) => [m.id, m.title]), modules);
  assert.deepEqual(catalog.topics.map((t) => [t.id, t.title]), topics);
  assert.deepEqual(catalog.units.map((u) => [u.id, u.topicId, u.title]), mapping.topics.map((t) => [t.unitId, t.topicId, t.title]));
  assert.ok(catalog.units.every((u) => u.estimatedMinutes === null && u.definitionStatus === 'pending'));
});

test('every legacy body, lesson, original file, question and answer key is preserved once', () => {
  const i = indexCatalog(catalog);
  assert.equal(catalog.resources.length, 333); assert.equal(catalog.activities.length, 191);
  for (const r of baseline.textbookUnits) {
    const asset = i.resources.get('legacy:textbook:' + r.id);
    assert.equal(asset.locator.source, r.source); assert.equal(asset.locator.legacyUrl, r.url);
    assert.equal(asset.locator.baselineFileSha256, hash('ebook/book/' + r.source));
  }
  for (const f of baseline.bookFiles) {
    const r = i.resources.get('legacy:asset:' + f.source);
    assert.equal(r.locator.sha256, f.sha256); assert.equal(hash('ebook/book/' + f.source), f.sha256);
    assert.ok(r.preservation.reason);
  }
  for (const m of baseline.lessonModules) for (const l of m.lessons) {
    assert.equal(i.resources.get('legacy:lesson:' + l.id).locator.legacyUrl, l.url);
  }
  for (const e of mapping.exercises) {
    const a = i.activities.get('legacy:exercise:' + e.id);
    assert.equal(a.persistence.storageKey, e.storageKey);
    assert.equal(a.persistence.legacyId, e.id);
    assert.equal(a.referenceSha256, e.answerEvidence.referenceSha256);
  }
  for (const q of mapping.quickChecks) assert.ok(i.activities.has(`legacy:quick-check:${q.lessonId}:${q.id}`));
  for (const a of catalog.activities) {
    const path = fs.existsSync(a.locator.source) ? a.locator.source : 'ebook/book/' + a.locator.source;
    assert.equal(hash(path), a.locator.sourceSha256);
  }
  for (const r of catalog.resources.filter((r) => ['lesson', 'inline'].includes(r.locator.type))) assert.equal(hash(r.locator.source), r.locator.baselineFileSha256);
});

test('all A03 bindings match exact forward mapping, without copying bodies or propagating completion', () => {
  for (const t of mapping.topics) {
    const u = catalog.units.find((u) => u.id === t.unitId);
    assert.deepEqual(u.slots.explanation.filter((b) => b.resourceId?.startsWith('legacy:textbook:') && b.role === 'primary').map((b) => b.resourceId), t.explanation.primaryTextbookUnitIds.map((id) => 'legacy:textbook:' + id));
    assert.deepEqual(u.slots.practice.filter((b) => b.activityId?.startsWith('activity-lab-')).map((b) => b.activityId), t.practice.labUnitIds.map((id) => 'activity-lab-' + id));
    assert.deepEqual(u.slots.assessment.filter((b) => b.activityId.startsWith('legacy:exercise:')).map((b) => b.activityId), t.assessment.exerciseIds.map((id) => 'legacy:exercise:' + id));
    assert.ok(Object.values(u.slots).flat().every((b) => b.review.verdict === 'unreviewed'));
  }
});

test('A03 partial98/tbd106/ready0 preserved for every topic; supplement-only ALOHA stays TBD', () => {
  const i = indexCatalog(catalog), summary = catalogReadiness(catalog);
  assert.deepEqual(summary.overall.counts, { ready: 0, partial: 98, tbd: 106 });
  for (const t of mapping.topics) assert.equal(unitReadiness(i.units.get(t.unitId), i).state, t.proposedReadiness, t.topicId);
  assert.equal(summary.topics['M21.05'].state, 'tbd');
  assert.equal(summary.topics['M06.02'].state, 'partial');
  assert.equal(summary.modules.M01.state, 'tbd');
  assert.equal(summary.modules.M06.state, 'partial');
});

test('six routes share stable units, satisfy required/optional prerequisites and exclude M33 core', () => {
  assert.equal(catalog.tracks.length, 6);
  for (const t of catalog.tracks) {
    assert.ok(t.steps.every((s) => !s.unitId.startsWith('unit-m33-')));
    assert.equal(new Set(t.steps.map((s) => s.unitId)).size, t.steps.length);
  }
  const arm = catalog.tracks.find((t) => t.id === 'track-manipulation');
  const twin = catalog.tracks.find((t) => t.id === 'track-digital-twin');
  assert.ok([arm,twin].every((t) => t.steps.some((s) => s.unitId === 'unit-m06-02-a')));
  assert.ok(catalogSchema.safeParse(catalog).success);
});

for (const [name, mutate] of [
  ['duplicate ID', (c) => c.units.push(c.units[0])],
  ['orphan child', (c) => c.modules[0].topicIds.pop()],
  ['empty container', (c) => c.areas[0].moduleIds = []],
  ['missing binding', (c) => c.units[0].slots.explanation[0].resourceId = 'missing'],
  ['foreign objective', (c) => c.units[0].slots.explanation[0].objectiveIds = ['foreign']],
  ['missing prerequisite', (c) => c.units[0].prerequisites.allOf = ['missing']],
  ['prerequisite cycle', (c) => c.units[0].prerequisites.allOf = [c.units[1].id]],
  ['out of order route', (c) => c.tracks[0].steps.reverse()],
  ['all optional route', (c) => c.tracks[0].steps.forEach((s) => s.required = false)],
  ['ambiguous alias', (c) => c.aliases.push(c.aliases[0])],
  ['alias cycle', (c) => c.aliases.push({kind:'legacy-resource-id',legacyId:c.aliases[0].canonicalId,canonicalId:c.aliases[0].legacyId})],
  ['missing alias target', (c) => c.aliases[0].canonicalId = 'missing'],
  ['missing URL alias target', (c) => c.aliases.push({kind:'url',legacyUrl:'/old/',targetUrl:'/missing/'})],
  ['resource locator kind mismatch', (c) => c.resources[0].kind = 'legacy-lesson'],
  ['missing activity dependency', (c) => c.activities[0].resourceRefs = ['missing']],
  ['passed without evidence', (c) => c.units[0].slots.explanation[0].review.verdict = 'passed'],
]) test(`registration rejects ${name}`, () => { const c = clone(); mutate(c); assert.equal(catalogSchema.safeParse(c).success, false); });

function readyFixture() {
  const c = clone(), u = c.units[0];
  u.definitionStatus = u.requirements.definitionStatus = u.prerequisites.definitionStatus = 'confirmed';
  const a = c.activities.find((a) => a.kind === 'quick-check');
  const binding = (key, id) => ({ [key]: id, role:'primary', objectiveIds: u.objectives.map((o) => o.id), coverage:'full', review: { verdict:'passed', reviewedRevision:null, evidenceRef:'fixture-reviewed' } });
  u.slots.explanation = [binding('resourceId', u.slots.explanation[0].resourceId)];
  u.slots.practice = [binding('activityId', a.id)];
  u.slots.assessment = [binding('activityId', a.id)];
  const i = indexCatalog(c);
  for (const bs of Object.values(u.slots)) for (const b of bs) b.review.reviewedRevision = bindingRevision(b, i);
  return { c, u, i };
}
test('all full, current, reviewed requirements ready; missing practice or feedback remains partial', () => {
  const {u,i} = readyFixture(); assert.equal(unitReadiness(u,i).state, 'ready');
  u.slots.practice = []; assert.equal(unitReadiness(u,i).state, 'partial');
  u.requirements.practice.mode = 'not_applicable'; u.requirements.practice.reason = '그림 해석 평가로 대체';
  assert.equal(unitReadiness(u,i).state, 'ready');
  i.activities.get(u.slots.assessment[0].activityId).feedbackStatus = 'context-only';
  assert.equal(unitReadiness(u,i).state, 'partial');
});
test('draft, supplement, failed review, broken integrity never become learning availability', () => {
  for (const mutate of [
    (b,i) => b.role = 'supplement',
    (b,i) => b.review.verdict = 'needs_revision',
    (b,i) => i.resources.get(b.resourceId).publication = 'draft',
    (b,i) => i.resources.get(b.resourceId).integrity.status = 'mismatch',
  ]) {
    const {u,i} = readyFixture();u.slots.practice = [];u.slots.assessment = [];
    mutate(u.slots.explanation[0],i);assert.equal(unitReadiness(u,i).state, 'tbd');
  }
});
test('unconfirmed definitions, stale dependency reviews and partial coverage cannot be ready', () => {
  for (const mutate of [
    (u,i) => u.prerequisites.definitionStatus = 'pending',
    (u,i) => u.requirements.definitionStatus = 'pending',
    (u,i) => u.slots.explanation[0].coverage = 'partial',
    (u,i) => i.resources.get(u.slots.explanation[0].resourceId).revision = 'changed',
    (u,i) => i.resources.get(i.activities.get(u.slots.assessment[0].activityId).explanationRefs[0]).revision = 'changed',
  ]) { const {u,i} = readyFixture();mutate(u,i);assert.equal(unitReadiness(u,i).state, 'partial'); }
});
test('invalid dependency blocks activity; aggregate deduplicates IDs and flags empty containers', () => {
  const {u,i} = readyFixture();
  const a = i.activities.get(u.slots.assessment[0].activityId);
  i.resources.get(a.explanationRefs[0]).integrity.status = 'missing';
  assert.equal(bindingAvailability(u.slots.assessment[0],i).available, false);
  assert.equal(unitReadiness(u,i).state, 'partial');
  assert.equal(summarizeReadiness([u.id,u.id],i).total,1);
  assert.equal(summarizeReadiness([],i).state,'tbd');
  assert.equal(summarizeReadiness([],i).definitionError,true);
});

test('a broken or stale primary binding remains an unresolved defect even with another full binding', () => {
  const {u,i} = readyFixture();
  const extra = structuredClone(u.slots.explanation[0]);
  extra.resourceId = 'missing'; u.slots.explanation.push(extra);
  assert.equal(unitReadiness(u,i).state,'partial');
});
test('optional unreviewed activity does not block a ready basic requirement', () => {
  const {u,i} = readyFixture();
  const extra = structuredClone(u.slots.practice[0]);
  extra.review = {verdict:'unreviewed',reviewedRevision:null,evidenceRef:null};
  extra.role = 'supplement'; u.slots.practice.push(extra);
  assert.equal(unitReadiness(u,i).state,'ready');
});

// Audit all published activities, including retained activities with no unit binding.
test('all published activity entries target retained reading routes, including the glossary index', () => {
  const retainedRoutes = new Set([
    '/textbook/',
    ...baseline.textbookUnits.map((unit) => unit.url),
    ...baseline.lessonModules.flatMap((module) => module.lessons.map((lesson) => lesson.url)),
  ]);
  for (const activity of catalog.activities.filter((activity) => activity.publication === 'published')) {
    for (const entry of activity.locator.entryUrls) {
      assert.ok(retainedRoutes.has(entry.split(/[?#]/)[0]), `${activity.id}: ${entry}`);
    }
  }
});
