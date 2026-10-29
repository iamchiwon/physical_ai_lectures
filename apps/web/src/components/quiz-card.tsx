"use client";

import * as React from "react";
import { CheckCircle2, CircleAlert, RotateCcw } from "lucide-react";
import type { QuickCheck } from "@/data/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useProgress } from "@/components/progress-provider";

interface QuizCardProps {
  lessonId: string;
  questions: QuickCheck[];
}

const normalize = (value: string) => value.toLocaleLowerCase("ko-KR").replace(/\s+/g, "");

function isShortAnswerCorrect(answer: string, keywords: string[]) {
  const normalizedAnswer = normalize(answer);
  return keywords.some((keyword) => normalizedAnswer.includes(normalize(keyword)));
}

export function QuizCard({ lessonId, questions }: QuizCardProps) {
  const { saveQuizScore, getQuizScore } = useProgress();
  const [index, setIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [shortAnswer, setShortAnswer] = React.useState("");
  const [checked, setChecked] = React.useState(false);
  const [correctCount, setCorrectCount] = React.useState(0);
  const [finished, setFinished] = React.useState(false);

  if (questions.length === 0) return null;

  const question = questions[index]!;
  const submittedAnswer = question.type === "multiple-choice" ? selectedOption !== null : shortAnswer.trim().length > 0;
  const isCorrect = question.type === "multiple-choice"
    ? selectedOption === question.answer
    : isShortAnswerCorrect(shortAnswer, question.acceptedKeywords);
  const score = Math.round((correctCount / questions.length) * 100);
  const bestScore = getQuizScore(lessonId);

  const handleCheck = () => {
    if (!submittedAnswer || checked) return;
    setChecked(true);
  };

  const handleNext = () => {
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    if (index === questions.length - 1) {
      const finalScore = Math.round((nextCorrectCount / questions.length) * 100);
      setCorrectCount(nextCorrectCount);
      saveQuizScore(lessonId, finalScore, questions.length);
      setFinished(true);
      return;
    }
    setCorrectCount(nextCorrectCount);
    setIndex((current) => current + 1);
    setSelectedOption(null);
    setShortAnswer("");
    setChecked(false);
  };

  const retry = () => {
    setIndex(0);
    setSelectedOption(null);
    setShortAnswer("");
    setChecked(false);
    setCorrectCount(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <Card className="border-blue-200 bg-blue-50/40" aria-live="polite">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><CheckCircle2 className="size-5 text-blue-600" /> 자가 점검 완료</CardTitle>
          <CardDescription>이번 점수는 {score}점이며, 최고 점수는 {Math.max(bestScore ?? 0, score)}점입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 rounded-xl bg-white p-4 text-sm leading-6 text-slate-600">
            {score >= 80 ? "핵심을 잘 이해했습니다. 다음 레슨으로 진행해 보세요." : "해설을 떠올리며 한 번 더 풀면 개념이 더 단단해집니다."}
          </div>
          <Button type="button" variant="outline" onClick={retry}><RotateCcw className="size-4" /> 다시 풀기</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-100" aria-labelledby={`quiz-${lessonId}-title`}>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 text-xs font-semibold text-blue-700">
          <span>자가 점검</span><span>{index + 1} / {questions.length}</span>
        </div>
        <CardTitle id={`quiz-${lessonId}-title`} className="text-lg leading-7">{question.question}</CardTitle>
        <CardDescription>답을 선택하거나 입력하면 바로 해설을 확인할 수 있습니다.</CardDescription>
      </CardHeader>
      <CardContent>
        {question.type === "multiple-choice" ? (
          <fieldset className="grid gap-2" disabled={checked}>
            <legend className="sr-only">답 선택</legend>
            {question.options.map((option, optionIndex) => (
              <label key={option} className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm leading-6 transition-colors",
                selectedOption === optionIndex ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-300",
                checked && optionIndex === question.answer && "border-emerald-500 bg-emerald-50",
                checked && selectedOption === optionIndex && optionIndex !== question.answer && "border-rose-400 bg-rose-50",
              )}>
                <input type="radio" name={`quiz-${lessonId}-${question.id}`} value={optionIndex} checked={selectedOption === optionIndex} onChange={() => setSelectedOption(optionIndex)} className="mt-1 accent-blue-600" />
                <span>{option}</span>
              </label>
            ))}
          </fieldset>
        ) : (
          <div>
            <label htmlFor={`answer-${lessonId}-${question.id}`} className="sr-only">서술형 답변</label>
            <Textarea id={`answer-${lessonId}-${question.id}`} value={shortAnswer} onChange={(event) => setShortAnswer(event.target.value)} disabled={checked} placeholder="핵심어를 포함해 자신의 말로 설명해 보세요." />
          </div>
        )}

        {checked ? (
          <div className={cn("mt-4 rounded-xl border p-4 text-sm leading-6", isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-amber-200 bg-amber-50 text-amber-950")} role="status">
            <p className="mb-1 flex items-center gap-2 font-bold">{isCorrect ? <CheckCircle2 className="size-4" /> : <CircleAlert className="size-4" />}{isCorrect ? "잘 이해했어요" : "조금 더 살펴볼까요?"}</p>
            <p>{question.explanation}</p>
            {question.type === "short-answer" ? <p className="mt-2"><strong>예시 답안:</strong> {question.answer}</p> : null}
          </div>
        ) : null}

        <div className="mt-4 flex justify-end">
          {checked ? <Button type="button" onClick={handleNext}>{index === questions.length - 1 ? "결과 보기" : "다음 문제"}</Button> : <Button type="button" onClick={handleCheck} disabled={!submittedAnswer}>정답 확인</Button>}
        </div>
      </CardContent>
    </Card>
  );
}
