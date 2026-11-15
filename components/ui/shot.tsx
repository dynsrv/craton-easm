'use client';

import { ScanEye } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

/** Screenshot thumbnail with a designed placeholder when there is no image or it fails to load. */
export function Shot({ assetId, available, label, className, large = false }: { assetId: string; available: boolean; label: string; className?: string; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!available || failed) {
    return (
      <span className={cn('flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-line bg-bg text-muted', className)}>
        <ScanEye className={large ? 'size-6' : 'size-4'} aria-hidden />
        <span className={large ? 'text-xs' : 'text-[10px] leading-none'}>{label}</span>
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/assets/${assetId}/screenshot`}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('rounded-md border border-line bg-panel2 object-cover object-top', className)}
    />
  );
}
