import { pageMetadata } from "@/lib/seo";
import { pageForPath } from "@/lib/seo-content";
import { LearningResourceData } from "@/components/structured-data";
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
  return lesson ? pageMetadata(pageForPath(`/learn/${lessonId}/`)) : {};
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
      <LearningResourceData path={`/learn/${lessonId}/`} title={lesson.title} description={lesson.summary} teaches={lesson.objectives} />
      <LessonView lesson={lesson} module={courseModule} modules={courseModules} previous={previous} next={next} />
    </CourseShell>
  );
}
