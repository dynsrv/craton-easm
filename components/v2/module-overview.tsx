'use client';

import { Layers } from 'lucide-react';
import { Card, CardTitle } from '@/components/ui/card';
import { IconTile } from '@/components/ui/icon-tile';
import { SEV_VAR, type Dict } from '@/lib/i18n';
import { MODULE } from '@/lib/modules';
import { cn } from '@/lib/utils';
import type { EmailSecurity, ScanDTO, Severity } from '@/lib/types';

/** Can someone send mail that looks like it came from this domain? */
function emailGrade(e: EmailSecurity | null): 'strong' | 'partial' | 'weak' | 'unknown' {
  if (!e) return 'unknown';
  if (e.dmarc.policy === 'none' || e.dmarc.policy === 'monitor') return 'weak';
  if (e.dmarc.policy === 'reject' && (e.spf.policy === 'fail' || e.spf.policy === 'softfail')) return 'strong';
  return 'partial';
}

type Tab = 'overview' | 'paths' | 'assets' | 'exposures' | 'drift';

/** One tile per security module: icon, headline number, one line of context. Each opens its tab. */
export function ModuleOverview({ scan, t, onOpen }: { scan: ScanDTO; t: Dict; onOpen: (tab: Tab) => void }) {
  const ex = scan.exposures.filter((e) => e.severity !== 'Info');
  const of = (k: string) => ex.filter((e) => e.kind === k);
  const worst = (list: { severity: Severity }[]) => list[0]?.severity;
  const shots = scan.assets.filter((a) => a.hasScreenshot).length;
  const risky = scan.assets.filter((a) => a.visualClass === 'Exposed Admin / DevOps Panel' || a.visualClass === 'Unauthenticated API Docs').length;
  const driftNow = scan.driftEvents.filter((e) => e.scanId === scan.id);

    const grade = emailGrade(scan.emailSecurity);
  const gradeColor = grade === 'strong' ? 'var(--color-ok)' : grade === 'weak' ? SEV_VAR[worst(of('email')) === 'Critical' || worst(of('email')) === 'High' ? worst(of('email'))! : 'Medium'] : undefined;

  const tiles: { key: string; tab: Tab; value: string | number; sub: string; sev?: Severity; color?: string }[] = [
    { key: 'takeover', tab: 'exposures', value: of('takeover').length, sub: t.modSub.takeover(of('takeover').length), sev: worst(of('takeover')) },
    { key: 'visual', tab: 'assets', value: shots, sub: t.modSub.visual(shots, risky), sev: risky ? 'High' : undefined },
    { key: 'code_leak', tab: 'exposures', value: of('code_leak').length, sub: t.modSub.code_leak(of('code_leak').length), sev: worst(of('code_leak')) },
    { key: 'bucket', tab: 'exposures', value: of('bucket').length, sub: t.modSub.bucket(of('bucket').length), sev: worst(of('bucket')) },
    {
      key: 'email',
      tab: 'exposures',
      value: t.emailGrade[grade],
      sub: scan.emailSecurity ? t.modSub.email(scan.emailSecurity.spf.policy, scan.emailSecurity.dmarc.policy) : '—',
      color: gradeColor,
    },
    { key: 'paths', tab: 'paths', value: scan.attackPaths.length, sub: t.modSub.paths(scan.attackPaths.length), sev: scan.attackPaths.length ? scan.attackPaths[0].impact : undefined },
    { key: 'drift', tab: 'drift', value: driftNow.length, sub: t.modSub.drift(driftNow.length, Boolean(scan.baselineScanId)), sev: worst([...driftNow].sort((a, b) => ['Critical', 'High', 'Medium', 'Low', 'Info'].indexOf(a.severity) - ['Critical', 'High', 'Medium', 'Low', 'Info'].indexOf(b.severity))) },
  ];

  return (
    <Card>
      <CardTitle icon={Layers}>{t.modulesTitle}</CardTitle>
      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {tiles.map((m) => {
          const mod = MODULE[m.key];
          return (
            <button
              key={m.key}
              onClick={() => onOpen(m.tab)}
              className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 bg-panel px-4 py-3 text-left transition-colors hover:bg-panel2 sm:content-start sm:items-start sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-y-1.5 sm:p-5"
            >
              <span className="row-span-2 sm:row-span-1 sm:pt-px">
                <IconTile icon={mod.icon} tone={mod.tone} />
              </span>
              <span className="self-end truncate text-[13px] font-medium leading-5 sm:self-start sm:overflow-visible sm:whitespace-normal">{t.mod[m.key]}</span>
              <span
                className={cn(
                  'col-start-3 row-span-2 row-start-1 text-right sm:col-span-2 sm:col-start-1 sm:row-span-1 sm:row-start-2 sm:text-left',
                  typeof m.value === 'number' ? 'tabular text-2xl font-semibold leading-7' : 'truncate text-lg font-semibold leading-7 sm:text-xl',
                )}
                style={{ color: m.color ?? (m.sev && m.sev !== 'Info' ? SEV_VAR[m.sev] : undefined) }}
              >
                {m.value}
              </span>
              <span className="col-start-2 self-start text-xs leading-4 text-muted sm:col-span-2 sm:col-start-1">{m.sub}</span>
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
    <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {keys.map((k) => (
        <div key={k} className="flex gap-3 bg-panel px-4 py-3 sm:p-5">
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
