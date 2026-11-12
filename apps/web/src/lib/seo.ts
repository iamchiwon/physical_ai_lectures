import type { Metadata } from "next";

export const siteName = "Physical AI 자습실";
export const siteDescription = "일반 코딩 경험자를 위한 피지컬 AI 한국어 교재. ROS 2, 로봇 제어, 컴퓨터 비전, 시뮬레이션, 모방학습과 Sim2Real을 본문·실습·확인 문제로 학습합니다.";

export function siteOrigin(value = process.env.NEXT_PUBLIC_SITE_URL || "https://physical-ai.teachself.fun") {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTP(S) origin without credentials, path, query, or fragment");
  }
  return url.origin;
}
export const indexableDeployment = process.env.SEO_INDEXABLE !== "false" && !(process.env.CF_PAGES === "1" && Boolean(process.env.CF_PAGES_BRANCH) && process.env.CF_PAGES_BRANCH !== (process.env.SEO_PRODUCTION_BRANCH || "main"));
export function siteVerification(values = { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION, naver: process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION }): Metadata['verification'] {
  return { ...(values.google?.trim() ? { google: values.google.trim() } : {}), ...(values.naver?.trim() ? { other: { 'naver-site-verification': values.naver.trim() } } : {}) };
}
export function absoluteUrl(path: string) { return new URL(path, `${siteOrigin()}/`).href; }
export function canonicalPath(path: string) {
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error("SEO path must be a local absolute path");
  const pathname = path.split(/[?#]/, 1)[0]!;
  return pathname === '/' || /\.[a-z0-9]+$/i.test(pathname) ? pathname : pathname.replace(/\/$/, '') + '/';
}
export function plainDescription(text: string, max = 160) {
  const clean = text.replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, ' ').replace(/\\+\([\s\S]*?\\+\)|\\+\[[\s\S]*?\\+\]|\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g, ' ').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/<[^>]*>/g, ' ').replace(/\{[^}]*\}/g, ' ').replace(/[#*`$|]/g, '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean;
}
export type SeoPage = { path: string; title: string; description: string; type?: "website" | "article"; index?: boolean };
export function pageMetadata(page: SeoPage): Metadata {
  const url = absoluteUrl(canonicalPath(page.path));
  const description = plainDescription(page.description);
  const images = [{ url: absoluteUrl('/social-card.png'), width: 1200, height: 630, alt: "피지컬 AI 한국어 교재 · 로봇 제어와 학습 과정" }];
  return {
    title: page.title, description,
    alternates: { canonical: url },
    robots: { index: indexableDeployment && page.index !== false, follow: true, googleBot: { index: indexableDeployment && page.index !== false, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: { title: `${page.title} | ${siteName}`, description, url, siteName, locale: 'ko_KR', type: page.type ?? 'website', images },
    twitter: { card: 'summary_large_image', title: `${page.title} | ${siteName}`, description, images: images.map(image => image.url) },
  };
}
export function serializeJsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, '\\u003c'); }
