import Link from "next/link";
import { BookOpen, ChevronRight, GraduationCap, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseShellProps {
  children: React.ReactNode;
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export function CourseShell({ children, eyebrow, title, description, actions }: CourseShellProps) {
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label="Physical AI 학습 홈">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
              <GraduationCap className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-slate-950">Physical AI 클래스룸</span>
              <span className="block truncate text-xs text-slate-500">로봇 제어 실무 자습 과정</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/"><LayoutDashboard className="size-4" aria-hidden="true" />학습 홈</Link>
            </Button>
            {actions}
          </div>
        </div>
      </header>

      {title ? (
        <section className="border-b border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-sky-50">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            {eyebrow ? <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-700"><BookOpen className="size-4" aria-hidden="true" />{eyebrow}</p> : null}
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div className="max-w-3xl">
                <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
                {description ? <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-slate-600">{description}</p> : null}
              </div>
              <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">
                전체 커리큘럼 <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {children}

      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>Physical AI 로봇 제어 실무 · Ubuntu 24.04 LTS · ROS 2 Jazzy</p>
          <p>읽고, 확인하고, 질문하며 완성하는 자기주도 학습</p>
        </div>
      </footer>
    </div>
  );
}
