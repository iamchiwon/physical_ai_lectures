"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BookCheck, CheckCircle2, Clock3, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getProgress, isApiConfigured, putProgress } from "@/lib/api-client";
import type { ProgressSnapshot, ProgressUpsert } from "@physical-ai/shared";

const STORAGE_KEY = "physical-ai-study-progress-v1";
const LEARNER_ID_KEY = "physical-ai-anonymous-learner-v1";

interface StoredProgress {
  completedLessons: string[];
  quizScores: Record<string, number>;
  lastLessonId: string | null;
}

interface ProgressContextValue extends StoredProgress {
  hydrated: boolean;
  markLessonComplete: (lessonId: string) => void;
  isLessonComplete: (lessonId: string) => boolean;
  saveQuizScore: (lessonId: string, score: number, totalQuestions?: number) => void;
  getQuizScore: (lessonId: string) => number | undefined;
  setLastLesson: (lessonId: string) => void;
  resetProgress: () => void;
}

const emptyProgress: StoredProgress = { completedLessons: [], quizScores: {}, lastLessonId: null };
const ProgressContext = React.createContext<ProgressContextValue | null>(null);

function readStoredProgress(): StoredProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress;
    const parsed = JSON.parse(raw) as Partial<StoredProgress>;
    return {
      completedLessons: Array.isArray(parsed.completedLessons)
        ? parsed.completedLessons.filter((value): value is string => typeof value === "string")
        : [],
      quizScores: parsed.quizScores && typeof parsed.quizScores === "object" ? parsed.quizScores : {},
      lastLessonId: typeof parsed.lastLessonId === "string" ? parsed.lastLessonId : null,
    };
  } catch {
    return emptyProgress;
  }
}

function getOrCreateLearnerId() {
  const stored = window.localStorage.getItem(LEARNER_ID_KEY);
  if (stored) return stored;
  const learnerId = crypto.randomUUID();
  window.localStorage.setItem(LEARNER_ID_KEY, learnerId);
  return learnerId;
}

