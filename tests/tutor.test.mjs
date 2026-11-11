import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';

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
test('headings label real prose without consuming retrieval slots or swallowing fenced comments',()=>{
  const result=retrieval.retrieveLessonContext('Wilson 구간', [{id:'facts',title:'평가',content:'## Wilson 구간\n\n첫 근거입니다.\n\n두 번째 근거입니다.\n\n세 번째 근거입니다.'}]);
  for(const text of ['첫 근거','두 번째 근거','세 번째 근거'])assert.ok(result.text.includes(text));
  assert.ok(!result.text.includes('\n## Wilson'));assert.equal((result.text.match(/자료 ID:/g)??[]).length,3);
  const code=retrieval.retrieveLessonContext('이 코드 첫 번째 줄은?', [{id:'comments',title:'주석',content:'## 계산\n```python\n# original comment\nx = 1\n```'}]);
  assert.match(code.text,/1: # original comment/);assert.match(code.text,/2: x = 1/);
});
test('literal fractions, decimals and percentages use exact boundaries and retain matching excerpts',()=>{
  for(const [literal,other]of [['18/20','118/200'],['0.95','10.950'],['90%','190%']]){
    const docs=[{id:'unrelated',title:'Wilson 구간',content:`다른 조건 ${other}의 일반 설명입니다.`},{id:'exact',title:'계산',content:`계산 입력 ${literal}의 실제 근거입니다.`}];
    const result=retrieval.retrieveLessonContext(`${literal} 계산`,docs);assert.match(result.text,/자료 ID: exact/);assert.ok(!result.text.includes('자료 ID: unrelated'));
    assert.equal(retrieval.retrieveLessonContext(literal,[docs[0]]).state,'none');
    assert.equal(retrieval.retrieveLessonContext(`${literal}.`,[docs[1]]).state,'found');
  }
  const text='Wilson '+('일반적인 배경 설명입니다. '.repeat(180))+'\n18/20의 실제 계산 근거입니다.';
  const result=retrieval.retrieveLessonContext('Wilson 18/20',[{id:'long',title:'긴 계산',content:text}]);
  assert.match(result.text,/18\/20의 실제 계산/);assert.ok(result.text.length<=4000);assert.ok(shared.estimateTokens(result.text)<=2000);
  const docs=[{id:'numbers',title:'계산',content:'0.95의 일반 계산'},{id:'focus',title:'선택',content:'사용자가 선택한 실제 근거'}];
  assert.match(retrieval.retrieveLessonContext('선택한 이 부분과 0.95 설명',docs,{selectedText:'사용자가 선택한 실제 근거'}).text,/자료 ID: focus/);
});
test('current M30.05 numeric comparison retrieves the worked Wilson intervals instead of heading-only or general prose',async()=>{
  const {parseAuthoredMarkdown}=await load('packages/shared/src/authored-format.ts');
  const authored=parseAuthoredMarkdown(fs.readFileSync('ebook/curriculum/M30/M30.05.md','utf8'));
  const legacy=fs.readFileSync('ebook/book/06_sim2real_deployment/chapter.md','utf8').split('## 6.6 ')[1].split('## 6.7 ')[0];
  const documents=[{id:'legacy',title:'평가 설계',content:legacy},{id:'authored-body',title:authored.title,content:authored.body},...authored.questions.map(q=>({id:q.id,title:`${authored.title} 해설`,content:q.answer}))];
  const result=retrieval.retrieveLessonContext('본문 18/20과 90/100의 Wilson 구간 수치와 표본 크기를 설명해 주세요.',documents);
  assert.match(result.text,/18\/20/);assert.match(result.text,/90\/100/);assert.match(result.text,/0\.699/);assert.match(result.text,/0\.972/);assert.match(result.text,/0\.826/);assert.match(result.text,/0\.945/);
  assert.ok(!result.text.includes('\n### 6.6.2'));assert.ok(result.text.length<=4000);assert.ok(shared.estimateTokens(result.text)<=2000);
});
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

test('rendered strong text selection retrieves the source paragraph instead of numeric competitors',()=>{
  const source='사전 통과 조건은 |힘 오차|≤0.10N이고 |가속도 오차|≤0.05m/s²를 **모두** 만족하는 것이다. 이번 힘 오차0.04N·가속도 오차0.02m/s²는 통과한다.';
  const selected=source.replace('**모두**','모두');
  const docs=[...Array.from({length:4},(_,i)=>({id:'competitor-'+i,title:'보정 조건과 기준',content:'여기서 힘오차0.04N과가속도오차0.02는 왜 통과인가요? 수치가 같은 다른 사례입니다.'})),{id:'authored:resource:M25.04:body',title:'미사용 평가',content:'# 기준\n\n'+source}];
  const result=retrieval.retrieveLessonContext('여기서 힘오차0.04N과가속도오차0.02는 왜 통과인가요?',docs,{selectedText:selected});
  assert.equal(result.state,'found');assert.match(result.text,/자료 ID: authored:resource:M25.04:body/);assert.ok(result.text.includes('0.10N'));assert.ok(result.text.includes('0.05m/s²'));assert.ok(result.text.includes('**모두**'));assert.ok(!result.text.includes('자료 ID: competitor-'));
  const underscore={id:'underscore',title:'조건',content:'서로 __모두__ 충족해야 합니다.'};assert.match(retrieval.retrieveLessonContext('선택한 이 조건은 왜 필요한가요?',[underscore],{selectedText:'서로 모두 충족해야 합니다.'}).text,/자료 ID: underscore/);
  const code=[{id:'python',title:'제곱 연산',content:'```python\nvalue = a ** b\n```'}];assert.match(retrieval.retrieveLessonContext('이 코드의 첫 번째 줄을 설명해주세요.',code,{selectedText:'value = a ** b'}).text,/1: value = a \*\* b/);
});

test('assessment passes the supplied body intact and limits feedback to grounded review rather than invented model answers',async()=>{
 const original=globalThis.fetch;const oldInfo=console.info;const oldWarn=console.warn;const logs=[];console.info=(...args)=>logs.push(args);console.warn=(...args)=>logs.push(args);
 const input={question:'이 모형의 이동 거리는?',answer:'0.2m',reference:'0.2m. 실제 장비 결과가 아닌 합성 계산이다.',context:'## 제공 모형\n속도4m/s·시간0.05s의 일정속도 합성 모형이다. 실제 장비를 실행하지 않는다. PRIVATE_BODY'};
 const upstream=[];
 try {
  globalThis.fetch=async(_url,options)=>{upstream.push(JSON.parse(options.body));return Response.json({choices:[{message:{content:'판정: 충분\n제공 모형의 단위와 합성 조건을 지켰습니다.'},finish_reason:'stop'}]});};
  const response=await app.request('/v1/assessment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)},{ALLOWED_ORIGINS:'http://localhost:3000',OPENROUTER_API_KEY:'PRIVATE_KEY'});
  assert.equal(response.status,200);const result=await response.json();assert.equal(result.mode,'openrouter');assert.equal(result.lessonContextIncluded,true);
  assert.deepEqual(JSON.parse(upstream[0].messages.find(m=>m.role==='user').content),input);
  const system=upstream[0].messages.find(m=>m.role==='system').content;
  assert.ok(system.includes('판정 유보'));assert.ok(system.includes('대안 풀이를 인정'));
  assert.ok(system.includes('긴 모범답안·전체 해설의 재작성·새 문제/조건을 만들지 않는다'));
  assert.ok(system.includes('context가 없으면'));assert.equal(upstream[0].max_tokens,1536);
  assert.ok(!JSON.stringify(logs).includes('PRIVATE_BODY'));assert.ok(!JSON.stringify(logs).includes('PRIVATE_KEY'));
 } finally {globalThis.fetch=original;console.info=oldInfo;console.warn=oldWarn;}
});
