'use client';

import { AppFooter } from '@/components/site-chrome';
import { ArrowLeft, CircleCheck, Loader2, Lock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Wordmark } from '@/components/brand';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

const NOTICE: Record<string, string> = {
  google_denied: 'Google sign-in was cancelled.',
  google_failed: 'Google sign-in did not complete. Please try again.',
  google_unverified: 'Your Google email address is not verified, so we cannot use it.',
  google_off: 'Google sign-in is not available right now.',
  disabled: 'This account is disabled. Contact your administrator.',
};

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.27-2.09 3.57-5.17 3.57-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28v-3.1H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.1C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  );
}

export function LoginForm({ problems, google }: { problems: string[]; google: boolean }) {
  // The page is static, so the notice (`/login?error=...`) is read here instead of on the server.
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => setNotice(new URLSearchParams(window.location.search).get('error')), []);
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
          <h1 className="text-2xl font-semibold leading-8 tracking-tight">Sign in or sign up</h1>
          <p className="mt-1 text-[13px] text-muted">{google ? 'New here? Continue with Google and your account is created for you.' : 'Use the account your administrator created for you.'}</p>

          {notice && NOTICE[notice] && (
            <p role="alert" className="mt-6 rounded-md border border-high px-3 py-2 text-[13px] text-high">
              {NOTICE[notice]}
            </p>
          )}

          {google && (
            <>
              <a href="/api/auth/google" className="mt-8 flex h-10 w-full items-center justify-center gap-2.5 border border-line bg-panel text-sm font-medium transition-colors hover:bg-panel2">
                <GoogleMark />
                Continue with Google
              </a>
              <div className="mt-6 flex items-center gap-3 text-xs text-muted" aria-hidden>
                <span className="h-px flex-1 bg-line" />
                or use email
                <span className="h-px flex-1 bg-line" />
              </div>
            </>
          )}

          <form onSubmit={submit} className={google ? 'mt-6 flex flex-col gap-4' : 'mt-8 flex flex-col gap-4'}>
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
            <span>
              Every scan is recorded against the account that ran it. By continuing you agree to the{' '}
              <Link href="/legal/terms" className="underline underline-offset-2 hover:text-ink">Terms</Link>,{' '}
              <Link href="/legal/acceptable-use" className="underline underline-offset-2 hover:text-ink">Acceptable Use</Link> and{' '}
              <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-ink">Privacy Policy</Link>.
            </span>
          </p>
        </div>
      </main>
    </div>
    <AppFooter />
    </div>
  );
}
