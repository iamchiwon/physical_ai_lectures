import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=process.cwd(),dir=path.join(root,'examples/P2'),python=process.env.PHYSICAL_AI_PYTHON??'python3';
const hash=raw=>createHash('sha256').update(raw).digest('hex');
function run(args){const r=spawnSync(python,[path.join(dir,'runner.py'),...args],{encoding:'utf8',timeout:10000});assert.ifError(r.error);return r;}
function probe(script){const prelude=`import importlib.util,json,copy\ns=importlib.util.spec_from_file_location('p2',${JSON.stringify(path.join(dir,'runner.py'))})\nm=importlib.util.module_from_spec(s);s.loader.exec_module(m)\nb=m.read_json(${JSON.stringify(path.join(dir,'cases.json'))});c=m.read_json(${JSON.stringify(path.join(dir,'config.json'))})\n`;const r=spawnSync(python,['-c',prelude+script],{encoding:'utf8',timeout:10000});assert.ifError(r.error);assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);}
const scenarios=['nominal','temporary-block','permanent-block','missing-tf','stale','wrong-map'];

test('P2 separates observed arrival, temporary replanning and permanent blockage without entering occupied cells',()=>{
 const book=fs.readFileSync(path.join(dir,'cases.json')),config=fs.readFileSync(path.join(dir,'config.json')),source=fs.readFileSync(path.join(dir,'runner.py'));
 const expected=['SUCCEEDED','SUCCEEDED','BLOCKED','INVALID','INVALID','INVALID'];
 for(const [i,scenario]of scenarios.entries()){
  const r=run(['--scenario',scenario]);assert.equal(r.status,0,r.stderr);const report=JSON.parse(r.stdout),ref=JSON.parse(fs.readFileSync(path.join(dir,'reference',scenario+'.json')));
  assert.equal(report.terminal_state,expected[i]);assert.equal(report.success,i<2);assert.equal(report.casebook_sha256,hash(book));assert.equal(report.config_sha256,hash(config));assert.equal(report.source_sha256,hash(source));assert.equal(ref.source_sha256,hash(source));assert.deepEqual(report.decisions,ref.decisions);assert.equal(report.decisions.length,report.observations.length);assert.deepEqual(report.decisions.at(-1).delta_cell,[0,0]);
  for(const [j,row]of report.decisions.entries()){
   if(row.state==='MOVING'){
    assert.equal(Math.abs(row.delta_cell[0])+Math.abs(row.delta_cell[1]),1);const next=row.map_cell.map((v,k)=>v+row.delta_cell[k]),occupied=[...JSON.parse(book).map.occupied,...report.observations[j].dynamic_occupied];assert.ok(!occupied.some(c=>c[0]===next[0]&&c[1]===next[1]));assert.ok(next[0]>=0&&next[0]<7&&next[1]>=0&&next[1]<5);assert.deepEqual(report.decisions[j+1].state==='INVALID'?report.observations[j+1].pose.xy_m.map((v,k)=>v+[1,0][k]):report.decisions[j+1].map_cell,next);
   }else assert.deepEqual(row.delta_cell,[0,0]);
  }
  if(i<2){assert.equal(report.moves,8);assert.equal(report.reached_waypoints,2);assert.equal(report.counts.GOAL_REACHED,1);assert.deepEqual(report.decisions.at(-1).map_cell,[6,4]);}
  if(i===1)assert.equal(report.counts.WAITING,2);
  if(i===2){assert.equal(report.counts.WAITING,2);assert.equal(report.decisions.at(-1).no_path_streak,3);assert.equal(report.reached_waypoints,0);}
  if(i>=3)assert.equal(report.decisions.at(-1).reason,['transform_unavailable','stale_observation','map_revision_mismatch'][i-3]);
 }
 assert.deepEqual(fs.readFileSync(path.join(dir,'cases.json')),book);assert.deepEqual(fs.readFileSync(path.join(dir,'config.json')),config);
});

test('P2 replay recomputes all six complete observation streams rather than using stored decisions',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'p2-replay-'));try{
  for(const scenario of scenarios){const report=JSON.parse(fs.readFileSync(path.join(dir,'reference',scenario+'.json')));const expected=structuredClone(report.decisions);report.decisions=[{state:'FAKE_SUCCESS'}];report.success=true;const input=path.join(temp,scenario+'.json');fs.writeFileSync(input,JSON.stringify(report));const before=fs.readFileSync(input),r=run(['--mode','replay','--input',input]);assert.equal(r.status,0,r.stderr);const actual=JSON.parse(r.stdout);assert.deepEqual(actual.decisions,expected);assert.equal(actual.success,scenario==='nominal'||scenario==='temporary-block');assert.equal(actual.input_sha256,hash(before));assert.deepEqual(fs.readFileSync(input),before);}
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});

