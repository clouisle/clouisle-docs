import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { absoluteUrl, getAlternateLanguages } from '@/lib/seo';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return source.getPages().map((page) => ({
    url: absoluteUrl(page.url),
    alternates: {
      languages: getAlternateLanguages(page.slugs),
    },
  }));
}
