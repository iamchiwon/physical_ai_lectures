import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseShell } from "@/components/course-shell";
import { Breadcrumbs, ReadinessBadge } from "@/components/curriculum-parts";
import { unitLink, topicIndex } from "@/lib/curriculum";
import { learningProjects } from "@/lib/learning-projects";

export function generateStaticParams() { return learningProjects.map(project => ({ projectId: project.id })); }
export async function generateMetadata({ params }: { params: Promise<{ projectId: string }> }) { const { projectId } = await params; return { title: learningProjects.find(project => project.id === projectId)?.title ?? "프로젝트 없음" }; }
export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params; const project = learningProjects.find(project => project.id === projectId); if (!project) notFound();
  const units = project.topics.flatMap(id => topicIndex.get(id)!.unitIds.map(unitLink));
  return <CourseShell title={`${project.id} · ${project.title}`} description={project.goal}>
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ title: "학습 홈", href: "/" }, { title: "학습 순서", href: `/curriculum/#stage-${project.stageId}` }, { title: project.id }]} />
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-bold">실행 패키지 준비중</h2><p className="mt-3 text-sm leading-7">현재 페이지는 목표·관련 학습·산출물·평가 기준 안내입니다. 프로젝트 starter code, 고정 환경, 입력 데이터와 실행 해설은 준비중입니다. 관련 교재의 계산·로그 활동 완료가 이 프로젝트의 실행 완료를 뜻하지 않습니다.</p></section>
      <section className="rounded-2xl border bg-white p-5"><h2 className="text-lg font-bold">관련 학습 순서</h2><ol className="mt-3 divide-y">{units.map(unit => <li key={unit.id} className="py-3"><ReadinessBadge state={unit.state} /><Link href={`${unit.href}?track=track-main`} className="ml-2 text-sm leading-7 text-blue-800 underline underline-offset-4">{unit.topicId} · {unit.title}</Link></li>)}</ol></section>
      <section className="rounded-2xl border bg-white p-5"><h2 className="text-lg font-bold">만들고 남길 결과</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7">{project.outputs.map(item => <li key={item}>{item}</li>)}</ul></section>
      <section className="rounded-2xl border bg-white p-5"><h2 className="text-lg font-bold">검토할 실패와 평가 기준</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7">{project.checks.map(item => <li key={item}>{item}</li>)}</ul></section>
      <p className="text-sm leading-7 text-slate-600">고정 기록 재생·시뮬레이션 폐루프·실물 실행은 각각 수행한 범위로 기록합니다. 장비 없는 조건 변화 실험을 실제 Sim2Real 실증으로 표시하지 않습니다.</p>
      <Link href={`/curriculum/#stage-${project.stageId}`} className="inline-block font-semibold text-blue-700">← 학습 단계로 돌아가기</Link>
    </main>
  </CourseShell>;
}
