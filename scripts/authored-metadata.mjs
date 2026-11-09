import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

// Registry scope is deliberate review authority; document discovery uses the full catalog.
export const authoredReviewRegistries = [
  { file: 'doc/v2/inventory/e1-reviews.json', modules: ['M00', 'M01', 'M02', 'M03'] },
  { file: 'doc/v2/inventory/e2-reviews.json', modules: ['M05', 'M06', 'M07', 'M08'] },
  { file: 'doc/v2/inventory/e3-reviews.json', modules: ['M10', 'M11', 'M12'], topicIds: ['M14.01', 'M14.03', 'M14.06'] },
  { file: 'doc/v2/inventory/e4-reviews.json', modules: ['M19', 'M20', 'M21', 'M22', 'M27', 'M30', 'M32'] },
  { file: 'doc/v2/inventory/e5-reviews.json', modules: ['M09', 'M15', 'M17', 'M18'] },
  { file: 'doc/v2/inventory/w01-reviews.json', topicIds: ['M31.01', 'M31.02'] },
  { file: 'doc/v2/inventory/w02-reviews.json', topicIds: ['M13.01', 'M13.02', 'M13.05', 'M13.06', 'M14.02', 'M14.04'] },
  { file: 'doc/v2/inventory/w03-reviews.json', topicIds: ['M31.03', 'M31.04'] },
  { file: 'doc/v2/inventory/w04-reviews.json', topicIds: ['M25.01', 'M25.02', 'M25.03', 'M25.04', 'M25.05', 'M25.06'] },
];
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const exactKeys = (value, keys) => Object.keys(value).every(key => keys.includes(key));
const relativeFile = value => typeof value === 'string' && value.trim() && !path.isAbsolute(value) && !value.includes('\\') && !value.split('/').some(part => !part || part === '..' || part === '.');
export function mergeAuthoredReviews(registries, knownTopicIds) {
  const known = new Set(knownTopicIds), topics = Object.create(null);
  for (const { file, modules, topicIds, data } of registries) {
    if (!object(data) || data.schemaVersion !== 1 || !object(data.topics) || !exactKeys(data, ['schemaVersion', 'topics'])) throw Error(`Unsupported authored review registry: ${file}`);
    for (const [id, review] of Object.entries(data.topics)) {
      if (Object.hasOwn(topics, id)) throw Error(`Duplicate authored review: ${id}`);
      if (!known.has(id) || !/^M\d{2}\.\d{2}$/.test(id)) throw Error(`Unknown authored review topic: ${id}`);
      if ((modules || topicIds) && !modules?.includes(id.split('.')[0]) && !topicIds?.includes(id)) throw Error(`Authored review outside registry scope: ${file}: ${id}`);
      if (!object(review) || !exactKeys(review, ['sourceSha256', 'evidenceRef']) || !/^[a-f0-9]{64}$/.test(review.sourceSha256 ?? '') || !relativeFile(review.evidenceRef)) throw Error(`Invalid authored review: ${file}: ${id}`);
      topics[id] = { sourceSha256: review.sourceSha256, evidenceRef: review.evidenceRef };
    }
  }
  return { schemaVersion: 1, topics };
}
export function readAuthoredReviews(root, units) {
  return mergeAuthoredReviews(authoredReviewRegistries.map(registry => {
    const file = path.join(root, registry.file);
    if (!fs.existsSync(file) || !fs.lstatSync(file).isFile()) throw Error(`Missing authored review registry: ${registry.file}`);
    return { ...registry, data: JSON.parse(fs.readFileSync(file, 'utf8')) };
  }), units.map(unit => unit.topicId));
}
export function collectAuthoredMetadata(root, units, reviews, parseDocument) {
  const expected = new Map(units.map(unit => [`ebook/curriculum/${unit.topicId.split('.')[0]}/${unit.topicId}.md`, unit]));
  if (expected.size !== units.length) throw Error('Ambiguous authored topic mapping');
  const directory = path.join(root, 'ebook/curriculum');
  const visit = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name), source = path.relative(root, file).split(path.sep).join('/');
      if (entry.isSymbolicLink()) throw Error(`Symbolic authored source is not allowed: ${source}`);
      if (entry.isDirectory()) visit(file);
      else if (/\.md$/i.test(entry.name) && entry.name !== 'README.md' && !expected.has(source)) throw Error(`Unknown authored source: ${source}`);
    }
  };
  if (fs.existsSync(directory)) visit(directory);
  const authored = [];
  for (const [source, unit] of expected) {
    const file = path.join(root, source);
    if (!fs.existsSync(file)) continue;
    if (!fs.lstatSync(file).isFile()) throw Error(`Invalid authored source file: ${source}`);
    const raw = fs.readFileSync(file), parsed = parseDocument(raw.toString('utf8'));
    const sha256 = createHash('sha256').update(raw).digest('hex');
    if (parsed.title !== unit.title) throw Error(`Authored title mismatch: ${unit.topicId}`);
    const review = reviews.topics[unit.topicId];
    if (review) {
      const evidence = path.join(root, review.evidenceRef);
      if (!fs.existsSync(evidence) || !fs.lstatSync(evidence).isFile()) throw Error(`Missing review evidence: ${unit.topicId}`);
    }
    const reviewed = review?.sourceSha256 === sha256;
    authored.push({ topicId: unit.topicId, source, title: parsed.title, objectives: parsed.objectives, prerequisiteNote: parsed.prerequisiteNote, sha256, reviewed, evidenceRef: reviewed ? review.evidenceRef : null });
  }
  for (const id of Object.keys(reviews.topics)) if (!authored.some(item => item.topicId === id)) throw Error(`Review without authored source: ${id}`);
  return authored;
}

/** Historical registered source fingerprints, not arbitrary paths from approval files. */
export function legacySourceBaselines(catalog, bookFiles) {
  const result = new Map();
  const register = (source, sha256) => {
    const key = /^(?:ebook|apps|packages)\//.test(source) ? source : `ebook/book/${source}`;
    if (result.has(key) && result.get(key) !== sha256) throw Error(`Conflicting historical source fingerprints: ${key}`);
    result.set(key, sha256);
  };
  for (const file of bookFiles) register(`ebook/book/${file.source}`, file.sha256);
  for (const activity of catalog.activities) register(activity.locator.source, activity.locator.sourceSha256);
  for (const resource of catalog.resources) {
    const locator = resource.locator;
    if ('baselineFileSha256' in locator) register(locator.source, locator.baselineFileSha256);
  }
  return result;
}
