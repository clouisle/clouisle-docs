import { RootProvider } from 'fumadocs-ui/provider/next';
import { i18n } from '@/lib/i18n';
import { SyncHtmlLang } from '@/components/sync-html-lang';

export default async function Layout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;

  return (
    <RootProvider i18n={i18n.provider(lang)}>
      <SyncHtmlLang />
      {children}
    </RootProvider>
  );
}
