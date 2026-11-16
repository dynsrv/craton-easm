'use client';

import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: React.ReactNode;
  /** Optional second line or right-aligned detail, shown in the menu only. */
  hint?: React.ReactNode;
}

interface SelectProps {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  'aria-label'?: string;
  className?: string;
  /** Text shown in the closed trigger, when it should differ from the option label. */
  renderValue?: (option: SelectOption | undefined) => React.ReactNode;
  mono?: boolean;
  disabled?: boolean;
}

/**
 * Themed dropdown built on Radix Select: keyboard navigation, type-ahead, focus return and
 * screen-reader roles come from the primitive; the look follows the app's theme tokens.
 */
export function Select({ id, value, onValueChange, options, placeholder, className, renderValue, mono, disabled, ...aria }: SelectProps) {
  const current = options.find((o) => o.value === value);
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        id={id}
        aria-label={aria['aria-label']}
        className={cn(
          'group inline-flex h-8 min-w-0 items-center justify-between gap-2 rounded-md border border-line bg-[var(--color-field)] pl-3 pr-2 text-left text-[13px] text-ink',
          'transition-colors hover:border-muted/60 hover:bg-panel2',
          'focus-visible:border-transparent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent',
          'data-[state=open]:border-transparent data-[state=open]:outline-2 data-[state=open]:outline-offset-0 data-[state=open]:outline-accent',
          'data-[placeholder]:text-muted',
          'disabled:cursor-not-allowed disabled:opacity-60',
          mono && 'font-mono',
          className,
        )}
      >
        <span className="min-w-0 truncate">
          <SelectPrimitive.Value placeholder={placeholder}>{renderValue ? renderValue(current) : current?.label}</SelectPrimitive.Value>
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 shrink-0 text-muted transition-transform duration-150 group-data-[state=open]:rotate-180" aria-hidden />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className={cn(
            'select-menu relative z-50 max-h-[min(360px,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden',
            'rounded-lg border border-line bg-panel text-ink shadow-[0_12px_32px_-8px_rgb(0_0_0/0.35),0_2px_6px_rgb(0_0_0/0.12)]',
          )}
        >
          <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center text-muted">
            <ChevronUp className="size-4" />
          </SelectPrimitive.ScrollUpButton>
          <SelectPrimitive.Viewport className="p-1">
            {options.map((o) => (
              <SelectPrimitive.Item
                key={o.value}
                value={o.value}
                className={cn(
                  'relative flex min-h-8 cursor-pointer select-none items-center gap-3 rounded-md py-1.5 pl-8 pr-3 text-[13px] leading-5 outline-none',
                  'data-[highlighted]:bg-panel2 data-[state=checked]:font-medium',
                  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  mono && 'font-mono',
                )}
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2.5 inline-flex">
                  <Check className="size-4 text-accent" aria-hidden />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{o.label}</SelectPrimitive.ItemText>
                {o.hint != null && <span className="tabular ml-auto pl-4 font-sans text-xs font-normal text-muted">{o.hint}</span>}
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center text-muted">
            <ChevronDown className="size-4" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
