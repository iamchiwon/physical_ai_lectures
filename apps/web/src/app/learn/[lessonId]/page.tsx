import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseShell } from "@/components/course-shell";
import { LessonView } from "@/components/lesson-view";
import { allLessons, courseModules, getAdjacentLessons, getLessonById } from "@/data/course";

interface LessonPageProps {
  params: Promise<{ lessonId: string }>;
}

export function generateStaticParams() {
  return allLessons.map((lesson) => ({ lessonId: lesson.id }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);
  return lesson ? { title: `${lesson.title} | Physical AI 클래스룸`, description: lesson.summary } : {};
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  const lesson = getLessonById(lessonId);
  if (!lesson) notFound();

  const courseModule = courseModules.find((item) => item.number === lesson.chapter);
  if (!courseModule) notFound();

  const { previous, next } = getAdjacentLessons(lesson.id);

  return (
    <CourseShell>
      <LessonView lesson={lesson} module={courseModule} modules={courseModules} previous={previous} next={next} />
    </CourseShell>
  );
}
