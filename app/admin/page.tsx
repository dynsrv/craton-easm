import { redirect } from 'next/navigation';
import { AdminPanel } from '@/components/admin-panel';
import { getSession } from '@/lib/auth/guard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  return <AdminPanel email={session.email} />;
}
