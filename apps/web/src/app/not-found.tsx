import Link from "next/link";
import { ArrowLeft, BookOpenCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <div className="max-w-md text-center">
        <BookOpenCheck className="mx-auto size-12 text-blue-600" />
        <p className="mt-5 text-sm font-bold text-blue-600">404 · 학습 단위를 찾을 수 없습니다</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">커리큘럼으로 돌아가 볼까요?</h1>
        <p className="mt-3 leading-7 text-slate-500">주소가 변경되었거나 아직 공개되지 않은 학습 단위입니다.</p>
        <Button asChild className="mt-7"><Link href="/"><ArrowLeft className="size-4" />대시보드로 돌아가기</Link></Button>
      </div>
    </main>
  );
}
