import type { Metadata } from 'next';
import { RootProvider } from 'fumadocs-ui/provider/next';

export const metadata: Metadata = {
  applicationName: 'Clouisle',
  authors: [{ name: 'Clouisle' }],
  creator: 'Clouisle',
  publisher: 'Clouisle',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    shortcut: ['/icon.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return <RootProvider>{children}</RootProvider>;
}
