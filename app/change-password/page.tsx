import { redirect } from 'next/navigation';
import { FirstPassword } from '@/components/first-password';
import { getSession } from '@/lib/auth/guard';
import type { Metadata } from 'next';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export const dynamic = 'force-dynamic';

export default async function ChangePasswordPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  return <FirstPassword email={session.email} />;
}
