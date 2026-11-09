import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthoredResponse } from "@/components/authored-response";
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
      {project.starter ? <section aria-labelledby="starter-title" className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <h2 id="starter-title" className="text-lg font-bold">실행 패키지 · 장비 없는 기본 경로</h2>
        <p className="mt-3 text-sm leading-7">RGB 마커와 제한된 가상 명령을 Python 표준 라이브러리로 실행합니다. 고정 기록 재생과 합성 폐루프를 따로 비교하며 실제 ROS·카메라·모터·물리 안전을 검증한 결과는 아닙니다.</p>
        <p className="mt-3 text-sm leading-7">확인 환경: {project.starter.verifiedEnvironment}. 외부 패키지나 GPU는 필요하지 않습니다. 압축을 풀어 README·SPEC·SOLUTION의 환경·입력·판정 기준을 확인하세요.</p>
        <div className="mt-4 flex flex-wrap gap-4"><a href={project.starter.href} download="P1-starter.zip" className="font-semibold text-blue-800 underline underline-offset-4">P1 실행 자료 ZIP 내려받기</a><a href={project.starter.manifestHref} download="P1-manifest.json" className="text-sm text-blue-800 underline underline-offset-4">파일 SHA 명세 내려받기</a></div>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-white p-4 text-xs leading-6"><code>{"python --version\npython runner.py --mode replay --input frames.json --output replay.json\npython runner.py --mode closed-loop --steps 20 --output closed-loop.json"}</code></pre>
        <p className="mt-3 text-xs leading-6">출력은 새 파일명으로 저장합니다. 입력/설정/소스·기존 결과를 덮어쓰지 않습니다. 자료를 받거나 단원을 완료한 사실이 이 프로젝트 수행 완료를 뜻하지 않습니다.</p>
      </section> : <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="font-bold">실행 패키지 준비중</h2><p className="mt-3 text-sm leading-7">현재 페이지는 목표·관련 학습·산출물·평가 기준 안내입니다. 프로젝트 starter code, 고정 환경, 입력 데이터와 실행 해설은 준비중입니다. 관련 교재의 계산·로그 활동 완료가 이 프로젝트의 실행 완료를 뜻하지 않습니다.</p></section>}
      <section className="rounded-2xl border bg-white p-5"><h2 className="text-lg font-bold">관련 학습 순서</h2><ol className="mt-3 divide-y">{units.map(unit => <li key={unit.id} className="py-3"><ReadinessBadge state={unit.state} /><Link href={`${unit.href}?track=track-main`} className="ml-2 text-sm leading-7 text-blue-800 underline underline-offset-4">{unit.topicId} · {unit.title}</Link></li>)}</ol></section>
      <section className="rounded-2xl border bg-white p-5"><h2 className="text-lg font-bold">만들고 남길 결과</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7">{project.outputs.map(item => <li key={item}>{item}</li>)}</ul></section>
      <section className="rounded-2xl border bg-white p-5"><h2 className="text-lg font-bold">검토할 실패와 평가 기준</h2><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7">{project.checks.map(item => <li key={item}>{item}</li>)}</ul></section>
      {project.starter ? <section aria-labelledby="project-evidence-title" className="rounded-2xl border bg-white p-5">
        <h2 id="project-evidence-title" className="text-lg font-bold">나의 프로젝트 수행 근거</h2>
        <p className="mt-3 text-sm leading-7">입력/환경·실행 결과·실패 해석·미확인을 기록하세요. 이 브라우저에 단원 답안과 구분해 저장하며 자동 채점·단원 완료·숙달 인증으로 집계하지 않습니다. 필요한 관찰만 적고 인증정보·개인 로그는 넣지 마세요.</p>
        {[
          { id: "inputs", title: "입력·환경과 두 실행 보고서", prompt: "Python/platform·source/config/input SHA와 재생/폐루프 실행 범위를 적으세요.", reference: "고정 재생11행·합성 폐루프20스텝을 구분하고 실제 입력/설정/코드를 연결합니다. reference를 자신의 실행으로 제출하지 않습니다." },
          { id: "failures", title: "상실·시간·축과 복귀", prompt: "LOST·STALE·INVALID·AMBIGUOUS의 관찰과 2회 관측 후 복귀 근거를 적으세요.", reference: "나이100ms는 유효,101ms부터 만료입니다. 관측 상실/실패 후 첫 정상 관측은0명령, 두 번째부터 재개합니다. 0명령의 서로 다른 이유를 비교합니다." },
          { id: "feedback", title: "명령 제한과 피드백 비교", prompt: "오른쪽/왼쪽 명령 제한과 기본/gain0 폐루프의 차이를 설명하세요.", reference: "폭7·중심3에서 x5/x1 오차±2/3, 제한 명령±0.25입니다. 기본20스텝 마지막 관측 오차0, gain0은2/3에 머무르는 작은 합성 모형입니다." },
          { id: "scope", title: "판정·미확인·다음 확인", prompt: "이번 근거가 입증한 범위와 실제 ROS/카메라/실물에서 미확인인 항목을 적으세요.", reference: "입력/명령 계약과 합성 피드백의 근거만 확인합니다. 실제 센서 잡음·통신 지연·물리/안전 성능을 검증한 것으로 확대하지 않습니다." },
        ].map(item => <div key={item.id} className="mt-5"><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-7">{item.prompt}</p><AuthoredResponse activityId={`project:P1:${item.id}`} revision={project.starter!.revision} solutionId={`project-P1-reference-${item.id}`} solution={<p className="text-sm leading-7">{item.reference}</p>} /></div>)}
        <p className="mt-5 text-sm leading-7">질문은 <Link href="/study/unit-m12-01-a/?track=track-main" className="text-blue-700 underline">영상·배열 단위의 AI 강사</Link> 또는 <Link href="/study/unit-m05-02-a/?track=track-main" className="text-blue-700 underline">노드·메시지 단위의 AI 강사</Link>에서 이어가세요. 실행 기록은 자동 전달되지 않으므로 필요한 관찰을 질문에 붙여 넣으세요.</p>
      </section> : null}
      <p className="text-sm leading-7 text-slate-600">고정 기록 재생·시뮬레이션 폐루프·실물 실행은 각각 수행한 범위로 기록합니다. 장비 없는 조건 변화 실험을 실제 Sim2Real 실증으로 표시하지 않습니다.</p>
      <Link href={`/curriculum/#stage-${project.stageId}`} className="inline-block font-semibold text-blue-700">← 학습 단계로 돌아가기</Link>
    </main>
  </CourseShell>;
}
