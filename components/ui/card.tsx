import type { LucideIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-md border border-line bg-panel p-5 shadow-[var(--shadow-panel)]', className)} {...props} />;
}

export function CardTitle({ className, icon: Icon, tone, children, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { icon?: LucideIcon; tone?: string }) {
  return (
    <h2 className={cn('mb-4 flex items-center gap-2 text-sm font-semibold leading-5', className)} {...props}>
      {Icon && <Icon className="size-4 shrink-0" style={{ color: tone ?? 'var(--color-muted)' }} aria-hidden />}
      {children}
    </h2>
  );
}

/** Small label above a block of content inside a card or drawer. */
export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn('mb-1.5 text-xs font-medium text-muted', className)} {...props} />;
}
