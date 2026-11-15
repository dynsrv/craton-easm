'use client';

import { ArrowRight, Building2, FileSearch, Gauge, ListOrdered, Route, Server, TrendingDown, TrendingUp } from 'lucide-react';
import { ScoreGauge } from '@/components/score-gauge';
import { Card, CardTitle } from '@/components/ui/card';
import { ModuleOverview } from '@/components/v2/module-overview';
import { catName, sevName, SEV_VAR, type Dict } from '@/lib/i18n';
import { CATEGORIES, SEVERITIES, type AssetDTO, type Category, type Lang, type ScanDTO, type Severity } from '@/lib/types';
import { cn } from '@/lib/utils';

type Tab = 'overview' | 'paths' | 'assets' | 'exposures' | 'drift';

interface OverviewProps {
  scan: ScanDTO;
  assets: AssetDTO[];
  counts: Record<Severity, number>;
  lang: Lang;
  t: Dict;
  setTab: (tab: Tab) => void;
  filterAssets: (next: { sev?: Severity | 'All'; cat?: Category | 'All' }) => void;
}

function Bars({ rows, onPick, active }: { rows: { key: string; label: string; n: number }[]; onPick?: (key: string) => void; active?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r) => (
        <li key={r.key} className="grid grid-cols-[minmax(0,1fr)_minmax(64px,40%)_24px] items-center gap-3 text-[13px] leading-5">
          {onPick ? (
            <button onClick={() => onPick(r.key)} className={cn('truncate text-left hover:text-accent', r.n === 0 && 'text-muted', active === r.key && 'font-medium text-accent')}>
              {r.label}
            </button>
          ) : (
            <span className="truncate">{r.label}</span>
          )}
          <span className="h-1.5 overflow-hidden rounded-full bg-panel2" aria-hidden>
            <i className="block h-full rounded-full bg-primary" style={{ width: `${(r.n / max) * 100}%` }} />
          </span>
          <span className="tabular text-right text-muted">{r.n}</span>
        </li>
      ))}
    </ul>
  );
}

