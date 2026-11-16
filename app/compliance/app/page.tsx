import type { Metadata } from 'next';
import { PUBLIC_THEME_SCRIPT } from '@/lib/public-theme';
import { CompliancePage } from '@/components/compliance-page';
import { currentUser } from '@/lib/auth/guard';
import { isAdminRole } from '@/lib/auth/roles';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Indonesian compliance guide',
  robots: { index: false },
  alternates: { canonical: '/compliance' },
};

/** Signed-in variant of /compliance (inside the app shell). Reached through a middleware rewrite. */
export default async function ComplianceApp() {
  const user = await currentUser();
  const email = user?.session.email ?? null;
  return (
    <>
      {!email && <script dangerouslySetInnerHTML={{ __html: PUBLIC_THEME_SCRIPT }} />}
      <CompliancePage email={email} isAdmin={isAdminRole(user?.role)} />
    </>
  );
}
