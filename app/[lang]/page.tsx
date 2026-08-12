import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { source } from '@/lib/source';
import { getMDXComponents } from '@/components/mdx';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { baseOptions } from '@/lib/layout.shared';
import { i18n } from '@/lib/i18n';
import type { LinkItemType } from 'fumadocs-ui/layouts/shared';

function navLinks(locale: string): LinkItemType[] {
  const prefix = locale === i18n.defaultLanguage ? '' : `/${locale}`;
  const labels =
    locale === 'en'
      ? { usage: 'Usage', reference: 'Reference', api: 'API', deploy: 'Deployment' }
      : { usage: '使用', reference: '参考', api: 'API', deploy: '部署' };

  return [
    {
      text: labels.usage,
      url: `${prefix}/usage`,
      active: 'nested-url',
    },
    {
      text: labels.reference,
      url: `${prefix}/reference`,
      active: 'nested-url',
    },
    {
      text: labels.api,
      url: `${prefix}/api`,
      active: 'nested-url',
    },
    {
      text: labels.deploy,
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
          <MDX components={getMDXComponents(page)} />
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
