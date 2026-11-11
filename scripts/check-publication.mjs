import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertPublicationText, assertPublicationPath, assertPublicationArchive } from './publication-policy.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const binary = /\.(?:png|jpe?g|webp|gif|ico|woff2?|ttf|otf|pdf|epub|zip|mp4|mp3)$/i;
let checked = 0, archiveEntries = 0;
function visit(relative, output = false) {
  const file = path.join(root, relative);
  if (fs.statSync(file).isDirectory()) {
    for (const entry of fs.readdirSync(file)) visit(`${relative}/${entry}`, output);
  } else {
    if (output) assertPublicationPath(relative.replace(/^apps\/web\/out\//, ''));
    if (/\.(?:zip|epub)$/i.test(file)) { archiveEntries += assertPublicationArchive(file); return; }
    if (output && /\.pdf$/i.test(file)) throw Error('PDF requires a separately requested publication review');
    if (binary.test(file)) return;
    assertPublicationText(fs.readFileSync(file, 'utf8'), relative);
    checked++;
  }
}
for (const file of ['README.md','doc/README.md','doc/integrated_curriculum.md','ebook/book','ebook/curriculum','examples','apps/web/src','apps/api/src','packages/shared/src']) visit(file);
if (!process.argv.includes('--source-only')) {
  if (!fs.existsSync(path.join(root, 'apps/web/out/index.html'))) throw Error('Build the web output before publication audit');
  visit('apps/web/out', true);
}
console.log(`Publication privacy audit passed: ${checked} text files, ${archiveEntries} archive entries; PDF/EPUB not generated.`);
