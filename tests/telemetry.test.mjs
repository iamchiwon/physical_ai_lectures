import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
const bundle=await build({entryPoints:['apps/web/src/lib/telemetry-model.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {TELEMETRY_SCENARIOS:cases,telemetryView:view}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));

test('telemetry keeps field ages separate from heartbeat and retains last values without inventing current values',()=>{
 const fresh=view(cases.fresh.frame);assert.equal(fresh.heartbeatAgeMs,5);assert.equal(fresh.batteryAgeMs,100);assert.equal(fresh.mission,'RUNNING');assert.equal(fresh.batteryPct,80);
 const stale=view(cases.stale.frame);assert.equal(stale.heartbeatValid,true);assert.equal(stale.heartbeatAgeMs,5);assert.equal(stale.batteryAgeMs,250);assert.equal(stale.batteryPct,null);assert.equal(stale.mission,null);assert.equal(stale.lastBatteryPct,80);assert.equal(stale.batteryStampMs,900);assert.equal(stale.lastMission,'RUNNING');
 const offline=view(cases.offline.frame);assert.equal(offline.heartbeatAgeMs,255);assert.equal(offline.heartbeatValid,false);assert.equal(offline.batteryAgeMs,500);assert.equal(offline.batteryPct,null);
 const empty=view({...cases.fresh.frame,snapshot:null,events:[]});for(const field of ['batteryPct','lastBatteryPct','batteryAgeMs','mission','lastMission','lastSeq'])assert.equal(empty[field],null);assert.equal(empty.uniqueEvents,0);
});

test('telemetry includes exact TTL boundaries and distinguishes a measured zero battery from missing data',()=>{
 const boundary=view({...cases.fresh.frame,nowMs:1100,heartbeatMs:1000});assert.equal(boundary.heartbeatAgeMs,100);assert.equal(boundary.heartbeatValid,true);assert.equal(boundary.batteryAgeMs,200);assert.equal(boundary.batteryPct,80);assert.equal(boundary.mission,'RUNNING');
 const expired=view({...cases.fresh.frame,nowMs:1101,heartbeatMs:1000});assert.equal(expired.heartbeatValid,false);assert.equal(expired.batteryAgeMs,201);assert.equal(expired.batteryPct,null);assert.equal(expired.mission,null);
 const zero=view({...cases.fresh.frame,snapshot:{stampMs:1000,batteryPct:0}});assert.equal(zero.batteryPct,0);assert.equal(zero.lastBatteryPct,0);
});

test('telemetry preserves source order against delayed events and counts duplicate deliveries separately',()=>{
 const frame=cases.events.frame,before=structuredClone(frame),r=view(frame);assert.equal(r.receivedEvents,4);assert.equal(r.uniqueEvents,3);assert.equal(r.duplicates,1);assert.equal(r.lastSeq,12);assert.equal(r.mission,'ERROR');assert.equal(r.missionAgeMs,60);assert.equal(r.batteryAgeMs,300);assert.equal(r.batteryPct,null);assert.deepEqual(r.ledger.map(e=>e.disposition),['update','update','late','duplicate']);assert.deepEqual(frame,before);
 for(const order of [[2,0,1,3],[3,2,1,0],[1,0,3,2]]){const reordered=view({...frame,events:order.map(i=>frame.events[i])});assert.equal(reordered.lastSeq,12);assert.equal(reordered.mission,'ERROR');assert.equal(reordered.uniqueEvents,3);assert.equal(reordered.duplicates,1);}
 function freeze(value){Object.freeze(value);for(const nested of Object.values(value))if(nested&&typeof nested==='object')freeze(nested);return value;}const frozen=freeze(structuredClone(frame));assert.doesNotThrow(()=>view(frozen));
});

test('telemetry rejects conflicting identities clocks duplicate payloads invalid values and regressing source time',()=>{
 for(const change of [{robotId:'r2'},{bootId:'bootB'},{clockId:'Other'},{nowMs:NaN},{nowMs:-1},{heartbeatMs:1001},{heartbeatMs:.5},{snapshot:{stampMs:1001,batteryPct:80}},{snapshot:{stampMs:900,batteryPct:NaN}},{snapshot:{stampMs:900,batteryPct:101}},{snapshot:{stampMs:900,batteryPct:-1}}])assert.throws(()=>view({...cases.fresh.frame,...change}));
 for(const change of [{robotId:'r2'},{bootId:'bootB'},{seq:0},{seq:true},{seq:NaN},{stampMs:1001},{mission:'UNKNOWN'}])assert.throws(()=>view({...cases.fresh.frame,events:[{...cases.fresh.frame.events[0],...change}]}));
 for(const change of [{stampMs:1139},{mission:'RUNNING'}])assert.throws(()=>view({...cases.events.frame,events:[...cases.events.frame.events,{...cases.events.frame.events[1],...change}]}),/Conflicting duplicate/);
 assert.throws(()=>view({...cases.events.frame,events:[...cases.events.frame.events,{...cases.events.frame.events[1],seq:13,stampMs:1000}]}),/regressed/);
});
