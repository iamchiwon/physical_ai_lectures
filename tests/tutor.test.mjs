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
    assert.equal(upstream[0].response_format.type,"json_schema");
    assert.equal(upstream[0].provider.require_parameters,true);
    assert.deepEqual(upstream[0].reasoning,{effort:"low",exclude:true});
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

const learnerUpdate = (overrides={}) => ({
  topic:'좌표계 변환',understanding:'new',known:'행렬 곱의 기본 연산',difficulty:'변환 적용 순서',
  strategy:'좌표계 이름과 적용 순서를 연결해 설명',confidence:'high',evidenceKind:'self_report',
  evidenceQuote:'행렬 곱은 알지만 변환 순서는 모르겠어요',...overrides,
});
test('learner observations must be grounded in the actual question; bare questions cannot prove mastery',()=>{
  const update=learnerUpdate();
  assert.equal(shared.groundLearnerUpdates([update],'처음입니다').length,0);
  assert.equal(shared.groundLearnerUpdates([update],update.evidenceQuote).length,1);
  const inferred=shared.groundLearnerUpdates([learnerUpdate({evidenceKind:'question',understanding:'independent'})],update.evidenceQuote)[0];
  assert.equal(inferred.understanding,'unknown');assert.equal(inferred.confidence,'low');assert.equal(inferred.known,'');
});
test('learner state restores locally; chapter deletion rebuilds it from remaining evidence',()=>{
  const update=learnerUpdate();const storage=memoryStorage();const store=storageModule.createTutorStore(()=>storage);store.hydrate();
  const first={...stored('a'),question:update.evidenceQuote,learnerUpdates:[update]};
  const corrected=learnerUpdate({understanding:'guided',difficulty:'',evidenceQuote:'이제 변환 순서가 이해돼요'});
  const second={...stored('b','chapter-2'),question:corrected.evidenceQuote,learnerUpdates:[corrected]};
  store.update({turns:[first,second]},true);
  assert.equal(store.getSnapshot().learnerState[0].understanding,'guided');
  const restored=storageModule.createTutorStore(()=>storage);restored.hydrate();
  assert.equal(restored.getSnapshot().learnerState[0].difficulty,'');
  restored.reset('chapter-2');assert.equal(restored.getSnapshot().learnerState[0].understanding,'new');
  assert.deepEqual(restored.getSnapshot().learnerState[0].evidenceTurnIds,['a']);
  restored.reset();assert.deepEqual(restored.getSnapshot().learnerState,[]);
});
test('AI-only explanations, demo replies and unsupported guesses do not replace established learner facts',()=>{
  const update=learnerUpdate();
  const first={...stored('a'),question:update.evidenceQuote,learnerUpdates:[update]};
  const guess=learnerUpdate({understanding:'independent',evidenceKind:'question',evidenceQuote:'다시 알려주세요'});
  const later={...stored('b'),question:'다시 알려주세요',learnerUpdates:[guess]};
  const demo={...stored('demo'),mode:'demo',question:update.evidenceQuote,learnerUpdates:[learnerUpdate({topic:'Python'})]};
  const unsupported={...stored('unsupported'),question:'다시 알려주세요',learnerUpdates:[learnerUpdate({topic:'ROS'})]};
  const state=shared.deriveLearnerState([first,later,demo,unsupported]);
  assert.equal(state.length,1);assert.equal(state[0].understanding,'new');
});
test('learner context prioritizes relevant knowledge, stays within 800 tokens and counts toward total budget',()=>{
  const state=Array.from({length:12},(_,i)=>({...learnerUpdate({topic:i===11?'좌표계 변환':'다른 개념 '+i}),evidenceTurnIds:['evidence-'+i]}));
  const context=shared.learnerContext(state,'좌표계 변환');
  assert.match(context,/좌표계 변환/);assert.ok(shared.estimateTokens(context)<=800);
  const result=shared.buildTutorContext(shared.TUTOR_INSTRUCTIONS,{...lesson,contextSummary:'관측'.repeat(1900)},'좌표계 변환 '.repeat(120),'미해결 개념 '.repeat(100),Array.from({length:24},(_,i)=>turn('t'+i,'chapter-1','긴 답변 '.repeat(2000))),state);
  assert.ok(shared.messageTokens(result.messages)<=shared.TUTOR_INPUT_TOKENS);
  assert.ok(result.messages[1].content.startsWith('학습자 상태'));
});
test('output envelope separates visible answer from assessment and preserves plain Markdown compatibility',async()=>{
  const {parseTutorOutput,TUTOR_RESPONSE_FORMAT}=await load('apps/api/src/services/tutor-output.ts');
  assert.ok(shared.estimateTokens(JSON.stringify(TUTOR_RESPONSE_FORMAT))<=shared.TUTOR_FORMAT_RESERVE_TOKENS);
  const update=learnerUpdate();
  let result=parseTutorOutput(JSON.stringify({answer:'행렬 곱을 기준으로 설명드리겠습니다.',learnerUpdates:[update]}),update.evidenceQuote);
  assert.equal(result.learnerUpdates.length,1);assert.ok(!result.answer.includes('learnerUpdates'));
  result=parseTutorOutput(JSON.stringify({answer:'간결하게 설명드리겠습니다.',learnerUpdates:[{bad:'invalid'}]}),update.evidenceQuote);
  assert.deepEqual(result.learnerUpdates,[]);assert.equal(result.answer,'간결하게 설명드리겠습니다.');
  assert.equal(parseTutorOutput('**관측**부터 살펴보겠습니다.',update.evidenceQuote).learnerUpdates.length,0);
  assert.throws(()=>parseTutorOutput('{"answer":"unfinished',update.evidenceQuote));
  assert.throws(()=>parseTutorOutput('설명입니다. {"answer":"partial", "learnerUpdates": [',update.evidenceQuote));
  assert.equal(parseTutorOutput(JSON.stringify({answer:'설명입니다.',learnerUpdates:[update]}),update.evidenceQuote,true).learnerUpdates.length,0);
});
test('API injects persona and learner state, returns grounded updates without logging learner data',async()=>{
  const originalFetch=globalThis.fetch;const originals={info:console.info,warn:console.warn,error:console.error};const logs=[];
  for(const level of Object.keys(originals))console[level]=(...args)=>logs.push(args);
  const update=learnerUpdate({evidenceQuote:'PRIVATE_LEARNER 이제 이해했어요'});
  const state=[{...learnerUpdate(),evidenceTurnIds:['previous']}];
  let sent;let calls=0;
  try {
    globalThis.fetch=async(url,options)=>{
      calls++;sent=JSON.parse(options.body);
      return Response.json({model:'example/free',choices:[{message:{content:JSON.stringify({answer:'익숙한 행렬 곱과 연결해 설명드리겠습니다.',learnerUpdates:[update]})},finish_reason:'stop'}]});
    };
    const response=await app.request('/v1/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:update.evidenceQuote,lesson,learnerState:state})},{ALLOWED_ORIGINS:'http://localhost:3000',OPENROUTER_API_KEY:'PRIVATE_KEY'});
    const result=await response.json();
    assert.equal(result.mode,'openrouter');assert.equal(result.learnerUpdates.length,1);assert.equal(calls,1);
    assert.match(sent.messages[0].content,/1타 강사/);assert.match(sent.messages[0].content,/이모지는 사용하지 않는다/);assert.match(sent.messages[0].content,/존대말/);
    assert.ok(sent.messages.some(message=>message.content.startsWith('학습자 상태')));
    assert.ok(!JSON.stringify(logs).includes('PRIVATE_LEARNER'));assert.ok(!JSON.stringify(logs).includes('행렬 곱'));
  } finally {globalThis.fetch=originalFetch;Object.assign(console,originals);}
});

const retrieval = await load('apps/web/src/lib/tutor-retrieval.ts');
const lessonDocs = [{id:'current',title:'ROS 2 실습',content:'# ROS 2 실습\n\n'+('앞부분의 일반 설명입니다. '.repeat(600))+'\n\n## 초기화 예제\n\n노드 생성 전에 초기화합니다.\n\n```python\nimport rclpy\nrclpy.init()\nnode = rclpy.create_node("demo")\n```\n\n종료 시에는 shutdown을 호출합니다.\n'}];
test('retrieves code beyond the former 3900-character prefix and provides exact line numbers',()=>{
  const result=retrieval.retrieveLessonContext('이 코드의 두 번째 줄은 왜 필요한가요?',lessonDocs);
  assert.equal(result.state,'found');assert.match(result.text,/2: rclpy.init\(\)/);
  assert.match(result.text,/노드 생성 전에 초기화/);assert.ok(result.text.length<=4000);assert.ok(shared.estimateTokens(result.text)<=2000);
  assert.ok(!result.text.includes('앞부분의 일반 설명입니다. '.repeat(30)));
});
test('ambiguous code needs clarification; selected or uniquely visible code resolves the target',()=>{
  const docs=[{id:'two',title:'두 예제',content:'## 초기화\n```python\nimport rclpy\nrclpy.init()\n```\n\n## 종료\n```python\nnode.destroy_node()\nrclpy.shutdown()\n```'}];
  assert.equal(retrieval.retrieveLessonContext('이 코드의 두 번째 줄은?',docs).state,'ambiguous');
  const selected=retrieval.retrieveLessonContext('이 코드의 두 번째 줄은?',docs,{selectedText:'rclpy.shutdown()'});
  assert.match(selected.text,/2: rclpy.shutdown/);assert.ok(!selected.text.includes('2: rclpy.init'));
  const visible=retrieval.retrieveLessonContext('이 코드의 두 번째 줄은?',docs,{visibleCode:'node.destroy_node()\nrclpy.shutdown()'});
  assert.match(visible.text,/2: rclpy.shutdown/);
  const explicit=retrieval.retrieveLessonContext("두 번째 코드의 두 번째 줄은?",docs);
  assert.match(explicit.text,/2: rclpy.shutdown/);
});
test('unrelated questions omit the textbook, even if an earlier paragraph remains selected',()=>{
  const result=retrieval.retrieveLessonContext('오늘 점심 메뉴를 추천해주세요.',lessonDocs,{selectedText:'노드 생성 전에 초기화합니다.'});
  assert.equal(result.state,'none');assert.equal(result.text,'');
  const context=shared.buildTutorContext(shared.TUTOR_INSTRUCTIONS,{id:'a',title:'ROS 2'},'오늘 점심 메뉴는?', '',[]);
  assert.ok(!context.messages.at(-1).content.includes('노드 생성'));assert.match(context.messages.at(-1).content,/첨부된 본문 자료는 없습니다/);
});
test('missing code and invalid line numbers are explicit; retrieved context survives conversation storage',()=>{
  assert.equal(retrieval.retrieveLessonContext('이 코드의 두 번째 줄은?',[{id:'none',title:'개념',content:'코드 없는 개념 설명'}]).state,'not_found');
  const result=retrieval.retrieveLessonContext('이 코드의 99번째 줄은?',lessonDocs);assert.match(result.text,/존재하지 않으므로/);
  const state=storageModule.createTutorStore(()=>memoryStorage());state.hydrate();
  state.update({turns:[{...stored('code'),referenceContext:'코드 1\n2: rclpy.init()'}]},true);
  const history=storageModule.successfulTurns(state.getSnapshot().turns);
  assert.match(shared.turnMessages(history[0])[0].content,/당시 참고 본문/);
});
test('API can request one lookup and refuses repeated lookup after completion without leaking intermediate learner state',async()=>{
  const originalFetch=globalThis.fetch;const originalInfo=console.info;console.info=()=>{};
  try {
    globalThis.fetch=async()=>Response.json({choices:[{message:{content:JSON.stringify({answer:'관련 본문을 확인하겠습니다.',lookupQuery:'rclpy.init',learnerUpdates:[]})},finish_reason:'stop'}]});
    const env={ALLOWED_ORIGINS:'http://localhost:3000',OPENROUTER_API_KEY:'PRIVATE_KEY'};
    const request=(lookupComplete)=>app.request('/v1/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:'이 코드가 왜 필요한가요?',lesson:{id:'a',title:'실습'},lookupComplete})},env);
    const first=await (await request(false)).json();assert.equal(first.lookupQuery,'rclpy.init');
    const second=await (await request(true)).json();assert.equal(second.lookupQuery,undefined);assert.match(second.answer,/코드나 문장을 선택/);
  }finally{globalThis.fetch=originalFetch;console.info=originalInfo;}
});

test('a missing named function does not retrieve unrelated lab prose',()=>{
  const result=retrieval.retrieveLessonContext('missing_function() 함수가 실습 코드에 필요한 이유',lessonDocs);
  assert.equal(result.state,'not_found');assert.ok(!result.text.includes('rclpy.init'));
});
