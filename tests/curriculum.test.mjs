import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { test } from 'node:test';
const result=await build({stdin:{contents:'export * from "./apps/web/src/lib/curriculum.ts"; export {learningProjects} from "./apps/web/src/lib/learning-projects.ts"; export {legacyCatalog,indexCatalog,unitReadiness} from "./packages/shared/src/catalog.ts";',resolveDir:process.cwd()},tsconfig:'apps/web/tsconfig.json',bundle:true,platform:'node',format:'esm',write:false});
let c;
try {c=await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);}
catch(error){throw new Error(JSON.stringify(error.issues??error.message));}

test('every one of 207 current units has a stable module/topic anchor and accurate readiness',()=>{
 assert.equal(c.catalog.modules.length,35);assert.equal(c.catalog.units.length,207);
 const seen=new Set();
 for(const unit of c.catalog.units){
  const link=c.unitLink(unit.id),topic=c.topicIndex.get(unit.topicId);
  assert.equal(link.topicId,topic.id);assert.equal(c.unitOverviewHref(unit.id),`/modules/${topic.moduleId}/#${c.topicAnchor(topic.id)}`);
  assert.equal(link.href,`/study/${unit.id}/`);
  assert.ok(!seen.has(link.href));seen.add(link.href);
 }
 assert.equal(Object.values(c.curriculumReadiness.overall.counts).reduce((a,b)=>a+b,0),207);
});
test('module pages preserve all topics in catalog order, and all prerequisite links resolve',()=>{
 for(const m of c.catalog.modules){assert.deepEqual(c.moduleUnits(m.id).map(u=>u.topicId),m.topicIds);}
 for(const u of c.catalog.units){
  const refs=c.prerequisiteLinks(u);
  assert.deepEqual(refs.allOf.map(r=>r.id),u.prerequisites.allOf);
  assert.deepEqual(refs.anyOf.map(r=>r.id),u.prerequisites.anyOf);
  for(const ref of [...refs.allOf,...refs.anyOf])assert.ok(c.curriculumIndex.units.has(ref.id));
 }
 assert.equal(c.prerequisiteLinks(c.curriculumIndex.units.get('unit-m00-01-a')).allOf.length,0);
 assert.ok(c.prerequisiteLinks(c.curriculumIndex.units.get('unit-m27-01-a')).anyOf.length>1);
});
test('every track target resolves to a real unit; optional steps never count as required',()=>{
 for(const track of c.catalog.tracks){
  assert.ok(track.steps.every(s=>c.unitLink(s.unitId).id===s.unitId));
  assert.equal(c.curriculumReadiness.tracks[track.id].total,track.steps.filter(s=>s.required).length);
 }
});
test('TBD unit with only supplements has no primary reading and retains original resource paths',()=>{
 const unit=c.legacyCatalog.units.find(unit=>unit.id==='unit-m21-05-a');assert.equal(c.primaryReading(unit),null);
 assert.equal(c.unitReadiness(unit,c.indexCatalog(c.legacyCatalog)).state,'tbd');
 assert.ok(Object.values(unit.slots).flat().every(binding=>binding.role==='supplement'));
 assert.equal(c.primaryReading(c.curriculumIndex.units.get(unit.id)).href,'/study/unit-m21-05-a/#authored-body');
 const authored=c.curriculumIndex.units.get('unit-m06-02-a');
 assert.equal(c.primaryReading(authored).href,'/study/unit-m06-02-a/#authored-body');
 const legacy=authored.slots.explanation.filter(binding=>'resourceId' in binding).map(binding=>c.curriculumIndex.resources.get(binding.resourceId)).filter(resource=>resource.locator.type==='textbook');
 assert.ok(legacy.length>0);for(const resource of legacy)assert.match(c.resourceHref(resource),/^\/textbook\//);
});

test('learning stages cover all current topics once and expose real branch prerequisites',()=>{
 assert.equal(c.learningSequence.length,207);assert.equal(new Set(c.learningSequence).size,207);
 assert.deepEqual(c.learningStages.flatMap(stage=>stage.topicIds),c.learningSequence);
 const tooling=c.learningStages.find(stage=>stage.id==='S01');for(const id of ['M01.03','M01.04','M01.06'])assert.ok(tooling.topicIds.includes(id));
 assert.ok(!tooling.title.includes('첫걸음'));
 const dual=c.prerequisiteLinks(c.curriculumIndex.units.get('unit-m32-03-a')).conditional;
 assert.equal(dual.length,1);assert.equal(dual[0].links[0].topicId,'M21.05');
 const authoredOps=c.catalog.units.find(u=>u.topicId==='M34.01');assert.equal(c.primaryReading(authoredOps).href,'/study/unit-m34-01-a/#authored-body');
 assert.equal(c.primaryReading(c.catalog.units.find(u=>u.topicId==='M34.02')).href,'/study/unit-m34-02-a/#authored-body');
 assert.equal(c.primaryReading(c.catalog.units.find(u=>u.topicId==='M34.03')).href,'/study/unit-m34-03-a/#authored-body');
});

test('project guidance never sends learners to later-stage prerequisites',()=>{
 const rank=new Map(c.learningStages.map((stage,i)=>[stage.id,i]));
 for(const project of c.learningProjects){
  assert.ok(c.learningStages.find(stage=>stage.id===project.stageId).milestoneIds.includes(project.id));
  for(const topic of project.topics){const stage=c.learningStages.find(stage=>stage.topicIds.includes(topic));assert.ok(stage,topic);assert.ok(rank.get(stage.id)<=rank.get(project.stageId),`${project.id}: future topic ${topic}`);}
 }
});

test('M34 module guidance does not retain a planned-content warning after all lessons are authored',()=>{
 const module=c.catalog.modules.find(m=>m.id==='M34');
 assert.ok(!module.prerequisiteNote.includes('준비중'));
 assert.ok(!module.prerequisiteNote.includes('계획 단위'));
 for(const unit of c.moduleUnits('M34'))assert.equal(c.unitReadiness(unit,c.curriculumIndex).state,'ready');
});
