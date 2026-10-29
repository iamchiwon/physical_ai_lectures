import type { Metadata } from "next";
import { ProgressProvider } from "@/components/progress-provider";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: {
    default: "Physical AI 로봇 제어 실무 | 자습실",
    template: "%s | Physical AI 자습실",
  },
  description: "Physical AI, Isaac Sim, ROS 2, SO-101, LeRobot와 Sim2Real을 작은 학습 단위로 익히는 한국어 자습 사이트",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ProgressProvider>{children}</ProgressProvider>
      </body>
    </html>
  );
}
