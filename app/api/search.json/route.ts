import { source } from '@/lib/source';
import { createI18nSearchAPI } from 'fumadocs-core/search/server';
import { i18n } from '@/lib/i18n';

// 索引数据库构建期只建一次（GET 直接返回导出的静态 JSON），不再按搜索请求实时建库：
// zbsearch 要把全站索引载入 Worker 内存再查，是 CPU 超时的头号大户。
// 客户端改走 `type: 'static'` 下载这份 JSON 后在浏览器里查（见 app/[lang]/layout.tsx search.options）。
//
// 用 `simple` 而不用 `createFromSource` 默认的 `advanced`：advanced 按 heading/text 切块
// 建索引（含 embeddings 向量位），全站导出 35MB；simple 按页一条，实测 8.7MB（gzip 后 2.1MB），
// 只在用户打开搜索框时下载一次。代价是结果定位到页面而非 heading 锚点，对文档站可接受。
// 注意：zbsearch 没有中文专用分词器（SUPPORTED_LANGUAGES 无 chinese），
// 中文走默认的 `multilingual`（Intl.Segmenter 按词切分），官方默认即此。
async function createServer() {
  const pages = source.getPages();
  const indexes = await Promise.all(
    pages.map(async (page) => ({
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      locale: page.locale ?? i18n.defaultLanguage,
      content: await page.data.getText('raw'),
    })),
  );
  return createI18nSearchAPI('simple', { indexes, i18n });
}

const server = await createServer();

export const dynamic = 'force-static';
export const revalidate = false;

// 索引 JSON 8MB+：加 1 天边缘缓存，内容只随部署变更（发版即新 Worker，旧缓存在 TTL 后自然过期）。
// content-type application/json 会被 Cloudflare 自动 gzip（~2MB 落到浏览器）。
export async function GET() {
  const res = await server.staticGET();
  res.headers.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  return res;
}
