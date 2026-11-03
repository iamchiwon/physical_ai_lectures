import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const repoRoot=process.cwd();
async function load(entry) {
 const result=await build({entryPoints:[path.join(repoRoot,entry)],tsconfig:path.join(repoRoot,'apps/web/tsconfig.json'),bundle:true,platform:'node',format:'esm',write:false});
 return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}
const c=await load('packages/shared/src/catalog.ts');
const {parseAuthoredMarkdown}=await load('packages/shared/src/authored-format.ts');
const {createLearningStore,LEARNING_STORAGE_KEY}=await load('apps/web/src/lib/learning-store.ts');
const hash=raw=>createHash('sha256').update(raw).digest('hex');
function memory(){const data=new Map();return {data,getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};}
const raw='---\n'+JSON.stringify({title:'Test',objectives:['설명','계산','진단'],prerequisiteNote:'선수 없음'})+'\n---\n## 본문\n왜 계산하는지 설명합니다.\n```python\n## Not a section\nprint(1)\n```\n## 실습\n수치 예시\n## 실습 해설\n근거와 단위\n## 확인 문제\n### Q1\n왜?\n### Q2\n계산하시오.\n### Q3\n진단하시오.\n## 해설\n### Q1\n이유\n### Q2\n과정\n### Q3\n원인\n## 참고 자료\n[문서](https://example.com)\n';
test('authored parser preserves fenced code and requires three paired prompts and solutions',()=>{
 const doc=parseAuthoredMarkdown(raw);assert.equal(doc.questions.length,3);assert.match(doc.body,/## Not a section/);assert.match(doc.practiceSolution,/단위/);
 assert.throws(()=>parseAuthoredMarkdown(raw.replace('### Q3\n원인','### Q4\n원인')));
 assert.throws(()=>parseAuthoredMarkdown(raw.replace('## 실습\n수치 예시','## 실습\n첫 활동\n## 실습\n수치 예시')));
 assert.throws(()=>parseAuthoredMarkdown(raw.replace('"계산",','')));
});
test('unreviewed source never upgrades baseline; current explicit review covers all goals with independent activities',()=>{
 const original=c.legacyCatalog.units.find(unit=>unit.topicId==='M00.01');
 const candidate={topicId:original.topicId,source:'ebook/curriculum/M00/M00.01.md',title:original.title,objectives:['폐루프를 설명한다','오차를 계산한다','관측 실패를 진단한다'],prerequisiteNote:'선수 없음',sha256:'a'.repeat(64),reviewed:false,evidenceRef:null};
 assert.deepEqual(c.applyAuthoredOverlay(c.legacyCatalog,[candidate]),c.legacyCatalog);
 const overlay=c.catalogSchema.parse(c.applyAuthoredOverlay(c.legacyCatalog,[{...candidate,reviewed:true,evidenceRef:'doc/v2/work_items/M00.01.md'}]));
 const unit=overlay.units.find(unit=>unit.id===original.id),index=c.indexCatalog(overlay);
 assert.equal(c.unitReadiness(unit,index).state,'ready');assert.equal(unit.objectives.length,3);assert.equal(unit.requirements.assessment.activityIds.length,3);
 assert.equal(overlay.resources.length,c.legacyCatalog.resources.length+10);assert.equal(overlay.activities.length,c.legacyCatalog.activities.length+4);
 for(const resource of c.legacyCatalog.resources)assert.deepEqual(index.resources.get(resource.id),resource);
 index.resources.get(`authored:resource:${unit.topicId}:body`).revision='changed';assert.equal(c.unitReadiness(unit,index).state,'partial');
});
test('runtime authored publication requires exact reviewed source hash and preserved legacy IDs',()=>{
 const registry=JSON.parse(fs.readFileSync('doc/v2/inventory/e1-reviews.json','utf8'));
 for(const meta of c.authoredMetadata){
  const current=hash(fs.readFileSync(meta.source));assert.equal(meta.sha256,current);
  const approved=registry.topics[meta.topicId]?.sourceSha256===current;
  assert.equal(meta.reviewed,approved);
  const unit=c.catalog.units.find(unit=>unit.topicId===meta.topicId);
  if(approved){assert.equal(c.unitReadiness(unit,c.indexCatalog(c.catalog)).state,'ready');assert.ok(fs.existsSync(meta.evidenceRef));}
  else assert.ok(!c.catalog.resources.some(r=>r.id===`authored:resource:${meta.topicId}:body`));
 }
 assert.deepEqual(c.catalog.units.map(unit=>unit.id),c.legacyCatalog.units.map(unit=>unit.id));
 assert.deepEqual(c.catalog.tracks,c.legacyCatalog.tracks);
 for(const resource of c.legacyCatalog.resources)assert.ok(c.catalog.resources.some(r=>r.id===resource.id));
 assert.ok(c.catalog.revision.length<160);
});
test('approved legacy changes preserve historical fingerprints and use current runtime source revisions',()=>{
 for(const row of c.legacyRevisions){
  assert.equal(hash(fs.readFileSync(row.source)),row.sha256);assert.equal(row.approved,true,row.source);
  const original=c.legacyCatalog.resources.find(r=>r.locator.type==='file'&&`ebook/book/${r.locator.source}`===row.source);
  if(original){assert.equal(original.locator.sha256,row.baselineSha256);const runtime=c.catalog.resources.find(r=>r.id===original.id);assert.equal(runtime.locator.sha256,row.sha256);assert.equal(runtime.integrity.status,'matched');}
 }
 for(const row of c.legacyExerciseReferences){const old=c.legacyCatalog.activities.find(a=>a.id===row.activityId),current=c.catalog.activities.find(a=>a.id===row.activityId);assert.equal(old.referenceSha256,row.baselineSha256);assert.equal(current.referenceSha256,row.sha256);assert.equal(current.integrity.status,'matched');}
});
test('new answers are revisioned, explicit self-review is separate, and only ready current activities can complete',()=>{
 const storage=memory();storage.setItem('physical-ai-answer-old','untouched');const store=createLearningStore(()=>storage);store.hydrate();
 const ids=['practice','q1','q2','q3'].map(id=>'authored:M00.01:'+id);
 for(const id of ids)store.saveActivity(id,'r1','답안과 계산 근거',false);
 assert.equal(store.complete('unit-m00-01-a','r1','catalog','ready',ids),false);
 for(const id of ids)store.saveActivity(id,'r1','답안과 계산 근거',true);
 assert.equal(store.complete('unit-m00-01-a','r1','catalog','partial',ids),false);
 assert.equal(store.complete('unit-m00-01-a','r1','catalog','ready',ids),true);
 assert.ok(store.getSnapshot().data.unitProgress['unit-m00-01-a'].completedAt);
 store.saveActivity(ids[0],'r2','변경된 답안',false);
 assert.equal(store.getSnapshot().data.activityRecords[ids[0]+'@r1'].answer,'답안과 계산 근거');
 assert.equal(store.complete('unit-m00-01-a','r2','catalog','ready',ids),false);
 const reload=createLearningStore(()=>storage);reload.hydrate();assert.equal(reload.getSnapshot().data.activityRecords[ids[0]].revision,'r2');
 assert.equal(storage.getItem('physical-ai-answer-old'),'untouched');
});
test('corrupt and concurrently changed v2 originals survive authored answer writes',()=>{
 const storage=memory();storage.setItem(LEARNING_STORAGE_KEY,'{bad');const store=createLearningStore(()=>storage);store.hydrate();
 store.saveActivity('authored:M00.01:q1','r1','작성 중인 답안',true);assert.equal(storage.getItem(LEARNING_STORAGE_KEY),'{bad');assert.equal(store.getSnapshot().data.activityRecords['authored:M00.01:q1'].answer,'작성 중인 답안');
 const fresh=memory();const first=createLearningStore(()=>fresh);first.hydrate();fresh.setItem(LEARNING_STORAGE_KEY,'external');first.saveActivity('authored:M00.01:q1','r1','내 답안');assert.equal(fresh.getItem(LEARNING_STORAGE_KEY),'external');assert.equal(first.getSnapshot().blocked,true);
});
test('failed authored writes survive valid cross-tab updates and prior completion revisions remain archived',()=>{
 const denied={getItem:()=>null,setItem:()=>{throw Error('quota')},removeItem:()=>{}};const q=createLearningStore(()=>denied);q.hydrate();
 q.saveActivity('authored:M00.01:q1','r1','소실되면 안 되는 답안',true);
 const other=memory();const external=createLearningStore(()=>other);external.hydrate();external.view('unit-external','r1','catalog');
 q.receiveStorage(other.getItem(LEARNING_STORAGE_KEY));assert.equal(q.getSnapshot().data.activityRecords['authored:M00.01:q1'].answer,'소실되면 안 되는 답안');assert.equal(q.getSnapshot().blocked,true);assert.equal(q.getSnapshot().unsavedChanges,true);
 const s=memory();const store=createLearningStore(()=>s);store.hydrate();const ids=['practice','q1','q2','q3'].map(id=>'authored:M00.01:'+id);
 for(const id of ids)store.saveActivity(id,'r1','버전1 풀이',true);store.complete('unit-m00-01-a','r1','catalog','ready',ids);const first={...store.getSnapshot().data.unitProgress['unit-m00-01-a']};
 for(const id of ids)store.saveActivity(id,'r2','버전2 풀이',true);store.complete('unit-m00-01-a','r2','catalog','ready',ids);
 assert.deepEqual(store.getSnapshot().data.unitProgress['unit-m00-01-a@r1'],first);assert.equal(store.getSnapshot().data.unitProgress['unit-m00-01-a'].contentRevision,'r2');
 const restored=createLearningStore(()=>s);restored.hydrate();assert.deepEqual(restored.getSnapshot().data.unitProgress['unit-m00-01-a@r1'],first);
});

test('textbook index includes reviewed authored documents and every retained legacy URL without conflating counts',async()=>{
 process.chdir(path.join(repoRoot,'apps/web'));
 let index;
 try { const helper=await load('apps/web/src/lib/textbook-index.ts'); index=helper.buildTextbookIndex(); } finally {process.chdir(repoRoot);}
 const units=index.foundations.flatMap(module=>module.units);
 assert.equal(index.authoredCount,c.authoredMetadata.filter(item=>item.reviewed).length);
 assert.equal(new Set(units.map(unit=>unit.id)).size,units.length);
 for(const unit of units){assert.equal(unit.bodies,1);assert.equal(unit.practices,1);assert.equal(unit.questions,3);assert.equal(unit.href,`/study/${unit.id}/`);assert.equal(unit.state,c.unitReadiness(c.catalog.units.find(source=>source.id===unit.id),c.indexCatalog(c.catalog)).state);}
 const original=JSON.parse(fs.readFileSync('doc/v2/inventory/legacy-content.json','utf8'));
 assert.equal(index.legacyCount,137);assert.deepEqual(new Set(index.legacy.flatMap(group=>group.units).map(unit=>unit.href)),new Set(original.textbookUnits.map(unit=>unit.url)));
});
