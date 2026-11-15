import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** A module icon on a softly tinted square. */
export function IconTile({ icon: Icon, tone, size = 'md', className }: { icon: LucideIcon; tone: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const box = size === 'sm' ? 'size-6 rounded' : size === 'lg' ? 'size-10 rounded-lg' : 'size-8 rounded-md';
  const glyph = size === 'sm' ? 'size-3.5' : size === 'lg' ? 'size-5' : 'size-4';
  return (
    <span className={cn('inline-grid shrink-0 place-items-center', box, className)} style={{ color: tone, background: `color-mix(in oklab, ${tone} 14%, transparent)` }} aria-hidden>
      <Icon className={glyph} />
    </span>
  );
}
