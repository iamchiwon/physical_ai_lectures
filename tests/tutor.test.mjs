import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { test } from 'node:test';

async function load(entry) {
  const result = await build({entryPoints:[entry],bundle:true,platform:'node',format:'esm',write:false});
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}
const shared = await load('packages/shared/src/index.ts');
const storageModule = await load('apps/web/src/lib/tutor-store.ts');
const {default:app} = await load('apps/api/src/index.ts');
const lesson = {id:'a1',title:'관측',contextSummary:'로봇의 관측과 상태'};
const turn = (id,chapterId='chapter-1',answer='센서 관측은 상태의 일부입니다.') => ({id,chapterId,chapterTitle:chapterId,lessonId:id,lessonTitle:'단원 '+id,question:'관측의 의미를 알려주세요.',answer});
const stored = (id,chapterId='chapter-1') => ({...turn(id,chapterId),status:'answered',mode:'openrouter'});
function memoryStorage() {
  const data = new Map();
  return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
}

test('restores all chapters; chapter reset removes associated summary and preserves other raw turns',()=>{
  const storage=memoryStorage(); const store=storageModule.createTutorStore(()=>storage); store.hydrate();
  store.update({turns:[stored('a'),stored('b','chapter-2'),stored('c')],memory:{content:'chapter-1 private facts',throughId:'b'}},true);
  const restored=storageModule.createTutorStore(()=>storage);restored.hydrate();
  assert.equal(restored.getSnapshot().turns.length,3);
  restored.reset('chapter-1');
  assert.deepEqual(restored.getSnapshot().turns.map(t=>t.id),['b']);assert.equal(restored.getSnapshot().memory,null);
  assert.ok(!storage.getItem(storageModule.TUTOR_STORAGE_KEY).includes('private facts'));
  assert.deepEqual(shared.afterMemory(storageModule.successfulTurns(restored.getSnapshot().turns),null).map(t=>t.id),['b']);
  restored.reset();assert.equal(storage.getItem(storageModule.TUTOR_STORAGE_KEY),null);
});
test('reload marks pending as failed; demo/failed replies never become AI history',()=>{
  const storage=memoryStorage();const store=storageModule.createTutorStore(()=>storage);store.hydrate();
  store.update({turns:[stored('ok'),{...stored('demo'),mode:'demo'},{...stored('failed'),status:'failed'},{...stored('pending'),status:'pending'}]},true);
  const restored=storageModule.createTutorStore(()=>storage);restored.hydrate();
  assert.equal(restored.getSnapshot().turns.at(-1).status,'failed');
  assert.deepEqual(storageModule.successfulTurns(restored.getSnapshot().turns).map(t=>t.id),['ok']);
});
test('quota/read corruption failures keep in-memory content and produce recoverable warnings',()=>{
  const broken={getItem:()=>'{bad json',setItem:()=>{throw Error('quota')},removeItem:()=>{throw Error('denied')}};
  const store=storageModule.createTutorStore(()=>broken);store.hydrate();assert.ok(store.getSnapshot().storageNotice);
  store.update({turns:[stored('a')]},true);assert.equal(store.getSnapshot().turns.length,1);assert.ok(store.getSnapshot().storageNotice);
  store.reset();assert.equal(store.getSnapshot().turns.length,0);assert.ok(store.getSnapshot().storageNotice);
});
test('storage changes and deletion invalidate in-flight request epochs',()=>{
  const store=storageModule.createTutorStore(()=>memoryStorage());store.hydrate();
  store.update({turns:[stored('a')],loading:true});const epoch=store.getSnapshot().epoch;
  store.receiveStorage(null);assert.equal(store.getSnapshot().loading,false);assert.ok(store.getSnapshot().epoch>epoch);
  const external=store.getSnapshot().epoch;store.reset('chapter-1');assert.ok(store.getSnapshot().epoch>external);
});
test('context is bounded, preserves role order and latest cross-chapter turn, and includes summary',()=>{
  const turns=Array.from({length:40},(_,i)=>turn('t'+i,i%2?'chapter-2':'chapter-1','아주 긴 설명입니다. '.repeat(1000)));
  const result=shared.buildTutorContext('강사 지침',lesson,'방금 설명한 예시는?', '학습자의 오개념과 미해결 질문',turns);
  assert.ok(shared.messageTokens(result.messages)<=shared.TUTOR_INPUT_TOKENS);
  assert.ok(result.omittedTurns>0);assert.ok(result.messages.some(m=>m.role==='assistant'));
  assert.ok(result.messages.some(m=>m.content.includes('t39')));
  assert.equal(result.messages.at(-1).role,'user');assert.match(result.messages.at(-1).content,/이번 질문/);
  assert.ok(result.messages.some(m=>m.content.includes('미해결 질문')));
  assert.equal(shared.afterMemory(turns,{content:'summary',throughId:'t30'})[0].id,'t31');
});
test('summary input and text clipping use bounded token estimates',()=>{
  const turns=Array.from({length:8},(_,i)=>turn('a'+i,'chapter-1','긴 설명 '.repeat(5000)));
  const chunk=shared.selectSummaryChunk('기존 요약',turns);
  assert.ok(chunk.length>0&&chunk.length<8);
  const input=shared.summaryInput('기존 요약',chunk);
  assert.ok(shared.estimateTokens(input)<=shared.TUTOR_SUMMARY_INPUT_TOKENS);
  const clipped=shared.clipTokens('관측과 상태 '.repeat(5000),1500);assert.ok(shared.estimateTokens(clipped)<=1500);
});
test('API sends assistant history, summarizes without logging content, and rejects failed summaries',async()=>{
  const originalFetch=globalThis.fetch; const originals={info:console.info,warn:console.warn,error:console.error};const logs=[];
  for(const level of Object.keys(originals))console[level]=(...args)=>logs.push(args);
  const env={ALLOWED_ORIGINS:'http://localhost:3000',OPENROUTER_API_KEY:'PRIVATE_KEY'};
  const request=(path,body)=>app.request('/v1/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)},env);
  let upstream=[];let responsePayload={model:'example/free',choices:[{message:{content:'관측을 이어서 설명합니다.'},finish_reason:'stop'}]};
  try {
    globalThis.fetch=async(url,options)=>{upstream.push(JSON.parse(options.body));return Response.json(responsePayload);};
    let response=await request('tutor',{question:'PRIVATE_QUESTION 이어서 설명해주세요.',lesson,history:[turn('old','chapter-2','PRIVATE_ANSWER')],summary:'PRIVATE_SUMMARY'});
    assert.equal(response.status,200);assert.equal((await response.json()).mode,'openrouter');
    assert.ok(upstream[0].messages.some(m=>m.role==='assistant'&&m.content==='PRIVATE_ANSWER'));
    assert.ok(upstream[0].messages.some(m=>m.content.includes('PRIVATE_SUMMARY')));
    assert.deepEqual(upstream[0].provider.max_price,{prompt:0,completion:0});
    responsePayload={choices:[{message:{content:'이전 질문과 미해결 과제를 요약했습니다.'},finish_reason:'stop'}]};
    response=await request('tutor/summary',{previousSummary:'PRIVATE_SUMMARY',turns:[turn('old')]});
    assert.equal(response.status,200);assert.ok((await response.json()).summary);
    assert.equal(upstream.at(-1).max_tokens,2048);
    for(const finish of ['length','error','content_filter']) {
      responsePayload={choices:[{message:{content:'incomplete summary'},finish_reason:finish}]};
      assert.equal((await request('tutor/summary',{turns:[turn('old')]})).status,502);
    }
    globalThis.fetch=async()=>Response.json({error:{code:429,message:'PRIVATE_PROVIDER_MESSAGE'}},{status:429});
    assert.equal((await request('tutor/summary',{turns:[turn('old')]})).status,502);
    assert.equal((await request('tutor/summary',{turns:[]})).status,400);
    assert.equal((await request('tutor',{question:'followup',lesson,history:Array(25).fill(turn('a'))})).status,400);
    const serialized=JSON.stringify(logs);
    for(const secret of ['PRIVATE_KEY','PRIVATE_QUESTION','PRIVATE_ANSWER','PRIVATE_SUMMARY','PRIVATE_PROVIDER_MESSAGE'])assert.ok(!serialized.includes(secret));
  } finally {globalThis.fetch=originalFetch;Object.assign(console,originals);}
});
