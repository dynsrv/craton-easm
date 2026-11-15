'use client';

import { Wordmark } from '@/components/brand';
import { PasswordForm } from '@/components/password-form';

export function FirstPassword({ email }: { email: string }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[420px] flex-col justify-center gap-5 px-4 py-10">
      <Wordmark />
      <div className="flex flex-col gap-3.5 rounded-sm border border-line bg-panel p-5">
        <h1 className="text-base font-semibold">Choose your password</h1>
        <p className="text-[12.5px] text-muted">
          You signed in as {email} with a one-time password. Set your own before continuing.
        </p>
        <PasswordForm currentLabel="One-time password" onDone={() => (window.location.href = '/')} />
      </div>
    </main>
  );
}
