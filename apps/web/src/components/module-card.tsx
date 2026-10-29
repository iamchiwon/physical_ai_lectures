import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Clock3 } from "lucide-react";
import type { CourseModule } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ModuleCardProps {
  module: CourseModule;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const totalMinutes = module.lessons.reduce((sum, lesson) => sum + lesson.duration, 0);
  const firstLesson = module.lessons[0];

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/70">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-br from-blue-50/80 to-white">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-600 text-sm font-bold text-white">{module.number}</span>
          <Badge>{module.lessons.length}개 레슨</Badge>
        </div>
        <CardTitle className="text-lg leading-7">{module.title}</CardTitle>
        <CardDescription>{module.summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-5">
        <ul className="space-y-2.5 text-sm text-slate-600">
          {module.lessons.map((lesson) => (
            <li key={lesson.id} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-500" aria-hidden="true" />
              <span>{lesson.title}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5 text-sm">
          <span className="flex items-center gap-1.5 text-slate-500"><Clock3 className="size-4" aria-hidden="true" />약 {totalMinutes}분</span>
          {firstLesson ? (
            <Link href={`/learn/${firstLesson.id}`} className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800">
              시작하기 <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 text-slate-400"><BookOpen className="size-4" />준비 중</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
