import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { readAuthoredReviews } from './authored-metadata.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = process.argv[2];
if (!destination) throw Error('Provide an output Markdown path');
const bundle = await build({ stdin: { contents: 'export {parseAuthoredMarkdown} from "./packages/shared/src/authored-format.ts"; export {catalogData} from "./packages/shared/src/catalog-data.ts";', resolveDir: root }, bundle: true, platform: 'node', format: 'esm', write: false });
const { parseAuthoredMarkdown, catalogData } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const registry = readAuthoredReviews(root, catalogData.units);
const titles = { M00: '문제 정의·학습 진단·로봇 안전', M01: 'Linux·Python·C/C++ 로봇 개발 기반', M02: '로봇 수학·확률·최적화 브리지', M03: '기구·센서·액추에이터·전원', M05: 'ROS 2 통신·실행·관측 도구', M06: '기구학·좌표계·역기구학', M07: '동역학·피드백 제어', M08: 'URDF·Xacro·로봇 모델 계약' };
const topics = Object.keys(registry.topics).sort();
if (!topics.length) throw Error('No reviewed authored content to export');
// Shift only Markdown headings, leaving example code fences and their comments untouched.
function nested(text) {
  let fence = null;
  return text.split('\n').map(line => {
    const marker = /^\s*(`{3,}|~{3,})/.exec(line);
    if (marker) { if (!fence) fence = marker[1]; else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = null; return line; }
    return !fence ? line.replace(/^(#{1,5}) /, '#$1 ') : line;
  }).join('\n');
}
const chunks = ['# E1 공통 기초 상세 교재 {#e1-foundations}', 'M00~M03의 검수된 새 본문·장비 없는 실습·문제·해설입니다. 아래 단위는 원본 Markdown에서 생성하며, 기존 여섯 장의 응용 교재와 이어 읽습니다. 실습·문항 답안의 자동 채점이나 실물·GPU 실행을 뜻하지 않습니다.'];
let previousModule = '';
for (const topic of topics) {
  const module = topic.split('.')[0];
  if (!(module in titles)) throw Error(`Unsupported authored topic: ${topic}`);
  const source = `ebook/curriculum/${module}/${topic}.md`;
  if (!fs.lstatSync(path.join(root, source)).isFile()) throw Error(`Invalid authored source file: ${topic}`);
  const raw = fs.readFileSync(path.join(root, source), 'utf8');
  const sha = createHash('sha256').update(raw).digest('hex');
  const review = registry.topics[topic];
  if (sha !== review.sourceSha256 || !fs.existsSync(path.join(root, review.evidenceRef)) || !fs.lstatSync(path.join(root, review.evidenceRef)).isFile()) throw Error(`Stale or missing review: ${topic}`);
  const doc = parseAuthoredMarkdown(raw);
  if (doc.title !== catalogData.units.find(unit => unit.topicId === topic)?.title) throw Error(`Authored title mismatch: ${topic}`);
  if (module.startsWith('M0') && Number(module.slice(1)) >= 5 && Number(previousModule.slice(1)) < 5) chunks.push('# E2 ROS 2·기구학·제어·모델 상세 교재 {#e2-robot-foundations}', 'M05~M08의 검수된 본문·장비 없는 기본 실습·문제·해설입니다. E1 기초와 이어 읽고, ROS 실행·실물/GPU 실행을 실제로 검증한 활동과 가상 로그·계산을 구분합니다.');
  if (module !== previousModule) { chunks.push(`# ${module}. ${titles[module]} {#${module.toLowerCase()}}`); previousModule = module; }
  chunks.push(`## ${topic}. ${doc.title} {#${topic.toLowerCase().replace('.', '-')} .chapter-section}`,
    '### 학습 목표', doc.objectives.map((goal, i) => `${i + 1}. ${goal}`).join('\n'), `**권장 선수:** ${doc.prerequisiteNote}`,
    '### 본문', nested(doc.body), '### 실습', nested(doc.practice), '### 실습 해설·판정', nested(doc.practiceSolution),
    '### 확인 문제', doc.questions.map(question => `#### ${question.id.toUpperCase()}\n\n${nested(question.prompt)}`).join('\n\n'),
    '### 문제 해설·판정', doc.questions.map(question => `#### ${question.id.toUpperCase()} 해설\n\n${nested(question.answer)}`).join('\n\n'),
    '### 참고 자료·기존 응용 교재 연결', nested(doc.references));
}
fs.mkdirSync(path.dirname(path.resolve(destination)), { recursive: true });
fs.writeFileSync(destination, chunks.join('\n\n') + '\n');
const baseline = JSON.parse(fs.readFileSync(path.join(root, 'doc/v2/inventory/legacy-content.json'), 'utf8'));
fs.writeFileSync(destination + '.links.json', JSON.stringify(baseline.textbookUnits.map(unit => ({ url: unit.url, chapter: unit.chapter, title: unit.title }))));
console.log(`Authored book export: ${topics.length} reviewed units → ${destination}`);
