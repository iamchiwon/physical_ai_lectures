import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.resolve(webRoot, "../../ebook/book");
const destination = path.join(webRoot, "public/textbook-assets");
await mkdir(destination, { recursive: true });
await cp(source, destination, {
  recursive: true,
  filter: (file) => ![".DS_Store", "__pycache__"].includes(path.basename(file)) && !file.endsWith(".pyc"),
});
console.log("Textbook images, original manuscripts and example files prepared.");


// Static, same-origin corpus. Only fetched when the tutor requests more lesson evidence.
const corpusDirectory = path.join(webRoot, "public/tutor-content");
await mkdir(corpusDirectory, {recursive:true});
async function sourceFiles(directory) {
  const entries=await readdir(directory,{withFileTypes:true});
  const nested=await Promise.all(entries.map(entry=>entry.isDirectory()?sourceFiles(path.join(directory,entry.name)):/\.(?:md|py|cpp|hpp|h|yaml|yml|sh|xml|urdf|json|toml)$/.test(entry.name)?[path.join(directory,entry.name)]:[]));
  return nested.flat();
}
const grouped=new Map();
for(const file of (await sourceFiles(source)).sort()) {
  const id=path.relative(source,file).split(path.sep).join("/");
  if(/(?:README|divider)\.md$/.test(id)||id.startsWith("appendices/")||id.includes("/exercises/solutions.md"))continue;
  const chapter=Number(id.match(/^0([1-6])_/)?.[1]??0);
  if(!chapter&&!/^00_frontmatter\/(environment|safety)\.md$/.test(id))continue;
  const raw=await readFile(file,"utf8");
  if(raw.length>256_000)continue;
  const extension=path.extname(file).slice(1);
  const content=extension==="md"?raw:`# 예제 파일: ${path.basename(file)}\n\n\`\`\`${extension}\n${raw}\n\`\`\``;
  const title=(content.match(/^#{1,6} (.+)$/m)?.[1]??id).replace(/\s*\{[^}]+\}\s*$/,"");
  const key=`chapter-${chapter}`;
  if(!grouped.has(key))grouped.set(key,[]);
  grouped.get(key).push({id,title,content});
}
for(const [chapter,documents] of grouped)await writeFile(path.join(corpusDirectory,`${chapter}.json`),JSON.stringify(documents));
