import type { Metadata } from 'next';
import { EasmPage } from '@/components/easm-page';
import { EASM_COPY } from '@/lib/easm-content';
import { PUBLIC_THEME_SCRIPT } from '@/lib/public-theme';

// Static: served from the edge with no session lookup, like the legal pages.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'What is EASM? External attack surface management',
  description: EASM_COPY.en.meta.description,
  alternates: { canonical: '/easm' },
  openGraph: { title: EASM_COPY.en.meta.title, description: EASM_COPY.en.meta.description, url: '/easm' },
};

export default function Easm() {
  return (
    <>
      {/* Same always-dark look as the landing page, set before first paint. */}
      <script dangerouslySetInnerHTML={{ __html: PUBLIC_THEME_SCRIPT }} />
      <EasmPage />
    </>
  );
}
