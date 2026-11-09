import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { readAuthoredReviews } from './authored-metadata.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = process.argv[2];
if (!destination) throw Error('Provide an output Markdown path');
const bundle = await build({ stdin: { contents: 'export {parseAuthoredMarkdown} from "./packages/shared/src/authored-format.ts"; export {currentDefinitionCatalog as catalogData, learningStages, learningSequence} from "./packages/shared/src/current-definition.ts";', resolveDir: root }, bundle: true, platform: 'node', format: 'esm', write: false });
const { parseAuthoredMarkdown, catalogData, learningStages, learningSequence } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const registry = readAuthoredReviews(root, catalogData.units);
const titles = Object.fromEntries(catalogData.modules.map(module => [module.id, module.title]));
// Publication follows the same adopted teaching order as the web. Review scopes remain independent.
const topics = learningSequence.filter(topic => Object.hasOwn(registry.topics, topic));
if (topics.length !== Object.keys(registry.topics).length) throw Error('Reviewed topic missing from current learning sequence');
const stageOf = new Map(learningStages.flatMap(stage => stage.topicIds.map(topic => [topic, stage])));
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
const chunks = ['# Physical AI 통합 상세 교재 {#physical-ai-course}', '일반 코딩 경험을 전제로 개발 환경·빌드 도구에서 로봇 시스템 통합까지 이어 읽습니다. 검수된 현재 원고만 포함하며, 준비중인 주제·프로젝트의 실행 완료를 뜻하지 않습니다. 원고·단위 식별자는 웹과 같습니다.'];
let previousModule = '', previousStage = '';
const seenModules = new Set();
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
  const stage = stageOf.get(topic);
  if (!stage) throw Error(`Missing learning stage: ${topic}`);
  if (stage.id !== previousStage) {
    const count = stage.topicIds.filter(id => Object.hasOwn(registry.topics, id)).length;
    chunks.push(`# ${stage.id}. ${stage.title} {#stage-${stage.id.toLowerCase()}}`, stage.description,
      `이 단계의 계획 ${stage.topicIds.length}개 중 현재 지문으로 검수된 ${count}개 원고를 포함합니다. 단계의 모든 콘텐츠·프로젝트 실행이 완료됐다는 뜻은 아닙니다.`);
    previousStage = stage.id; previousModule = '';
  }
  if (module !== previousModule) {
    const anchor = seenModules.has(module) ? `${module.toLowerCase()}-${topic.toLowerCase().replace(".", "-")}` : module.toLowerCase();
    chunks.push(`# ${module}. ${titles[module]} {#${anchor}}`);
    seenModules.add(module);
    const included = stage.topicIds.filter(id => id.startsWith(`${module}.`) && Object.hasOwn(registry.topics, id)).length;
    const placed = stage.topicIds.filter(id => id.startsWith(`${module}.`)).length;
    const planned = catalogData.units.filter(unit => unit.topicId.startsWith(`${module}.`)).length;
    if (included < placed || placed < planned) chunks.push(`전체 모듈 ${planned}개 중 이번 단계의 배치는 ${placed}개이며, 현재 검수 원고 ${included}개를 포함합니다. 다른 단계에 배치된 단위와 준비중인 단위는 구분합니다.`);
    previousModule = module;
  }
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
