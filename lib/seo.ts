import type { Metadata } from 'next';
import { getPageImageUrl, source } from './source';
import { i18n } from './i18n';
import { appName, docsSiteUrl, gitConfig } from './shared';

const docsSiteName = 'Clouisle Docs';
const docsSiteOrigin = docsSiteUrl.replace(/\/$/, '');
type Page = (typeof source)['$inferPage'];
export type SitemapLanguages = Partial<Record<'zh-CN' | 'en' | 'x-default', string>>;
type AlternateLanguages = NonNullable<NonNullable<Metadata['alternates']>['languages']>;

type PageSchemaType = 'WebPage' | 'TechArticle';

export function absoluteUrl(pathname: string) {
  return new URL(pathname, docsSiteOrigin).toString();
}

export function getHreflang(locale: string) {
  return locale === 'zh' ? 'zh-CN' : locale;
}

export function getOpenGraphLocale(locale: string) {
  return locale === 'zh' ? 'zh_CN' : locale === 'en' ? 'en_US' : locale;
}

export function getAlternateLanguages(slugs: string[]): SitemapLanguages {
  const languages: SitemapLanguages = {};

  for (const locale of i18n.languages) {
    const page = source.getPage(slugs, locale);
    if (page) languages[getHreflang(locale) as 'zh-CN' | 'en'] = absoluteUrl(page.url);
  }

  const defaultPage = source.getPage(slugs, i18n.defaultLanguage);
  if (defaultPage) languages['x-default'] = absoluteUrl(defaultPage.url);

  return languages;
}

function getMetadataAlternateLanguages(slugs: string[]): AlternateLanguages {
  return getAlternateLanguages(slugs) as AlternateLanguages;
}

export function getPageMetadata(page: Page, type: 'website' | 'article' = 'article'): Metadata {
  const title = page.data.title ?? docsSiteName;
  const description = page.data.description ?? '';
  const url = absoluteUrl(page.url);
  const imageUrl = absoluteUrl(getPageImageUrl(page).url);
  const locale = page.locale ?? i18n.defaultLanguage;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: getMetadataAlternateLanguages(page.slugs),
    },
    openGraph: {
      type,
      title,
      description,
      url,
      siteName: docsSiteName,
      locale: getOpenGraphLocale(locale),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function getSiteStructuredData(locale: string): Record<string, unknown>[] {
  const language = getHreflang(locale);
  const organizationId = `${docsSiteOrigin}#organization`;

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': organizationId,
      name: appName,
      url: 'https://clouisle.asia',
      logo: absoluteUrl('/icon.svg'),
      sameAs: [`https://github.com/${gitConfig.user}/${gitConfig.repo}`],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${docsSiteOrigin}#website`,
      url: absoluteUrl('/'),
      name: locale === 'en' ? 'Clouisle Docs' : 'Clouisle 文档',
      inLanguage: language,
      publisher: { '@id': organizationId },
    },
  ];
}

export function getPageStructuredData(
  page: Page,
  type: PageSchemaType = 'TechArticle',
): Record<string, unknown> {
  const title = page.data.title ?? docsSiteName;
  const description = page.data.description ?? '';
  const url = absoluteUrl(page.url);
  const locale = page.locale ?? i18n.defaultLanguage;

  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': url,
    url,
    name: title,
    headline: title,
    description,
    inLanguage: getHreflang(locale),
    isPartOf: { '@id': `${docsSiteOrigin}#website` },
    publisher: { '@id': `${docsSiteOrigin}#organization` },
  };
}
