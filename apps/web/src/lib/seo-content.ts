import { catalog, curriculumIndex } from "@/lib/curriculum";
import { authoredForTopic } from "@/lib/authored";
import { allLessons } from "@/data/course";
import { learningProjects } from "@/lib/learning-projects";
import { textbookUnits, textbookLink, type TextbookUnit } from "@/lib/textbook";
import { plainDescription, type SeoPage } from "@/lib/seo";
import { unitReadiness, type CatalogUnit } from "@physical-ai/shared/catalog";

export function studySeo(unit: CatalogUnit): SeoPage {
  return { path: `/study/${unit.id}/`, title: `${unit.topicId} · ${unit.title}`, description: `${unit.title}. ${unit.objectives.map(goal => goal.description).join(' ')} 본문·실습·확인 문제로 학습합니다.`, type: 'article', index: unitReadiness(unit, curriculumIndex).state === 'ready' };
}
export function textbookSeo(unit: TextbookUnit): SeoPage {
  const document = textbookUnits.find(row => row.source === unit.source)!;
  const context = document.title !== unit.title ? `${document.title} · ` : `${unit.group} · `;
  const prose = unit.content.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, ' ').split('\n').filter(line => !/^\s*(?:#|\||!\[|<)/.test(line)).join(' ');
  const sentence = prose.split(/(?<=[.!?])\s+/).find(text => text.trim().length >= 15 && !/[\\$]/.test(text)) ?? '';
  return { path: `/textbook/${unit.slug}/`, title: `${context}${unit.title}`, description: `${document.title}의 ${unit.title}. ${plainDescription(sentence, 115) || '한국어 로봇 제어 교재의 개념·실습 조건과 판단 근거를 확인합니다.'}`, type: 'article' };
}
let cachedPages: SeoPage[] | undefined;
export function publicSeoPages(): SeoPage[] {
  return cachedPages ??= [
    { path: '/', title: '피지컬 AI 로봇 교육·한국어 교재', description: '코딩 경험에서 로봇 시스템 구현으로. 35모듈·207단위의 피지컬 AI 한국어 교재와 실습으로 ROS 2, 컴퓨터 비전, 주행·조작, 모방학습, Sim2Real을 단계별로 학습합니다.' },
    { path: '/curriculum/', title: '피지컬 AI 커리큘럼·학습 순서', description: '환경·도구에서 인지·제어·시뮬레이션·로봇 학습·통합까지. 35모듈·207단위와 분야별 7개 추천 경로의 선수와 학습 순서를 확인하세요.' },
    { path: '/textbook/', title: '피지컬 AI 교재·실습·확인 문제', description: '상세 교재 207단위와 기존 6장 응용 교재를 탐색하세요. ROS 2, 기구학, 센서·비전, 모방학습과 Sim2Real의 본문·실습·개별 해설을 제공합니다.' },
    { path: '/capstone/', title: '로봇 캡스톤 과제·평가 기준', description: '모바일 배달, 로봇팔 조작, 이동 매니퓰레이터·양팔 협응 과제의 요구사항과 재현·실험·발표 기준을 확인하세요.' },
    ...catalog.modules.map(module => ({ path: `/modules/${module.id}/`, title: `${module.id} · ${module.title}`, description: `${module.title}. ${module.objectives.map(goal => goal.description).join(' ')} 소주제별 교재와 권장 선수를 확인하세요.` })),
    ...catalog.tracks.map(track => ({ path: `/tracks/${track.id}/`, title: `${track.title} · 학습 경로`, description: `${track.description} 필수/선택 학습 단위의 순서와 선수를 확인하세요.` })),
    ...catalog.units.map(studySeo),
    ...learningProjects.map(project => ({ path: `/projects/${project.id}/`, title: `${project.id} · ${project.title}`, description: `${project.goal} 제공 자료, 산출물과 평가 기준을 확인하고 수행 근거를 기록합니다.` })),
    ...allLessons.map(lesson => ({ path: `/learn/${lesson.id}/`, title: `${lesson.title} · 요약 레슨`, description: lesson.summary, type: 'article' as const })),
    ...textbookUnits.map(textbookSeo),
  ];
}
export function pageForPath(path: string) {
  const page = publicSeoPages().find(page => page.path === path);
  if (!page) throw new Error(`Missing SEO page: ${path}`);
  return page;
}
export function sitemapImages(path: string): string[] {
  const study = /^\/study\/([^/]+)\/$/.exec(path);
  const unit = study ? curriculumIndex.units.get(study[1]!) : undefined;
  const authored = unit ? authoredForTopic(unit.topicId) : null;
  const legacy = textbookUnits.find(unit => path === `/textbook/${unit.slug}/`);
  return [...new Set([...((authored?.body ?? legacy?.content ?? '').matchAll(/!\[[^\]]*\]\(([^)]+)\)/g))].map(match => authored ? match[1]! : textbookLink(match[1]!, legacy!)).filter(url => url.startsWith('/') && !url.startsWith('//')))];
}
