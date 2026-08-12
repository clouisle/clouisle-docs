import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { source } from '@/lib/source';
import { getMDXComponents } from '@/components/mdx';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { baseOptions } from '@/lib/layout.shared';
import { i18n } from '@/lib/i18n';
import type { LinkItemType } from 'fumadocs-ui/layouts/shared';

function navLinks(locale: string): LinkItemType[] {
  const prefix = locale === i18n.defaultLanguage ? '' : `/${locale}`;

  return [
    {
      text: '使用',
      url: `${prefix}/usage`,
      active: 'nested-url',
    },
    {
      text: '参考',
      url: `${prefix}/reference`,
      active: 'nested-url',
    },
    {
      text: 'API',
      url: `${prefix}/api`,
      active: 'nested-url',
    },
    {
      text: '部署',
      url: `${prefix}/self-host`,
      active: 'nested-url',
    },
  ];
}

export default async function Page(props: PageProps<'/[lang]'>) {
  const params = await props.params;
  const page = source.getPage([], params.lang);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <HomeLayout {...baseOptions()} links={navLinks(params.lang)}>
      <div className="mx-auto flex w-full max-w-(--fd-layout-width) flex-1 flex-col px-4 py-10 sm:py-14">
        <div className="prose max-w-none">
          <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
        </div>
      </div>
    </HomeLayout>
  );
}

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export async function generateMetadata(props: PageProps<'/[lang]'>): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage([], params.lang);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
