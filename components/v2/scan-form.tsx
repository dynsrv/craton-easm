'use client';

import { Loader2, Radar, X } from 'lucide-react';
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

/** Domain input, authorisation and submit: used on the welcome screen and in the New scan dialog. */
export function ScanForm({ t, domain, setDomain, authorized, setAuthorized, busy, error, onSubmit, autoFocus }: ScanFormProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
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
          className="field h-10 min-w-0 flex-1 font-mono text-sm"
        />
        <Button type="submit" disabled={busy || !authorized} className="h-10 px-4">
          {busy ? <Loader2 className="animate-spin" /> : <Radar />}
          {busy ? t.scanning : t.run}
        </Button>
      </div>
      <label htmlFor="authorized" className="flex items-start gap-2.5 text-[13px] leading-5 text-muted">
        <input id="authorized" type="checkbox" checked={authorized} onChange={(e) => setAuthorized(e.target.checked)} className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]" />
        {t.authorize}
      </label>
      {error && (
        <p role="alert" className="text-[13px] text-crit">
          {error}
        </p>
      )}
    </form>
  );
}

/** Modal wrapper for the scan form. */
export function ScanDialog({ open, onClose, t, children }: { open: boolean; onClose: () => void; t: Dict; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'var(--scrim)' }} onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-dialog-title"
        className="fixed left-1/2 top-[12vh] z-50 w-[calc(100%-32px)] max-w-[520px] -translate-x-1/2 rounded-lg border border-line bg-panel p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="scan-dialog-title" className="text-lg font-semibold leading-7">
              {t.newScanTitle}
            </h2>
            <p className="mt-1 text-[13px] leading-5 text-muted">{t.newScanBody}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label={t.cancel}>
            <X />
          </Button>
        </div>
        {children}
      </div>
    </>
  );
}
