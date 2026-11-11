import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Internal-only policy data. Never import this module into the web/API runtime.
const inventory = path.join(root, 'doc/fastcampus');
const courseTitles = fs.readdirSync(inventory).filter(name => name.endsWith('.md')).map(name => {
  const title = fs.readFileSync(path.join(inventory, name), 'utf8').split('\n')[0];
  return title.replace(/^# FC\d+\.\s*/, '').trim();
});
const forbidden = [
  /\bkant(?:-ai-campus)?\b|칸트/iu,
  /fastcampus|패스트\s*캠퍼스|day1company/iu,
  /(?<![a-z0-9])FC(?:0[1-9]|[12][0-9]|3[01])(?![a-z0-9])/iu,
  /course_inventory|kant_sequence|doc\/fastcampus/iu,
  /certification\.vector\.com|nu-gm-book-resource/iu,
];
const privatePaths = /(?:^|\/)(?:doc\/(?:fastcampus|proposals|v2\/(?:inventory|work_items))\/|doc\/(?:course_inventory|research_method|merge_and_migration)\.md(?:$|\/))/u;
export function normalizePublicationText(text) {
  return text.replace(/\\u([a-f\d]{4})/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/\\x([a-f\d]{2})/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/\\\//g, '/')
    .replace(/(?:%[a-f\d]{2})+/gi, encoded => { try { return decodeURIComponent(encoded); } catch { return encoded; } })
    .replace(/&#(?:x([a-f\d]+)|(\d+));/gi, (raw, hex, decimal) => { const n = parseInt(hex || decimal, hex ? 16 : 10); return n <= 0x10ffff ? String.fromCodePoint(n) : raw; })
    .replace(/\s+/g, ' ');
}
export function assertPublicationText(text, label = 'publication') {
  const normalized = normalizePublicationText(text);
  if (forbidden.some(pattern => pattern.test(normalized)) || courseTitles.some(title => normalized.includes(title))) {
    // Do not echo private source names back into public build logs/artifacts.
    throw Error(`Reference-course information in public content: ${label}`);
  }
}
export function assertPublicationPath(file) {
  if (privatePaths.test(file.replaceAll('\\', '/'))) throw Error(`Internal research file in publication: ${file}`);
}

export function assertPublicationArchive(file) {
  const code = `import io,json,sys,zipfile,stat
rows=[]
size=[0]
def inspect(data,prefix='',depth=0):
 if depth>4: raise ValueError('Nested archive limit exceeded')
 with zipfile.ZipFile(io.BytesIO(data)) as archive:
  for entry in archive.infolist():
   name=prefix+entry.filename
   if name.startswith('/') or '..' in name.split('/') or stat.S_ISLNK(entry.external_attr>>16): raise ValueError('Unsafe archive entry')
   if entry.is_dir(): continue
   size[0]+=entry.file_size
   if size[0]>33554432: raise ValueError('Archive review size limit exceeded')
   if name.lower().endswith('.pdf'): raise ValueError('PDF requires a separately requested publication review')
   content=archive.read(entry)
   if name.lower().endswith(('.zip','.epub')): inspect(content,name+'/',depth+1)
   else: rows.append({'name':name,'text':content.decode('utf-8',errors='replace')})
inspect(open(sys.argv[1],'rb').read())
print(json.dumps(rows))`;
  const entries = JSON.parse(execFileSync('python3', ['-c', code, file], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
  for (const entry of entries) {
    assertPublicationPath(entry.name);
    assertPublicationText(entry.name, file);
    assertPublicationText(entry.text, `${file} archive entry`);
  }
  return entries.length;
}
