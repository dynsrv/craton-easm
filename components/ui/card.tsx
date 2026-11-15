import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-md border border-line bg-panel p-5 shadow-[var(--shadow-panel)]', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('mb-4 text-sm font-semibold leading-5', className)} {...props} />;
}

/** Small label above a block of content inside a card or drawer. */
export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn('mb-1.5 text-xs font-medium text-muted', className)} {...props} />;
}
