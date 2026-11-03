"use client";

import { useEffect, useSyncExternalStore, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { learningStore, LEARNING_STORAGE_KEY } from "@/lib/learning-store";
import { studyHref } from "@/lib/study-navigation";

export function useLearningState() {
  const state = useSyncExternalStore(learningStore.subscribe, learningStore.getSnapshot, learningStore.getServerSnapshot);
  useEffect(() => {
    learningStore.hydrate();
    const receive = (event: StorageEvent) => {
      if (event.storageArea === window.localStorage && (event.key === LEARNING_STORAGE_KEY || event.key === null)) learningStore.receiveStorage(event.newValue);
    };
    window.addEventListener("storage", receive);
    return () => window.removeEventListener("storage", receive);
  }, []);
  return state;
}
export function LearningStorageNotice() {
  const state = useLearningState();
  if (!state.notice) return null;
  const download = () => {
    const url = URL.createObjectURL(new Blob([state.raw ?? JSON.stringify(state.data)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "physical-ai-learning-record.json"; anchor.click(); URL.revokeObjectURL(url);
  };
  return <div role="status" className="my-4 rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-950"><p>{state.notice}</p><button className="mr-4 underline" onClick={download}>원본 기록 내려받기</button><button className="underline" onClick={() => { if (window.confirm("신규 단위의 읽기·이어 학습 기록만 초기화합니다. 기존 요약 진도·답안·대화는 유지됩니다. 계속할까요?")) learningStore.reset(); }}>신규 학습 기록만 초기화</button></div>;
}
function LocationTracker({ unitId, revision, catalogRevision, trackIds }: { unitId: string; revision: string; catalogRevision: string; trackIds: string[] }) {
  const state = useLearningState();
  const search = useSearchParams();
  const tracks = search.getAll("track");
  const trackId = tracks.length === 1 && trackIds.includes(tracks[0]!) ? tracks[0]! : null;
  useEffect(() => { if (state.hydrated) learningStore.view(unitId, revision, catalogRevision, trackId); }, [state.hydrated, unitId, revision, catalogRevision, trackId]);
  return null;
}
export function LearningLocation(props: { unitId: string; revision: string; catalogRevision: string; trackIds: string[] }) {
  return <><Suspense fallback={null}><LocationTracker {...props} /></Suspense><LearningStorageNotice /></>;
}
export interface ResumeUnit { id: string; title: string; state: string; revision: string; trackIds: string[] }
export function LearningResume({ units }: { units: ResumeUnit[] }) {
  const state = useLearningState();
  const location = state.data.lastLocation;
  if (!state.hydrated || !location) return <LearningStorageNotice />;
  const unit = units.find((item) => item.id === location.unitId);
  const track = location.trackId && unit?.trackIds.includes(location.trackId) ? location.trackId : undefined;
  return <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-7"><LearningStorageNotice />{unit ? <><p className="font-semibold">최근 통합 단위: {unit.title}</p><p>{unit.state} · 읽기 기록이며 완료·숙달과 별개입니다.</p>{location.trackId && !track ? <p>이전 추천 경로가 변경되어 단위에서 이어갑니다.</p> : null}{state.data.unitProgress[unit.id]?.contentRevision !== unit.revision ? <p>이 단위의 내용이 변경되었습니다. 현재 준비 상태를 다시 확인하세요.</p> : null}<Link className="font-semibold text-blue-700 underline" href={studyHref(unit.id, track)}>통합 단위 이어 학습 →</Link></> : <p>이전 단위 ID를 현재 목차에서 찾을 수 없습니다. 기록은 보존했습니다. <Link className="text-blue-700 underline" href="/curriculum/">전체 목차에서 선택하세요.</Link></p>}</div>;
}
