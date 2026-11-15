import { Dashboard } from '@/components/dashboard';
import { getSession } from '@/lib/auth/guard';
import { listScans, loadScanDTO } from '@/lib/run-scan';
import type { Metadata } from 'next';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export const dynamic = 'force-dynamic';

/**
 * The page arrives with the scan list and the open scan already in it, so the browser
 * does not wait for JavaScript and two more API calls before showing anything.
 */
export default async function Home({ searchParams }: { searchParams: Promise<{ scan?: string }> }) {
  const [session, { scan: wanted }, recent] = await Promise.all([getSession(), searchParams, listScans()]);
  const id = wanted && recent.some((s) => s.id === wanted) ? wanted : recent[0]?.id;
  const scan = id ? await loadScanDTO(id) : null;
  return <Dashboard userEmail={session?.email} initialScan={scan} initialRecent={recent} />;
}
