import type { Metadata } from "next";
import { CourseShell } from "@/components/course-shell";
import { Dashboard } from "@/components/dashboard";
import { allLessons } from "@/data/course";

export const metadata: Metadata = {
  title: "통합 학습 과정",
  description: "일반 코딩 경험에서 로봇 시스템 구현으로 이어지는 Physical AI 과정. 개발 환경·빌드 도구부터 비전·주행·조작·학습·통합까지 단계별로 학습합니다.",
};

export default function HomePage() {
  return (
    <CourseShell>
      <Dashboard lessons={allLessons.map(({ id, title }) => ({ id, title }))} />
    </CourseShell>
  );
}