function mergeProgress(local: StoredProgress, remote: ProgressSnapshot): StoredProgress {
  const completedLessons = [...new Set([...local.completedLessons, ...remote.completedLessons])];
  const quizScores = { ...remote.quizScores };
  for (const [lessonId, score] of Object.entries(local.quizScores)) {
    quizScores[lessonId] = Math.max(quizScores[lessonId] ?? 0, score);
  }
  return {
    completedLessons,
    quizScores,
    lastLessonId: local.lastLessonId ?? remote.lastLessonId,
  };
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = React.useState<StoredProgress>(emptyProgress);
  const [hydrated, setHydrated] = React.useState(false);
  const [syncReady, setSyncReady] = React.useState(false);
  const learnerIdRef = React.useRef<string | null>(null);
  const pendingAttemptRef = React.useRef<ProgressUpsert["attempt"]>(undefined);

  React.useEffect(() => {
    let active = true;
    const hydrationTask = window.setTimeout(() => {
      const hydrate = async () => {
        const localProgress = readStoredProgress();
        const learnerId = getOrCreateLearnerId();
        learnerIdRef.current = learnerId;
        let mergedProgress = localProgress;
        if (isApiConfigured()) {
          try {
            mergedProgress = mergeProgress(localProgress, await getProgress(learnerId));
          } catch {
            // Offline-first: the browser copy remains usable when the Worker is unavailable.
          }
        }
        if (!active) return;
        setProgress(mergedProgress);
        setHydrated(true);
        setSyncReady(true);
      };
      void hydrate();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(hydrationTask);
    };
  }, []);

  React.useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [hydrated, progress]);

  React.useEffect(() => {
    if (!syncReady || !isApiConfigured() || !learnerIdRef.current) return;
    const learnerId = learnerIdRef.current;
    const attempt = pendingAttemptRef.current;
    const syncTask = window.setTimeout(() => {
      if (pendingAttemptRef.current === attempt) pendingAttemptRef.current = undefined;
      void putProgress(learnerId, {
        completedLessons: progress.completedLessons,
        quizScores: progress.quizScores,
        lastLessonId: progress.lastLessonId,
        ...(attempt ? { attempt } : {}),
      }).catch(() => {
        // Local storage remains the source of truth until the next successful sync.
      });
    }, 600);
    return () => window.clearTimeout(syncTask);
  }, [progress, syncReady]);

  const markLessonComplete = React.useCallback((lessonId: string) => {
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

  const saveQuizScore = React.useCallback((lessonId: string, score: number, totalQuestions = 0) => {
    const safeScore = Math.min(100, Math.max(0, Math.round(score)));
    pendingAttemptRef.current = totalQuestions > 0 ? { lessonId, score: safeScore, totalQuestions } : undefined;
    setProgress((current) => ({
      ...current,
      quizScores: { ...current.quizScores, [lessonId]: Math.max(current.quizScores[lessonId] ?? 0, safeScore) },
      lastLessonId: lessonId,
    }));
  }, []);

  const getQuizScore = React.useCallback((lessonId: string) => progress.quizScores[lessonId], [progress.quizScores]);
  const setLastLesson = React.useCallback((lessonId: string) => setProgress((current) => ({ ...current, lastLessonId: lessonId })), []);
  const resetProgress = React.useCallback(() => setProgress(emptyProgress), []);
  const value = React.useMemo<ProgressContextValue>(
    () => ({ ...progress, hydrated, markLessonComplete, isLessonComplete, saveQuizScore, getQuizScore, setLastLesson, resetProgress }),
    [progress, hydrated, markLessonComplete, isLessonComplete, saveQuizScore, getQuizScore, setLastLesson, resetProgress],
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

interface DashboardProgressProps {
  lessonCount: number;
  totalMinutes: number;
  questionCount: number;
  firstLessonId: string;
}

export function DashboardProgress({ lessonCount, totalMinutes, questionCount, firstLessonId }: DashboardProgressProps) {
  const { completedLessons, lastLessonId, hydrated, quizScores } = useProgress();
  const completedCount = hydrated ? completedLessons.length : 0;
  const percentage = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;
  const scoreValues = Object.values(quizScores);
  const averageScore = scoreValues.length ? Math.round(scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length) : 0;
  const continueId = lastLessonId ?? firstLessonId;

  return (
    <Card className="self-end border-blue-100 bg-white/90 shadow-xl shadow-blue-100/50">
      <CardHeader>
        <div className="flex items-center justify-between"><span className="text-xs font-bold text-blue-700">나의 학습 현황</span><Gauge className="size-5 text-blue-600" /></div>
        <CardTitle className="mt-3 text-2xl">{completedCount ? `${completedCount}개의 작은 성공` : "첫 걸음을 준비했어요"}</CardTitle>
        <CardDescription>진도와 점검 점수는 이 브라우저에 자동 저장됩니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={percentage} aria-label={`전체 학습 진도 ${percentage}퍼센트`} />
        <div className="mt-3 flex justify-between text-sm"><span className="text-slate-500">완료한 레슨</span><strong>{completedCount} / {lessonCount}</strong></div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-blue-50 p-3"><Clock3 className="mb-2 size-4 text-blue-600" /><strong className="block">{Math.round(totalMinutes / 60)}시간</strong><span className="text-xs text-slate-500">예상 학습</span></div>
          <div className="rounded-xl bg-sky-50 p-3"><BookCheck className="mb-2 size-4 text-sky-600" /><strong className="block">{scoreValues.length ? `${averageScore}점` : questionCount}</strong><span className="text-xs text-slate-500">{scoreValues.length ? "점검 평균" : "점검 문항"}</span></div>
        </div>
        <Button asChild className="mt-4 w-full"><Link href={`/learn/${continueId}`}>{completedCount ? "이어서 학습" : "첫 레슨 시작"}<ArrowRight className="size-4" /></Link></Button>
      </CardContent>
    </Card>
  );
}
