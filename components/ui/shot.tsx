'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/** Screenshot thumbnail. Renders nothing if the image fails to load: no empty placeholder boxes. */
export function Shot({ assetId, className }: { assetId: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
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
