import './global.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
});

export default function Layout({ children }: LayoutProps<'/'>) {
  // html lang 由 [lang]/layout 内的客户端组件同步（服务端初值见 [lang]/layout）
  return (
    <html lang="zh" className={inter.className} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
