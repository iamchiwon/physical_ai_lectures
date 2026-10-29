import { CourseShell } from "@/components/course-shell";
import { Dashboard } from "@/components/dashboard";
import { allLessons, courseModules, courseStats } from "@/data/course";

export default function HomePage() {
  const firstLesson = allLessons[0];

  if (!firstLesson) return null;

  return (
    <CourseShell>
      <Dashboard modules={courseModules} stats={courseStats} firstLesson={firstLesson} />
    </CourseShell>
  );
}
