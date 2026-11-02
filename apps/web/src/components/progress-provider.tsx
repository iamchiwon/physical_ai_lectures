"use client";

import * as React from "react";
import Link from "next/link";
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

  React.useEffect(() => {
    const hydrationTask = window.setTimeout(() => {
      try {
        const stored = parseLegacyProgress(window.localStorage.getItem(STORAGE_KEY));
        setProgress(stored.progress);
        setStorageNotice(stored.notice);
      } catch {
        setStorageNotice("이 브라우저에서 학습 기록을 불러올 수 없습니다. 저장 설정을 확인해 주세요.");
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(hydrationTask);
  }, []);

  React.useEffect(() => {
    if (!hydrated || !shouldSave.current) return;
    shouldSave.current = false;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
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

export function LessonCompleteButton({ lessonId, nextLessonId }: { lessonId: string; nextLessonId?: string | undefined }) {
  const { hydrated, isLessonComplete, markLessonComplete } = useProgress();
  const completed = hydrated && isLessonComplete(lessonId);

  if (completed && nextLessonId) {
    return <Button asChild><Link href={`/learn/${nextLessonId}`}>다음 레슨으로 <ArrowRight className="size-4" /></Link></Button>;
  }
  return (
    <Button type="button" variant={completed ? "soft" : "default"} onClick={() => markLessonComplete(lessonId)} disabled={!hydrated || completed}>
      <CheckCircle2 className="size-4" /> {completed ? "완료한 레슨" : "이 레슨 완료"}
    </Button>
  );
}
