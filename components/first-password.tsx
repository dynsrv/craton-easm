'use client';

import { Wordmark } from '@/components/brand';
import { PasswordForm } from '@/components/password-form';

export function FirstPassword({ email }: { email: string }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[420px] flex-col justify-center gap-6 px-4 py-10">
      <Wordmark />
      <div className="flex flex-col gap-4 rounded-md border border-line bg-panel p-6 shadow-[var(--shadow-panel)]">
        <h1 className="text-lg font-semibold leading-6">Choose your password</h1>
        <p className="text-[13px] text-muted">
          You signed in as {email} with a one-time password. Set your own before continuing.
        </p>
        <PasswordForm currentLabel="One-time password" onDone={() => (window.location.href = '/')} />
      </div>
    </main>
  );
}
