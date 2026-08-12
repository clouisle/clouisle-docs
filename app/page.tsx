import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { source } from '@/lib/source';
import { getMDXComponents } from '@/components/mdx';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { baseOptions } from '@/lib/layout.shared';
import { Logo } from '@/components/logo';
import type { LinkItemType } from 'fumadocs-ui/layouts/shared';

const links: LinkItemType[] = [
  {
    text: '使用',
    url: '/usage',
    active: 'nested-url',
  },
  {
    text: '参考',
    url: '/reference',
    active: 'nested-url',
  },
  {
    text: 'API',
    url: '/api',
    active: 'nested-url',
  },
  {
    text: '自部署',
    url: '/self-host',
    active: 'nested-url',
  },
];

export default async function Page() {
  const page = source.getPage([]);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <HomeLayout {...baseOptions()} links={links}>
      <div className="mx-auto flex w-full max-w-(--fd-layout-width) flex-1 flex-col px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <Logo className="size-40" />
          <h1 className="mt-8 text-4xl font-bold tracking-tight text-fd-foreground">
            {page.data.title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-fd-muted-foreground">
            {page.data.description}
          </p>
        </div>
        <div className="prose mt-10 max-w-none">
          <MDX components={getMDXComponents({ a: createRelativeLink(source, page) })} />
        </div>
      </div>
    </HomeLayout>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const page = source.getPage([]);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
