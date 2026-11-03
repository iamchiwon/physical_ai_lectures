import Link from "next/link";
import { stateLabels, prerequisiteLinks } from "@/lib/curriculum";
import type { CatalogUnit, Readiness } from "@physical-ai/shared/catalog";

export function ReadinessBadge({ state }: { state: Readiness | "not_applicable" }) {
  if (state === "ready") return null;
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${state === "not_applicable" ? "bg-slate-100 text-slate-600" : "bg-blue-50 text-blue-800"}`}>{stateLabels[state]}</span>;
}
export function ReadinessCounts({ counts }: { counts: { ready: number; partial: number; tbd: number } }) {
  const pending = counts.partial + counts.tbd;
  return pending > 0 ? <span className="text-xs leading-6 text-slate-600">준비중 {pending}</span> : null;
}
export function Prerequisites({ unit }: { unit: CatalogUnit }) {
  const { allOf, anyOf } = prerequisiteLinks(unit);
  return <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
    <p className="font-semibold text-slate-800">권장 선수 {unit.prerequisites.definitionStatus === "pending" ? <span className="font-normal text-slate-500">· 집필 전 확정할 초안</span> : null}</p>
    {!allOf.length && !anyOf.length ? <p>선수 없음</p> : <>
      {allOf.length ? <div className="mt-2"><p className="text-xs font-semibold">모두 권장</p><ul>{allOf.map((link) => <li key={link.id}><Link href={link.href} className="text-blue-700 underline underline-offset-4">{link.topicId} · {link.title}</Link></li>)}</ul></div> : null}
      {anyOf.length ? <div className="mt-2"><p className="text-xs font-semibold">다음 중 하나 이상</p><ul>{anyOf.map((link) => <li key={link.id}><Link href={link.href} className="text-blue-700 underline underline-offset-4">{link.topicId} · {link.title}</Link></li>)}</ul></div> : null}
    </>}
    <p className="mt-2 text-xs leading-6">{unit.prerequisites.reason} 이미 알고 있다면 직접 열어볼 수 있습니다.</p>
  </div>;
}
export function Breadcrumbs({ items }: { items: { title: string; href?: string }[] }) {
  return <nav aria-label="현재 위치" className="mb-6"><ol className="flex flex-wrap gap-x-2 gap-y-1 text-sm leading-6 text-slate-500">{items.map((item, i) => <li key={`${i}-${item.title}`} className="flex gap-2">{i ? <span aria-hidden="true">/</span> : null}{item.href ? <Link className="text-blue-700" href={item.href}>{item.title}</Link> : <span aria-current="page" className="font-semibold text-slate-800">{item.title}</span>}</li>)}</ol></nav>;
}
