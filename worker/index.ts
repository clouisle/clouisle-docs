/**
 * 静态站极简路由 Worker。
 *
 * 所有页面/OG/搜索索引/llms 文本都是构建期落盘的纯静态文件（out/），
 * 本 Worker 只做三件事，不加载任何页面渲染运行时：
 *
 * 1. `/api/feedback`（POST）-> worker/feedback.ts（本站唯一的动态接口）
 * 2. 默认语言（zh）无前缀回退：`/usage` -> 静态文件 `/zh/usage.html`
 *    （/en/* 等带前缀路径直接命中静态文件，不进本逻辑）
 * 3. Markdown 快捷路径：`/usage.md` / Accept: text/markdown -> `/llms.mdx/zh/usage/content.md`
 *    （之前 middleware 里的 rewriteSuffix 是走不通的死代码，这里真正修好）
 *
 * 其他请求（带前缀页面、_next、og、图片等）由静态资源层直接 serving，本 Worker 不执行。
 */

import { handleFeedback, type FeedbackEnv } from './feedback';

interface Env extends FeedbackEnv {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

const DEFAULT_LOCALE = 'zh';
const SUPPORTED_LOCALES = new Set(['zh', 'en']);

/** 是否偏好 markdown（LLM 爬虫）：Accept 头含 text/markdown 或 text/plain 且不是浏览器常规请求。 */
function isMarkdownPreferred(request: Request): boolean {
  const accept = request.headers.get('accept') ?? '';
  if (/(^|,)\s*text\/(markdown|x-markdown)/.test(accept)) return true;
  // text/plain：浏览器导航请求 Accept 一定含 text/html，纯 text/plain 视为程序化 markdown 请求
  if (accept.includes('text/plain') && !accept.includes('text/html')) return true;
  return false;
}

/** 把无前缀文档路径映射到默认语言的 markdown 文件：/usage -> /llms.mdx/zh/usage/content.md */
function markdownAssetPath(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && SUPPORTED_LOCALES.has(segments[0] as 'zh' | 'en')) return null;
  // /api/ 下只有 search.json 和 feedback 是真接口，其余是文档页（如 /api/auth.md）
  if (pathname === '/api/search.json' || pathname === '/api/feedback' || pathname === '/') {
    return null;
  }
  const clean = pathname.replace(/\/$/, '');
  return `/llms.mdx/${DEFAULT_LOCALE}${clean}/content.md`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    let url: URL;
    try {
      url = new URL(request.url);
    } catch {
      return new Response('Bad Request', { status: 400 });
    }
    const pathname = url.pathname;

    // 1. 唯一的动态接口
    if (pathname === '/api/feedback') {
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
      }
      return handleFeedback(request, env);
    }

    // 只处理 GET/HEAD，其他方法直接透传静态层
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return env.ASSETS.fetch(request);
    }

    // 2. `.md` 后缀快捷路径：/usage.md -> /llms.mdx/zh/usage/content.md
    if (pathname.endsWith('.md')) {
      const base = pathname.slice(0, -3) || '/';
      const target = markdownAssetPath(base);
      if (target) {
        const res = await env.ASSETS.fetch(new Request(new URL(target, url)));
        if (res.ok) return res;
      }
      return env.ASSETS.fetch(request);
    }

    // 3. Accept markdown 协商：LLM 爬虫直接拿 markdown（no-store，避免边缘缓存污染 HTML）
    if (isMarkdownPreferred(request)) {
      const target = markdownAssetPath(pathname);
      if (target) {
        const res = await env.ASSETS.fetch(new Request(new URL(target, url)));
        if (res.ok) {
          const out = new Response(res.body, res);
          out.headers.set('Cache-Control', 'no-store');
          return out;
        }
      }
    }

    // 4. 默认语言无前缀回退：/usage -> /zh/usage（无扩展名，由静态层 html_handling 解析到 .html）。
    // 注意不能指向 `.html` 文件：页面 `x.html` 与 `x/` 目录（RSC payload）并存时，
    // 静态层会把 `/x.html` 307 到 `/x`。无扩展名路径则直接 200。
    if (pathname === '/') {
      return env.ASSETS.fetch(new Request(new URL('/zh', url)));
    }
    const segments = pathname.split('/').filter(Boolean);
    if (
      segments.length > 0 &&
      !SUPPORTED_LOCALES.has(segments[0] as 'zh' | 'en') &&
      // /api/ 下只有 search.json 和 feedback 是真接口，其余是文档页（如 /api/auth），放行走 zh 回退
      !(pathname === '/api/search.json' || pathname === '/api/feedback') &&
      !pathname.startsWith('/_next/') &&
      !pathname.startsWith('/og/') &&
      !pathname.startsWith('/llms') &&
      !pathname.startsWith('/images/') &&
      !pathname.includes('.')
    ) {
      const target = `/zh${pathname}`;
      const res = await env.ASSETS.fetch(new Request(new URL(target, url)));
      if (res.ok) return res;
    }

    // 5. 兜底：自定义 404 页（not_found_handling 只在无 Worker 时生效，有 Worker 需自己处理）
    const notFound = await env.ASSETS.fetch(new Request(new URL('/404.html', url)));
    if (notFound.ok) {
      return new Response(notFound.body, {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
