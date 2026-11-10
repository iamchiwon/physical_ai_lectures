import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { assertPublicationText, assertPublicationPath, assertPublicationArchive } from '../scripts/publication-policy.mjs';

test('public materials reject course attribution even in metadata and encoded links', () => {
  for (const text of ['KANT', '패스트캠퍼스', 'https://fastcampus.co.kr/course', 'FC01', 'FC31', 'planned-kant-2026-11-06', 'https://certification.vector.com/course/view.php?id=321', 'https://modernrobotics.northwestern.edu/nu-gm-book-resource/topic/', String.raw`\u004b\u0041\u004e\u0054`, 'https%3A%2F%2Ffastcampus.co.kr', '&#75;&#65;&#78;&#84;']) assert.throws(() => assertPublicationText(text), /Reference-course/);
  const raw = fs.readFileSync('doc/fastcampus/FC24_data_online_can.md','utf8');
  const title = raw.split('\n')[0].replace(/^# FC\d+\.\s*/, '');
  assert.throws(() => assertPublicationText(JSON.stringify({title})), /Reference-course/);
  assert.doesNotThrow(() => assertPublicationText('공식 ROS 문서·논문·서적·라이선스; CAN 0xFC01; M28.01'));
});
test('internal research files cannot be packaged while learner content paths remain valid', () => {
  for (const name of ['doc/fastcampus/source.md','doc/proposals/design.json','doc/course_inventory.md','doc/v2/inventory/reviews.json','doc/v2/work_items/review.md']) assert.throws(() => assertPublicationPath(name), /Internal research/);
  for (const name of ['study/unit-m28-01-a/index.html','tutor-study/unit-m28-01-a','textbook-assets/chapter.md']) assert.doesNotThrow(() => assertPublicationPath(name));
});
test('all authored source bodies and public curriculum satisfy the publication boundary', () => {
  function visit(dir) { for (const name of fs.readdirSync(dir)) { const file=path.join(dir,name); if(fs.statSync(file).isDirectory())visit(file); else if(file.endsWith('.md'))assertPublicationText(fs.readFileSync(file,'utf8'),file); } }
  visit('ebook/curriculum');visit('ebook/book');
  for (const file of ['doc/README.md','doc/integrated_curriculum.md'])assertPublicationText(fs.readFileSync(file,'utf8'),file);
});

test('download archives are inspected for both hidden text and private entries', () => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'publication-archive-'));
  const zip=(name,entry,text)=>{const file=path.join(dir,name);execFileSync('python3',['-c','import sys,zipfile; a=zipfile.ZipFile(sys.argv[1],"w"); a.writestr(sys.argv[2],sys.argv[3]); a.close()',file,entry,text]);return file;};
  try {
    assert.equal(assertPublicationArchive(zip('safe.zip','starter/README.md','공식 문서와 학습 입력')),1);
    assert.throws(()=>assertPublicationArchive(zip('leak.zip','starter/notes.txt','KANT')),/Reference-course/);
    assert.throws(()=>assertPublicationArchive(zip('private.zip','doc/course_inventory.md','internal')),/Internal research/);
  } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
