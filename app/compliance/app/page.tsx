import type { Metadata } from 'next';
import { CompliancePage } from '@/components/compliance-page';
import { getSession } from '@/lib/auth/guard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Indonesian compliance guide',
  robots: { index: false },
  alternates: { canonical: '/compliance' },
};

/** Signed-in variant of /compliance (inside the app shell). Reached through a middleware rewrite. */
export default async function ComplianceApp() {
  const session = await getSession();
  const email = session?.email ?? null;
  return (
    <>
      {!email && <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.theme='dark'" }} />}
      <CompliancePage email={email} />
    </>
  );
}
