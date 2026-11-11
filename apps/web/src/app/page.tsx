import { pageMetadata } from "@/lib/seo";
import { pageForPath } from "@/lib/seo-content";
import type { Metadata } from "next";
import { CourseShell } from "@/components/course-shell";
import { Dashboard } from "@/components/dashboard";
import { allLessons } from "@/data/course";

export const metadata: Metadata = pageMetadata(pageForPath("/"));

export default function HomePage() {
  return (
    <CourseShell>
      <Dashboard lessons={allLessons.map(({ id, title }) => ({ id, title }))} />
    </CourseShell>
  );
}
