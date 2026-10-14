import { source } from '@/lib/source';
import { llms } from 'fumadocs-core/source';

export const dynamic = 'force-static';
export const revalidate = false;

export function GET() {
  return new Response(llms(source).index(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
