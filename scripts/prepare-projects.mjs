import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const definitions={
 P1:{names:['README.md','SPEC.md','SOLUTION.md','runner.py','config.json','frames.json','reference/replay.json','reference/closed-loop.json'],metadata:'project-starter-data.json'},
 P2:{names:['README.md','SPEC.md','SOLUTION.md','runner.py','config.json','cases.json','reference/nominal.json','reference/temporary-block.json','reference/permanent-block.json','reference/missing-tf.json','reference/stale.json','reference/wrong-map.json','reference/replay.json'],metadata:'p2-starter-data.json'},
};
const digest=b=>createHash('sha256').update(b).digest('hex');
function crc32(data){let c=0xffffffff;for(const byte of data){c^=byte;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function bundle(projectId){
const names=definitions[projectId].names;
const locals=[],central=[],files=[];let offset=0;
for(const name of names){
 const source=path.join(root,'examples',projectId,name);if(!fs.lstatSync(source).isFile()||fs.lstatSync(source).isSymbolicLink())throw Error(`Invalid project source: ${name}`);
 const data=fs.readFileSync(source),filename=Buffer.from(projectId+'/'+name),crc=crc32(data),header=Buffer.alloc(30);
 header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(0x21,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(data.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(filename.length,26);
 locals.push(header,filename,data);const entry=Buffer.alloc(46);entry.writeUInt32LE(0x02014b50,0);entry.writeUInt16LE(20,4);entry.writeUInt16LE(20,6);entry.writeUInt16LE(0x800,8);entry.writeUInt16LE(0x21,14);entry.writeUInt32LE(crc,16);entry.writeUInt32LE(data.length,20);entry.writeUInt32LE(data.length,24);entry.writeUInt16LE(filename.length,28);entry.writeUInt32LE(offset,42);central.push(entry,filename);offset+=header.length+filename.length+data.length;files.push({path:projectId+'/'+name,bytes:data.length,sha256:digest(data)});
}
const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(names.length,8);end.writeUInt16LE(names.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
const zip=Buffer.concat([...locals,directory,end]),sha=digest(zip);
return {zip,sha,files};
}
const args=process.argv.slice(2);
if(args.length){
 if(args.length!==2||args[0]!=='--inspect'||!Object.hasOwn(definitions,args[1]))throw Error('Use --inspect P1 or --inspect P2 for read-only bundle review');
 const {sha,files}=bundle(args[1]);console.log(JSON.stringify({projectId:args[1],bundleSha256:sha,files},null,2));process.exit(0);
}
const registry=JSON.parse(fs.readFileSync(path.join(root,'doc/v2/inventory/project-reviews.json'),'utf8'));
if(registry?.schemaVersion!==1||!registry.projects||typeof registry.projects!=='object'||Array.isArray(registry.projects)||Object.keys(registry).some(key=>!['schemaVersion','projects'].includes(key))||Object.keys(registry.projects).some(id=>!Object.hasOwn(definitions,id))||!Object.hasOwn(registry.projects,'P1'))throw Error('Invalid project review authority');
const pending=[];
// Validate every approved archive before changing any published bytes.
for(const projectId of Object.keys(registry.projects)){
 const {zip,sha,files}=bundle(projectId),review=registry.projects[projectId],ref=review?.evidenceRef;
 if(!review||Object.keys(review).some(key=>!['bundleSha256','evidenceRef'].includes(key))||review.bundleSha256!==sha||typeof ref!=='string'||!ref||path.isAbsolute(ref)||ref.includes('\\')||ref.split('/').some(part=>!part||part==='..'||part==='.')||!fs.existsSync(path.join(root,ref))||!fs.lstatSync(path.join(root,ref)).isFile())throw Error(`Stale or missing ${projectId} review: re-review the exact bundle before publishing`);
 pending.push({projectId,zip,sha,files});
}
const destination=path.join(root,'apps/web/public/project-starters');
fs.mkdirSync(destination,{recursive:true});
for(const {projectId,zip,sha,files}of pending){
 fs.writeFileSync(path.join(destination,projectId+'.zip'),zip);
 const manifest={schemaVersion:1,projectId,revision:'sha256:'+sha,bundleSha256:sha,files};fs.writeFileSync(path.join(destination,projectId+'.json'),JSON.stringify(manifest,null,2)+'\n');
 const metadata={href:'/project-starters/'+projectId+'.zip',manifestHref:'/project-starters/'+projectId+'.json',revision:manifest.revision,verifiedEnvironment:'Python 3.12.11 · Darwin'};fs.writeFileSync(path.join(root,'apps/web/src/lib',definitions[projectId].metadata),JSON.stringify(metadata,null,2)+'\n');console.log(`Project starter: ${projectId}, ${files.length} files, ${zip.length} bytes, ${manifest.revision}`);
}
