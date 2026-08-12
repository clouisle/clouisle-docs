import { headers } from 'next/headers';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { Inter } from 'next/font/google';
import { i18n } from '@/lib/i18n';

const inter = Inter({
  subsets: ['latin'],
});

export default async function Layout({ children }: LayoutProps<'/'>) {
  const h = await headers();
  const locale = h.get('x-locale') ?? i18n.defaultLanguage;

  return (
    <html lang={locale} className={inter.className} suppressHydrationWarning>
      <body>
        <RootProvider i18n={i18n.provider(locale)}>{children}</RootProvider>
      </body>
    </html>
  );
}
