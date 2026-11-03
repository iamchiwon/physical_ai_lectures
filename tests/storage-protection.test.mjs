import { build } from 'esbuild';
import assert from 'node:assert/strict';
import { test } from 'node:test';
const result = await build({entryPoints:['apps/web/src/lib/tutor-store.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {createTutorStore,TUTOR_STORAGE_KEY} = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
function storageWith(raw) {
  const data = new Map([[TUTOR_STORAGE_KEY,raw]]);
  return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
}
const turn = {id:'new',chapterId:'module-M06',chapterTitle:'기구학',lessonId:'unit-m06-02-a',lessonTitle:'FK',question:'FK란 무엇인가요?',status:'pending'};
test('corrupt and future tutor records survive new questions and reset unchanged',()=>{
  for(const raw of ['', '{invalid',JSON.stringify({version:2,turns:[],memory:null})]) {
    const storage=storageWith(raw);const store=createTutorStore(()=>storage);store.hydrate();
    store.update({turns:[turn]},true);
    assert.equal(storage.getItem(TUTOR_STORAGE_KEY),raw);
    assert.equal(store.getSnapshot().turns.length,1);
    store.reset();assert.equal(storage.getItem(TUTOR_STORAGE_KEY),raw);assert.ok(store.getSnapshot().storageNotice);
  }
});
test('concurrent unseen storage edits are preserved instead of overwritten',()=>{
  const storage=storageWith(null);const store=createTutorStore(()=>storage);store.hydrate();
  const external=JSON.stringify({version:1,turns:[],memory:null});storage.setItem(TUTOR_STORAGE_KEY,external);
  store.update({turns:[turn]},true);assert.equal(storage.getItem(TUTOR_STORAGE_KEY),external);assert.ok(store.getSnapshot().storageNotice);
  store.receiveStorage(external);store.update({turns:[turn]},true);
  assert.equal(storage.getItem(TUTOR_STORAGE_KEY),external);
  assert.equal(store.getSnapshot().turns[0].id,'new');
  const reloaded=createTutorStore(()=>storage);reloaded.hydrate();reloaded.update({turns:[turn]},true);
  assert.equal(JSON.parse(storage.getItem(TUTOR_STORAGE_KEY)).turns[0].id,'new');
});
test('invalid external records invalidate pending requests and block later persistence',()=>{
  const storage=storageWith(null);const store=createTutorStore(()=>storage);store.hydrate();store.update({loading:true});
  const epoch=store.getSnapshot().epoch;storage.setItem(TUTOR_STORAGE_KEY,'broken');store.receiveStorage('broken');
  assert.ok(store.getSnapshot().epoch>epoch);assert.equal(store.getSnapshot().loading,false);
  store.update({turns:[turn]},true);assert.equal(storage.getItem(TUTOR_STORAGE_KEY),'broken');
});

test('quota-failed local conversations survive external updates while pending requests are invalidated',()=>{
  let raw=null;let fail=true;
  const storage={getItem:()=>raw,setItem:(_,value)=>{if(fail)throw Error('quota');raw=value;},removeItem:()=>{raw=null;}};
  const store=createTutorStore(()=>storage);store.hydrate();store.update({turns:[turn],loading:true},true);
  const epoch=store.getSnapshot().epoch;
  const external=JSON.stringify({version:1,turns:[],memory:null});raw=external;fail=false;store.receiveStorage(external);
  assert.equal(store.getSnapshot().turns[0].id,'new');assert.equal(store.getSnapshot().turns[0].status,'failed');
  assert.equal(store.getSnapshot().loading,false);assert.ok(store.getSnapshot().epoch>epoch);assert.ok(store.getSnapshot().storageNotice);
  store.update({turns:[{...turn,id:'local-next'}]},true);assert.equal(raw,external);
});
test('explicit external deletion clears local conversation and invalidates unsaved requests',()=>{
  let raw=null;
  const storage={getItem:()=>raw,setItem:()=>{throw Error('quota');},removeItem:()=>{raw=null;}};
  const store=createTutorStore(()=>storage);store.hydrate();store.update({turns:[turn],loading:true},true);
  const epoch=store.getSnapshot().epoch;store.receiveStorage(null);
  assert.deepEqual(store.getSnapshot().turns,[]);assert.equal(store.getSnapshot().loading,false);assert.ok(store.getSnapshot().epoch>epoch);
});
test('a concurrent write after setItem is detected by the next write instead of accepted as our baseline',()=>{
  let raw=null;
  const external=JSON.stringify({version:1,turns:[],memory:null});
  const storage={getItem:()=>raw,setItem:()=>{raw=external;},removeItem:()=>{raw=null;}};
  const store=createTutorStore(()=>storage);store.hydrate();store.update({turns:[turn]},true);
  store.update({turns:[{...turn,id:'next'}]},true);
  assert.equal(raw,external);assert.ok(store.getSnapshot().storageNotice);
});
