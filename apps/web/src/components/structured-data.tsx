import { absoluteUrl, canonicalPath, serializeJsonLd, siteName } from "@/lib/seo";

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
export function LearningResourceData({ path, title, description, teaches }: { path: string; title: string; description: string; teaches?: string[] }) {
  return <JsonLd data={{ '@context': 'https://schema.org', '@type': 'LearningResource', '@id': `${absoluteUrl(canonicalPath(path))}#learning-resource`, url: absoluteUrl(canonicalPath(path)), name: title, description, inLanguage: 'ko', learningResourceType: 'Lesson', isAccessibleForFree: true, ...(teaches ? { teaches } : {}), isPartOf: { '@type': 'WebSite', '@id': absoluteUrl('/#website'), name: siteName } }} />;
}
