'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Wordmark } from '@/components/brand';
import { Button } from '@/components/ui/button';

export function LoginForm({ problems }: { problems: string[] }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const body = (await res.json()) as { error?: string; mustChangePassword?: boolean };
      if (!res.ok) throw new Error(body.error ?? 'Sign-in failed.');
      window.location.href = body.mustChangePassword ? '/change-password' : '/';
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-[380px] flex-col justify-center gap-5 px-4 py-10">
      <Wordmark />
      <form onSubmit={submit} className="flex flex-col gap-3.5 rounded-sm border border-line bg-panel p-5">
        <h1 className="text-base font-semibold">Sign in</h1>
        {problems.length > 0 && (
          <div role="alert" className="rounded-sm border border-high px-3 py-2 text-[12.5px]">
            <b className="text-high">Setup incomplete</b>
            <ul className="mt-1 list-disc pl-4 text-muted">
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
        </div>
        {error && <p role="alert" className="text-[12.5px] text-crit">{error}</p>}
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          Sign in
        </Button>
      </form>
      <p className="text-xs text-muted">Access is limited to authorised operators. Scans are logged per account.</p>
    </main>
  );
}
