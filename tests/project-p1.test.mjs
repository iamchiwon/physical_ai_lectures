import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root=process.cwd(),dir=path.join(root,'examples/P1');
const python=process.env.PHYSICAL_AI_PYTHON??'python3';
const hash=raw=>createHash('sha256').update(raw).digest('hex');
function run(args){const r=spawnSync(python,[path.join(dir,'runner.py'),...args],{encoding:'utf8',timeout:10000});assert.ifError(r.error);return r;}
function probe(script){const prelude=`import importlib.util,json\ns=importlib.util.spec_from_file_location('p1',${JSON.stringify(path.join(dir,'runner.py'))})\nm=importlib.util.module_from_spec(s);s.loader.exec_module(m)\n`;const r=spawnSync(python,['-c',prelude+script],{encoding:'utf8',timeout:10000});assert.ifError(r.error);assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);}

test('P1 replay preserves all input rows and reports detection loss, stale data and controlled reacquisition',()=>{
 const input=path.join(dir,'frames.json'),before=fs.readFileSync(input),r=run(['--mode','replay','--input',input]);assert.equal(r.status,0,r.stderr);const report=JSON.parse(r.stdout);
 assert.equal(report.input_sha256,hash(before));assert.equal(report.source_sha256,hash(fs.readFileSync(path.join(dir,'runner.py'))));assert.deepEqual(fs.readFileSync(input),before);
 assert.deepEqual(report.rows.map(r=>r.state),['ACQUIRING','TRACKING','LOST','STALE','ACQUIRING','TRACKING','AMBIGUOUS','INVALID','INVALID','ACQUIRING','TRACKING']);
 assert.deepEqual(report.rows.map(r=>r.frame_id),Array.from({length:11},(_,i)=>i));
 assert.deepEqual(report.rows.map(r=>r.command_px_per_step),[0,.25,0,0,0,-.25,0,0,0,0,0]);assert.ok(report.rows.every(r=>Math.abs(r.command_px_per_step)<=.25));
 const ref=JSON.parse(fs.readFileSync(path.join(dir,'reference/replay.json')));assert.deepEqual(report.rows,ref.rows);assert.equal(report.units,'virtual pixels per step');
});

test('P1 clock, axis and pixel boundaries fail closed and reset the two-observation recovery rule',()=>{
 const result=probe(`import copy\ndef f(i,t,c):return {'frame_id':i,'t_ms':t,'captured_ms':c,'image':m.image_at([5])}\nc=m.Controller()\nsequence=[c.step(f(*values)) for values in [(0,100,0),(1,150,50),(2,200,99),(3,250,250),(4,300,300),(4,350,350),(5,300,300),(6,400,400),(7,450,450)]]\nbad=[]\nfor kind in ['axis','bool','range','future','negative','missing','width','nan']:\n x=f(0,0,0)\n if kind=='axis':x['image']['pixels']=list(map(list,zip(*x['image']['pixels'])))\n if kind=='bool':x['image']['pixels'][1][5][0]=True\n if kind=='range':x['image']['pixels'][1][5][0]=256\n if kind=='future':x['captured_ms']=1\n if kind=='negative':x['t_ms']=-1\n if kind=='missing':del x['image']\n if kind=='width':x['image']['width']=0\n if kind=='nan':x['image']['pixels'][1][5][0]=float('nan')\n bad.append(m.Controller().step(x))\nprint(json.dumps({'sequence':sequence,'bad':bad}))\n`);
 assert.deepEqual(result.sequence.map(r=>r.state),['ACQUIRING','TRACKING','STALE','ACQUIRING','TRACKING','INVALID','INVALID','ACQUIRING','TRACKING']);assert.equal(result.sequence[1].age_ms,100);assert.equal(result.sequence[2].age_ms,101);
 for(const row of [...result.bad,...result.sequence.filter(r=>r.state!=='TRACKING')]){assert.equal(row.command_px_per_step,0);assert.ok(row.reason);}
 assert.ok(result.bad.every(r=>r.state==='INVALID'));
});

test('P1 CLI rejects overwriting source data or reports and invalid whole-run inputs',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'p1-execution-'));try{
  const input=path.join(temp,'frames.json'),output=path.join(temp,'report.json');fs.copyFileSync(path.join(dir,'frames.json'),input);const before=fs.readFileSync(input);
  assert.equal(run(['--input',input,'--output',input]).status,2);assert.deepEqual(fs.readFileSync(input),before);
  assert.equal(run(['--input',input,'--output',output]).status,0);const report=fs.readFileSync(output);assert.equal(run(['--input',input,'--output',output]).status,2);assert.deepEqual(fs.readFileSync(output),report);
  fs.writeFileSync(input,'{broken');assert.equal(run(['--input',input]).status,2);assert.equal(run(['--mode','closed-loop','--input',input]).status,2);assert.equal(run(['--mode','closed-loop','--steps','0']).status,2);
  const config=path.join(temp,'config.json');fs.writeFileSync(config,JSON.stringify({ttl_ms:100,reacquire:2,gain:.6,max_command:0,deadband:.1}));assert.equal(run(['--config',config]).status,2);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});

