import { getLLMText, getPageMarkdownUrl, source } from '@/lib/source';
import { notFound } from 'next/navigation';

export const revalidate = false;
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function GET(_req: Request, { params }: RouteContext<'/llms.mdx/[...slug]'>) {
  const { slug } = await params;
  const [locale, ...rest] = slug;
  const page = source.getPage(rest.slice(0, -1), locale);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageMarkdownUrl(page).segments,
  }));
}
