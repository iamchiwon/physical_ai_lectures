"use client";

import * as React from "react";
import { LegacyContextLink } from "@/components/legacy-study-navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

import { emptyLegacyProgress, LEGACY_PROGRESS_KEY, parseLegacyProgress } from "@/lib/home-progress";
import type { LegacyProgress } from "@/lib/home-progress";

const STORAGE_KEY = LEGACY_PROGRESS_KEY;
type StoredProgress = LegacyProgress;

interface ProgressContextValue extends StoredProgress {
  hydrated: boolean;
  storageNotice: string | null;
  markLessonComplete: (lessonId: string) => void;
  isLessonComplete: (lessonId: string) => boolean;
  saveQuizScore: (lessonId: string, score: number, totalQuestions?: number) => void;
  getQuizScore: (lessonId: string) => number | undefined;
  setLastLesson: (lessonId: string) => void;
  resetProgress: () => void;
}

const emptyProgress = emptyLegacyProgress;
const ProgressContext = React.createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = React.useState<StoredProgress>(emptyProgress);
  const [hydrated, setHydrated] = React.useState(false);
  const [storageNotice, setStorageNotice] = React.useState<string | null>(null);
  const shouldSave = React.useRef(false);
  const storageWritable = React.useRef(true);
  const persistedRaw = React.useRef<string | null>(null);

  React.useEffect(() => {
    const hydrationTask = window.setTimeout(() => {
      try {
        persistedRaw.current = window.localStorage.getItem(STORAGE_KEY);
        const stored = parseLegacyProgress(persistedRaw.current);
        storageWritable.current = stored.notice === null;
        setProgress(stored.progress);
        setStorageNotice(stored.notice ? `${stored.notice} 원본 보호를 위해 저장을 멈췄습니다. 백업·복구 후 새로고침하세요.` : null);
      } catch {
        storageWritable.current = false;
        setStorageNotice("이 브라우저에서 학습 기록을 불러올 수 없습니다. 저장 설정을 확인해 주세요.");
      }
      setHydrated(true);
    }, 0);
    const onStorage = (event: StorageEvent) => {
      if (event.storageArea !== window.localStorage || (event.key !== STORAGE_KEY && event.key !== null)) return;
      const stored = parseLegacyProgress(event.newValue);
      persistedRaw.current = event.newValue;
      storageWritable.current = stored.notice === null;
      shouldSave.current = false;
      if (!stored.notice) setProgress(stored.progress);
      setStorageNotice(stored.notice ? `${stored.notice} 원본 보호를 위해 저장을 멈췄습니다.` : "다른 탭의 학습 기록을 불러왔습니다.");
    };
    window.addEventListener("storage", onStorage);
    return () => { window.clearTimeout(hydrationTask); window.removeEventListener("storage", onStorage); };
  }, []);

  React.useEffect(() => {
    if (!hydrated || !shouldSave.current) return;
    shouldSave.current = false;
    try {
      if (!storageWritable.current || window.localStorage.getItem(STORAGE_KEY) !== persistedRaw.current) {
        storageWritable.current = false;
        const task = window.setTimeout(() => setStorageNotice("기존 학습 기록 원본을 보호하기 위해 저장을 멈췄습니다. 현재 변경은 이 화면에만 유지됩니다. 백업·복구 후 새로고침하세요."), 0);
        return () => window.clearTimeout(task);
      }
      const raw = JSON.stringify(progress);
      window.localStorage.setItem(STORAGE_KEY, raw);
      persistedRaw.current = raw;
    } catch {
      const task = window.setTimeout(() => setStorageNotice("학습 기록을 저장하지 못했습니다. 현재 화면의 기록은 유지되며 다음 학습 동작에서 다시 저장합니다."), 0);
      return () => window.clearTimeout(task);
    }
  }, [hydrated, progress]);

  const markLessonComplete = React.useCallback((lessonId: string) => {
    shouldSave.current = true;
    setProgress((current) => ({
      ...current,
      completedLessons: current.completedLessons.includes(lessonId)
        ? current.completedLessons
        : [...current.completedLessons, lessonId],
      lastLessonId: lessonId,
    }));
  }, []);

  const isLessonComplete = React.useCallback(
    (lessonId: string) => progress.completedLessons.includes(lessonId),
    [progress.completedLessons],
  );

  const saveQuizScore = React.useCallback((lessonId: string, score: number) => {
    shouldSave.current = true;
    const safeScore = Math.min(100, Math.max(0, Math.round(score)));
    setProgress((current) => ({
      ...current,
      quizScores: { ...current.quizScores, [lessonId]: Math.max(current.quizScores[lessonId] ?? 0, safeScore) },
      lastLessonId: lessonId,
    }));
  }, []);

  const getQuizScore = React.useCallback((lessonId: string) => progress.quizScores[lessonId], [progress.quizScores]);
  const setLastLesson = React.useCallback((lessonId: string) => {
    shouldSave.current = true;
    setProgress((current) => ({ ...current, lastLessonId: lessonId }));
  }, []);
  const resetProgress = React.useCallback(() => {
    shouldSave.current = true;
    setProgress(emptyProgress);
  }, []);
  const value = React.useMemo<ProgressContextValue>(
    () => ({ ...progress, hydrated, storageNotice, markLessonComplete, isLessonComplete, saveQuizScore, getQuizScore, setLastLesson, resetProgress }),
    [progress, hydrated, storageNotice, markLessonComplete, isLessonComplete, saveQuizScore, getQuizScore, setLastLesson, resetProgress],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = React.useContext(ProgressContext);
  if (!context) throw new Error("useProgress는 ProgressProvider 안에서 사용해야 합니다.");
  return context;
}

export function ProgressStorageNotice() {
  const { storageNotice } = useProgress();
  return storageNotice ? <p role="status" className="mb-5 rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-950">{storageNotice}</p> : null;
}

export function LessonCompleteButton({ lessonId, nextLessonId }: { lessonId: string; nextLessonId?: string | undefined }) {
  const { hydrated, isLessonComplete, markLessonComplete } = useProgress();
  const completed = hydrated && isLessonComplete(lessonId);

  if (completed && nextLessonId) {
    return <Button asChild><LegacyContextLink href={`/learn/${nextLessonId}`}>다음 레슨으로 <ArrowRight className="size-4" /></LegacyContextLink></Button>;
  }
  return (
    <Button type="button" variant={completed ? "soft" : "default"} onClick={() => markLessonComplete(lessonId)} disabled={!hydrated || completed}>
      <CheckCircle2 className="size-4" /> {completed ? "완료한 레슨" : "이 레슨 완료"}
    </Button>
  );
}
