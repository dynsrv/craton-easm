/** Craton mark: three strata, the stable core of a continent. */
export function CratonMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="3" width="20" height="4" fill="var(--color-accent)" />
      <rect x="2" y="10" width="14" height="4" fill="var(--color-accent)" opacity="0.7" />
      <rect x="2" y="17" width="20" height="4" fill="var(--color-accent)" opacity="0.4" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="flex items-center gap-2">
      <CratonMark className="size-[18px]" />
      <span className="text-[13px] font-semibold uppercase tracking-[0.16em]">Craton</span>
      <span className="border-l border-line pl-2 text-[11px] uppercase tracking-[0.1em] text-muted">EASM</span>
    </span>
  );
}
