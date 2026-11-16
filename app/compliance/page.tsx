import type { Metadata } from 'next';
import { CompliancePage } from '@/components/compliance-page';

// Static: served from the edge with no session lookup. Signed-in users are rewritten to /compliance/app by middleware.
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Indonesian compliance guide',
  description:
    'UU PDP, PP 71/2019, OJK, Bank Indonesia and BSSN rules that bear on your external attack surface, in plain language with links to the source, and how Craton findings relate to them.',
  alternates: { canonical: '/compliance' },
};

export default function Compliance() {
  return (
    <>
      {/* Visitors always get the dark theme, set before first paint. */}
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.theme='dark'" }} />
      <CompliancePage email={null} />
    </>
  );
}
