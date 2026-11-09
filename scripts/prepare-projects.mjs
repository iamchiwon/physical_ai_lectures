import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const names=['README.md','SPEC.md','SOLUTION.md','runner.py','config.json','frames.json','reference/replay.json','reference/closed-loop.json'];
const digest=b=>createHash('sha256').update(b).digest('hex');
function crc32(data){let c=0xffffffff;for(const byte of data){c^=byte;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
const locals=[],central=[],files=[];let offset=0;
for(const name of names){
 const source=path.join(root,'examples/P1',name);if(!fs.lstatSync(source).isFile()||fs.lstatSync(source).isSymbolicLink())throw Error(`Invalid project source: ${name}`);
 const data=fs.readFileSync(source),filename=Buffer.from('P1/'+name),crc=crc32(data),header=Buffer.alloc(30);
 header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(0x21,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(data.length,18);header.writeUInt32LE(data.length,22);header.writeUInt16LE(filename.length,26);
 locals.push(header,filename,data);const entry=Buffer.alloc(46);entry.writeUInt32LE(0x02014b50,0);entry.writeUInt16LE(20,4);entry.writeUInt16LE(20,6);entry.writeUInt16LE(0x800,8);entry.writeUInt16LE(0x21,14);entry.writeUInt32LE(crc,16);entry.writeUInt32LE(data.length,20);entry.writeUInt32LE(data.length,24);entry.writeUInt16LE(filename.length,28);entry.writeUInt32LE(offset,42);central.push(entry,filename);offset+=header.length+filename.length+data.length;files.push({path:'P1/'+name,bytes:data.length,sha256:digest(data)});
}
const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(names.length,8);end.writeUInt16LE(names.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
const zip=Buffer.concat([...locals,directory,end]),sha=digest(zip),destination=path.join(root,'apps/web/public/project-starters');fs.mkdirSync(destination,{recursive:true});fs.writeFileSync(path.join(destination,'P1.zip'),zip);
const manifest={schemaVersion:1,projectId:'P1',revision:'sha256:'+sha,bundleSha256:sha,files};fs.writeFileSync(path.join(destination,'P1.json'),JSON.stringify(manifest,null,2)+'\n');
const metadata={href:'/project-starters/P1.zip',manifestHref:'/project-starters/P1.json',revision:manifest.revision,verifiedEnvironment:'Python 3.12.11 · Darwin'};fs.writeFileSync(path.join(root,'apps/web/src/lib/project-starter-data.json'),JSON.stringify(metadata,null,2)+'\n');console.log(`Project starter: P1, ${files.length} files, ${zip.length} bytes, ${manifest.revision}`);
