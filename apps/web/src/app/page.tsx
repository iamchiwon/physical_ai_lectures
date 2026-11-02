import type { Metadata } from "next";
import { CourseShell } from "@/components/course-shell";
import { Dashboard } from "@/components/dashboard";
import { allLessons } from "@/data/course";

export const metadata: Metadata = {
  title: "통합 학습 과정",
  description: "34모듈·204소주제의 Physical AI 통합 과정. 6개 추천 경로와 준비 현황을 살펴보고 기존 교재·요약 학습을 이어가세요.",
};

export default function HomePage() {
  return (
    <CourseShell>
      <Dashboard lessons={allLessons.map(({ id, title }) => ({ id, title }))} />
    </CourseShell>
  );
}
