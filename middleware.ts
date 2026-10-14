import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { createI18nMiddleware } from 'fumadocs-core/i18n/middleware';
import { docsContentRoute, docsImageRoute, docsRoute } from '@/lib/shared';
import { i18n } from '@/lib/i18n';

const { rewrite: rewriteDocs } = rewritePath(
  `${docsRoute}{/*path}`,
  `${docsContentRoute}{/*path}/content.md`,
);
const { rewrite: rewriteSuffix } = rewritePath(
  `${docsRoute}{/*path}.md`,
  `${docsContentRoute}{/*path}/content.md`,
);

// system routes must never be rewritten to markdown content
const systemRoutes = [
  docsContentRoute, // already the markdown destination (/llms.mdx)
  docsImageRoute, // /og
  '/llms.txt',
  '/llms-full.txt',
  '/api',
].filter(Boolean);

function isSystemRoute(pathname: string) {
  return systemRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

const i18nMiddleware = createI18nMiddleware(i18n);

function getLocale(pathname: string): 'zh' | 'en' {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && i18n.languages.includes(segments[0] as 'zh' | 'en')) {
    return segments[0] as 'zh' | 'en';
  }
  return i18n.defaultLanguage;
}

function withLocale(response: NextResponse, pathname: string) {
  response.headers.set('x-locale', getLocale(pathname));
  return response;
}

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname;

  // static assets & system routes: skip i18n and markdown rewrites.
  // 注意：`.md` 后缀的文档快捷路径目前走不通（i18n rewrite 会先把它带偏，见 rewriteSuffix 注释），
  // 这里保持历史行为直接放行（404），等 Phase 2 全静态时再落盘真正的 .md 文件。
  if (
    pathname.startsWith('/_next') ||
    pathname === '/api/search' ||
    pathname.startsWith('/api/search/') ||
    pathname.startsWith('/api/feedback') ||
    pathname.startsWith('/og') ||
    pathname.startsWith('/llms') ||
    pathname === '/icon.svg' ||
    pathname.includes('.')
  ) {
    return withLocale(NextResponse.next(), pathname);
  }

  // i18n: rewrite missing default-locale prefix, redirect default-locale prefix away
  const i18nResult = i18nMiddleware(request, event);
  if (i18nResult instanceof NextResponse) {
    return withLocale(i18nResult, pathname);
  }
  if (i18nResult) {
    return i18nResult;
  }

  if (!isSystemRoute(pathname)) {
    const result = rewriteSuffix(pathname);
    if (result) {
      return withLocale(NextResponse.rewrite(new URL(result, request.nextUrl)), pathname);
    }

    if (isMarkdownPreferred(request)) {
      const result = rewriteDocs(pathname);

      if (result) {
        return withLocale(
          NextResponse.rewrite(new URL(result, request.nextUrl), {
            // this URL has two representations, selected by `Accept`
            headers: { Vary: 'Accept' },
          }),
          pathname,
        );
      }
    }
  }

  return withLocale(NextResponse.next(), pathname);
}

// 系统路由与静态资源不进 middleware（省 Worker CPU）。
// 注意不能整体排除 `api` 前缀：`/api/*` 下既有文档页（如 /api/auth）也有接口，
// 这里只精确排除接口路径，文档页仍走下面的 i18n/markdown 逻辑。
// 带点文件（icon.svg、sitemap.xml 等）仍会进入，由函数体内的前置判断直接放行，行为与之前一致。
export const config = {
  matcher: ['/((?!_next|api/search|api/feedback|og|llms|images|icon).*)'],
};