test('P1 synthetic feedback responds to commands while disabled gain cannot improve the same scene',()=>{
 const r=probe(`config=dict(m.CONFIG);config['gain']=0\nprint(json.dumps({'feedback':m.closed_loop(20),'disabled':m.closed_loop(20,config)}))\n`);
 assert.equal(r.feedback[0].normalized_error,2/3);assert.equal(r.feedback.at(-1).normalized_error,0);assert.ok(r.feedback.some(row=>row.offset_after_px!==row.offset_before_px));
 assert.ok(r.disabled.every(row=>row.offset_after_px===0&&row.command_px_per_step===0&&row.normalized_error===2/3));assert.equal(r.feedback.at(-1).state,'TRACKING');
});

test('P1 downloadable archive contains exactly the reviewed files and exposes its real revision',()=>{
 const manifest=JSON.parse(fs.readFileSync('apps/web/public/project-starters/P1.json')),zip=fs.readFileSync('apps/web/public/project-starters/P1.zip'),metadata=JSON.parse(fs.readFileSync('apps/web/src/lib/project-starter-data.json'));
 assert.equal(manifest.bundleSha256,hash(zip));assert.equal(metadata.revision,'sha256:'+hash(zip));assert.equal(manifest.files.length,8);
 for(const entry of manifest.files){assert.ok(entry.path.startsWith('P1/'));const data=fs.readFileSync(path.join(root,'examples',entry.path));assert.equal(entry.sha256,hash(data));assert.equal(entry.bytes,data.length);}
 const archive=probe(`import zipfile,pathlib\nz=zipfile.ZipFile(${JSON.stringify(path.join(root,'apps/web/public/project-starters/P1.zip'))})\nassert z.testzip() is None\nprint(json.dumps({'names':z.namelist(),'allMatch':all(z.read(n)==(pathlib.Path(${JSON.stringify(path.join(root,'examples'))})/n).read_bytes() for n in z.namelist())}))\n`);
 assert.deepEqual(archive.names,manifest.files.map(file=>file.path));assert.equal(archive.allMatch,true);
});

test('P1 packaging requires exact scoped review before overwriting any published bytes',()=>{
 const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'p1-review-authority-'));try{
  fs.mkdirSync(path.join(fixture,'scripts'),{recursive:true});fs.mkdirSync(path.join(fixture,'apps/web/src/lib'),{recursive:true});fs.mkdirSync(path.join(fixture,'doc/v2/inventory'),{recursive:true});fs.cpSync(dir,path.join(fixture,'examples/P1'),{recursive:true});fs.copyFileSync('scripts/prepare-projects.mjs',path.join(fixture,'scripts/prepare-projects.mjs'));fs.writeFileSync(path.join(fixture,'evidence.md'),'Reviewed fixture');
  const registry=JSON.parse(fs.readFileSync('doc/v2/inventory/project-reviews.json'));registry.projects.P1.evidenceRef='evidence.md';const approval=path.join(fixture,'doc/v2/inventory/project-reviews.json');fs.writeFileSync(approval,JSON.stringify(registry));
  const prepare=()=>spawnSync(process.execPath,[path.join(fixture,'scripts/prepare-projects.mjs')],{encoding:'utf8'});assert.equal(prepare().status,0);const output=path.join(fixture,'apps/web/public/project-starters/P1.zip'),before=fs.readFileSync(output),source=path.join(fixture,'examples/P1/runner.py'),original=fs.readFileSync(source);
  fs.appendFileSync(source,'\n# unreviewed change\n');const stale=prepare();assert.notEqual(stale.status,0);assert.match(stale.stderr,/Stale or missing/);assert.deepEqual(fs.readFileSync(output),before);fs.writeFileSync(source,original);
  fs.unlinkSync(path.join(fixture,'evidence.md'));assert.notEqual(prepare().status,0);assert.deepEqual(fs.readFileSync(output),before);fs.writeFileSync(path.join(fixture,'evidence.md'),'Reviewed fixture');registry.projects.P2={...registry.projects.P1};fs.writeFileSync(approval,JSON.stringify(registry));assert.notEqual(prepare().status,0);assert.deepEqual(fs.readFileSync(output),before);
 }finally{fs.rmSync(fixture,{recursive:true,force:true});}
});
