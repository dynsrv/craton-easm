import type { Metadata } from 'next';
import { LoginForm } from '@/components/login-form';
import { googleEnabled } from '@/lib/auth/google';
import { authSecret } from '@/lib/auth/session';

// Static: built once and served from the edge. The environment is read at build time (a changed variable
// needs a redeploy anyway), and the error notice from Google sign-in is read in the browser.
// Signed-in visitors are redirected by middleware.
export const dynamic = 'force-static';

export const metadata: Metadata = { title: 'Sign in', alternates: { canonical: '/login' } };

export default function LoginPage() {
  const problems: string[] = [];
  if (!authSecret()) problems.push('AUTH_SECRET is not set (32+ random characters).');
  if (!process.env.DATABASE_URL) problems.push('No database is connected. Add a Postgres database (DATABASE_URL), then redeploy.');
  return <LoginForm problems={problems} google={googleEnabled()} />;
}
