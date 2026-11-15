import { Dashboard } from '@/components/dashboard';
import { getSession } from '@/lib/auth/guard';

export default async function Home() {
  const session = await getSession();
  return <Dashboard userEmail={session?.email} />;
}
