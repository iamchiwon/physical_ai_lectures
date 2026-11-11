import type { MetadataRoute } from "next";
import { absoluteUrl, canonicalPath, indexableDeployment } from "@/lib/seo";
import { publicSeoPages, sitemapImages } from "@/lib/seo-content";
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexableDeployment) return [];
  return publicSeoPages().filter(page => page.index !== false).map(page => ({ url: absoluteUrl(canonicalPath(page.path)), images: sitemapImages(page.path).map(absoluteUrl) }));
}
