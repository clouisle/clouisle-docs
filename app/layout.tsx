import './global.css';
import { Inter } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  // RootProvider 留在根 layout：next-themes 主题 script 不随客户端导航重渲染。
  // i18n（locale/locales/translations）由 app/[lang]/layout.tsx 提供，
  // 避免外层 zh 翻译表 merge 污染其他语言。
  return (
    <html lang="zh" className={inter.className} suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
