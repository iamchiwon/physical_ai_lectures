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
  for(const raw of ['{invalid',JSON.stringify({version:2,turns:[],memory:null})]) {
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
  assert.equal(JSON.parse(storage.getItem(TUTOR_STORAGE_KEY)).turns[0].id,'new');
});
test('invalid external records invalidate pending requests and block later persistence',()=>{
  const storage=storageWith(null);const store=createTutorStore(()=>storage);store.hydrate();store.update({loading:true});
  const epoch=store.getSnapshot().epoch;storage.setItem(TUTOR_STORAGE_KEY,'broken');store.receiveStorage('broken');
  assert.ok(store.getSnapshot().epoch>epoch);assert.equal(store.getSnapshot().loading,false);
  store.update({turns:[turn]},true);assert.equal(storage.getItem(TUTOR_STORAGE_KEY),'broken');
});
