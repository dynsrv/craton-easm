import { cn } from '@/lib/utils';

/** Paints a transparent PNG in the current text colour, so the logo follows the light and dark themes. */
function Masked({ src, ratio, className, label }: { src: string; ratio: number; className?: string; label?: string }) {
  const mask = `url(${src})`;
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('block shrink-0 bg-ink', className)}
      style={{ aspectRatio: ratio, maskImage: mask, WebkitMaskImage: mask, maskSize: 'contain', WebkitMaskSize: 'contain', maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'left center', WebkitMaskPosition: 'left center' }}
    />
  );
}

/** Craton fingerprint mark. */
export function CratonMark({ className }: { className?: string }) {
  return <Masked src="/brand/craton-mark.png" ratio={404 / 402} className={cn('size-5', className)} />;
}

/** Mark plus the CRATON wordmark, one lockup. `compact` is kept for callers; the lockup is the same at every width. */
export function Wordmark({ className }: { compact?: boolean; className?: string }) {
  return <Masked src="/brand/craton-logo.png" ratio={1741 / 402} label="Craton" className={cn('h-8', className)} />;
}
