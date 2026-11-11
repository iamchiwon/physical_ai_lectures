import { absoluteUrl, pageMetadata, siteDescription, siteName, siteOrigin, siteVerification } from "@/lib/seo";
import { JsonLd } from "@/components/structured-data";
import type { Metadata } from "next";
import { TutorProvider } from "@/components/tutor-provider";
import { ProgressProvider } from "@/components/progress-provider";
import "./globals.css";
import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  ...pageMetadata({ path: '/', title: '피지컬 AI 로봇 교육·한국어 교재', description: siteDescription }),
  metadataBase: new URL(siteOrigin()),
  title: { default: '피지컬 AI 로봇 교육·한국어 교재', template: `%s | ${siteName}` },
  applicationName: siteName,
  verification: siteVerification(),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", "@id": absoluteUrl("/#website"), url: absoluteUrl("/"), name: siteName, alternateName: "피지컬 AI 자습실", inLanguage: "ko", description: siteDescription }} />
        <ProgressProvider><TutorProvider>{children}</TutorProvider></ProgressProvider>
      </body>
    </html>
  );
}
