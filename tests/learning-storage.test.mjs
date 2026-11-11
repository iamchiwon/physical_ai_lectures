import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { test } from 'node:test';
async function load(entry) {
 const result=await build({entryPoints:[entry],tsconfig:'apps/web/tsconfig.json',bundle:true,platform:'node',format:'esm',write:false});
 return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}
const {createLearningStore,LEARNING_STORAGE_KEY,LEARNING_STORAGE_BUDGET}=await load('apps/web/src/lib/learning-store.ts');
const {legacyStudyHref,forwardLegacyStudyHref,resolveLegacyStudyContext}=await load('apps/web/src/lib/legacy-study-context.ts');
const {legacyStudyContextsFor}=await load('apps/web/src/lib/legacy-study-context-server.ts');
const {catalog}=await load('apps/web/src/lib/curriculum.ts');
const {parseLegacyProgress}=await load('apps/web/src/lib/home-progress.ts');
function storage(){const data=new Map();return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};}
test('reading shared resources records one stable unit without granting completion or copying old records',()=>{
 const s=storage();s.setItem('physical-ai-answer-ch3-q1','original answer');s.setItem('physical-ai-study-progress-v1','original progress');s.setItem('physical-ai:tutor:v1','original conversation');
 const store=createLearningStore(()=>s);store.hydrate();store.view('unit-m06-02-a','r1','catalog','track-manipulation');
 const first=s.getItem(LEARNING_STORAGE_KEY);store.view('unit-m06-02-a','r1','catalog','track-manipulation');assert.equal(s.getItem(LEARNING_STORAGE_KEY),first);
 assert.equal(store.getSnapshot().data.unitProgress['unit-m06-02-a'].completedAt,null);assert.deepEqual(store.getSnapshot().data.activityRecords,{});
 assert.equal(store.getSnapshot().data.lastLocation.trackId,'track-manipulation');
 const restored=createLearningStore(()=>s);restored.hydrate();assert.equal(restored.getSnapshot().data.lastLocation.unitId,'unit-m06-02-a');
 restored.reset();assert.equal(s.getItem('physical-ai-answer-ch3-q1'),'original answer');assert.equal(s.getItem('physical-ai-study-progress-v1'),'original progress');assert.equal(s.getItem('physical-ai:tutor:v1'),'original conversation');
});
test('corrupt/future documents remain byte-for-byte intact; storage updates restore valid data',()=>{
 for(const raw of ['{bad',JSON.stringify({schemaVersion:3,valuable:'future data'})]){
  const s=storage();s.setItem(LEARNING_STORAGE_KEY,raw);const store=createLearningStore(()=>s);store.hydrate();assert.equal(store.getSnapshot().blocked,true);
  store.view('unit-m06-02-a','r1','catalog');assert.equal(s.getItem(LEARNING_STORAGE_KEY),raw);assert.ok(store.getSnapshot().notice);
  store.receiveStorage(null);assert.equal(store.getSnapshot().blocked,false);assert.equal(store.getSnapshot().data.lastLocation,null);
 }
});
test('cross-tab race and quota failure preserve existing persisted records',()=>{
 const s=storage();const store=createLearningStore(()=>s);store.hydrate();store.view('unit-a','r1','catalog');
 const other=createLearningStore(()=>s);other.hydrate();other.view('unit-b','r1','catalog');const latest=s.getItem(LEARNING_STORAGE_KEY);
 store.view('unit-c','r1','catalog');assert.equal(s.getItem(LEARNING_STORAGE_KEY),latest);assert.equal(store.getSnapshot().blocked,true);
 store.receiveStorage(latest);assert.equal(store.getSnapshot().data.lastLocation.unitId,'unit-b');
 const denied={getItem:()=>null,setItem:()=>{throw Error('quota')},removeItem:()=>{}};const q=createLearningStore(()=>denied);q.hydrate();q.view('unit-a','r1','catalog');assert.ok(q.getSnapshot().notice);assert.equal(q.getSnapshot().data.lastLocation.unitId,'unit-a');
});
test('207 read-only records fit the measured 512 KiB budget',()=>{
 const s=storage();const store=createLearningStore(()=>s);store.hydrate();for(let i=0;i<207;i++)store.view('unit-m'+i+'-01-a','2026-11-02-v1','2026-11-02-v1');
 const bytes=new TextEncoder().encode(s.getItem(LEARNING_STORAGE_KEY)).length;assert.ok(bytes<LEARNING_STORAGE_BUDGET);assert.ok(bytes<40000);
});
test('old completion, highest quiz score and unknown legacy IDs survive parsing',()=>{
 const fixture={completedLessons:['legacy-known','retired-id'],quizScores:{'legacy-known':100,'retired-id':80},lastLessonId:'legacy-known'};
 assert.deepEqual(parseLegacyProgress(JSON.stringify(fixture)).progress,fixture);
});
test('legacy return URLs retain original anchors and only accept mapped units and valid tracks',()=>{
 const real = catalog.resources.filter(r=>r.locator.type==='textbook'||r.locator.type==='lesson');
 let mapped=0;for(const resource of real){
  const path=resource.locator.legacyUrl.split(/[?#]/)[0];const contexts=legacyStudyContextsFor(path);
  for(const context of contexts){mapped++;assert.ok(catalog.units.some(u=>u.id===context.id));assert.equal(resolveLegacyStudyContext(contexts,[context.id],[]).href,`/study/${context.id}/`);}
 }assert.ok(mapped>100);
 assert.equal(legacyStudyHref('/textbook/a/#section','unit-a','track-a'),'/textbook/a/?from=unit-a&track=track-a#section');
 assert.equal(legacyStudyHref('/textbook-assets/code.py','unit-a'),'/textbook-assets/code.py');
 const units=[{id:'unit-a',title:'A',moduleId:'M06',revision:'r',catalogRevision:'c',trackIds:['track-a']}];
 assert.equal(resolveLegacyStudyContext(units,['unit-a'],['track-a']).href,'/study/unit-a/?track=track-a');
 assert.equal(resolveLegacyStudyContext(units,['unit-a'],['bad']).href,'/study/unit-a/');
 assert.equal(resolveLegacyStudyContext(units,['unit-a','unit-a'],[]),null);assert.equal(resolveLegacyStudyContext(units,['bad'],[]),null);
});

test('old previous/next and summary links carry the origin across multiple pages with canonical fallback',()=>{
 const first='/textbook/03_so101_kinematics_teleop--chapter-6/';
 const next='/textbook/03_so101_kinematics_teleop--chapter-7/';
 for(const path of [first,next]){
  const contexts=legacyStudyContextsFor(path);assert.ok(contexts.some(c=>c.id==='unit-m06-02-a'));
  const href=forwardLegacyStudyHref(path,['unit-m06-02-a'],['track-manipulation']);
  const url=new URL(href,'https://classroom.invalid');
  assert.equal(resolveLegacyStudyContext(contexts,url.searchParams.getAll('from'),url.searchParams.getAll('track')).href,'/study/unit-m06-02-a/?track=track-manipulation');
 }
 assert.equal(forwardLegacyStudyHref(next,[],[]),next);
 assert.equal(forwardLegacyStudyHref(next,['unit-m06-02-a','unit-m06-02-a'],[]),next);
 assert.equal(forwardLegacyStudyHref(next,['//evil'],[]),next);
 const unrelated=legacyStudyContextsFor('/learn/nonexistent/');
 assert.equal(resolveLegacyStudyContext(unrelated,['unit-m06-02-a'],['track-manipulation']),null);
});
