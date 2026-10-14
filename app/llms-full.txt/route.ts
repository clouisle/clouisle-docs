import { getLLMText, source } from '@/lib/source';

// 全站 raw markdown 一次拼接：CPU/内存双贵。构建期预渲染 + 边缘缓存 1 天，
// 内容随部署更新，缓存失效天然对齐发版节奏。
export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  const scan = source.getPages().map(getLLMText);
  const scanned = await Promise.all(scan);

  return new Response(scanned.join('\n\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
