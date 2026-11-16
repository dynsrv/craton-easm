import type { Metadata } from 'next';
import { LegalHub } from '@/components/legal-page';

// Static: the legal hub is built once and served from the edge.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Legal',
  description: 'Terms of service, privacy policy, acceptable use, liability and complaints for Craton, in plain language.',
  alternates: { canonical: '/legal' },
};

export default function Legal() {
  return (
    <>
      {/* Same always-dark look as the landing page, set before first paint. */}
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.theme='dark'" }} />
      <LegalHub />
    </>
  );
}
