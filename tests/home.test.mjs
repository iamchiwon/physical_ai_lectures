import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { test } from 'node:test';

async function load(entry) {
  const bundle = await build({ entryPoints:[entry], tsconfig:'apps/web/tsconfig.json', bundle:true, platform:'node', format:'esm', write:false });
  try { return await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`); }
  catch (error) { throw new Error(JSON.stringify(error.issues ?? error.message)); }
}
const { homeCatalog, buildHomeCatalog } = await load('apps/web/src/lib/home-catalog.ts');
const { catalog, legacyCatalog, catalogReadiness } = await load('packages/shared/src/catalog.ts');
const { parseLegacyProgress, legacyProgressSummary } = await load('apps/web/src/lib/home-progress.ts');

test('home uses current catalog totals and never fabricates duration or a completion percentage', () => {
  assert.deepEqual(homeCatalog.totals,{modules:35,topics:207,tracks:7,...catalogReadiness(catalog).overall.counts});
  assert.equal(homeCatalog.areas.length,7);
  assert.equal(homeCatalog.areas.flatMap((a) => a.modules).length,35);
  assert.ok(!('estimatedMinutes' in homeCatalog));
  assert.ok(!JSON.stringify(homeCatalog).includes('baselineFileSha256'));
});
test('main and six specialist track overviews preserve required/optional counts and module order', () => {
  assert.equal(homeCatalog.tracks.length,7);
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
  assert.deepEqual(homeCatalog.readings.map(r=>r.topicId),['M00.01','M01.01','M01.04','M05.01','M12.01','M09.01']);
  for(const reading of homeCatalog.readings){assert.equal(reading.reading.href,`/study/${reading.unitId}/#authored-body`);assert.equal(reading.reading.title,`${reading.title} · 본문`);}
  const preserved=legacyCatalog.resources.find(resource=>resource.locator.type==='textbook'&&resource.title.includes('LeRobotDataset'));assert.ok(preserved);assert.ok(catalog.resources.some(resource=>resource.id===preserved.id&&resource.title===preserved.title));
  for (const reading of homeCatalog.readings) assert.match(reading.reading.href,/^\/(?:textbook\/[^/]+\/|study\/[^/]+\/#authored-body)$/);
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
