import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/login-form';
import { getSession } from '@/lib/auth/guard';
import { authSecret } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: { absolute: 'Craton EASM: external attack surface management' } };

export default async function LoginPage() {
  if (await getSession()) redirect('/');
  const problems: string[] = [];
  if (!authSecret()) problems.push('AUTH_SECRET is not set (32+ random characters).');
  if (!process.env.DATABASE_URL) problems.push('No database is connected. Add a Postgres database (DATABASE_URL), then redeploy.');
  return <LoginForm problems={problems} />;
}
