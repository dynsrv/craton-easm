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

/**
 * Always-visible scan bar under the top navigation: scanning works like a search box,
 * with no hidden panel or pop-up.
 */
export function ScanBar({
  t,
  domain,
  setDomain,
  authorized,
  setAuthorized,
  busy,
  running,
  error,
  onSubmit,
  autoFocus,
}: ScanFormProps & { running: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.focus({ preventScroll: true });
  }, [autoFocus]);
  const locked = busy || running;
  return (
    <section aria-label={t.newScanTitle} className="no-print border-b border-line bg-panel">
      <form onSubmit={onSubmit} className="mx-auto flex max-w-[1360px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-4">
        <label htmlFor="domain" className="flex shrink-0 items-center gap-2 text-[13px] font-semibold">
          <Radar className="size-4 text-muted" strokeWidth={1.75} aria-hidden />
          {t.newScanTitle}
        </label>
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <input
            ref={ref}
            id="domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder={t.domainPlaceholder}
            spellCheck={false}
            autoComplete="off"
            required
            disabled={running}
            aria-describedby={error ? 'scan-error' : undefined}
            className="field min-w-0 flex-1 font-mono"
          />
          <label htmlFor="authorized" className="flex shrink-0 items-center gap-2 text-[13px] leading-5 text-muted">
            <input
              id="authorized"
              type="checkbox"
              checked={authorized}
              onChange={(e) => setAuthorized(e.target.checked)}
              className="size-4 shrink-0 accent-[var(--color-primary)]"
            />
            {t.authorizeShort}
          </label>
          <Button type="submit" disabled={locked || !authorized} title={!authorized ? t.authorize : undefined}>
            {locked ? <Loader2 className="animate-spin" /> : <Radar />}
            {running ? t.scanning : t.run}
          </Button>
        </div>
      </form>
      {error && (
        <p id="scan-error" role="alert" className="mx-auto max-w-[1360px] px-4 pb-3 text-[13px] text-crit sm:px-6">
          {error}
        </p>
      )}
    </section>
  );
}
