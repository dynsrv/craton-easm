import type { LucideIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border border-line bg-panel p-5', className)} {...props} />;
}

export function CardTitle({ className, icon: Icon, children, ...props }: React.HTMLAttributes<HTMLHeadingElement> & { icon?: LucideIcon; tone?: string }) {
  return (
    <h2 className={cn('mb-5 flex items-center gap-2.5 lbl', className)} {...props}>
      {Icon && <Icon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />}
      {children}
    </h2>
  );
}

/** Small label above a block of content inside a card or drawer. */
export function Eyebrow({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn('mb-2 lbl', className)} {...props} />;
}
