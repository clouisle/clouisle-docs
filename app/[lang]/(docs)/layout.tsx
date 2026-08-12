import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { source } from '@/lib/source';
import { baseOptions } from '@/lib/layout.shared';
import type { CSSProperties } from 'react';

export default async function Layout({ children, ...props }: LayoutProps<'/[lang]'>) {
  const params = await props.params;

  return (
    <DocsLayout
      tree={source.getPageTree(params.lang)}
      {...baseOptions()}
      tabs={{
        transform(option, node) {
          if (!node.icon) return option;

          return {
            ...option,
            icon: (
              <div
                className="[&_svg]:size-full rounded-lg size-full text-(--tab-color) max-md:bg-(--tab-color)/10 max-md:border max-md:p-1.5"
                style={{ '--tab-color': 'var(--color-fd-foreground)' } as CSSProperties}
              >
                {node.icon}
              </div>
            ),
          };
        },
      }}
    >
      {children}
    </DocsLayout>
  );
}
