'use client';

import { CircleCheck, FileText, Link2Off, Loader2, Lock, Radar } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AssetDrawer } from '@/components/asset-drawer';
import { AttackPaths } from '@/components/v2/attack-paths';
import { DriftTimeline } from '@/components/v2/drift-timeline';
import { Exposures } from '@/components/v2/exposures';
import { ModuleShowcase } from '@/components/v2/module-overview';
import { Overview } from '@/components/v2/overview';
import { ScanBar } from '@/components/v2/scan-form';
import { Callout } from '@/components/ui/callout';
import { Shot } from '@/components/ui/shot';
import { MODULE, PHASE_ICONS } from '@/lib/modules';
import { ScoreGauge } from '@/components/score-gauge';
import { TopBar } from '@/components/top-bar';
import { PortChip, SeverityBadge, SeverityDot } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardTitle, Eyebrow } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { catName, sevName, SEV_VAR, T, tlsLabel, TONE_CLASS, visName } from '@/lib/i18n';
import { SENSITIVE_PORTS } from '@/lib/ports';
import { SEVERITY_RANK } from '@/lib/score';
import { CATEGORIES, SEVERITIES, type AssetDTO, type Category, type Lang, type ScanDTO, type Severity } from '@/lib/types';
import type { ScanListItem } from '@/lib/types';
import { cn } from '@/lib/utils';


const POLL_MS = 1500;

const TABS = ['overview', 'paths', 'assets', 'exposures', 'drift'] as const;
type Tab = (typeof TABS)[number];

export { LangToggle, useLang } from '@/components/lang';
import { LangToggle, useLang } from '@/components/lang';