test('P2 checks observation age, TF direction and time, map identity and localization independently',()=>{
 const result=probe(`def frame():return m.make_observation(b,0,b['start_cell'],[],c)\nrows={}\nfor kind in ['age100','age101','future','clock','missing_tf','tf_time','tf_direction','tf_offset','pose_frame','pose_nan','map','no_map','no_localization','occupancy','outside','occupied']:\n o=frame()\n if kind=='age100':o['stamp_ms']=900;o['transform']['stamp_ms']=900\n if kind=='age101':o['stamp_ms']=899;o['transform']['stamp_ms']=899\n if kind=='future':o['stamp_ms']=1001;o['transform']['stamp_ms']=1001\n if kind=='clock':o['clock_id']='OtherClock'\n if kind=='missing_tf':o['transform']=None\n if kind=='tf_time':o['transform']['stamp_ms']=999\n if kind=='tf_direction':o['transform']['source_frame']='map';o['transform']['target_frame']='odom'\n if kind=='tf_offset':o['transform']['translation_m']=[-1,0]\n if kind=='pose_frame':o['pose']['frame_id']='camera'\n if kind=='pose_nan':o['pose']['xy_m']=[float('nan'),2]\n if kind=='map':o['map_revision']='old'\n if kind=='no_map':o['map_loaded']=False\n if kind=='no_localization':o['localization_valid']=False\n if kind=='occupancy':del o['dynamic_occupied']\n if kind=='outside':o['pose']['xy_m']=[6,2]\n if kind=='occupied':o['dynamic_occupied']=[[0,2]]\n rows[kind]=m.Controller(b,c).step(o)\nctrl=m.Controller(b,c);first=ctrl.step(frame());duplicate=frame();duplicate['now_ms']=1100;duplicate['stamp_ms']=1100;duplicate['transform']['stamp_ms']=1100\nrows['duplicate']=ctrl.step(duplicate)\nprint(json.dumps({'rows':rows,'first':first}))`);
 assert.deepEqual(result.first.map_cell,[0,2]);assert.equal(result.rows.age100.state,'MOVING');assert.equal(result.rows.age100.age_ms,100);
 const reasons={age101:'stale_observation',future:'future_observation',clock:'clock_mismatch',missing_tf:'transform_unavailable',tf_time:'transform_time',tf_direction:'transform_contract',tf_offset:'transform_calibration',pose_frame:'pose_frame_or_value',pose_nan:'pose_frame_or_value',map:'map_revision_mismatch',no_map:'map_unavailable',no_localization:'localization_unavailable',occupancy:'occupancy_unavailable',outside:'pose_outside_map',occupied:'pose_in_occupied_cell',duplicate:'nonmonotonic_observation'};
 for(const[k,reason]of Object.entries(reasons)){assert.equal(result.rows[k].state,'INVALID',k);assert.equal(result.rows[k].reason,reason,k);assert.deepEqual(result.rows[k].delta_cell,[0,0],k);}
});

test('P2 step budget cannot turn an intermediate waypoint into complete mission success',()=>{
 const r=probe(`b['scenarios']={'nominal':b['scenarios']['nominal']}\nc['max_steps']=7\no,d=m.simulate(b,c,'nominal')\nctrl=m.Controller(b,c)\nfor row in o:ctrl.step(row)\ntry:ctrl.step(o[-1]);after_terminal=False\nexcept ValueError:after_terminal=True\nprint(json.dumps({'last':d[-1],'states':[r['state'] for r in d],'afterTerminalRejected':after_terminal}))`);
 assert.equal(r.last.state,'TIMEOUT');assert.equal(r.last.reached_waypoints,1);assert.deepEqual(r.last.delta_cell,[0,0]);assert.equal(r.afterTerminalRejected,true);assert.ok(!r.states.includes('SUCCEEDED'));
});

test('P2 CLI preserves inputs and reports and rejects malformed, partial or mismatched replay',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'p2-cli-'));try{
  const output=path.join(temp,'report.json'),input=path.join(temp,'input.json');fs.copyFileSync(path.join(dir,'reference/nominal.json'),input);const before=fs.readFileSync(input);
  assert.equal(run(['--mode','replay','--input',input,'--output',input]).status,2);assert.deepEqual(fs.readFileSync(input),before);assert.equal(run(['--output',output]).status,0);const saved=fs.readFileSync(output);assert.equal(run(['--output',output]).status,2);assert.deepEqual(fs.readFileSync(output),saved);
  const original=JSON.parse(before);for(const mutate of [r=>r.observations=[],r=>r.observations=r.observations.slice(0,2),r=>r.observations.push(r.observations.at(-1)),r=>r.config_sha256='different']){const r=structuredClone(original);mutate(r);fs.writeFileSync(input,JSON.stringify(r));assert.equal(run(['--mode','replay','--input',input]).status,2);}
  fs.writeFileSync(input,'{broken');assert.equal(run(['--mode','replay','--input',input]).status,2);for(const name of ['runner.py','config.json','cases.json']){const protectedFile=path.join(dir,name),raw=fs.readFileSync(protectedFile);assert.equal(run(['--output',protectedFile]).status,2);assert.deepEqual(fs.readFileSync(protectedFile),raw);}
  assert.equal(run(['--mode','replay']).status,2);assert.equal(run(['--input',input]).status,2);assert.equal(run(['--scenario','unknown']).status,2);
  const book=JSON.parse(fs.readFileSync(path.join(dir,'cases.json')));book.schema_version=true;fs.writeFileSync(input,JSON.stringify(book));assert.equal(run(['--cases',input]).status,2,'boolean schema is not integer version 1');
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
