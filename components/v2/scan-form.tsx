'use client';

import { Loader2, Radar } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { Dict } from '@/lib/i18n';

interface ScanFormProps {
  t: Dict;
  domain: string;
  setDomain: (v: string) => void;
  authorized: boolean;
  setAuthorized: (v: boolean) => void;
  busy: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  autoFocus?: boolean;
}

/** Domain input, authorisation and submit: used on the welcome screen and in the inline New scan panel. */
export function ScanForm({ t, domain, setDomain, authorized, setAuthorized, busy, error, onSubmit, autoFocus }: ScanFormProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus({ preventScroll: true });
  }, [autoFocus]);
  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      <label htmlFor="domain" className="label">
        {t.domainLabel}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={ref}
          id="domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="company.co.id"
          spellCheck={false}
          autoComplete="off"
          required
          className="field min-w-0 flex-1 font-mono"
        />
        <Button type="submit" disabled={busy || !authorized}>
          {busy ? <Loader2 className="animate-spin" /> : <Radar />}
          {busy ? t.scanning : t.run}
        </Button>
      </div>
      <label htmlFor="authorized" className="mt-3 flex items-center gap-2 text-[13px] leading-5 text-muted">
        <input id="authorized" type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} className="size-4 shrink-0 accent-[var(--color-primary)]" />
        {t.authorize}
      </label>
      {error && (
        <p role="alert" className="mt-2 text-[13px] leading-5 text-crit">
          {error}
        </p>
      )}
    </form>
  );
}

/** New scan panel shown in the page flow under the header: no overlay, the results stay visible below. */
export function ScanPanel({ open, onClose, t, children }: { open: boolean; onClose: () => void; t: Dict; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <section ref={ref} id="new-scan" aria-labelledby="new-scan-title" className="rounded-lg border border-line bg-panel p-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
        <div>
          <h2 id="new-scan-title" className="flex items-center gap-2 text-base font-semibold leading-6">
            <Radar className="size-4 shrink-0 text-muted" strokeWidth={1.75} aria-hidden />
            {t.newScanTitle}
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-muted">{t.newScanBody}</p>
        </div>
        {/* Closed with the header's Cancel button or Escape */}
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
