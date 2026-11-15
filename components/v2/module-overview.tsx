'use client';

import { ChevronRight, Layers } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { IconTile } from '@/components/ui/icon-tile';
import { SEV_VAR, type Dict } from '@/lib/i18n';
import { MODULE } from '@/lib/modules';
import type { ScanDTO, Severity } from '@/lib/types';

type Tab = 'overview' | 'paths' | 'assets' | 'exposures' | 'drift';

/** One tile per security module: icon, headline number, one line of context. Each opens its tab. */
export function ModuleOverview({ scan, t, onOpen }: { scan: ScanDTO; t: Dict; onOpen: (tab: Tab) => void }) {
  const ex = scan.exposures.filter((e) => e.severity !== 'Info');
  const of = (k: string) => ex.filter((e) => e.kind === k);
  const worst = (list: { severity: Severity }[]) => list[0]?.severity;
  const shots = scan.assets.filter((a) => a.hasScreenshot).length;
  const risky = scan.assets.filter((a) => a.visualClass === 'Exposed Admin / DevOps Panel' || a.visualClass === 'Unauthenticated API Docs').length;
  const driftNow = scan.driftEvents.filter((e) => e.scanId === scan.id);

  const tiles: { key: string; tab: Tab; value: string | number; sub: string; sev?: Severity }[] = [
    { key: 'takeover', tab: 'exposures', value: of('takeover').length, sub: t.modSub.takeover(of('takeover').length), sev: worst(of('takeover')) },
    { key: 'visual', tab: 'assets', value: shots, sub: t.modSub.visual(shots, risky), sev: risky ? 'High' : undefined },
    { key: 'code_leak', tab: 'exposures', value: of('code_leak').length, sub: t.modSub.code_leak(of('code_leak').length), sev: worst(of('code_leak')) },
    { key: 'bucket', tab: 'exposures', value: of('bucket').length, sub: t.modSub.bucket(of('bucket').length), sev: worst(of('bucket')) },
    {
      key: 'email',
      tab: 'exposures',
      value: of('email').length ? of('email').length : '✓',
      sub: scan.emailSecurity ? t.modSub.email(scan.emailSecurity.spf.policy, scan.emailSecurity.dmarc.policy) : '—',
      sev: worst(of('email')),
    },
    { key: 'paths', tab: 'paths', value: scan.attackPaths.length, sub: t.modSub.paths(scan.attackPaths.length), sev: scan.attackPaths.length ? scan.attackPaths[0].impact : undefined },
    { key: 'drift', tab: 'drift', value: driftNow.length, sub: t.modSub.drift(driftNow.length, Boolean(scan.baselineScanId)), sev: worst([...driftNow].sort((a, b) => ['Critical', 'High', 'Medium', 'Low', 'Info'].indexOf(a.severity) - ['Critical', 'High', 'Medium', 'Low', 'Info'].indexOf(b.severity))) },
  ];

  return (
    <Card>
      <CardTitle icon={Layers}>{t.modulesTitle}</CardTitle>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {tiles.map((m) => {
          const mod = MODULE[m.key];
          return (
            <button
              key={m.key}
              onClick={() => onOpen(m.tab)}
              className="group flex flex-col gap-3 rounded-md border border-line bg-bg p-4 text-left transition-colors hover:border-[color:var(--color-muted)] hover:bg-panel2"
            >
              <span className="flex items-center justify-between">
                <IconTile icon={mod.icon} tone={mod.tone} />
                <ChevronRight className="size-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
              </span>
              <span>
                <span className="block text-[13px] font-medium leading-5">{t.mod[m.key]}</span>
                <span className="tabular mt-1 block text-2xl font-semibold leading-7" style={{ color: m.sev && m.sev !== 'Info' ? SEV_VAR[m.sev] : undefined }}>
                  {m.value}
                </span>
                <span className="mt-0.5 block text-xs leading-4 text-muted">{m.sub}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/** Shown before the first scan: what each module checks. */
export function ModuleShowcase({ t }: { t: Dict }) {
  const keys = ['discovery', 'takeover', 'visual', 'code_leak', 'bucket', 'email', 'paths', 'drift'];
  const title: Record<string, string> = t.mod;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {keys.map((k) => (
        <div key={k} className="flex gap-3 rounded-md border border-line bg-panel p-4">
          <IconTile icon={MODULE[k].icon} tone={MODULE[k].tone} />
          <div>
            <p className="text-[13px] font-semibold leading-5">{k === 'discovery' ? (t.tabAssets === 'Aset' ? 'Penemuan aset' : 'Asset discovery') : title[k]}</p>
            <p className="mt-0.5 text-xs leading-4 text-muted">{t.modDesc[k]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
