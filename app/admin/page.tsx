import { redirect } from 'next/navigation';
import { AdminPanel } from '@/components/admin-panel';
import { currentUser } from '@/lib/auth/guard';
import { isAdminRole } from '@/lib/auth/roles';
import type { Metadata } from 'next';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect('/login');
  if (!isAdminRole(user.role)) redirect('/');
  return <AdminPanel email={user.session.email} />;
}
