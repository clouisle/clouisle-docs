import type { MetadataRoute } from 'next';
import { docsSiteUrl } from '@/lib/shared';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/_next/',
        '/api/search.json',
        '/og/',
        '/llms.mdx/',
        '/llms.txt',
        '/llms-full.txt',
      ],
    },
    host: docsSiteUrl,
    sitemap: new URL('/sitemap.xml', docsSiteUrl).toString(),
  };
}
