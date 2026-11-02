import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { test } from 'node:test';

async function load(entry) {
  const bundle = await build({ entryPoints:[entry], tsconfig:'apps/web/tsconfig.json', bundle:true, platform:'node', format:'esm', write:false });
  try { return await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`); }
  catch (error) { throw new Error(JSON.stringify(error.issues ?? error.message)); }
}
const { homeCatalog, buildHomeCatalog } = await load('apps/web/src/lib/home-catalog.ts');
const { catalog } = await load('packages/shared/src/catalog.ts');
const { parseLegacyProgress, legacyProgressSummary } = await load('apps/web/src/lib/home-progress.ts');

test('home uses current catalog totals and never fabricates duration or a completion percentage', () => {
  assert.deepEqual(homeCatalog.totals,{modules:34,topics:204,tracks:6,ready:0,partial:98,tbd:106});
  assert.equal(homeCatalog.areas.length,7);
  assert.equal(homeCatalog.areas.flatMap((a) => a.modules).length,34);
  assert.ok(!('estimatedMinutes' in homeCatalog));
  assert.ok(!JSON.stringify(homeCatalog).includes('baselineFileSha256'));
});
test('six distinct track overviews preserve required/optional counts and module order', () => {
  assert.equal(homeCatalog.tracks.length,6);
  for (const track of homeCatalog.tracks) {
    const source = catalog.tracks.find((t) => t.id === track.id);
    assert.equal(track.required,source.steps.filter((s) => s.required).length);
    assert.equal(track.optional,source.steps.filter((s) => !s.required).length);
    assert.equal(track.counts.ready+track.counts.partial+track.counts.tbd,track.required);
    assert.ok(track.sequence.every((m) => m.id !== 'M33'));
  }
});
test('reading entry points are explicit primary textbook resources and exclude unavailable bindings', () => {
  assert.equal(homeCatalog.readings.length,6);
  assert.match(homeCatalog.readings.find((r) => r.topicId === 'M20.03').reading.title,/LeRobotDataset/);
  assert.match(homeCatalog.readings.find((r) => r.topicId === 'M10.03').reading.title,/접촉 역학/);
  for (const reading of homeCatalog.readings) assert.match(reading.reading.href,/^\/textbook\/[^/]+\/$/);
  const source = structuredClone(catalog);
  for (const r of source.resources) r.integrity.status = 'mismatch';
  const home = buildHomeCatalog(source);
  assert.equal(home.readings.length,0);
  assert.ok(home.areas.flatMap((a) => a.modules).every((m) => m.reading === null));
});
test('known legacy last lesson resumes exactly and completion is deduplicated against real lessons', () => {
  const progress={completedLessons:['a','a','unknown'],quizScores:{},lastLessonId:'b'};
  const summary=legacyProgressSummary(progress,[{id:'a',title:'A'},{id:'b',title:'B'}]);
  assert.equal(summary.completed,1);assert.equal(summary.lastLesson.id,'b');assert.equal(summary.unknownLastLesson,false);
  assert.equal(legacyProgressSummary({...progress,lastLessonId:'../missing'},[{id:'a',title:'A'}]).unknownLastLesson,true);
});
test('missing or malformed local records return a safe state and keep raw input untouched', () => {
  assert.equal(parseLegacyProgress(null).notice,null);
  for(const raw of ['{broken','null','[]','{}','{"completedLessons":[],"quizScores":null,"lastLessonId":null}']) {
    const result=parseLegacyProgress(raw);assert.ok(result.notice);assert.equal(result.progress.lastLessonId,null);
  }
});
test('invalid scores and non-string completion IDs are ignored with a recovery notice', () => {
  const raw=JSON.stringify({completedLessons:['a',1],quizScores:{a:100,b:'100',c:-1,d:101},lastLessonId:'a',extra:'preserve'});
  const {progress,notice}=parseLegacyProgress(raw);
  assert.deepEqual(progress,{completedLessons:['a'],quizScores:{a:100},lastLessonId:'a'});assert.ok(notice);
  assert.ok(raw.includes('preserve'));
});
