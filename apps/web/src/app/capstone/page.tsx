import { pageMetadata } from "@/lib/seo";
import { pageForPath } from "@/lib/seo-content";
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { AuthoredMarkdown } from "@/components/authored-markdown";
import { Breadcrumbs } from "@/components/curriculum-parts";
import { CourseShell } from "@/components/course-shell";

export const metadata = pageMetadata(pageForPath("/capstone/"));

/** A build-time view of the existing textbook rubric; no new progress or storage model. */
export default function CapstonePage() {
  const content = fs.readFileSync(path.resolve(process.cwd(), "../../ebook/book/06_sim2real_deployment/exercises/project_rubric.md"), "utf8")
    .replace(" {#chapter-6-project-rubric}", "");
  return <CourseShell title="선택 캡스톤 · 제공 자료와 평가" description="세 과제 중 하나를 선택하고 공통 요구·재현·발표 기준으로 근거를 정리합니다.">
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <Breadcrumbs currentHref="/capstone/" items={[{ title: "학습 순서", href: "/curriculum/#stage-S11" }, { title: "선택 캡스톤" }]} />
      <p className="text-sm leading-7 text-slate-700">장비 없는 기본 과제와 선택 실물 확장의 범위를 구분합니다. 작성할 양식은 원본을 내려받아 복사해 사용할 수 있습니다.</p>
      <a href="/textbook-assets/06_sim2real_deployment/exercises/project_rubric.md" download="capstone-guide.md" className="inline-block font-semibold text-blue-700 underline underline-offset-4">원본 안내·양식(.md) 내려받기</a>
      <p className="text-xs leading-6 text-slate-600">표는 가로로 스크롤해 모든 열을 읽을 수 있습니다. 키보드는 표 영역에 초점을 둔 뒤 방향키를 사용하세요.</p>
      <section aria-label="캡스톤 제공 자료" className="rounded-2xl border bg-white p-5 sm:p-8"><AuthoredMarkdown content={content} scrollTables /></section>
      <Link href="/curriculum/#stage-S11" className="inline-block font-semibold text-blue-700">← 캡스톤 학습 단계로 돌아가기</Link>
    </main>
  </CourseShell>;
}
