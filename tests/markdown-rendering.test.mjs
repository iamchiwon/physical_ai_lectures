import {build} from 'esbuild';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {test} from 'node:test';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const result=await build({stdin:{contents:`
 import {createElement} from 'react';
 import {renderToStaticMarkup} from 'react-dom/server';
 import {AuthoredMarkdown} from './src/components/authored-markdown.tsx';
 import {TextbookMarkdown} from './src/components/textbook-markdown.tsx';
 import {TutorMarkdown} from './src/components/tutor-markdown.tsx';
 import {parseAuthoredMarkdown} from '../../packages/shared/src/authored-format.ts';
 export {parseAuthoredMarkdown};
 export const renderers={
  authored:content=>renderToStaticMarkup(createElement(AuthoredMarkdown,{content})),
  textbook:content=>renderToStaticMarkup(createElement(TextbookMarkdown,{unit:{slug:'fixture',title:'Fixture',group:'Fixture',chapter:2,source:'02_physx_simulation/chapter.md',content}})),
  tutor:content=>renderToStaticMarkup(createElement(TutorMarkdown,{content,copyable:false}))
 };
`,resolveDir:path.join(root,'apps/web'),loader:'tsx'},tsconfig:path.join(root,'apps/web/tsconfig.json'),bundle:true,platform:'node',format:'esm',jsx:'automatic',write:false,banner:{js:`import {createRequire} from 'node:module'; const require=createRequire(${JSON.stringify(path.join(root,'package.json'))});`}});
let renderers,parseAuthoredMarkdown;
const previous=process.cwd();process.chdir(path.join(root,'apps/web'));
try{({renderers,parseAuthoredMarkdown}=await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64')));}finally{process.chdir(previous);}
const fixture=[
 '폭69.8~70.2mm, 간격70.2~70.4mm. R1~R4/T1~T6.',
 '', '~~폐기된 조건~~',
 '', '| 범위 | 의미 |', '|---|---|', '| 0~1 및 2~3 | 비교 |',
 '', '- [x] 자기검토',
 '', '인라인 `a~b~c` 및 $x^2$.',
 '', '~~~text', '12~13 ~~source~~', '~~~'
].join('\n');
const lesson=parseAuthoredMarkdown(fs.readFileSync(path.join(root,'ebook/curriculum/M26/M26.04.md'),'utf8')).body;
for(const [name,render] of Object.entries(renderers))test(`${name} preserves numeric and ID ranges while retaining explicit strike tables code and math`,()=>{
 const html=render(fixture);
 for(const value of ['69.8~70.2mm','70.2~70.4mm','R1~R4/T1~T6','0~1 및 2~3','a~b~c','12~13 ~~source~~'])assert.ok(html.includes(value),`${name}: ${value}`);
 assert.deepEqual([...html.matchAll(/<del>(.*?)<\/del>/gs)].map(m=>m[1]),['폐기된 조건']);
 assert.match(html,/<table>/);assert.match(html,/<input[^>]*checked/);assert.match(html,/class="katex"/);assert.ok(!html.includes('katex-error'));
 const actual=render(lesson);assert.ok(!actual.includes('<del>'));
 assert.ok(actual.includes('69.8~70.2mm'));assert.ok(actual.includes('70.2~70.4mm'));
 assert.ok(actual.includes('o------x------o'));assert.match(actual,/class="katex"/);
});
