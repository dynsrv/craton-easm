/** Craton mark: three strata, the stable core of a continent. */
export function CratonMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="3" width="20" height="4" rx="1" fill="var(--color-primary)" />
      <rect x="2" y="10" width="14" height="4" rx="1" fill="var(--color-primary)" opacity="0.7" />
      <rect x="2" y="17" width="20" height="4" rx="1" fill="var(--color-primary)" opacity="0.4" />
    </svg>
  );
}

/** The product name is the one place that stays in capitals. */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <CratonMark className="size-5" />
      <span className="text-sm font-semibold tracking-[0.14em]">CRATON</span>
      <span className={compact ? 'hidden border-l border-line pl-2.5 text-xs tracking-[0.1em] text-muted sm:inline' : 'border-l border-line pl-2.5 text-xs tracking-[0.1em] text-muted'}>EASM</span>
    </span>
  );
}
