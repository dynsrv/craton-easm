'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Sector } from '@/lib/compliance';

const IDS: Sector[] = ['any', 'bank', 'payments', 'finance', 'cii'];

/** Remembers the organisation type between the compliance guide and the scan tab. */
export function useSector(): [Sector, (s: Sector) => void] {
  const [sector, setState] = useState<Sector>('any');
  useEffect(() => {
    try {
      const v = localStorage.getItem('ng-sector') as Sector | null;
      if (v && IDS.includes(v)) setState(v);
    } catch {}
  }, []);
  const set = useCallback((s: Sector) => {
    setState(s);
    try {
      localStorage.setItem('ng-sector', s);
    } catch {}
  }, []);
  return [sector, set];
}
