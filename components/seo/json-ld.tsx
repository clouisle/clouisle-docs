import type { ReactNode } from 'react';

type JsonLdProps = {
  data: unknown;
};

export function JsonLd({ data }: JsonLdProps): ReactNode {
  const serialized = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialized }} />;
}
