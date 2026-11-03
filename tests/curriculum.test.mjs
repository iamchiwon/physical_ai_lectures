import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { test } from 'node:test';
const result=await build({entryPoints:['apps/web/src/lib/curriculum.ts'],tsconfig:'apps/web/tsconfig.json',bundle:true,platform:'node',format:'esm',write:false});
let c;
try {c=await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);}
catch(error){throw new Error(JSON.stringify(error.issues??error.message));}

test('every one of 204 units has a stable module/topic anchor and accurate readiness',()=>{
 assert.equal(c.catalog.modules.length,34);assert.equal(c.catalog.units.length,204);
 const seen=new Set();
 for(const unit of c.catalog.units){
  const link=c.unitLink(unit.id),topic=c.topicIndex.get(unit.topicId);
  assert.equal(link.topicId,topic.id);assert.equal(c.unitOverviewHref(unit.id),`/modules/${topic.moduleId}/#${c.topicAnchor(topic.id)}`);
  assert.equal(link.href,`/study/${unit.id}/`);
  assert.ok(!seen.has(link.href));seen.add(link.href);
 }
 assert.equal(Object.values(c.curriculumReadiness.overall.counts).reduce((a,b)=>a+b,0),204);
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
 const unit=c.curriculumIndex.units.get('unit-m21-05-a');assert.equal(c.primaryReading(unit),null);
 const authored=c.curriculumIndex.units.get('unit-m06-02-a');
 assert.equal(c.primaryReading(authored).href,'/study/unit-m06-02-a/#authored-body');
 const legacy=authored.slots.explanation.filter(binding=>'resourceId' in binding).map(binding=>c.curriculumIndex.resources.get(binding.resourceId)).filter(resource=>resource.locator.type==='textbook');
 assert.ok(legacy.length>0);for(const resource of legacy)assert.match(c.resourceHref(resource),/^\/textbook\//);
});
