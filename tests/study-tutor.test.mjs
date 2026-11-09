import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import path from 'node:path';
import { existsSync, statSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
const root=process.cwd();
const directory=await mkdtemp(path.join(tmpdir(),'study-tutor-'));
async function load(entry){
 const outfile=path.join(directory,path.basename(entry)+'.mjs');
 await build({entryPoints:[path.join(root,entry)],tsconfig:path.join(root,'apps/web/tsconfig.json'),bundle:true,platform:'node',format:'esm',outfile});
 return import(pathToFileURL(outfile));
}
process.chdir(path.join(root,'apps/web'));
const helper=await load('apps/web/src/lib/study-tutor.ts');
const c=await load('apps/web/src/lib/curriculum.ts');
const {legacyCatalog,indexCatalog,unitReadiness}=await load('packages/shared/src/catalog.ts');
const baselineTbd=legacyCatalog.units.find(unit=>unit.id==='unit-m21-05-a');
const {retrieveLessonContext}=await load('apps/web/src/lib/tutor-retrieval.ts');
const {tutorCompatibility}=await load('apps/web/src/lib/tutor-compatibility.ts');
const manifest=await load('apps/web/src/app/tutor-study/manifest/route.ts');
const { default: app }=await load('apps/api/src/index.ts');
process.chdir(path.join(root,'apps/web'));
test('207 unit corpora contain only published matched mapped resource IDs and module expansion stays in-module',()=>{
 for(const unit of c.catalog.units){
  const corpus=helper.studyTutorCorpus(unit);
  const ids=new Set(helper.studyTutorResourceIds(unit));
  const moduleIds=new Set(c.moduleUnits(corpus.moduleId).flatMap(helper.studyTutorResourceIds));
  for(const document of corpus.documents) { assert.ok(ids.has(document.id)); assert.ok(document.content); }
  for(const document of corpus.moduleDocuments) assert.ok(moduleIds.has(document.id));
  for(const id of corpus.resourceIds) { const resource=c.curriculumIndex.resources.get(id);assert.equal(resource.publication,'published');assert.equal(resource.integrity.status,'matched'); }
 }
});
test('TBD carries explicit gaps and existing supplement role while stable IDs remain independent of legacy chapters',()=>{
 const unit=baselineTbd;const props=helper.studyTutorProps(unit);
 assert.equal(unitReadiness(unit,indexCatalog(legacyCatalog)).state,'tbd');
 assert.equal(props.lessonId,unit.id);assert.equal(props.learningContext.readiness,'tbd');assert.equal(props.learningContext.moduleId,'M21');
 assert.match(props.sourceContent,/미작성 범위/);assert.match(props.sourceContent,/보충 참고/);assert.match(props.sourceContent,/실습 파라미터·결과는 전달되지 않았/);
 const withCode=c.catalog.units.map(helper.studyTutorCorpus).find(corpus=>corpus.documents.some(doc=>doc.content.includes('```')));assert.ok(withCode);
});
test('current M21.05 has ready authored content while every former supplement binding is retained',()=>{
 const unit=c.curriculumIndex.units.get(baselineTbd.id),props=helper.studyTutorProps(unit);
 assert.equal(props.learningContext.readiness,'ready');assert.match(props.sourceContent,/학습 범위와 한계/);
 const corpus=helper.studyTutorCorpus(unit);assert.ok(corpus.documents.some(doc=>doc.id==='authored:resource:M21.05:body'&&doc.content.includes('Mobile ALOHA')));
 for(const slot of Object.keys(baselineTbd.slots))for(const binding of baselineTbd.slots[slot]){
  const key='resourceId' in binding?'resourceId':'activityId';
  assert.ok(unit.slots[slot].some(current=>current[key]===binding[key]&&current.role===binding.role));
  if(key==='resourceId')assert.ok(c.curriculumIndex.resources.has(binding[key]));else assert.ok(c.curriculumIndex.activities.has(binding[key]));
 }
});
test('manifest indexes unit/module/resource IDs and Worker advertises optional context capability',async()=>{
 const index=await manifest.GET().json();assert.equal(index.units.length,207);assert.ok(index.units.every(item=>item.moduleId&&Array.isArray(item.resourceIds)));
 const health=await app.request('/v1/health',{}, {ALLOWED_ORIGINS:'http://localhost:3000'});assert.deepEqual((await health.json()).supportedContextVersions,[1]);
});
test('new Worker accepts old requests and forwards optional TBD context with source boundaries',async()=>{
 const original=globalThis.fetch;const messages=[];
 globalThis.fetch=async(_url,options)=>{messages.push(JSON.parse(options.body).messages);return Response.json({model:'example/free',choices:[{message:{content:JSON.stringify({answer:'미작성 단위입니다.',learnerUpdates:[],lookupQuery:''})},finish_reason:'stop'}]});};
 try {
  const props=helper.studyTutorProps(baselineTbd);
  const body={question:'현재 단원의 준비 상태는?',lesson:{id:props.lessonId,title:props.lessonTitle,contextSummary:props.sourceContent},learningContext:props.learningContext};
  const response=await app.request('/v1/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)},{ALLOWED_ORIGINS:'http://localhost:3000',OPENROUTER_API_KEY:'test-key'});
  assert.equal(response.status,200);assert.equal((await response.json()).mode,'openrouter');
  const demo=await app.request('/v1/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)},{ALLOWED_ORIGINS:'http://localhost:3000'});
  const demoPayload=await demo.json();assert.equal(demoPayload.mode,'demo');assert.match(demoPayload.answer,/답변을 생성하지 못했습니다/);assert.match(demoPayload.answer,/tbd/);assert.match(demoPayload.answer,/데모 안내/);
  assert.ok(messages.flat().some(message=>message.content.includes('[learningContext]')&&message.content.includes('"readiness":"tbd"')));
  delete body.learningContext;
  const legacy=await app.request('/v1/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)},{ALLOWED_ORIGINS:'http://localhost:3000'});assert.equal(legacy.status,200);assert.equal((await legacy.json()).mode,'demo');
 } finally {globalThis.fetch=original;}
});
test('old Worker or unavailable health gates TBD references and live-state questions but permits explicit general concepts',()=>{
 const context=helper.studyTutorProps(baselineTbd).learningContext;
 assert.equal(tutorCompatibility(false,context,'교재 실습 코드를 설명해주세요').allowed,false);
 assert.equal(tutorCompatibility(false,context,'일반 개념: 정책 학습이란?').allowed,true);
 assert.equal(tutorCompatibility(false,{...context,readiness:'partial'},'실습 결과를 확인해주세요').allowed,false);
 assert.equal(tutorCompatibility(false,{...context,readiness:'partial'},'연결된 코드 설명').allowed,true);
 assert.equal(tutorCompatibility(true,context,'현재 단원 준비 상태는?').allowed,true);
 assert.equal(tutorCompatibility(false,undefined,'기존 교재 설명').allowed,true);
});
test('corpus URL matches exported route filename and retrieves the named file/function query',()=>{
 const unit=c.curriculumIndex.units.get('unit-m06-02-a');
 const props=helper.studyTutorProps(unit);assert.equal(props.corpusUrl,`/tutor-study/${unit.id}`);
 const outfile=path.join(root,'apps/web/out',props.corpusUrl);
 if(existsSync(path.join(root,'apps/web/out/tutor-study'))) {assert.ok(existsSync(outfile));assert.ok(statSync(outfile).isFile());}
 const corpus=helper.studyTutorCorpus(unit);
 const reference=retrieveLessonContext('교재 fk_dls_ik.py의 dh_transform 함수 코드를 설명해 주세요.',corpus.documents);
 assert.equal(reference.state,'found');assert.match(reference.text,/def dh_transform/);
});
test.after(async()=>{process.chdir(root);await rm(directory,{recursive:true,force:true});});
