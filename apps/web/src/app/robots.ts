import type { MetadataRoute } from "next";
import { absoluteUrl, indexableDeployment } from "@/lib/seo";
export const dynamic = 'force-static';
export default function robots(): MetadataRoute.Robots {
  // Keep CSS/JS/images crawlable; non-page payloads use X-Robots-Tag instead.
  return { rules: { userAgent: '*', allow: '/' }, ...(indexableDeployment ? { sitemap: absoluteUrl('/sitemap.xml') } : {}) };
}
