import { getPageImageUrl, source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { ImageResponse } from 'takumi-js/response';
import { generate as DefaultImage } from 'fumadocs-ui/og/takumi';
import { appName } from '@/lib/shared';

// OG 图构建期全部预渲染（generateStaticParams），运行时不再按需生成：
// takumi 图片编码是 Worker CPU 大户，锁死静态后爬虫/社交抓取只命中缓存。
export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;

export async function GET(_req: Request, { params }: RouteContext<'/og/[...slug]'>) {
  const { slug } = await params;
  const [locale, ...rest] = slug;
  const page = source.getPage(rest.slice(0, -1), locale);
  if (!page) notFound();

  const res = new ImageResponse(
    <DefaultImage title={page.data.title} description={page.data.description} site={appName} />,
    {
      width: 1200,
      height: 630,
      // PNG 编码比 webp 便宜一半；OG 图内容以文字为主，体积差异可接受
      format: 'png',
    },
  );
  // OG 图随构建预渲染、内容不变：边缘缓存 1 年，按需回源也不再重新编码
  res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return res;
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: getPageImageUrl(page).segments,
  }));
}
