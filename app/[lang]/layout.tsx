import '../global.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { I18nProvider } from 'fumadocs-ui/contexts/i18n';
import { i18n } from '@/lib/i18n';
import { SyncHtmlLang } from '@/components/sync-html-lang';
import { JsonLd } from '@/components/seo/json-ld';
import { getHreflang, getPageMetadata, getSiteStructuredData } from '@/lib/seo';
import { docsSiteUrl } from '@/lib/shared';
import { source } from '@/lib/source';
import { notFound } from 'next/navigation';

// 站点 origin 是写死的常量：构建期解析一次，失败即报错（fail-fast），避免每个请求重复 new URL()
function parseSiteUrl(): URL {
  try {
    return new URL(docsSiteUrl);
  } catch {
    throw new Error(`Invalid docsSiteUrl: ${docsSiteUrl}`);
  }
}
const siteUrl = parseSiteUrl();

const inter = Inter({
  subsets: ['latin'],
});

export default async function Layout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!i18n.languages.includes(lang as (typeof i18n.languages)[number])) notFound();

  const locale = lang as (typeof i18n.languages)[number];
  const value = i18n.provider(locale);

  return (
    <html lang={getHreflang(locale)} className={inter.className} suppressHydrationWarning>
      <head>
        {/* next-themes 0.4.6 把初始化 script 渲染在 body 内，React 19 拒绝执行（error #418），
            导致刷新/新开页面首帧不恢复 localStorage 主题（闪变）。
            head 内同步脚本在 HTML 解析时执行：读 localStorage('theme') 设置 html class，
            与 next-themes 的 storageKey/attribute/defaultTheme/system 语义一致。 */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var dark=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);var d=document.documentElement;d.classList.remove('light','dark');d.classList.add(dark?'dark':'light');d.style.colorScheme=dark?'dark':'light';}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        {/* 搜索走静态索引：构建期由 /api/search.json 预渲染全量索引 JSON，
            客户端下载后在浏览器内检索，不再按请求打 Worker 实时建库（CPU 大户）。
            type: 'static' 虽标记 deprecated，但在当前版本仍完整可用；后续版本移除时再迁到自定义 Dialog。 */}
        <RootProvider search={{ options: { type: 'static', api: '/api/search.json' } }}>
          <I18nProvider locale={locale} locales={value.locales} translations={value.translations}>
            <JsonLd data={getSiteStructuredData(locale)} />
            <SyncHtmlLang />
            {children}
          </I18nProvider>
        </RootProvider>
      </body>
    </html>
  );
}

export async function generateMetadata(props: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await props.params;
  const page = source.getPage([], lang);
  if (!page) notFound();

  return {
    // 全站元数据：本布局是本站的根布局（app/layout.tsx 已移除，
    // 根级 <html>/<body> 必须与 [lang] 同级，否则 React 会把主题 script 渲染到文档外）。
    applicationName: 'Clouisle',
    authors: [{ name: 'Clouisle' }],
    creator: 'Clouisle',
    publisher: 'Clouisle',
    icons: {
      icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
      shortcut: ['/icon.svg'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    ...getPageMetadata(page, 'website'),
    title: {
      default: page.data.title ?? 'Clouisle 文档',
      template: '%s | Clouisle Docs',
    },
    metadataBase: siteUrl,
  };
}

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}
