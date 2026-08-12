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
      <body>
        <RootProvider>
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
    ...getPageMetadata(page, 'website'),
    title: {
      default: page.data.title ?? 'Clouisle 文档',
      template: '%s | Clouisle Docs',
    },
    metadataBase: new URL(docsSiteUrl),
  };
}

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}
