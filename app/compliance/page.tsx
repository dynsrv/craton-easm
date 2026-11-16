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
  return <CompliancePage email={session?.email ?? null} />;
}
