import { I18nProvider } from 'fumadocs-ui/contexts/i18n';
import { i18n } from '@/lib/i18n';
import { SyncHtmlLang } from '@/components/sync-html-lang';

export default async function Layout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  const value = i18n.provider(lang);

  return (
    <I18nProvider locale={lang} locales={value.locales} translations={value.translations}>
      <SyncHtmlLang />
      {children}
    </I18nProvider>
  );
}
