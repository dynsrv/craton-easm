'use client';

import { Wordmark } from '@/components/brand';
import { PasswordForm } from '@/components/password-form';
import { AppFooter } from '@/components/site-chrome';

export function FirstPassword({ email }: { email: string }) {
  return (
    <div className="flex min-h-dvh flex-col">
    <main className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center gap-6 px-4 py-10">
      <Wordmark />
      <div className="flex flex-col gap-4 rounded-md border border-line bg-panel p-6 shadow-[var(--shadow-panel)]">
        <h1 className="text-lg font-semibold leading-6">Choose your password</h1>
        <p className="text-[13px] text-muted">
          You signed in as {email} with a one-time password. Set your own before continuing.
        </p>
        <PasswordForm currentLabel="One-time password" onDone={() => (window.location.href = '/')} />
      </div>
    </main>
    <AppFooter />
    </div>
  );
}
