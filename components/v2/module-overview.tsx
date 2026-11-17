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
      {/* Every tile has the same three rows: icon + title with the result on the right, then the caption underneath. */}
      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {tiles.map((m, idx) => {
          const mod = MODULE[m.key];
          return (
            <button
              key={m.key}
              onClick={() => onOpen(m.tab)}
              className={cn(
                'group flex min-w-0 flex-col gap-1.5 bg-panel px-4 py-3.5 text-left transition-colors hover:bg-panel2 sm:px-5 sm:py-4',
                // The odd tile out spans the row, so the ruled grid ends square.
                idx === tiles.length - 1 && tiles.length % 2 === 1 && 'sm:max-xl:col-span-2',
              )}
            >
              <span className="flex min-h-7 items-center gap-3 xl:grid xl:grid-cols-[auto_minmax(0,1fr)] xl:gap-y-2">
                <IconTile icon={mod.icon} tone={mod.tone} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium leading-5 xl:order-3 xl:col-span-2">
                  <span className={m.key === 'email' ? 'hidden' : 'xl:hidden'}>{t.mod[m.key]}</span>
                  <span className={m.key === 'email' ? '' : 'hidden xl:inline'}>{t.modShort[m.key]}</span>
                </span>
                <span
                  className={cn('shrink-0 text-right font-semibold leading-7 xl:order-2 xl:justify-self-end', typeof m.value === 'number' ? 'tabular text-2xl/7' : 'text-lg/7')}
                  style={{ color: m.color ?? (m.sev && m.sev !== 'Info' ? SEV_VAR[m.sev] : undefined) }}
                >
                  {m.value}
                </span>
              </span>
              <span className="text-xs leading-4 text-muted sm:min-h-8">{m.sub}</span>
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
        <div key={k} className="flex gap-3.5 bg-panel px-4 py-4 sm:p-6">
          <IconTile icon={MODULE[k].icon} tone={MODULE[k].tone} />
          <div>
            <p className="text-[13px] font-semibold leading-5">{k === 'discovery' ? (t.tabAssets === 'Aset' ? 'Penemuan aset' : 'Asset discovery') : title[k]}</p>
            <p className="mt-1 text-[13px] leading-5 text-muted">{t.modDesc[k]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
