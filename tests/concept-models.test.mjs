import {build} from 'esbuild';import assert from 'node:assert/strict';import {test} from 'node:test';
async function load(entry){const b=await build({entryPoints:[entry],tsconfig:'apps/web/tsconfig.json',bundle:true,platform:'node',format:'esm',write:false});return import(`data:text/javascript;base64,${Buffer.from(b.outputFiles[0].text).toString('base64')}`);}
const {solvePlanarArm,advanceJointAngle}=await load('apps/web/src/components/virtual-lab.tsx');const {simulateControlModel,CONTROL_SAMPLE_TIMES}=await load('apps/web/src/lib/control-model.ts');
const parameters={kp:1,ki:1,kd:0,sampleTime:0.1,delaySamples:0,antiWindup:true};const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,`${a} != ${b}`);
const {calculateWheelModel,wheelForward,wheelInverse}=await load('apps/web/src/lib/wheel-model.ts');
const wheelDefaults={mode:'mecanum',radius:0.1,span:0.4,vx:0.2,vy:0.1,omega:0,limit:2,rrOffset:1};
const {calculateThreshold,SYNTHETIC_SCORES}=await load('apps/web/src/lib/threshold-model.ts');
const {calculateProjection}=await load('apps/web/src/lib/projection-model.ts');
const projectionDefaults={fx:400,fy:400,cx:320,cy:240,x:0.1,y:0.05,z:1,vx:0.2,deltaTime:0.05};
test('synthetic threshold equality, confusion counts, metrics and total cost match independent hand calculations',()=>{
 assert.deepEqual(SYNTHETIC_SCORES.map(r=>[r.scorePercent,r.label]),[[95,1],[90,0],[80,1],[70,0],[60,1],[40,0],[30,1],[10,0]]);
 const r=calculateThreshold(50,2,3);assert.deepEqual([r.TP,r.FP,r.FN,r.TN],[3,2,1,2]);close(r.precision,0.6);close(r.recall,0.75);close(r.f1,2/3);close(r.totalCost,7);
 const equal=calculateThreshold(95,1,1);assert.equal(equal.rows[0].predicted,true);assert.deepEqual([equal.TP,equal.FP,equal.FN,equal.TN],[1,0,3,4]);
 const none=calculateThreshold(100,1,1);assert.equal(none.precision,null);close(none.recall,0);close(none.f1,0);
 const all=calculateThreshold(0,0,0);assert.deepEqual([all.TP,all.FP,all.FN,all.TN],[4,4,0,0]);close(all.totalCost,0);
 let previousPositive=8;for(let t=0;t<=100;t++){const m=calculateThreshold(t,1,1);assert.equal(m.TP+m.FP+m.FN+m.TN,8);assert.ok(m.TP+m.FP<=previousPositive);previousPositive=m.TP+m.FP;}
 for(const args of [[50.5,1,1],[-1,1,1],[101,1,1],[NaN,1,1],[50,-1,1],[50,1,Infinity],[50,11,1]])assert.throws(()=>calculateThreshold(...args));
});
test('pinhole SI projection, signed same-clock time offset and depth scaling match hand calculations',()=>{
 const p=calculateProjection(projectionDefaults);close(p.original.u,360);close(p.original.v,260);close(p.shifted.u,364);close(p.shifted.v,260);close(p.deltaU,4);close(p.deltaX,0.01);close(p.range,Math.sqrt(1.0125));assert.ok(p.range>1);
 const backward=calculateProjection({...projectionDefaults,deltaTime:-0.05});close(backward.deltaU,-4);close(backward.shifted.u,356);close(backward.deltaX,-0.01);
 const doubleDepth=calculateProjection({...projectionDefaults,z:2});close(doubleDepth.deltaU,2);close(doubleDepth.original.u,340);close(doubleDepth.original.v,250);
 const doubledFx=calculateProjection({...projectionDefaults,fx:800});close(doubledFx.deltaU,8);close(doubledFx.deltaX,p.deltaX);
 for(const z of [0.1,0.7,5])for(const fx of [50,400,800])for(const vx of [-1,0,1]){const m=calculateProjection({...projectionDefaults,z,fx,vx});close(m.deltaU*z/fx,m.deltaX);close(m.shifted.u-m.original.u,m.deltaU);}
});
test('pinhole frame uses half-open pixel bounds without clamping valid out-of-frame projections and rejects invalid inputs',()=>{
 const origin=calculateProjection({...projectionDefaults,cx:0,cy:0,x:0,y:0,vx:0});assert.equal(origin.original.inside,true);
 const right=calculateProjection({...projectionDefaults,x:0.8,y:0,vx:0});close(right.original.u,640);assert.equal(right.original.inside,false);
 const bottom=calculateProjection({...projectionDefaults,x:0,y:0.6,vx:0});close(bottom.original.v,480);assert.equal(bottom.original.inside,false);
 const outside=calculateProjection({...projectionDefaults,x:1,y:-1,z:0.1});close(outside.original.u,4320);close(outside.original.v,-3760);assert.equal(outside.original.inside,false);
 for(const bad of [{z:0},{z:-1},{fx:0},{fy:NaN},{deltaTime:0.3},{vx:Infinity},{cx:641}])assert.throws(()=>calculateProjection({...projectionDefaults,...bad}));
});
test('wheel SI formulas reproduce differential and mecanum textbook hand calculations',()=>{
 const d=wheelForward('differential',[4,8],0.05,0.3);close(d.vx,0.3);close(d.vy,0);close(d.omega,2/3);
 wheelInverse('differential',d,0.05,0.3).forEach((v,i)=>close(v,[4,8][i]));
 const m=calculateWheelModel({...wheelDefaults,limit:3});m.requested.forEach((v,i)=>close(v,[1,3,3,1][i]));
 m.recorded.forEach((v,i)=>close(v,[1,3,3,2][i]));close(m.estimate.vx,0.225);close(m.estimate.vy,0.075);close(m.estimate.omega,0.0625);
 m.reconstructed.forEach((v,i)=>close(v,[1.25,3.25,2.75,1.75][i]));m.residual.forEach((v,i)=>close(v,[-0.25,-0.25,0.25,0.25][i]));close(m.consistency,-1);close(m.residualNorm,0.5);
});
test('wheel common scaling preserves body proportions and keeps synthetic recording separate from command limits',()=>{
 const m=calculateWheelModel(wheelDefaults);close(m.scale,2/3);close(m.achieved.vx,0.2*2/3);close(m.achieved.vy,0.1*2/3);close(m.achieved.omega,0);
 assert.ok(m.limited.every(v=>Math.abs(v)<=2+1e-12));close(m.recorded[3],2/3+1);close(m.estimate.vx,0.2*2/3+0.025);
 const outside=calculateWheelModel({...wheelDefaults,rrOffset:3});assert.ok(outside.recorded[3]>outside.limited[3]&&outside.recorded[3]>2);
 for(const mode of ['differential','mecanum'])for(const vx of [-1,0,1])for(const omega of [-3,0,3]){const result=calculateWheelModel({...wheelDefaults,mode,vx,vy:mode==='differential'?0:-0.7,omega,rrOffset:0});close(result.achieved.vx,vx*result.scale);close(result.achieved.vy,(mode==='differential'?0:-0.7)*result.scale);close(result.achieved.omega,omega*result.scale);result.residual.forEach(v=>close(v,0));}
 const zero=calculateWheelModel({...wheelDefaults,vx:0,vy:0,omega:0,rrOffset:0});close(zero.scale,1);assert.ok(zero.limited.every(v=>v===0));
});
test('wheel calculator rejects unsupported lateral differential motion and invalid geometry or finite bounds',()=>{
 assert.throws(()=>calculateWheelModel({...wheelDefaults,mode:'differential'}));
 assert.throws(()=>wheelInverse('differential',{vx:0,vy:0.1,omega:0},0.1,0.3));
 for(const bad of [{radius:0},{radius:NaN},{span:-1},{limit:0},{omega:Infinity},{rrOffset:4},{vy:2},{mode:'omni'}])assert.throws(()=>calculateWheelModel({...wheelDefaults,...bad}));
 assert.throws(()=>wheelForward('mecanum',[1,2],0.1,0.4));assert.throws(()=>wheelForward('differential',[1,2],0,0.4));assert.throws(()=>wheelInverse('mecanum',{vx:0,vy:0,omega:0},0,0.4));
});
test('2R IK rejects inner/outer unreachable goals instead of clamping and resolves both workspace boundaries',()=>{
 for(const [x,y,reason] of [[0,0,'inner'],[13,0,'inner'],[143,0,'outer'],[142+1e-8,0,'outer'],[14-1e-8,0,'inner'],[100,110,'outer']]){const s=solvePlanarArm(x,y);assert.equal(s.reachable,false);assert.equal(s.reason,reason);assert.ok(!('q1Degrees'in s));}
 for(const [x,y]of [[14,0],[142,0],[-142,0],[0,142],[120,55]]){const s=solvePlanarArm(x,y);assert.equal(s.reachable,true);const q1=s.q1Degrees*Math.PI/180,q2=s.q2Degrees*Math.PI/180;close(78*Math.cos(q1)+64*Math.cos(q1+q2),x);close(78*Math.sin(q1)+64*Math.sin(q1+q2),y);}
 assert.equal(solvePlanarArm(14,0).singular,true);assert.equal(solvePlanarArm(142,0).singular,true);assert.equal(solvePlanarArm(NaN,0).reachable,false);assert.throws(()=>solvePlanarArm(0,0,0,64));
 close(advanceJointAngle(179,-179),179.32);close(advanceJointAngle(-179,179),-179.32);
});
test('exact-ZOH first step, conditional integral update and zero/positive command delays match hand calculations',()=>{
 const on=simulateControlModel(parameters),off=simulateControlModel({...parameters,antiWindup:false});
 close(simulateControlModel({...parameters,kd:1}).points[0].rawCommand,on.points[0].rawCommand);close(on.points[0].integral,0);close(off.points[0].integral,0.15);close(on.points[0].command,1);close(on.points[0].appliedCommand,1);close(on.points[1].output,1-Math.exp(-0.1));close(on.points[1].output,off.points[1].output);
 const delayed=simulateControlModel({...parameters,delaySamples:2});close(delayed.points[0].command,1);close(delayed.points[0].appliedCommand,0);close(delayed.points[1].appliedCommand,0);close(delayed.points[2].appliedCommand,1);close(delayed.points[2].output,0);close(delayed.points[3].output,1-Math.exp(-0.1));
});
test('same-model anti-windup comparison shows faster recovery after an unreachable demand without implying universal superiority',()=>{
 const on=simulateControlModel(parameters),off=simulateControlModel({...parameters,antiWindup:false});assert.ok(on.blockedIntegrations>0);assert.ok(on.recoveryEntryTime<off.recoveryEntryTime);assert.ok(on.saturationTime<off.saturationTime);
 assert.ok(on.points[40].integral<off.points[40].integral);assert.equal(on.points[39].reference,1.5);assert.equal(on.points[40].reference,0.2);
 const p=simulateControlModel({...parameters,ki:0}),same=simulateControlModel({...parameters,ki:0,antiWindup:false});assert.deepEqual(p.points,same.points);assert.equal(p.blockedIntegrations,0);
});
test('documented parameter corners stay finite, preserve plant bounds and use consistent sample intervals',()=>{
 for(const sampleTime of CONTROL_SAMPLE_TIMES)for(const delaySamples of [0,8])for(const antiWindup of [true,false]){const result=simulateControlModel({...parameters,kp:5,ki:4,kd:1,sampleTime,delaySamples,antiWindup});assert.equal(result.points.length,Math.round(12/sampleTime));assert.ok(result.points.every(p=>Object.values(p).every(v=>typeof v!=='number'||Number.isFinite(v))&&p.output>=-1-1e-12&&p.output<=1+1e-12&&Math.abs(p.command)<=1&&Math.abs(p.appliedCommand)<=1));close(result.saturationIntervals.reduce((sum,i)=>sum+i.end-i.start,0),result.saturationTime);}
 const zero=simulateControlModel({...parameters,kp:0,ki:0,kd:0});assert.ok(zero.points.every(point=>point.output===0&&point.command===0));assert.equal(zero.saturationTime,0);assert.equal(zero.recoveryEntryTime,null);
 for(const bad of [{sampleTime:0},{delaySamples:1.5},{delaySamples:9},{kp:NaN},{ki:-1}])assert.throws(()=>simulateControlModel({...parameters,...bad}));
});
