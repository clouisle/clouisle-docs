import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';
import { Logo } from '@/components/logo';

export function baseOptions(locale: string): BaseLayoutProps {
  return {
    nav: {
      url: `/${locale}`,
      title: (
        <span className="flex items-center gap-2">
          <Logo />
          <span className="font-semibold">{appName}</span>
        </span>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