export function Dashboard({ userEmail, initialScan = null, initialRecent = [] }: { userEmail?: string; initialScan?: ScanDTO | null; initialRecent?: ScanListItem[] }) {
  const [lang, setLang] = useLang();
  const t = T[lang];
  const [domain, setDomain] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [scan, setScan] = useState<ScanDTO | null>(initialScan);
  const [recent, setRecent] = useState<ScanListItem[]>(initialRecent);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sev, setSev] = useState<Severity | 'All'>('All');
  const [cat, setCat] = useState<Category | 'All'>('All');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<AssetDTO | null>(null);
  const [tab, setTabState] = useState<Tab>('overview');
  const [monitorBusy, setMonitorBusy] = useState(false);
  

  // The tab lives in the URL hash so links (e.g. from drift alerts) open the right view.
  useEffect(() => {
    const read = () => {
      const h = window.location.hash.slice(1) as Tab;
      if (TABS.includes(h)) setTabState(h);
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  const setTab = useCallback((next: Tab) => {
    setTabState(next);
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${next}`);
  }, []);
  const logRef = useRef<HTMLPreElement>(null);

  const loadScan = useCallback(async (id: string) => {
    const res = await fetch(`/api/scans/${id}`, { cache: 'no-store' });
    if (res.ok) setScan((await res.json()) as ScanDTO);
  }, []);

  const loadRecent = useCallback(async () => {
    const res = await fetch('/api/scans', { cache: 'no-store' });
    if (!res.ok) return [];
    const { scans } = (await res.json()) as { scans: ScanListItem[] };
    setRecent(scans);
    return scans;
  }, []);



  // Poll while a scan is in flight.
  const running = scan?.status === 'queued' || scan?.status === 'running';
  const scanId = scan?.id;
  useEffect(() => {
    if (!running || !scanId) return;
    const timer = setInterval(() => loadScan(scanId), POLL_MS);
    return () => clearInterval(timer);
  }, [running, scanId, loadScan]);

  // Refresh the scan picker when a scan finishes (the first list arrives with the page).
  const wasRunning = useRef(running);
  useEffect(() => {
    if (wasRunning.current && !running) loadRecent();
    wasRunning.current = running;
  }, [running, loadRecent]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [scan?.log.length]);

  const startScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, authorized }),
      });
      const body = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !body.id) throw new Error(body.error ?? 'Could not start the scan');
      setSelected(null);
      setDomain('');
      setTab('overview');
      setSev('All');
      setCat('All');
      setQ('');
      await loadScan(body.id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const assets = useMemo(
    () =>
      [...(scan?.assets ?? [])].sort(
        (a, b) => (a.severity ? SEVERITY_RANK[a.severity] : 9) - (b.severity ? SEVERITY_RANK[b.severity] : 9) || a.hostname.localeCompare(b.hostname),
      ),
    [scan?.assets],
  );
  const counts = useMemo(() => {
    const c = Object.fromEntries(SEVERITIES.map((s) => [s, 0])) as Record<Severity, number>;
    for (const a of assets) if (a.severity) c[a.severity]++;
    return c;
  }, [assets]);
  const anyShots = assets.some((a) => a.hasScreenshot);
  const rows = assets.filter(
    (a) =>
      (sev === 'All' || a.severity === sev) &&
      (cat === 'All' || a.category === cat) &&
      (!q || `${a.hostname} ${a.title ?? ''} ${a.ips.join(' ')} ${a.provider}`.toLowerCase().includes(q.toLowerCase())),
  );
  const done = scan?.status === 'completed';

  const dateFmt = (iso: string) => new Date(iso).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const th = 'border-b border-line px-3 py-2.5 text-left text-xs font-medium text-muted';
  const takeoverHosts = new Set((scan?.exposures ?? []).filter((e) => e.kind === 'takeover').map((e) => e.hostname));
  const actionableExposures = (scan?.exposures ?? []).filter((e) => e.severity !== 'Info');
  const openHost = (hostname: string) => {
    const a = assets.find((x) => x.hostname === hostname);
    if (a) setSelected(a);
  };
  const filterAssets = (next: { sev?: Severity | 'All'; cat?: Category | 'All' }) => {
    if (next.sev) setSev(next.sev);
    if (next.cat) setCat(next.cat);
    setTab('assets');
  };
  const toggleMonitor = async () => {
    if (!scan) return;
    setMonitorBusy(true);
    try {
      const res = await fetch('/api/monitors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ domain: scan.domain, enabled: !scan.monitored }) });
      if (res.ok) setScan({ ...scan, monitored: !scan.monitored });
    } finally {
      setMonitorBusy(false);
    }
  };
  const tabCount: Record<Tab, number | null> = {
    overview: null,
    paths: scan?.attackPaths.length ?? 0,
    assets: assets.length,
    exposures: actionableExposures.length,
    drift: scan?.driftEvents.filter((e) => e.scanId === scan.id).length ?? 0,
  };
  const tabLabel: Record<Tab, string> = { overview: t.tabOverview, paths: t.tabPaths, assets: t.tabAssets, exposures: t.tabExposures, drift: t.tabDrift };

  return (
    <div>
      <TopBar active="dashboard" email={userEmail}>
        <LangToggle lang={lang} setLang={setLang} />
      </TopBar>
      <ScanBar
        t={t}
        domain={domain}
        setDomain={setDomain}
        authorized={authorized}
        setAuthorized={setAuthorized}
        busy={submitting}
        running={!!running}
        error={error}
        onSubmit={startScan}
        autoFocus={!scan}
      />

      <main className="mx-auto flex max-w-[1360px] flex-col gap-5 px-4 pb-20 pt-6 sm:px-6">
        {!scan && (
          <div className="flex flex-col gap-6 pt-4">
            <Card className="p-6 sm:p-8">
              <Radar className="mb-4 size-8 text-muted" strokeWidth={1.5} aria-hidden />
              <h1 className="text-2xl font-semibold leading-8 tracking-tight">{t.welcomeTitle}</h1>
              <p className="mt-2 text-[15px] leading-6 text-muted">{t.welcomeBody}</p>
              <p className="mt-4 text-[13px] font-medium">{t.welcomeStart}</p>
            </Card>
            <ModuleShowcase t={t} />
          </div>
        )}

        {scan && (
          <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div className="min-w-0">
              <p className="text-[13px] text-muted">{t.tagline}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h1 className="[overflow-wrap:anywhere] text-2xl font-semibold leading-8 tracking-tight">{scan.domain}</h1>
                {recent.length > 1 && (
                  <Select
                    id="recent"
                    aria-label={t.recent}
                    value={scan.id}
                    onValueChange={loadScan}
                    className="h-7 w-auto max-w-[260px] border-transparent bg-panel2 text-xs"
                    options={recent.map((r) => ({ value: r.id, label: r.domain, hint: dateFmt(r.createdAt) }))}
                    renderValue={(o) => <span className="text-muted">{o?.hint}</span>}
                  />
                )}
              </div>
              <p className="mt-1 text-[13px] text-muted">
                {running ? t.scanning : `${t.scanned} ${dateFmt(scan.finishedAt ?? scan.createdAt)} · ${assets.length} ${t.live}`}
              </p>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <button
                type="button"
                role="switch"
                aria-checked={scan.monitored}
                disabled={monitorBusy}
                onClick={toggleMonitor}
                title={t.monitorHint}
                className="inline-flex h-8 shrink-0 items-center gap-2 rounded-md border border-line bg-panel px-3 text-[13px] font-medium hover:bg-panel2 disabled:opacity-50"
              >
                <span className={cn('relative h-4 w-7 rounded-full transition-colors', scan.monitored ? 'bg-primary' : 'bg-line')} aria-hidden>
                  <span className={cn('absolute top-0.5 size-3 rounded-full bg-white transition-[left]', scan.monitored ? 'left-[14px]' : 'left-0.5')} />
                </span>
                {t.monitor}
              </button>
              {done && (
                <Link href={`/report/${scan.id}`} className="inline-flex h-8 shrink-0 items-center gap-2 rounded-md border border-primary bg-primary px-3.5 text-[13px] font-medium text-white hover:brightness-110">
                  <FileText className="size-4" strokeWidth={1.75} />
                  {t.report}
                </Link>
              )}
            </div>
          </header>
        )}

        {scan?.status === 'failed' && (
          <div role="alert" className="rounded-md border border-crit px-4 py-2.5">
            <b className="font-semibold text-crit">{t.failed}:</b> {scan.error}
          </div>
        )}

        {scan && running && (
          <Card>
            <CardTitle icon={Radar}>{t.progress}</CardTitle>
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
              <ul className="flex flex-col gap-2.5">
                {t.phases.map((p, i) => (
                  <li key={p} className={cn('flex items-center gap-3 text-muted', i < scan.phase && 'text-ink', i === scan.phase && 'font-medium text-ink')}>
                    {(() => {
                      if (i < scan.phase) return <CircleCheck className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />;
                      if (i === scan.phase) return <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />;
                      const Icon = PHASE_ICONS[i];
                      return <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />;
                    })()}
                    {p}
                  </li>
                ))}
              </ul>
              <pre ref={logRef} aria-live="polite" className="h-[190px] overflow-auto whitespace-pre-wrap rounded-md border border-line bg-bg px-3.5 py-3 font-mono text-xs leading-relaxed text-muted">
                {scan.log.join('\n')}
              </pre>
            </div>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-panel2">
              <div className="h-full bg-primary transition-[width]" style={{ width: `${Math.round((scan.phase / t.phases.length) * 100)}%` }} />
            </div>
            <p className="mt-3 text-[13px] text-muted">{t.resultsSoon}</p>
          </Card>
        )}

        {scan && done && (scan.source === 'dns-fallback' || scan.triagedBy !== 'llm') && (
          <Callout tone="info">
            {scan.source === 'dns-fallback' && <p>{t.fallbackNote}</p>}
            {scan.triagedBy !== 'llm' && <p>{t.heuristicNote}</p>}
          </Callout>
        )}

        {scan && !running && (
          <nav className="-mb-1 flex gap-1 overflow-x-auto border-b border-line" role="tablist" aria-label={scan.domain}>
            {TABS.map((id) => (
              <button
                key={id}
                role="tab"
                id={`tab-${id}`}
                aria-selected={tab === id}
                aria-controls={`panel-${id}`}
                onClick={() => setTab(id)}
                className={cn(
                  '-mb-px flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-sm text-muted hover:text-ink',
                  tab === id ? 'border-primary font-medium text-ink' : 'border-transparent',
                )}
              >
                {(() => {
                  const Icon = MODULE[id].icon;
                  return <Icon className="size-4" strokeWidth={1.75} aria-hidden />;
                })()}
                {tabLabel[id]}
                {tabCount[id] != null && tabCount[id]! > 0 && <span className="tabular rounded-sm bg-panel2 px-1.5 text-xs font-medium text-muted">{tabCount[id]}</span>}
              </button>
            ))}
          </nav>
        )}

        {scan && !running && tab === 'paths' && (
          <section role="tabpanel" id="panel-paths" aria-labelledby="tab-paths">
            <AttackPaths paths={scan.attackPaths} lang={lang} t={t} onHost={openHost} />
          </section>
        )}
        {scan && !running && tab === 'exposures' && (
          <section role="tabpanel" id="panel-exposures" aria-labelledby="tab-exposures">
            <Exposures exposures={scan.exposures} email={scan.emailSecurity} lang={lang} t={t} />
          </section>
        )}
        {scan && !running && tab === 'drift' && (
          <section role="tabpanel" id="panel-drift" aria-labelledby="tab-drift">
            <DriftTimeline events={scan.driftEvents} baselineScanId={scan.baselineScanId} lang={lang} t={t} />
          </section>
        )}

        {scan && !running && tab === 'overview' && (
          <section role="tabpanel" id="panel-overview" aria-labelledby="tab-overview">
            <Overview scan={scan} assets={assets} counts={counts} lang={lang} t={t} setTab={setTab} filterAssets={filterAssets} />
          </section>
        )}

        {scan && !running && tab === 'assets' && (
          <section role="tabpanel" id="panel-assets" aria-labelledby="tab-assets">
            <Card className="p-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 pb-4 pt-5">
                <h2 className="mr-auto flex items-center gap-2 text-sm font-semibold leading-5">
                  <MODULE.assets.icon className="size-4 text-muted" aria-hidden />
                  {t.assets} <span className="tabular ml-1 font-normal text-muted">{rows.length === assets.length ? assets.length : `${rows.length} / ${assets.length}`}</span>
                </h2>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label={t.cSev}>
                  {(['All', ...SEVERITIES] as const).map((s) => (
                    <button
                      key={s}
                      aria-pressed={sev === s}
                      onClick={() => setSev(s)}
                      className={cn('h-8 rounded-md border border-line px-3 text-[13px] text-muted hover:bg-panel2', sev === s && 'bg-panel2 font-medium text-ink')}
                      style={sev === s ? { borderColor: s === 'All' ? 'var(--color-primary)' : SEV_VAR[s] } : undefined}
                    >
                      {s === 'All' ? t.all : sevName(s, lang)}
                    </button>
                  ))}
                </div>
                <Select
                  id="cat"
                  aria-label={t.cCat}
                  value={cat}
                  onValueChange={(v) => setCat(v as Category | 'All')}
                  className="w-full sm:w-[220px]"
                  options={[
                    { value: 'All', label: t.allCats, hint: assets.length },
                    ...CATEGORIES.map((c) => ({ value: c, label: catName(c, lang), hint: assets.filter((a) => a.category === c).length })),
                  ]}
                />
                <input id="q" type="search" aria-label={t.search} placeholder={t.search} value={q} onChange={(e) => setQ(e.target.value)} className="field sm:w-[220px]" />
              </div>

              <div className="overflow-x-auto border-t border-line">
                {/* The screenshot column only appears when this scan captured any */}
                <table className="w-full min-w-[960px] border-collapse">
                  <thead>
                    <tr>
                      <th className={cn(th, 'w-[104px] pl-5')}>{t.cSev}</th>
                      {anyShots && (
                        <th className={cn(th, 'w-[92px]')}>
                          <span className="sr-only">{t.screenshot}</span>
                        </th>
                      )}
                      <th className={th}>{t.cHost}</th>
                      <th className={th}>{t.cCat}</th>
                      <th className={cn(th, 'w-[64px]')}>{t.cHttp}</th>
                      <th className={th}>{t.cProv}</th>
                      <th className={th}>{t.cTls}</th>
                      <th className={cn(th, 'pr-5')}>{t.cPorts}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((a) => {
                      const tls = tlsLabel(a.tlsDaysLeft, t);
                      return (
                        <tr
                          key={a.id}
                          tabIndex={0}
                          onClick={() => setSelected(a)}
                          onKeyDown={(e) => e.key === 'Enter' && setSelected(a)}
                          className="cursor-pointer align-top hover:bg-panel2 focus-visible:bg-panel2 focus-visible:outline-offset-[-2px] [&:last-child>td]:border-b-0 [&>td]:border-b [&>td]:border-line [&>td]:px-3 [&>td]:py-3"
                        >
                          <td className="!pl-5">{a.severity ? <SeverityBadge severity={a.severity} label={sevName(a.severity, lang)} /> : <span className="text-muted">{t.pending}</span>}</td>
                          {anyShots && <td>{a.hasScreenshot && <Shot assetId={a.id} className="h-[50px] w-20" />}</td>}
                          <td>
                            <div className="flex flex-wrap items-center gap-2 font-mono text-[13px] font-medium leading-5">
                              {a.hostname}
                              {takeoverHosts.has(a.hostname) && (
                                <span className="inline-flex items-center gap-1 rounded-sm border border-crit px-1.5 font-sans text-[11px] font-medium text-crit">
                                  <Link2Off className="size-3" aria-hidden />
                                  {t.takeoverBadge}
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 flex max-w-[360px] items-center gap-1.5 text-xs leading-4 text-muted">
                              {a.hasLoginForm && <Lock className="size-3 shrink-0" aria-label={t.login} />}
                              <span className="truncate">{a.title ?? '—'}</span>
                            </div>
                            {a.visualClass && a.visualClass !== 'Public Marketing Website' && a.visualClass !== 'Other / Unclear' && (
                              <div className="mt-1 text-xs font-medium text-accent">
                                {visName(a.visualClass, lang)}
                                {a.visualProduct ? ` · ${a.visualProduct}` : ''}
                              </div>
                            )}
                          </td>
                          <td className="text-[13px] leading-5">{a.category ? catName(a.category, lang) : '—'}</td>
                          <td className="tabular font-mono text-[13px] leading-5">{a.httpStatus ?? <span className="text-muted">—</span>}</td>
                          <td>
                            <div className="text-[13px] leading-5">{a.provider}</div>
                            <div className="tabular mt-0.5 font-mono text-xs leading-4 text-muted">{a.ips[0]}</div>
                          </td>
                          <td className={cn('tabular whitespace-nowrap text-[13px] leading-5', TONE_CLASS[tls.tone])}>{tls.text}</td>
                          <td className="!pr-5">
                            <div className="flex flex-wrap gap-1">
                              {a.ports.map((p) => (
                                <PortChip key={p} port={p} risky={p in SENSITIVE_PORTS} />
                              ))}
                            </div>
                            {a.cves.length > 0 && <div className="tabular mt-1 text-xs font-medium text-crit">{a.cves.length} CVE</div>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {rows.length === 0 && <p className="border-t border-line py-10 text-center text-muted">{running ? t.scanning : t.none}</p>}
            </Card>
          </section>
        )}
      </main>

      {selected && <AssetDrawer asset={selected} lang={lang} t={t} onClose={() => setSelected(null)} />}
    </div>
  );
}
