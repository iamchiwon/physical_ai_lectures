import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const repoRoot=fileURLToPath(new URL('../',import.meta.url));
createRequire(path.join(repoRoot,'apps/web/package.json'))('@next/env').loadEnvConfig(path.join(repoRoot,'apps/web'));
const indexable=process.env.SEO_INDEXABLE!=='false'&&!(process.env.CF_PAGES==='1'&&Boolean(process.env.CF_PAGES_BRANCH)&&process.env.CF_PAGES_BRANCH!==(process.env.SEO_PRODUCTION_BRANCH||'main'));
const root=path.join(repoRoot,'apps/web/out');
const htmlFiles=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(file.endsWith('.html'))htmlFiles.push(file)}}walk(root);
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>decode(m[1]));
assert.equal(new Set(urls).size,urls.length,'duplicate sitemap URL');
const canonicalSet=new Set(),indexedCanonicals=new Set(),titles=new Set();let pages=0,resources=0,breadcrumbs=0;
for(const file of htmlFiles){
 const html=fs.readFileSync(file,'utf8'),head=html.split('</head>')[0];
 const tags=[...head.matchAll(/<(?:meta|link)\b[^>]*>/g)].map(m=>attrs(m[0]));
 const rel=path.relative(root,file).split(path.sep).join('/');
 const expected=rel==='index.html'?'/':'/'+rel.replace(/index\.html$/,'');
 if(rel==='404.html'||rel.startsWith('404/')||rel.startsWith('_not-found/')){assert.ok(tags.some(t=>t.name==='robots'&&t.content.includes('noindex')),rel+' must be noindex');continue;}
 pages++;assert.equal([...html.matchAll(/<h1\b/g)].length,1,rel+' must have one primary heading');
 assert.ok(tags.some(t=>t.name==='google-site-verification'&&t.content==='RJmko0OiPRVYace5uG1qH3IEM6sHX0IUL-USveOUdwo'),rel+' owner verification tag');
 const canonical=tags.filter(t=>t.rel==='canonical');assert.equal(canonical.length,1,rel+' canonical');const url=new URL(canonical[0].href);assert.equal(url.pathname,expected,rel);assert.ok(!url.search&&!url.hash,rel);assert.ok(!canonicalSet.has(url.href),rel+' duplicate canonical');canonicalSet.add(url.href);
 const title=decode(head.match(/<title>([^<]+)<\/title>/)?.[1]??'');assert.ok(title&&title.length<180,rel);assert.ok(!titles.has(title),rel+' duplicate title');titles.add(title);
 assert.equal(tags.filter(t=>t.name==='description').length,1,rel);assert.ok(tags.find(t=>t.name==='description').content.length>=20,rel);
 assert.equal(tags.find(t=>t.property==='og:url')?.content,url.href,rel);assert.equal(tags.find(t=>t.name==='twitter:card')?.content,'summary_large_image',rel);
 const image=new URL(tags.find(t=>t.property==='og:image')?.content);assert.ok(fs.existsSync(path.join(root,image.pathname)),rel+' OG image');
 const policy=tags.find(t=>t.name==='robots');assert.ok(policy,rel+' robots policy');const excluded=policy.content.includes('noindex');
 if(!indexable)assert.ok(excluded,rel+' preview must be noindex');
 else if(excluded){assert.ok(expected.startsWith('/study/'),rel+' unexpected noindex');assert.ok(!urls.includes(url.href),rel+' excluded page in sitemap');}
 else indexedCanonicals.add(url.href);
 const data=[...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));assert.ok(data.some(d=>d['@type']==='WebSite'),rel+' website data');
 for(const d of data){if(d['@type']==='LearningResource'){resources++;assert.equal(d.url,url.href,rel+' resource URL');assert.ok(d.name&&d.description&&d.inLanguage==='ko');}
 if(d['@type']==='BreadcrumbList'){breadcrumbs++;assert.ok(d.itemListElement.length>=2);d.itemListElement.forEach((i,n)=>{assert.equal(i.position,n+1);assert.ok(i.name);assert.equal(new URL(i.item).origin,url.origin);});assert.equal(d.itemListElement.at(-1).item,url.href,rel+' breadcrumb URL');}}
 if(indexable&&!excluded)assert.ok(urls.includes(url.href),rel+' missing from sitemap');
}
if(indexable)assert.deepEqual(new Set(urls),indexedCanonicals,'sitemap contains non-canonical/missing HTML');else assert.equal(urls.length,0,'preview sitemap must be empty');
for(const m of sitemap.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)){const image=new URL(decode(m[1]));assert.ok(fs.existsSync(path.join(root,image.pathname)),image.href);}
const robots=fs.readFileSync(path.join(root,'robots.txt'),'utf8');assert.ok(robots.includes('Allow: /'));if(indexable)assert.ok(robots.includes('Sitemap: '+new URL('/sitemap.xml',urls[0]).href));else assert.ok(!robots.includes('Sitemap:')); assert.ok(!robots.includes('Disallow: /_next'));
assert.ok(fs.readFileSync(path.join(root,'_headers'),'utf8').includes('X-Robots-Tag: noindex, follow'));
console.log(`SEO export audit passed: ${pages} canonical HTML pages, ${urls.length} sitemap URLs, ${resources} learning resources, ${breadcrumbs} breadcrumb lists.`);
