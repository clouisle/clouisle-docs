import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { source } from '@/lib/source';
import { getMDXComponents } from '@/components/mdx';
import { notFound } from 'next/navigation';
import { baseOptions } from '@/lib/layout.shared';
import { i18n } from '@/lib/i18n';
import type { LinkItemType } from 'fumadocs-ui/layouts/shared';
import { JsonLd } from '@/components/seo/json-ld';
import { getPageStructuredData } from '@/lib/seo';

export const dynamic = 'force-static';

// output: export 下每个动态页面都必须自带 generateStaticParams；
// 仅靠 [lang]/layout.tsx 的声明在 next dev 中会报 “missing param” 并整站不可用。
export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

function navLinks(locale: string): LinkItemType[] {
  const prefix = `/${locale}`;
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
    <>
      <JsonLd data={getPageStructuredData(page, 'WebPage')} />
      <HomeLayout {...baseOptions(params.lang)} links={navLinks(params.lang)}>
        <div className="mx-auto flex w-full max-w-(--fd-layout-width) flex-1 flex-col px-4 py-10 sm:py-14">
          <div className="prose max-w-none">
            <MDX components={getMDXComponents(page)} />
          </div>
        </div>
      </HomeLayout>
    </>
  );
}
