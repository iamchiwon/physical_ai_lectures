import { build } from 'esbuild';
import test from 'node:test';
import assert from 'node:assert/strict';
const result = await build({stdin:{contents:'export {evaluateAnswer} from "./apps/web/src/lib/api-client.ts"; export {createLearningStore,LEARNING_STORAGE_KEY} from "./apps/web/src/lib/learning-store.ts"; export {assessmentRequestSchema} from "./packages/shared/src/index.ts"; export {AuthoredResponse} from "./apps/web/src/components/authored-response.tsx"; export {createElement} from "react"; export {renderToString} from "react-dom/server";',resolveDir:process.cwd()},define:{'process.env.NEXT_PUBLIC_API_BASE_URL':JSON.stringify('https://assessment.test')},nodePaths:[process.cwd()+'/apps/web/node_modules'],banner:{js:'import { createRequire } from "node:module"; const require=createRequire(process.cwd()+"/package.json");'},tsconfig:'apps/web/tsconfig.json',bundle:true,platform:'node',format:'esm',write:false});
const c=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));
function memory(){const data=new Map();return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};}
const id='authored:M13.03:q1';

test('unsubmitted authored answers do not render a freely openable solution in initial HTML',()=>{
 const html=c.renderToString(c.createElement(c.AuthoredResponse,{activityId:id,revision:'r1',question:'문제 내용',reference:'평가 근거',context:'본문 조건',solutionId:'solution',solution:c.createElement('p',null,'secret-rubric')}));
 assert.ok(html.includes('확인하기'));
 assert.ok(!html.includes('secret-rubric'));
 assert.ok(!html.includes('<details'));
 assert.ok(html.includes('한 번 선택하면'));
});

test('checked feedback survives reload and self-review but is cleared for a different answer',()=>{
 const storage=memory(),store=c.createLearningStore(()=>storage);store.hydrate();
 assert.equal(store.saveActivity(id,'r1','2m'),true);
 assert.equal(store.saveFeedback(id,'r1','2m','충분: 계산과 단위가 맞습니다.'),true);
 assert.equal(store.saveActivity(id,'r1','2m',true),true);
 const reloaded=c.createLearningStore(()=>storage);reloaded.hydrate();
 assert.equal(reloaded.getSnapshot().data.activityRecords[id].feedback,'충분: 계산과 단위가 맞습니다.');
 assert.equal(reloaded.getSnapshot().data.activityRecords[id].evidence,'self-reviewed');
 reloaded.saveActivity(id,'r1','2m');
 assert.equal(reloaded.getSnapshot().data.activityRecords[id].feedback,undefined);
 reloaded.saveFeedback(id,'r1','2m','두 번째 평가');
 reloaded.saveActivity(id,'r1','3m');
 assert.equal(reloaded.getSnapshot().data.activityRecords[id].feedback,undefined);
 assert.equal(reloaded.getSnapshot().data.activityRecords[id].evidence,'');
});

test('late feedback cannot replace a revised answer or cross a content revision',()=>{
 const storage=memory(),store=c.createLearningStore(()=>storage);store.hydrate();
 store.saveActivity(id,'r1','first');store.saveFeedback(id,'r1','first','first feedback');
 store.saveActivity(id,'r1','second');
 assert.equal(store.saveFeedback(id,'r1','first','late first feedback'),false);
 store.saveFeedback(id,'r1','second','second feedback');store.saveActivity(id,'r2','second');
 assert.equal(store.saveFeedback(id,'r1','second','late r1 feedback'),false);
 assert.equal(store.getSnapshot().data.activityRecords[id].feedback,undefined);
 assert.equal(store.getSnapshot().data.activityRecords[id+'@r1'].feedback,'second feedback');
});

test('assessment storage does not overwrite a concurrent tab and short numeric answers are valid',()=>{
 const storage=memory(),store=c.createLearningStore(()=>storage);store.hydrate();store.saveActivity(id,'r1','0');
 storage.setItem(c.LEARNING_STORAGE_KEY,'external record');
 assert.equal(store.saveFeedback(id,'r1','0','feedback'),false);
 assert.equal(storage.getItem(c.LEARNING_STORAGE_KEY),'external record');
 assert.equal(c.assessmentRequestSchema.safeParse({question:'거리?',answer:'0',reference:'0m'}).success,true);
 assert.equal(c.assessmentRequestSchema.safeParse({question:'거리?',answer:'  ',reference:'0m'}).success,false);
});

test('a context-aware check rejects an old API response that cannot confirm lesson context delivery',async()=>{
 const original=globalThis.fetch;
 const input={question:'거리 계산',answer:'0.2m',reference:'0.2m',context:'속도4m/s·시간.05s인 합성 모형'};
 try {
  globalThis.fetch=async()=>Response.json({feedback:'old ungrounded feedback',mode:'openrouter'});
  await assert.rejects(c.evaluateAnswer(input),/본문 문맥 전달을 확인하지 못했습니다/);
  globalThis.fetch=async()=>Response.json({feedback:'grounded feedback',mode:'openrouter',lessonContextIncluded:true});
  assert.equal((await c.evaluateAnswer(input)).feedback,'grounded feedback');
  globalThis.fetch=async()=>Response.json({feedback:'AI 연결 없음: 자기검토 안내',mode:'self-review',lessonContextIncluded:false});
  assert.equal((await c.evaluateAnswer(input)).mode,'self-review');
 } finally {globalThis.fetch=original;}
});