export function Overview({ scan, assets, counts, lang, t, setTab, filterAssets }: OverviewProps) {
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short' });
  const delta = scan.score != null && scan.baseline?.score != null ? scan.score - scan.baseline.score : null;
  const path = scan.attackPaths[0];
  const total = Math.max(1, SEVERITIES.reduce((s, k) => s + counts[k], 0));

  const hosting = Object.entries(
    assets.reduce<Record<string, number>>((acc, a) => {
      const name = a.provider.replace(/\s*\(.*\)$/, '');
      acc[name] = (acc[name] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([key, n]) => ({ key, label: key, n }));

  return (
    <div className="flex flex-col gap-5">
      {/* 1. How exposed are we, and what changed */}
      <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        <Card className="flex flex-col">
          <CardTitle icon={Gauge}>{t.score}</CardTitle>
          <div className="flex justify-center py-1">{scan.score != null ? <ScoreGauge score={scan.score} t={t} /> : <p className="py-8 text-muted">{t.pending}…</p>}</div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-muted">
            {delta == null ? (
              t.firstScan
            ) : delta === 0 ? (
              `${t.unchanged} ${t.since(fmt(scan.baseline!.date))}`
            ) : (
              <>
                {delta > 0 ? <TrendingUp className="size-4 text-low" aria-hidden /> : <TrendingDown className="size-4 text-crit" aria-hidden />}
                <b className={cn('tabular font-semibold', delta > 0 ? 'text-low' : 'text-crit')}>
                  {delta > 0 ? '+' : ''}
                  {delta}
                </b>
                {delta > 0 ? t.better : t.worse} {t.since(fmt(scan.baseline!.date))}
              </>
            )}
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-line pt-4">
            {(
              [
                [scan.namesFound, t.names],
                [assets.length, t.live],
                [assets.filter((a) => a.hasLoginForm).length, t.logins],
                [assets.filter((a) => a.tlsDaysLeft != null && a.tlsDaysLeft < 30).length, t.certs],
              ] as const
            ).map(([n, label]) => (
              <div key={label}>
                <dd className="tabular text-lg font-semibold leading-7">{n}</dd>
                <dt className="text-xs leading-4 text-muted">{label}</dt>
              </div>
            ))}
          </dl>
        </Card>

        {/* Sections spread evenly when the score card beside it is taller */}
        <Card className="flex flex-col justify-between gap-5">
          <div>
            <CardTitle icon={FileSearch} className="mb-3">
              {t.whatWeFound}
            </CardTitle>
            <p className="text-[15px] leading-6">{scan.brief?.summary[lang] ?? `${t.pending}…`}</p>
          </div>

          <div>
            <div className="mb-3 flex h-2 overflow-hidden rounded-full bg-panel2" aria-hidden>
              {SEVERITIES.map((s) => counts[s] > 0 && <i key={s} className="block h-full" style={{ background: SEV_VAR[s], width: `${(counts[s] / total) * 100}%` }} />)}
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t.bySev}>
              {SEVERITIES.map((s) => (
                <button
                  key={s}
                  onClick={() => filterAssets({ sev: s })}
                  className="inline-flex h-8 items-center gap-2 rounded-md border border-line bg-bg px-3 text-[13px] hover:bg-panel2"
                  title={t.viewAssets}
                >
                  <span className="size-2 rounded-full" style={{ background: SEV_VAR[s] }} aria-hidden />
                  <b className="tabular font-semibold">{counts[s]}</b>
                  <span className="text-muted">{sevName(s, lang)}</span>
                </button>
              ))}
            </div>
          </div>

          {path && (
            <div className="border-t border-line pt-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-medium text-muted">
                <Route className="size-4" strokeWidth={1.75} aria-hidden />
                {t.likelyPath}
              </p>
              <p className="text-[13px] font-semibold leading-5">{path.title[lang]}</p>
              <ol className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] leading-5 text-muted">
                {path.nodes.map((n, i) => (
                  <li key={n.id} className="flex items-center gap-2">
                    {i > 0 && <ArrowRight className="size-3.5 shrink-0" aria-hidden />}
                    <span className={n.id === path.chokePoint.nodeId ? 'font-medium text-ink underline decoration-low decoration-2 underline-offset-4' : ''}>{n.label[lang]}</span>
                  </li>
                ))}
              </ol>
              <button onClick={() => setTab('paths')} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline">
                {t.seePaths}
                <ArrowRight className="size-3.5" aria-hidden />
              </button>
            </div>
          )}
        </Card>
      </div>

      {/* 2. What to do first */}
      {scan.brief?.topFixes.length ? (
        <Card>
          <CardTitle icon={ListOrdered}>{t.fixFirst}</CardTitle>
          <ol className="grid gap-4 md:grid-cols-3">
            {scan.brief.topFixes.map((f, i) => (
              <li key={i} className="flex flex-col gap-2 rounded-md border border-line bg-bg p-4">
                <span className="tabular text-xs font-semibold text-muted">{String(i + 1).padStart(2, '0')}</span>
                <strong className="font-semibold leading-5">{f.title[lang]}</strong>
                <p className="text-[13px] leading-5 text-muted">{f.detail[lang]}</p>
                <p className="mt-auto flex flex-wrap gap-x-3 gap-y-0.5 pt-1 font-mono text-xs leading-5 text-muted">
                  {f.hostnames.map((hn) => (
                    <span key={hn} className="whitespace-nowrap">
                      {hn}
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ol>
        </Card>
      ) : null}

      {/* 3. Module results */}
      <ModuleOverview scan={scan} t={t} onOpen={setTab} />

      {/* 4. Where the surface is */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardTitle icon={Server}>{t.byCat}</CardTitle>
          <Bars rows={CATEGORIES.map((c) => ({ key: c, label: catName(c, lang), n: assets.filter((a) => a.category === c).length }))} onPick={(k) => filterAssets({ cat: k as Category })} />
        </Card>
        <Card>
          <CardTitle icon={Building2}>{t.byHosting}</CardTitle>
          <Bars rows={hosting} />
        </Card>
      </div>
    </div>
  );
}
