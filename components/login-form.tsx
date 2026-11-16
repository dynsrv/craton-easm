'use client';

import { AppFooter } from '@/components/site-chrome';
import { ArrowLeft, CircleCheck, Loader2, Lock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Wordmark } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-toggle';
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
    <div className="flex min-h-dvh flex-col">
    <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Brand side: what you are signing in to */}
      <aside className="hidden flex-col justify-between border-r border-line bg-panel p-10 lg:flex xl:p-14">
        <Link href="/" aria-label="Craton home" className="w-fit">
          <Wordmark />
        </Link>
        <div className="max-w-[480px]">
          <h2 className="text-[32px] font-semibold leading-10 tracking-tight">See your company the way an attacker does.</h2>
          <ul className="mt-8 flex flex-col gap-4">
            {[
              ['Discover', 'Every subdomain, host and cloud bucket tied to your domain.'],
              ['Prioritise', 'Attack paths and the single fix that breaks each one.'],
              ['Report', 'A one-page brief for leadership, in English or Bahasa Indonesia.'],
            ].map(([k, v]) => (
              <li key={k} className="flex items-start gap-3 text-sm leading-6">
                <CircleCheck className="mt-1 size-4 shrink-0 text-ok" strokeWidth={1.75} aria-hidden />
                <span>
                  <b className="font-semibold">{k}.</b> <span className="text-muted">{v}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="flex items-center gap-2 text-[13px] text-muted">
          <ShieldCheck className="size-4" strokeWidth={1.75} aria-hidden />
          Passive by design. No agents, no exploits, no downloads.
        </p>
      </aside>

      <main className="flex flex-col px-4 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden />
            <span className="lg:hidden">
              <Wordmark compact />
            </span>
            <span className="hidden lg:inline">Back to home</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-[360px] flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl font-semibold leading-8 tracking-tight">Sign in</h1>
          <p className="mt-1 text-[13px] text-muted">Use the account your administrator created for you.</p>

          <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
            {problems.length > 0 && (
              <div role="alert" className="rounded-md border border-high px-3 py-2 text-[13px]">
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
            {error && <p role="alert" className="text-[13px] text-crit">{error}</p>}
            <Button type="submit" disabled={busy} className="mt-2 w-full">
              {busy && <Loader2 className="animate-spin" />}
              Sign in
            </Button>
          </form>

          <p className="mt-8 flex items-start gap-2 text-xs leading-5 text-muted">
            <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Access is limited to authorised operators. Every scan is recorded against the account that ran it.
          </p>
        </div>
      </main>
    </div>
    <AppFooter />
    </div>
  );
}
