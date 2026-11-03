"use client";

import { Suspense, type ReactNode, type ComponentProps } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LearningLocation } from "@/components/learning-location";
import { forwardLegacyStudyHref, legacyStudyHref, resolveLegacyStudyContext, type LegacyStudyContext } from "@/lib/legacy-study-context";

interface ResourceLinkProps { href: string; unitId: string; trackIds?: string[]; title?: string; className?: string; children?: ReactNode }
function ResourceLink({ href, unitId, trackIds = [], title, className, children }: ResourceLinkProps) {
  const search = useSearchParams();
  const tracks = search.getAll("track");
  const track = tracks.length === 1 && trackIds.includes(tracks[0]!) ? tracks[0] : undefined;
  return <Link href={legacyStudyHref(href, unitId, track)} className={className} title={title}>{children ?? title}</Link>;
}
export function StudyResourceLink(props: ResourceLinkProps) {
  return <Suspense fallback={<Link href={legacyStudyHref(props.href, props.unitId)} className={props.className}>{props.children ?? props.title}</Link>}><ResourceLink {...props} /></Suspense>;
}
function ReturnNavigation({ contexts }: { contexts: LegacyStudyContext[] }) {
  const search = useSearchParams();
  const context = resolveLegacyStudyContext(contexts, search.getAll("from"), search.getAll("track"));
  const location = context ?? (search.getAll("from").length === 0 && contexts.length === 1 ? contexts[0] : null);
  return <><nav aria-label="통합 학습으로 복귀" className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-7">
    {context ? <><p className="font-semibold">현재 통합 단위: {context.title}</p><Link className="font-semibold text-blue-700 underline" href={context.href}>단위로 돌아가 이전·다음 학습 이어가기 →</Link><span className="mx-2">·</span><Link className="text-blue-700 underline" href={`/modules/${context.moduleId}/`}>모듈 목차</Link></> : <Link href="/curriculum/" className="text-blue-700 underline">통합 커리큘럼 전체 목차 →</Link>}
    <p className="mt-1 text-xs text-slate-600">기존 자료의 답안·진도·대화는 같은 기록을 사용합니다. 읽기만으로 새 단위를 완료하지 않습니다.</p>
  </nav>{location ? <LearningLocation unitId={location.id} revision={location.revision} catalogRevision={location.catalogRevision} trackIds={location.trackIds} /> : null}</>;
}
export function LegacyStudyNavigation(props: { contexts: LegacyStudyContext[] }) {
  return <Suspense fallback={<nav className="mb-5 text-sm"><Link href="/curriculum/">통합 커리큘럼 전체 목차 →</Link></nav>}><ReturnNavigation {...props} /></Suspense>;
}

type LegacyContextLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };
function ContextLink({ href, ...props }: LegacyContextLinkProps) {
  const search = useSearchParams();
  return <Link {...props} href={forwardLegacyStudyHref(href, search.getAll("from"), search.getAll("track"))} />;
}
export function LegacyContextLink(props: LegacyContextLinkProps) {
  return <Suspense fallback={<Link {...props} />}><ContextLink {...props} /></Suspense>;
}
