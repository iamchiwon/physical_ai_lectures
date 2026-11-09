import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { authoredReviewRegistries, readAuthoredReviews, mergeAuthoredReviews, collectAuthoredMetadata, legacySourceBaselines } from '../scripts/authored-metadata.mjs';
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
test('authored preparation validates the current canonical definition while preserving source and activity identities',()=>{
 const root=fs.mkdtempSync(path.join(tmpdir(),'physical-ai-current-definition-'));
 const topicId='M01.04',unit=c.currentDefinitionCatalog.units.find(unit=>unit.topicId===topicId),source=`ebook/curriculum/M01/${topicId}.md`,evidenceRef='review.md';
 const text=raw.replace('"title":"Test"',`"title":${JSON.stringify(unit.title)}`);
 fs.mkdirSync(path.dirname(path.join(root,source)),{recursive:true});fs.writeFileSync(path.join(root,source),text);fs.writeFileSync(path.join(root,evidenceRef),'Independent current-definition fixture review');
 const reviews={schemaVersion:1,topics:{[topicId]:{sourceSha256:hash(text),evidenceRef}}};
 try{
  const metadata=collectAuthoredMetadata(root,c.currentDefinitionCatalog.units,reviews,parseAuthoredMarkdown);assert.equal(metadata[0].reviewed,true);
  assert.throws(()=>collectAuthoredMetadata(root,c.legacyCatalog.units,reviews,parseAuthoredMarkdown),/title mismatch/);
  const current=c.catalogSchema.parse(c.applyAuthoredOverlay(c.currentDefinitionCatalog,metadata)),index=c.indexCatalog(current);
  const ready=index.units.get(unit.id);assert.equal(ready.title,unit.title);assert.equal(c.unitReadiness(ready,index).state,'ready');
  assert.ok(current.activities.some(activity=>activity.id==='authored:M01.04:practice'));assert.ok(current.resources.some(resource=>resource.locator.publicUrl===`/study/${unit.id}/#authored-body`));
  fs.writeFileSync(path.join(root,source),text+'\n');assert.equal(collectAuthoredMetadata(root,c.currentDefinitionCatalog.units,reviews,parseAuthoredMarkdown)[0].reviewed,false);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
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
 const registry=readAuthoredReviews(repoRoot,c.catalog.units);
 for(const meta of c.authoredMetadata){
  const current=hash(fs.readFileSync(meta.source));assert.equal(meta.sha256,current);
  const approved=registry.topics[meta.topicId]?.sourceSha256===current;
  assert.equal(meta.reviewed,approved);
  const unit=c.catalog.units.find(unit=>unit.topicId===meta.topicId);
  if(approved){assert.equal(c.unitReadiness(unit,c.indexCatalog(c.catalog)).state,'ready');assert.ok(fs.existsSync(meta.evidenceRef));}
  else assert.ok(!c.catalog.resources.some(r=>r.id===`authored:resource:${meta.topicId}:body`));
 }
 assert.deepEqual(c.catalog.units.map(unit=>unit.id),c.currentDefinitionCatalog.units.map(unit=>unit.id));
 for(const old of c.legacyCatalog.units)assert.ok(c.catalog.units.some(unit=>unit.id===old.id&&unit.topicId===old.topicId));
 for(const old of c.legacyCatalog.tracks){const current=c.catalog.tracks.find(track=>track.id===old.id);assert.deepEqual({...current,steps:[]},{...old,steps:[]});assert.deepEqual([...current.steps].sort((a,b)=>a.id.localeCompare(b.id)),[...old.steps].sort((a,b)=>a.id.localeCompare(b.id)));}
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

test('review registries merge E1 and E2 only with distinct known topics, scoped valid hashes and safe evidence',()=>{
 const known=['M00.01','M05.01','M09.01'];
 const review={sourceSha256:'a'.repeat(64),evidenceRef:'doc/v2/work_items/fixture.md'};
 const e1={file:'e1.json',modules:['M00'],data:{schemaVersion:1,topics:{'M00.01':review}}};
 const e2={file:'e2.json',modules:['M05','M06','M07','M08'],data:{schemaVersion:1,topics:{'M05.01':review}}};
 assert.deepEqual(Object.keys(mergeAuthoredReviews([e1,e2],known).topics),['M00.01','M05.01']);
 assert.throws(()=>mergeAuthoredReviews([e1,{...e2,data:{schemaVersion:1,topics:{'M00.01':review}}}],known),/Duplicate/);
 assert.throws(()=>mergeAuthoredReviews([{...e2,data:{schemaVersion:2,topics:{}}}],known),/Unsupported/);
 assert.throws(()=>mergeAuthoredReviews([{...e2,data:{schemaVersion:1,topics:{'M05.99':review}}}],known),/Unknown/);
 assert.throws(()=>mergeAuthoredReviews([{...e2,data:{schemaVersion:1,topics:{'M09.01':review}}}],known),/scope/);
 for(const invalid of [{...review,sourceSha256:'invalid'},{...review,evidenceRef:'../outside.md'},{...review,extra:true}])assert.throws(()=>mergeAuthoredReviews([{...e2,data:{schemaVersion:1,topics:{'M05.01':invalid}}}],known),/Invalid/);
});
test('E3 scope allows all 21 designated topics and rejects the three deferred M14 topics without changing earlier authority',()=>{
 const registry=authoredReviewRegistries.find(row=>row.file.endsWith('/e3-reviews.json'));
 const review={sourceSha256:'b'.repeat(64),evidenceRef:'doc/v2/work_items/E3-fixture.md'};
 const allowed=c.legacyCatalog.units.map(unit=>unit.topicId).filter(id=>/^M1[012]\./.test(id)||['M14.01','M14.03','M14.06'].includes(id));
 assert.equal(allowed.length,21);
 const known=c.legacyCatalog.units.map(unit=>unit.topicId);
 assert.equal(Object.keys(mergeAuthoredReviews([{...registry,data:{schemaVersion:1,topics:Object.fromEntries(allowed.map(id=>[id,review]))}}],known).topics).length,21);
 for(const id of ['M14.02','M14.04','M14.05','M00.01','M05.01'])assert.throws(()=>mergeAuthoredReviews([{...registry,data:{schemaVersion:1,topics:{[id]:review}}}],known),/scope/);
 for(const earlier of authoredReviewRegistries.filter(row=>row!==registry))assert.throws(()=>mergeAuthoredReviews([{...earlier,data:{schemaVersion:1,topics:{'M14.01':review}}}],known),/scope/);
});
test('E4 scope accepts exactly its 42 topics and cannot approve deferred M14 or other batches',()=>{
 const registry=authoredReviewRegistries.find(row=>row.file.endsWith('/e4-reviews.json'));
 assert.deepEqual(registry.modules,['M19','M20','M21','M22','M27','M30','M32']);
 const review={sourceSha256:'c'.repeat(64),evidenceRef:'doc/v2/work_items/E4-fixture.md'};
 const known=c.legacyCatalog.units.map(unit=>unit.topicId),allowed=known.filter(id=>registry.modules.includes(id.split('.')[0]));
 assert.equal(allowed.length,42);
 assert.equal(Object.keys(mergeAuthoredReviews([{...registry,data:{schemaVersion:1,topics:Object.fromEntries(allowed.map(id=>[id,review]))}}],known).topics).length,42);
 for(const id of ['M14.01','M14.02','M14.04','M14.05','M18.01','M23.01','M31.01','M33.01'])assert.throws(()=>mergeAuthoredReviews([{...registry,data:{schemaVersion:1,topics:{[id]:review}}}],known),/scope/);
 for(const earlier of authoredReviewRegistries.filter(row=>row!==registry))assert.throws(()=>mergeAuthoredReviews([{...earlier,data:{schemaVersion:1,topics:{'M19.01':review}}}],known),/scope/);
});
test('E5 scope accepts exactly M09 M15 M17 M18 and cannot extend earlier or deferred authority',()=>{
 const registry=authoredReviewRegistries.find(row=>row.file.endsWith('/e5-reviews.json'));
 assert.deepEqual(registry.modules,['M09','M15','M17','M18']);
 const review={sourceSha256:'d'.repeat(64),evidenceRef:'doc/v2/work_items/E5-fixture.md'};
 const known=c.legacyCatalog.units.map(unit=>unit.topicId),allowed=known.filter(id=>registry.modules.includes(id.split('.')[0]));
 assert.equal(allowed.length,24);
 assert.equal(Object.keys(mergeAuthoredReviews([{...registry,data:{schemaVersion:1,topics:Object.fromEntries(allowed.map(id=>[id,review]))}}],known).topics).length,24);
 for(const id of ['M08.01','M10.01','M14.01','M14.02','M14.04','M14.05','M16.01','M19.01'])assert.throws(()=>mergeAuthoredReviews([{...registry,data:{schemaVersion:1,topics:{[id]:review}}}],known),/scope/);
 for(const earlier of authoredReviewRegistries.filter(row=>row!==registry))assert.throws(()=>mergeAuthoredReviews([{...earlier,data:{schemaVersion:1,topics:{'M09.01':review}}}],known),/scope/);
});
for(const batch of [
 {name:'E2',registry:'e2',previousCount:24,topicIds:['M05.01','M06.01','M07.01','M08.01']},
 {name:'E3',registry:'e3',previousCount:48,topicIds:['M10.01','M11.01','M12.01','M14.01','M14.03','M14.06']},
 {name:'E4',registry:'e4',previousCount:69,topicIds:['M19.01','M20.01','M21.01','M22.01','M27.01','M30.01','M32.01']},
 {name:'E5',registry:'e5',previousCount:111,topicIds:['M09.01','M15.01','M17.01','M18.01']},
])test(`${batch.name} approval flows through metadata, readiness, textbook index and authored AI sections while preserving earlier batches`,async()=>{
 const fixtureRoot=fs.mkdtempSync(path.join(tmpdir(),`physical-ai-${batch.registry}-approval-`));
 const topicIds=batch.topicIds,evidenceRef=`doc/v2/work_items/${batch.name}-fixture.md`;
 const units=topicIds.map(topicId=>c.legacyCatalog.units.find(unit=>unit.topicId===topicId));
 const texts=new Map(units.map(unit=>[unit.topicId,raw.replace('"title":"Test"',`"title":${JSON.stringify(unit.title)}`)]));
 const source=id=>`ebook/curriculum/${id.split('.')[0]}/${id}.md`;
 fs.mkdirSync(path.join(fixtureRoot,'doc/v2/inventory'),{recursive:true});fs.mkdirSync(path.dirname(path.join(fixtureRoot,evidenceRef)),{recursive:true});
 fs.writeFileSync(path.join(fixtureRoot,evidenceRef),'Independent fixture approval evidence');
 const approvalFile=path.join(fixtureRoot,`doc/v2/inventory/${batch.registry}-reviews.json`);
 for(const registry of authoredReviewRegistries)fs.writeFileSync(path.join(fixtureRoot,registry.file),JSON.stringify({schemaVersion:1,topics:{}}));
 for(const [id,text] of texts){fs.mkdirSync(path.dirname(path.join(fixtureRoot,source(id))),{recursive:true});fs.writeFileSync(path.join(fixtureRoot,source(id)),text);}
 try {
  const pending=collectAuthoredMetadata(fixtureRoot,c.legacyCatalog.units,readAuthoredReviews(fixtureRoot,c.legacyCatalog.units),parseAuthoredMarkdown);
  assert.equal(pending.length,topicIds.length);assert.ok(pending.every(item=>!item.reviewed));assert.deepEqual(c.applyAuthoredOverlay(c.legacyCatalog,pending),c.legacyCatalog);
  fs.writeFileSync(approvalFile,JSON.stringify({schemaVersion:1,topics:Object.fromEntries([...texts].map(([id,text])=>[id,{sourceSha256:hash(text),evidenceRef}]))}));
  const reviews=readAuthoredReviews(fixtureRoot,c.legacyCatalog.units);
  const metadata=collectAuthoredMetadata(fixtureRoot,c.legacyCatalog.units,reviews,parseAuthoredMarkdown);assert.ok(metadata.every(item=>item.reviewed));
  const previous=authoredReviewRegistries.slice(0,authoredReviewRegistries.findIndex(registry=>registry.file.endsWith(`/${batch.registry}-reviews.json`)));
  const e1=c.authoredMetadata.filter(item=>previous.some(registry=>registry.modules?.includes(item.topicId.split('.')[0])||registry.topicIds?.includes(item.topicId)));
  assert.equal(e1.filter(item=>item.reviewed).length,batch.previousCount);
  const before=c.applyAuthoredOverlay(c.legacyCatalog,e1);
  const overlay=c.catalogSchema.parse(c.applyAuthoredOverlay(c.legacyCatalog,[...e1,...metadata]));
  for(const topicId of topicIds)assert.equal(c.unitReadiness(overlay.units.find(unit=>unit.topicId===topicId),c.indexCatalog(overlay)).state,'ready');
  for(const original of before.units.filter(unit=>!topicIds.includes(unit.topicId)))assert.deepEqual(overlay.units.find(unit=>unit.id===original.id),original);
  if(batch.name==='E3')for(const id of ['M14.02','M14.04','M14.05'])assert.deepEqual(overlay.units.find(unit=>unit.topicId===id),c.legacyCatalog.units.find(unit=>unit.topicId===id));
  process.chdir(path.join(repoRoot,'apps/web'));let reader,contents;
  try {reader=await load('apps/web/src/lib/authored.ts');contents=await load('apps/web/src/lib/textbook-index.ts');}finally{process.chdir(repoRoot);}
  const read=id=>topicIds.includes(id)?reader.authoredForTopic(id,metadata,fixtureRoot):reader.authoredForTopic(id,c.authoredMetadata,repoRoot);
  const index=contents.buildTextbookIndex(overlay,read);
  for(const unit of units){const listed=index.foundations.find(module=>module.id===unit.topicId.split('.')[0]).units.find(row=>row.topicId===unit.topicId);assert.equal(listed.href,`/study/${unit.id}/`);assert.equal(listed.questions,3);assert.equal(reader.authoredSection(unit.topicId,'body',read),parseAuthoredMarkdown(texts.get(unit.topicId)).body);assert.equal(reader.authoredSection(unit.topicId,'answer-q3',read),parseAuthoredMarkdown(texts.get(unit.topicId)).questions[2].answer);}
  assert.equal(index.authoredCount,e1.filter(item=>item.reviewed).length+topicIds.length);assert.equal(index.legacyCount,137);
  const topicId=topicIds[0];fs.writeFileSync(path.join(fixtureRoot,source(topicId)),texts.get(topicId)+'\n');
  assert.equal(collectAuthoredMetadata(fixtureRoot,c.legacyCatalog.units,reviews,parseAuthoredMarkdown)[0].reviewed,false);
  assert.throws(()=>reader.authoredForTopic(topicId,metadata,fixtureRoot),/changed after/);
  const unknown=path.join(fixtureRoot,`ebook/curriculum/${topicId.split('.')[0]}/${topicId.split('.')[0]}.99.md`);fs.writeFileSync(unknown,texts.get(topicId));
  assert.throws(()=>collectAuthoredMetadata(fixtureRoot,c.legacyCatalog.units,reviews,parseAuthoredMarkdown),/Unknown authored source/);fs.unlinkSync(unknown);
  fs.unlinkSync(path.join(fixtureRoot,evidenceRef));assert.throws(()=>collectAuthoredMetadata(fixtureRoot,c.legacyCatalog.units,reviews,parseAuthoredMarkdown),/Missing review evidence/);
  fs.writeFileSync(path.join(fixtureRoot,evidenceRef),'restored');fs.unlinkSync(path.join(fixtureRoot,source(topicId)));assert.throws(()=>collectAuthoredMetadata(fixtureRoot,c.legacyCatalog.units,reviews,parseAuthoredMarkdown),/Review without authored source/);
  fs.unlinkSync(approvalFile);assert.throws(()=>readAuthoredReviews(fixtureRoot,c.legacyCatalog.units),/Missing authored review registry/);
 } finally {process.chdir(repoRoot);fs.rmSync(fixtureRoot,{recursive:true,force:true});}
});

test('legacy app source revisions use registered historical hashes and update activity integrity without changing book baselines',()=>{
 const baseline=JSON.parse(fs.readFileSync('doc/v2/inventory/legacy-content.json','utf8'));const sources=legacySourceBaselines(c.legacyCatalog,baseline.bookFiles);
 const source='apps/web/src/components/virtual-lab.tsx',historical=c.legacyCatalog.activities.find(activity=>activity.locator.source===source).locator.sourceSha256;
 assert.equal(sources.get(source),historical);for(const file of baseline.bookFiles)assert.equal(sources.get(`ebook/book/${file.source}`),file.sha256);
 const revision={source,baselineSha256:historical,sha256:'b'.repeat(64),approved:false,reason:'Fixture app revision',evidenceRef:null};
 const rejected=c.applyAuthoredOverlay(c.legacyCatalog,[],[revision]);for(const activity of rejected.activities.filter(a=>a.locator.source===source))assert.equal(activity.integrity.status,'mismatch');
 const accepted=c.applyAuthoredOverlay(c.legacyCatalog,[],[{...revision,approved:true,evidenceRef:'fixture-review'}]);for(const activity of accepted.activities.filter(a=>a.locator.source===source)){assert.equal(activity.integrity.status,'matched');assert.equal(activity.locator.sourceSha256,revision.sha256);assert.equal(activity.revision,`sha256:${revision.sha256}`);}
 assert.deepEqual(accepted.resources,c.legacyCatalog.resources);
});

test('W01 authority is limited to the two early M31 topics and cannot approve later automation',()=>{
 const registry=authoredReviewRegistries.find(row=>row.file.endsWith('/w01-reviews.json'));assert.deepEqual(registry.topicIds,['M31.01','M31.02']);assert.equal(registry.modules,undefined);
 const known=c.catalog.units.map(unit=>unit.topicId),review={sourceSha256:'a'.repeat(64),evidenceRef:'review.md'};
 const data={schemaVersion:1,topics:Object.fromEntries(registry.topicIds.map(id=>[id,review]))};assert.equal(Object.keys(mergeAuthoredReviews([{...registry,data}],known).topics).length,2);
 for(const id of ['M31.03','M31.04','M31.05','M31.06','M34.01','M13.01'])assert.throws(()=>mergeAuthoredReviews([{...registry,data:{schemaVersion:1,topics:{[id]:review}}}],known),/scope/);
});

test('W02 authority covers only six classical perception and fusion gaps',()=>{
 const registry=authoredReviewRegistries.find(row=>row.file.endsWith('/w02-reviews.json'));assert.deepEqual(registry.topicIds,['M13.01','M13.02','M13.05','M13.06','M14.02','M14.04']);assert.equal(registry.modules,undefined);
 const known=c.catalog.units.map(unit=>unit.topicId),review={sourceSha256:'a'.repeat(64),evidenceRef:'review.md'};
 const data={schemaVersion:1,topics:Object.fromEntries(registry.topicIds.map(id=>[id,review]))};assert.equal(Object.keys(mergeAuthoredReviews([{...registry,data}],known).topics).length,6);
 for(const id of ['M13.03','M13.04','M14.01','M14.03','M14.05','M14.06','M16.01','M31.01'])assert.throws(()=>mergeAuthoredReviews([{...registry,data:{schemaVersion:1,topics:{[id]:review}}}],known),/scope/);
});

test('W03 approval authority is limited to mobile reproduction and CI units',()=>{
 const registry=authoredReviewRegistries.find(r=>r.file==='doc/v2/inventory/w03-reviews.json');
 assert.deepEqual(registry.topicIds,['M31.03','M31.04']);
 for(const topicId of ['M31.01','M31.02','M31.05','M31.06','M14.04','M34.01'])assert.ok(!registry.topicIds.includes(topicId));
});

test('W04 review authority covers only six digital twin asset topics',()=>{
 const registry=authoredReviewRegistries.find(r=>r.file==='doc/v2/inventory/w04-reviews.json');assert.deepEqual(registry.topicIds,['M25.01','M25.02','M25.03','M25.04','M25.05','M25.06']);assert.equal(registry.modules,undefined);
 const known=c.catalog.units.map(u=>u.topicId),review={sourceSha256:'a'.repeat(64),evidenceRef:'review.md'};
 const data={schemaVersion:1,topics:Object.fromEntries(registry.topicIds.map(id=>[id,review]))};assert.equal(Object.keys(mergeAuthoredReviews([{...registry,data}],known).topics).length,6);
 for(const id of ['M10.01','M23.01','M24.01','M27.01','M31.05','M34.01'])assert.throws(()=>mergeAuthoredReviews([{...registry,data:{schemaVersion:1,topics:{[id]:review}}}],known),/scope/);
});

test('W05 authority covers only later automation and physical change boundaries',()=>{
 const registry=authoredReviewRegistries.find(r=>r.file==='doc/v2/inventory/w05-reviews.json');assert.deepEqual(registry.topicIds,['M31.05','M31.06']);assert.equal(registry.modules,undefined);
 const known=c.catalog.units.map(u=>u.topicId),review={sourceSha256:'a'.repeat(64),evidenceRef:'review.md'};
 const data={schemaVersion:1,topics:Object.fromEntries(registry.topicIds.map(id=>[id,review]))};assert.equal(Object.keys(mergeAuthoredReviews([{...registry,data}],known).topics).length,2);
 for(const id of ['M31.01','M31.02','M31.03','M31.04','M25.01','M34.01'])assert.throws(()=>mergeAuthoredReviews([{...registry,data:{schemaVersion:1,topics:{[id]:review}}}],known),/scope/);
});

test('W06 authority is limited to telemetry synchronization and supervised operations UI',()=>{
 const registry=authoredReviewRegistries.find(r=>r.file==='doc/v2/inventory/w06-reviews.json');assert.deepEqual(registry.topicIds,['M34.01','M34.02','M34.03']);assert.equal(registry.modules,undefined);
 const known=c.catalog.units.map(u=>u.topicId),review={sourceSha256:'a'.repeat(64),evidenceRef:'review.md'};
 const data={schemaVersion:1,topics:Object.fromEntries(registry.topicIds.map(id=>[id,review]))};assert.equal(Object.keys(mergeAuthoredReviews([{...registry,data}],known).topics).length,3);
 for(const id of ['M31.05','M31.06','M25.01','M30.04','M22.06','M05.01'])assert.throws(()=>mergeAuthoredReviews([{...registry,data:{schemaVersion:1,topics:{[id]:review}}}],known),/scope/);
});

test('W07 authority covers only the six MCU peripheral and driver topics',()=>{
 const registry=authoredReviewRegistries.find(r=>r.file==='doc/v2/inventory/w07-reviews.json');assert.deepEqual(registry.topicIds,['M04.01','M04.02','M04.03','M04.04','M04.05','M04.06']);assert.equal(registry.modules,undefined);
 const known=c.catalog.units.map(u=>u.topicId),review={sourceSha256:'a'.repeat(64),evidenceRef:'review.md'};
 const data={schemaVersion:1,topics:Object.fromEntries(registry.topicIds.map(id=>[id,review]))};assert.equal(Object.keys(mergeAuthoredReviews([{...registry,data}],known).topics).length,6);
 for(const id of ['M01.03','M03.04','M26.01','M28.01','M29.01','M34.01'])assert.throws(()=>mergeAuthoredReviews([{...registry,data:{schemaVersion:1,topics:{[id]:review}}}],known),/scope/);
});

test('W08 authority is limited to embedded integration and HSI topics',()=>{
 const registry=authoredReviewRegistries.find(r=>r.file==='doc/v2/inventory/w08-reviews.json');assert.deepEqual(registry.topicIds,['M26.01','M26.02','M26.03','M26.04','M26.05','M26.06']);assert.equal(registry.modules,undefined);
 const known=c.catalog.units.map(u=>u.topicId),review={sourceSha256:'a'.repeat(64),evidenceRef:'review.md'};
 const data={schemaVersion:1,topics:Object.fromEntries(registry.topicIds.map(id=>[id,review]))};assert.equal(Object.keys(mergeAuthoredReviews([{...registry,data}],known).topics).length,6);
 for(const id of ['M04.06','M07.04','M28.01','M29.01','M31.06','M34.01'])assert.throws(()=>mergeAuthoredReviews([{...registry,data:{schemaVersion:1,topics:{[id]:review}}}],known),/scope/);
});
