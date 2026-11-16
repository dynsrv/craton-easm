import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-primary bg-primary text-[var(--color-inverse)] hover:opacity-85',
        outline: 'border-line bg-transparent text-ink hover:border-muted',
        ghost: 'border-transparent bg-transparent text-muted hover:bg-panel2 hover:text-ink',
      },
      size: { default: 'h-8 px-3.5 text-[13px]', sm: 'h-7 px-2.5 text-xs', icon: 'size-8' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export type ButtonProps = React.ComponentProps<'button'> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
