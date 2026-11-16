'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MIN = 12;

/** Change-password form, used on the forced first-login screen and in Admin > Account. */
export function PasswordForm({ onDone, currentLabel = 'Current password', className }: { onDone?: () => void; currentLabel?: string; className?: string }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (next.length < MIN) return setError(`Use at least ${MIN} characters.`);
    if (next !== confirm) return setError('The two new passwords do not match.');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ current, next }) });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error ?? 'Could not change the password.');
      setCurrent('');
      setNext('');
      setConfirm('');
      setSaved(true);
      onDone?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={cn('flex max-w-[380px] flex-col gap-4', className)}>
      <div>
        <label htmlFor="pw-current" className="label">{currentLabel}</label>
        <input id="pw-current" type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} className="field !h-9" />
      </div>
      <div>
        <label htmlFor="pw-next" className="label">New password (at least {MIN} characters)</label>
        <input id="pw-next" type="password" autoComplete="new-password" required value={next} onChange={(e) => setNext(e.target.value)} className="field !h-9" />
      </div>
      <div>
        <label htmlFor="pw-confirm" className="label">Repeat new password</label>
        <input id="pw-confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="field !h-9" />
      </div>
      {error && <p role="alert" className="text-[13px] text-crit">{error}</p>}
      {saved && <p role="status" className="text-[13px] text-low">Password changed.</p>}
      <div>
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="animate-spin" />}
          Change password
        </Button>
      </div>
    </form>
  );
}
