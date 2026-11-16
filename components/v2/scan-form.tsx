'use client';

import { ArrowRight, Check, Crosshair, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  const authRef = useRef<HTMLInputElement>(null);
  const [authErr, setAuthErr] = useState(false);
  useEffect(() => {
    if (autoFocus) ref.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  const submit = (e: React.FormEvent) => {
    // Enabled button, validated on submit: no permanently greyed control.
    if (!authorized) {
      e.preventDefault();
      setAuthErr(true);
      authRef.current?.focus();
      return;
    }
    setAuthErr(false);
    onSubmit(e);
  };

  return (
    <section aria-label={t.newScanTitle} className="no-print border-b border-line bg-panel">
      <form onSubmit={submit} className="mx-auto flex max-w-[1360px] flex-col gap-3 px-4 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:gap-6">
        <p className="flex shrink-0 items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
          <Crosshair className="size-4 text-ink" strokeWidth={1.75} aria-hidden />
          {t.newScanTitle}
        </p>

        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-stretch sm:gap-3">
          {/* Command bar: target glyph + domain input share one hairline frame */}
          <div className="flex h-11 min-w-0 flex-1 items-center border border-line bg-field focus-within:border-ink">
            <span className="grid place-items-center pl-3 pr-2 text-muted" aria-hidden>
              <span className="font-mono text-sm">&gt;</span>
            </span>
            <input
              ref={ref}
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder={t.domainPlaceholder}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="none"
              inputMode="url"
              required
              disabled={running}
              aria-describedby={error || authErr ? 'scan-error' : undefined}
              className="h-full min-w-0 flex-1 border-0 bg-transparent pr-3 font-mono text-[13px] text-ink outline-none placeholder:text-muted/70 disabled:opacity-60"
            />
          </div>
          <Button type="submit" disabled={running} className="h-11 w-full px-5 sm:w-auto">
            {busy || running ? <Loader2 className="animate-spin" /> : <ArrowRight />}
            {running ? t.scanning : t.run}
          </Button>
        </div>
      </form>

      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-x-5 gap-y-2 px-4 pb-3.5 sm:px-6">
        <label htmlFor="authorized" className="flex cursor-pointer select-none items-center gap-2.5 text-[13px] leading-5 text-muted">
          <span className={cn('relative grid size-4 shrink-0 place-items-center border transition-colors', authorized ? 'border-ink bg-ink' : authErr ? 'border-crit' : 'border-line bg-field')}>
            <input
              ref={authRef}
              id="authorized"
              type="checkbox"
              checked={authorized}
              onChange={(e) => {
                setAuthorized(e.target.checked);
                if (e.target.checked) setAuthErr(false);
              }}
              className="absolute inset-0 cursor-pointer appearance-none"
            />
            {authorized && <Check className="pointer-events-none size-3 text-[var(--color-inverse)]" strokeWidth={3} aria-hidden />}
          </span>
          {t.authorizeShort}
        </label>
        {(error || authErr) && (
          <p id="scan-error" role="alert" className="text-[13px] text-crit">
            {error ?? t.authorize}
          </p>
        )}
      </div>
    </section>
  );
}
