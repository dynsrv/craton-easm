import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** A module icon: one neutral colour, no background, so icons support the text instead of competing with it. */
export function IconTile({ icon: Icon, size = 'md', className }: { icon: LucideIcon; tone?: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const glyph = size === 'sm' ? 'size-4' : size === 'lg' ? 'size-6' : 'size-5';
  return <Icon className={cn('shrink-0 text-muted', glyph, className)} strokeWidth={1.75} aria-hidden />;
}
