"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { resolveStudyNavigation, studyHref } from "@/lib/study-navigation";
import type { StudyOrder, StudyTrackContext } from "@/lib/study-navigation";

const labels = { ready: "준비됨", partial: "일부 준비", tbd: "TBD · 준비 예정" };
export function StudyNavigationView({ navigation }: { navigation: ReturnType<typeof resolveStudyNavigation> }) {
  const { previous, next, context, notice } = navigation;
  return <section aria-labelledby="study-navigation-title" className="mt-8 rounded-2xl border bg-white p-5 sm:p-6">
    <h2 id="study-navigation-title" className="text-lg font-bold">학습 이동</h2>
    <div aria-live="polite">
      {notice ? <p role="status" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm leading-7 text-amber-900">{notice}</p> : null}
      {context ? <p className="mt-3 text-sm leading-7 text-slate-600">현재 경로: <Link className="font-semibold text-blue-700" href={`/tracks/${context.id}/#${context.stepId}`}>{context.title}</Link> · {context.position} / {context.total} · {context.required ? "필수" : "선택 심화"}</p> : <p className="mt-3 text-sm text-slate-600">전체 목차의 단위 순서</p>}
    </div>
    <nav aria-label="이전과 다음 학습 단위" className="mt-4 grid gap-3 sm:grid-cols-2">
      {[{ label: "이전 단위", item: previous }, { label: "다음 단위", item: next }].map(({ label, item }) => item ? <Link key={label} href={studyHref(item.id, context?.id)} className="min-w-0 rounded-xl border p-4 hover:bg-blue-50"><span className="block text-xs text-slate-500">{label} · {labels[item.state]}</span><span className="mt-2 block text-sm font-semibold leading-7 text-blue-800">{item.topicId} · {item.title}</span></Link> : <p key={label} className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">{label === "이전 단위" ? "이 순서의 첫 단위입니다." : "이 순서의 마지막 단위입니다."}</p>)}
    </nav>
    <Link href="/curriculum/" className="mt-4 inline-block text-sm font-semibold text-blue-700">전체 목차로 돌아가기 →</Link>
  </section>;
}
export function StudyNavigation({ base, contexts }: { base: StudyOrder; contexts: StudyTrackContext[] }) {
  const search = useSearchParams();
  return <StudyNavigationView navigation={resolveStudyNavigation(base, contexts, search.getAll("track"))} />;
}
