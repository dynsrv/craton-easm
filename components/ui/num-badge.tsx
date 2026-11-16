import { cn } from '@/lib/utils';

/** Step number in a soft circle tinted with the theme accent, so numbered lists read as steps. */
export function NumBadge({ n, className }: { n: number; className?: string }) {
  return (
    <span
      className={cn('tabular grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold leading-none text-accent', className)}
      style={{ background: 'color-mix(in srgb, var(--color-accent) 16%, transparent)' }}
      aria-hidden
    >
      {n}
    </span>
  );
}
