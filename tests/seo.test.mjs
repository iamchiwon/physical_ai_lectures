import { build } from 'esbuild';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
async function load(preview=false,origin='https://physical-ai.teachself.fun'){
 const result=await build({stdin:{contents:'export * from "./apps/web/src/lib/seo.ts"; export * from "./apps/web/src/lib/seo-content.ts"; export {default as sitemap} from "./apps/web/src/app/sitemap.ts"; export {default as robots} from "./apps/web/src/app/robots.ts";',resolveDir:root},tsconfig:'apps/web/tsconfig.json',bundle:true,platform:'node',format:'esm',write:false,define:{'process.env.NEXT_PUBLIC_SITE_URL':JSON.stringify(origin),'process.env.SEO_INDEXABLE':JSON.stringify('true'),'process.env.CF_PAGES':JSON.stringify(preview?'1':'0'),'process.env.CF_PAGES_BRANCH':JSON.stringify(preview?'feature/seo':'main'),'process.env.SEO_PRODUCTION_BRANCH':JSON.stringify('main')}});
 const before=process.cwd();process.chdir(path.join(root,'apps/web'));
 try{return await import('data:text/javascript;base64,'+Buffer.from(result.outputFiles[0].text).toString('base64'));}finally{process.chdir(before);}
}
const c=await load();
test('canonical origins reject ambiguous URLs and paths drop navigation parameters',()=>{
 for(const value of ['https://u:p@example.com','https://example.com/path','https://example.com?x=1','ftp://example.com'])assert.throws(()=>c.siteOrigin(value));
 assert.equal(c.siteOrigin('https://example.com/'),'https://example.com');assert.equal(c.canonicalPath('/study/u?track=x#body'),'/study/u/');assert.throws(()=>c.canonicalPath('//other.example'));
});
test('all public learning routes have unique titles, descriptions, and absolute self canonicals',()=>{
 const pages=c.publicSeoPages();assert.equal(new Set(pages.map(p=>p.path)).size,pages.length);
 const titles=new Map();
 for(const p of pages){const m=c.pageMetadata(p);assert.ok(m.description.length>=20&&m.description.length<=160,p.path);assert.equal(m.alternates.canonical,'https://physical-ai.teachself.fun'+p.path);assert.ok(!titles.has(m.title),`${p.path}: duplicate title with ${titles.get(m.title)}`);titles.set(m.title,p.path);assert.equal(m.openGraph.url,m.alternates.canonical);assert.equal(m.twitter.card,'summary_large_image');}
 assert.equal(pages.filter(p=>p.path.startsWith('/study/')).length,207);
});
test('sitemap includes published HTML and images but not payloads, queries, or error routes',()=>{
 const rows=c.sitemap();assert.equal(rows.length,c.publicSeoPages().filter(p=>p.index!==false).length);
 assert.equal(new Set(rows.map(x=>x.url)).size,rows.length);
 for(const row of rows){assert.ok(!/[?#]/.test(row.url));assert.ok(!row.url.includes('/tutor-'));for(const url of row.images||[])assert.ok(fs.existsSync(path.join(root,'apps/web/public',new URL(url).pathname)));}
 assert.ok(rows.find(r=>r.url.endsWith('/study/unit-m00-01-a/')).images.some(x=>x.endsWith('M00.01-cup.webp')));
 assert.ok(c.robots().sitemap.endsWith('/sitemap.xml'));
});
test('preview deployments stay crawlable for noindex while omitting sitemap publication',async()=>{
 const preview=await load(true);assert.equal(preview.pageMetadata(preview.publicSeoPages()[0]).robots.index,false);assert.deepEqual(preview.sitemap(),[]);assert.equal(preview.robots().sitemap,undefined);assert.equal(preview.robots().rules.allow,'/');
});
test('JSON-LD escapes script-breaking content without changing the data',()=>{
 const malicious={name:'</script><script>alert(1)</script>'};const text=c.serializeJsonLd(malicious);assert.ok(!text.includes('<'));assert.deepEqual(JSON.parse(text),malicious);
});
test('ownership verification uses configured public tokens without fabricated defaults',()=>{
 assert.deepEqual(c.siteVerification({}),{});
 assert.deepEqual(c.siteVerification({google:' test-google ',naver:'test-naver'}),{google:'test-google',other:{'naver-site-verification':'test-naver'}});
});
test('search snippets retain prose without raw math markup or code blocks',()=>{
 const text='좌표 변환 \\(^{A}R_B\\)은 같은 점을 다시 표현합니다. $x+y$ ```python\nsecret_code()\n``` 본문과 실습을 읽습니다.';
 const clean=c.plainDescription(text);
 assert.ok(clean.includes('같은 점을 다시 표현'));assert.ok(!clean.includes('R_B'));assert.ok(!clean.includes('secret_code'));assert.ok(!clean.includes('\\('));
});
test('legacy snippets choose intact prose instead of leaving grammar around removed equations',()=>{
 const p=c.pageForPath('/textbook/02_physx_simulation--chapter-6/');
 assert.ok(p.description.includes('위치(position)와 방향(orientation)의 쌍이다.'));
 assert.ok(!p.description.includes('회전행렬 는'));
});

test('the default production origin remains teachself when the environment override is absent',async()=>{
 const defaults=await load(false,'');
 assert.equal(defaults.siteOrigin(),'https://physical-ai.teachself.fun');
 assert.ok(defaults.sitemap().every(row=>new URL(row.url).origin==='https://physical-ai.teachself.fun'));
});
