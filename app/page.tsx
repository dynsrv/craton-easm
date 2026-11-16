import type { Metadata } from 'next';
import { Dashboard } from '@/components/dashboard';
import { Landing } from '@/components/landing';
import { getSession } from '@/lib/auth/guard';
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
  const session = await getSession();
  if (!session) return <Landing />;
  const [{ scan: wanted }, recent] = await Promise.all([searchParams, listScans()]);
  const id = wanted && recent.some((s) => s.id === wanted) ? wanted : recent[0]?.id;
  const scan = id ? await loadScanDTO(id) : null;
  return <Dashboard userEmail={session.email} initialScan={scan} initialRecent={recent} />;
}
