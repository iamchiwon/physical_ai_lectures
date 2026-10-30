"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export function GlossaryPractice({ terms }: { terms: { term: string; description: string }[] }) {
  const [query, setQuery] = React.useState("");
  const [revealed, setRevealed] = React.useState<string[]>([]);
  const filtered = terms.filter((item) => `${item.term} ${item.description}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="rounded-2xl border bg-white p-6"><h2 className="text-2xl font-bold">핵심 용어 복습</h2><p className="mt-2 text-sm text-slate-600">뜻을 먼저 떠올린 뒤 설명을 열어 비교해 보세요.</p><label className="mt-4 block text-sm font-bold" htmlFor="term-search">용어·설명 검색</label><input id="term-search" className="mt-2 w-full rounded-xl border p-3" value={query} onChange={(event) => setQuery(event.target.value)} /><div className="mt-4 grid gap-3 sm:grid-cols-2">{filtered.map((item) => <div className="rounded-xl border p-4" key={item.term}><h3 className="font-bold text-blue-950">{item.term}</h3>{revealed.includes(item.term) ? <p className="mt-2 text-sm leading-6">{item.description}</p> : <Button className="mt-2" variant="soft" size="sm" onClick={() => setRevealed((current) => [...current, item.term])}>설명 확인</Button>}</div>)}</div>{!filtered.length ? <p className="mt-4">검색 결과가 없습니다.</p> : null}</section>;
}
