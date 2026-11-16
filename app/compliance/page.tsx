import type { Metadata } from 'next';
import { CompliancePage } from '@/components/compliance-page';
import { getSession } from '@/lib/auth/guard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Indonesian compliance guide',
  description:
    'UU PDP, PP 71/2019, OJK, Bank Indonesia and BSSN rules that bear on your external attack surface, in plain language with links to the source, and how Craton findings relate to them.',
  alternates: { canonical: '/compliance' },
};

/** Public reference page. Signed-in users see it inside the app shell. */
export default async function Compliance() {
  const session = await getSession();
  const email = session?.email ?? null;
  return (
    <>
      {/* Signed-out visitors always get the dark theme, set before first paint. Signed-in users keep their own choice. */}
      {!email && <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.theme='dark'" }} />}
      <CompliancePage email={email} />
    </>
  );
}
