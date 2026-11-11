import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const inventory=JSON.parse(fs.readFileSync('doc/visual-review/inventory.json','utf8'));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
let reviewed=0,assets=0;
for(const [id,row]of Object.entries(inventory.units)){
 if(row.status!=='reviewed'){if(!process.argv.includes('--partial'))throw Error(`${id}: review pending`);continue;}
 reviewed++;if(hash(row.source)!==row.sourceSha256)throw Error(`${id}: review stale`);
 if(!fs.existsSync(row.evidence)||!row.reason)throw Error(`${id}: review evidence missing`);
 const raw=fs.readFileSync(row.source,'utf8');
 for(const a of row.assets){assets++;if(hash(a.path)!==a.sha256)throw Error(`${id}: image changed`);
  if(!a.alt?.trim()||!a.caption?.trim())throw Error(`${id}: missing explanation`);
  if(!raw.includes(`](/textbook-visuals/${path.basename(a.path)})`))throw Error(`${id}: image not connected`);
  if(a.method==='imagegen-api'&&(!a.model||!fs.existsSync(a.prompt)))throw Error(`${id}: generation record missing`);
  if(a.path.endsWith('.svg')){const svg=fs.readFileSync(a.path,'utf8');if(/<script|<foreignObject|https?:\/\/(?!www.w3.org\/2000\/svg)/.test(svg))throw Error(`${id}: unsafe external SVG`);}
 }
}
console.log(`Visual review: ${reviewed}/${Object.keys(inventory.units).length} units; ${assets} checked assets.`);
