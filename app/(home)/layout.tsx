import '../global.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clouisle Docs',
  robots: { index: false, follow: true },
};

/**
 * `/` 的根布局：站点所有文档都在 `/[lang]` 下，根路径只做跳转。
 * 生产环境由 Cloudflare Worker 直接把 `/` 映射到 `/zh`（URL 不变）；
 * 静态导出/next dev 下没有 Worker，靠这里的 meta refresh + 链接兜底。
 */
export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="zh-CN">
      <head>
        <meta httpEquiv="refresh" content="0;url=/zh" />
      </head>
      <body>{children}</body>
    </html>
  );
}
