import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { test } from 'node:test';
async function load(entry){
 const result=await build({entryPoints:[entry],tsconfig:'apps/web/tsconfig.json',bundle:true,platform:'node',format:'esm',write:false});
 try{return await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);}catch(error){throw new Error(JSON.stringify(error.issues??error.message));}
}
const c=await load('apps/web/src/lib/curriculum.ts');
const {studyHref,resolveStudyNavigation}=await load('apps/web/src/lib/study-navigation.ts');
const {studyResource}=await load('apps/web/src/lib/study-resources.ts');

test('all 204 units retain a canonical URL independent of six track contexts',()=>{
 for(const unit of c.catalog.units){
  assert.equal(studyHref(unit.id),`/study/${unit.id}/`);
  const nav=c.studyNavigationFor(unit.id);
  for(const context of nav.contexts){
   const track=c.trackIndex.get(context.id);const i=track.steps.findIndex(s=>s.unitId===unit.id);
   assert.equal(context.previous?.id,track.steps[i-1]?.unitId);assert.equal(context.next?.id,track.steps[i+1]?.unitId);
   assert.equal(context.stepId,track.steps[i].id);assert.equal(context.required,track.steps[i].required);
   const resolved=resolveStudyNavigation(nav.base,nav.contexts,[track.id]);assert.equal(resolved.context.id,track.id);
   assert.equal(studyHref(unit.id,track.id),`/study/${unit.id}/?track=${track.id}`);
  }
 }
});
test('default order includes TBD and handles first/last boundaries without skipping',()=>{
 const first=c.studyNavigationFor(c.catalog.units[0].id);assert.equal(first.base.previous,null);assert.equal(first.base.next.id,c.catalog.units[1].id);
 const last=c.studyNavigationFor(c.catalog.units.at(-1).id);assert.equal(last.base.next,null);
 const current=c.studyNavigationFor('unit-m00-06-a');assert.equal(current.base.next.id,'unit-m01-01-a');assert.equal(current.base.next.state,'tbd');
});
test('invalid, absent-membership and duplicate track queries fall back to catalog order explicitly',()=>{
 const nav=c.studyNavigationFor('unit-m33-01-a');assert.equal(nav.contexts.length,0);
 for(const values of [['missing'],['track-mobile'],['track-mobile','track-mobile'],['']]){
  const resolved=resolveStudyNavigation(nav.base,nav.contexts,values);assert.equal(resolved.context,null);assert.ok(resolved.notice);assert.deepEqual(resolved.next,nav.base.next);
 }
 const clean=resolveStudyNavigation(nav.base,nav.contexts,[]);assert.equal(clean.notice,null);
});
test('TBD only-supplement bindings stay clearly supplementary and original resources are not copied',()=>{
 const unit=c.curriculumIndex.units.get('unit-m21-05-a');
 const items=Object.values(unit.slots).flat().map(studyResource);
 assert.ok(items.length>0);assert.ok(items.every(item=>item.role==='supplement'));
 assert.ok(items.every(item=>!('content' in item)));
});
test('invalid resource or activity bindings have zero actionable links and a visible reason',()=>{
 const b={resourceId:'missing',role:'primary',coverage:'full',review:{verdict:'unreviewed',reviewedRevision:null,evidenceRef:null}};
 const resource=studyResource(b);assert.equal(resource.available,false);assert.equal(resource.links.length,0);assert.ok(resource.reason);
 const activity=studyResource({activityId:'missing',role:'primary',coverage:'full',review:b.review});assert.equal(activity.available,false);assert.equal(activity.links.length,0);
 const fk=c.curriculumIndex.units.get('unit-m06-02-a').slots.explanation[0];
 assert.equal(studyResource({...fk,review:{verdict:'needs_revision',reviewedRevision:null,evidenceRef:null}}).links.length,0);
});
test('study query module has no runtime catalog import or schema payload',async()=>{
 const result=await build({entryPoints:['apps/web/src/lib/study-navigation.ts'],bundle:true,platform:'browser',format:'esm',write:false});
 const code=result.outputFiles[0].text;assert.ok(code.length<5000);assert.ok(!code.includes('baselineFileSha256'));
});

test('all original resources stay canonical and distinguish detailed text, summary and files',()=>{
 for(const unit of c.catalog.units)for(const binding of Object.values(unit.slots).flat()){
  if(!('resourceId' in binding))continue;
  const source=c.curriculumIndex.resources.get(binding.resourceId),item=studyResource(binding);
  assert.equal(item.links[0]?.href,c.resourceHref(source));
  assert.ok(!('content' in item));
  if(source.kind==='legacy-lesson')assert.equal(item.kind,'기존 요약 레슨');
  if(source.kind==='legacy-textbook')assert.equal(item.kind,'기존 상세 본문');
 }
});
test('written activities reuse exact legacy answer anchors and original authored feedback',()=>{
 for(const activity of c.catalog.activities.filter(a=>['question','report','quick-check'].includes(a.kind))){
  const binding={activityId:activity.id,role:'primary',coverage:'partial',review:{verdict:'unreviewed',reviewedRevision:null,evidenceRef:null}};
  const item=studyResource(binding);assert.equal(item.available,true);assert.ok(item.feedback);
  for(const url of activity.locator.entryUrls){
   const anchor=activity.kind==='quick-check'?'quick-check':activity.persistence.legacyId;
   assert.ok(item.links.some(link=>link.href===`${url.split('#')[0]}#${anchor}`));
  }
  const refs=[...activity.explanationRefs,...(activity.rubricRef?[activity.rubricRef]:[])];
  for(const id of refs){const resource=c.curriculumIndex.resources.get(id);if(resource.locator.type!=='inline')assert.ok(item.links.some(link=>link.href===c.resourceHref(resource)));}
  assert.equal(new Set(item.links.map(link=>link.href)).size,item.links.length);
  if(activity.feedbackStatus==='context-only')assert.match(item.feedback,/個別|개별 모범답안은 미작성/);
 }
});
test('browser models point to the control area and state approximation limits',()=>{
 for(const activity of c.catalog.activities.filter(a=>a.kind==='browser-model')){
  const item=studyResource({activityId:activity.id,role:'primary',coverage:'partial',review:{verdict:'unreviewed',reviewedRevision:null,evidenceRef:null}});
  assert.ok(item.links.length>0);assert.ok(item.links.every(link=>link.href.endsWith('#virtual-lab')));assert.match(item.limitation,/브라우저 근사/);
 }
});


test('report cards summarize the activity without repeating the full original manuscript',()=>{
 for(const activity of c.catalog.activities.filter(a=>a.kind==='report')){
  const item=studyResource({activityId:activity.id,role:'primary',coverage:'partial',review:{verdict:'unreviewed',reviewedRevision:null,evidenceRef:null}});
  assert.equal(item.title,'실습 보고서 · 기존 원고와 평가 안내');
  assert.ok(!item.title.includes('\n'));assert.ok(item.links.some(link=>link.href.endsWith(`#${activity.persistence.legacyId}`)));
 }
});
