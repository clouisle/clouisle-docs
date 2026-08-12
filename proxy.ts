import { NextRequest, NextResponse } from 'next/server';
import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { docsContentRoute, docsImageRoute, docsRoute } from '@/lib/shared';

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

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (!isSystemRoute(pathname)) {
    const result = rewriteSuffix(pathname);
    if (result) {
      return NextResponse.rewrite(new URL(result, request.nextUrl));
    }

    if (isMarkdownPreferred(request)) {
      const result = rewriteDocs(request.nextUrl.pathname);

      if (result) {
        return NextResponse.rewrite(new URL(result, request.nextUrl), {
          // this URL has two representations, selected by `Accept`
          headers: { Vary: 'Accept' },
        });
      }
    }
  }

  return NextResponse.next();
}
