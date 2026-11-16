import type { Metadata } from 'next';
import { Dashboard } from '@/components/dashboard';
import { Landing } from '@/components/landing';
import { currentUser, getSession } from '@/lib/auth/guard';
import { isAdminRole } from '@/lib/auth/roles';
import { PUBLIC_THEME_SCRIPT } from '@/lib/public-theme';
import { listScans, loadScanDTO } from '@/lib/run-scan';

export const dynamic = 'force-dynamic';

// Visitors see the public landing page (indexed); signed-in users see their workspace (not indexed).
export async function generateMetadata(): Promise<Metadata> {
  const session = await getSession();
  return session ? { title: 'Dashboard', robots: { index: false, follow: false } } : { alternates: { canonical: '/' } };
}

/**
 * Signed in: the page arrives with the scan list and the open scan already in it,
 * so the browser does not wait for JavaScript and two more API calls before showing anything.
 */
export default async function Home({ searchParams }: { searchParams: Promise<{ scan?: string }> }) {
  const user = await currentUser();
  if (!user)
    return (
      <>
        {/* Visitors get their saved theme, or dark the first time, before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: PUBLIC_THEME_SCRIPT }} />
        <Landing />
      </>
    );
  const admin = isAdminRole(user.role);
  const [{ scan: wanted }, recent] = await Promise.all([searchParams, listScans(admin ? {} : { ownerId: user.session.userId })]);
  const id = wanted && recent.some((s) => s.id === wanted) ? wanted : recent[0]?.id;
  const scan = id ? await loadScanDTO(id) : null;
  return <Dashboard userEmail={user.session.email} isAdmin={admin} initialScan={scan} initialRecent={recent} />;
}
