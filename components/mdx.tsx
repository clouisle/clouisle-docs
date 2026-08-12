import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Card as BaseCard } from 'fumadocs-ui/components/card';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { i18n } from '@/lib/i18n';
import { source } from '@/lib/source';

type Page = (typeof source)['$inferPage'];

// 系统路由/资源路径不应加 locale 前缀
const SYSTEM_ROUTES = [
  '/_next',
  '/images',
  '/og',
  '/llms',
  '/api/search',
  '/icon.svg',
  '/llms.txt',
  '/llms-full.txt',
];

/**
 * 为绝对内部链接补 locale 前缀（如 /usage → /en/usage）。
 * 相对路径由 createRelativeLink 先行解析；外部/锚点/系统路由原样返回。
 */
export function localizeHref(href: string, locale: string): string {
  if (locale === i18n.defaultLanguage) return href;
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  if (href.startsWith(`/${locale}`)) return href;
  if (SYSTEM_ROUTES.some((route) => href.startsWith(route))) return href;
  return `/${locale}${href}`;
}

export function getMDXComponents(page: Page, components?: MDXComponents) {
  const locale = page.locale ?? i18n.defaultLanguage;
  const RelativeLink = createRelativeLink(source, page);

  // markdown 链接：相对路径由 createRelativeLink 解析，绝对路径补 locale 前缀
  const LocaleLink = (props: { href?: string }) => (
    <RelativeLink {...props} href={props.href ? localizeHref(props.href, locale) : props.href} />
  );

  // Card href 同样补 locale 前缀
  const LocaleCard = (props: Parameters<typeof BaseCard>[0]) => (
    <BaseCard {...props} href={props.href ? localizeHref(props.href, locale) : props.href} />
  );

  return {
    ...defaultMdxComponents,
    Card: LocaleCard,
    a: LocaleLink,
    // 大写组件形式：mdx-js 只对大写标签走组件表，JSX 里用 <Link> 才能 locale 化
    Link: LocaleLink,
    ImageZoom,
    img: (props) => <ImageZoom {...(props as Parameters<typeof ImageZoom>[0])} />,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
