'use client';

import { BellRing, Bot, Check, Copy, Gauge, GitBranch, KeyRound, Loader2, Plug, Radar, ServerCog, ShieldCheck, Sparkles, Trash2, UserCheck, UserPlus, UserX, Users as UsersIcon, Webhook, type LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { PasswordForm } from '@/components/password-form';
import { TopBar } from '@/components/top-bar';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import type { UsageSummary } from '@/lib/ai/usage';
import { cn } from '@/lib/utils';

interface SettingView {
  key: string;
  secret: boolean;
  source: 'database' | 'env' | 'none';
  display: string | null;
}
interface UserRow {
  id: string;
  email: string;
  role: string;
  maxHosts: number | null;
  disabled: boolean;
  scans: number;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const SOURCE_LABEL = { database: 'Saved here', env: 'From environment variable', none: 'Not set' } as const;
const SERVICE_ICON: Record<string, LucideIcon> = {
  OPENAI_API_KEY: Bot,
  ANTHROPIC_API_KEY: Sparkles,
  SHODAN_API_KEY: Radar,
  OTX_API_KEY: Radar,
  GITHUB_TOKEN: GitBranch,
  ALERT_WEBHOOK_URL: Webhook,
};

const SECRETS = [
  { key: 'OPENAI_API_KEY', label: 'OpenAI API key', help: 'Primary model for triage and the executive brief.' },
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API key', help: 'Used when no OpenAI key is set, or when the provider is Anthropic.' },
  { key: 'SHODAN_API_KEY', label: 'Shodan API key', help: 'Optional. Without it the free InternetDB is used for ports and CVEs.' },
  { key: 'OTX_API_KEY', label: 'AlienVault OTX key', help: 'Optional. Adds passive-DNS subdomains from OTX threat intelligence. Free key at otx.alienvault.com.' },
  { key: 'GITHUB_TOKEN', label: 'GitHub token', help: 'Enables the public code check. A fine-grained token with no repository access is enough for code search.' },
  { key: 'ALERT_WEBHOOK_URL', label: 'Alert webhook URL', help: 'HTTPS endpoint that receives high-severity drift as JSON. Slack and Teams incoming webhooks work as-is.' },
] as const;

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body;
}

const TABS = [
  { id: 'services', label: 'Services', icon: ServerCog },
  { id: 'usage', label: 'AI usage', icon: Gauge },
  { id: 'sources', label: 'Data sources', icon: Plug },
  { id: 'access', label: 'Users & access', icon: UsersIcon },
] as const;
type TabId = (typeof TABS)[number]['id'];

/** One bordered panel: a mono label, an optional description, then ruled content that runs edge to edge. */
function Section({ title, icon: Icon, desc, aside, children, className }: { title: string; icon: LucideIcon; desc?: string; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('flex min-w-0 flex-col border border-line bg-panel', className)}>
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2.5 lbl">
            <Icon className="size-3.5 shrink-0 text-ink" strokeWidth={1.75} aria-hidden />
            {title}
          </h2>
          {desc && <p className="mt-1.5 text-[13px] leading-5 text-muted">{desc}</p>}
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
}

/** Column header row used by every table-like list so labels share one style. */
const TH = 'lbl';

export function AdminPanel({ email }: { email: string }) {
  const [tab, setTab] = useState<TabId>('services');
  const [defaultHosts, setDefaultHosts] = useState(50);
  useEffect(() => {
    api<{ settings: SettingView[] }>('/api/admin/settings')
      .then((r) => setDefaultHosts(Number(r.settings.find((x) => x.key === 'MAX_HOSTS')?.display) || 50))
      .catch(() => {});
  }, [tab]);
  return (
    <div>
      <TopBar active="admin" email={email} isAdmin />
      <main className="mx-auto flex max-w-[1360px] flex-col gap-5 px-4 pb-20 pt-8 sm:px-6">
        <div>
          <p className={TH}>Craton EASM</p>
          <h1 className="mt-1.5 text-2xl font-semibold leading-8 tracking-tight">Administration</h1>
          <p className="mt-0.5 text-muted">Backend services, AI spend, data sources and operator access.</p>
        </div>

        <nav className="-mb-1 flex gap-1 overflow-x-auto border-b border-line" role="tablist" aria-label="Administration">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              id={`admin-tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`admin-panel-${id}`}
              onClick={() => setTab(id)}
              className={cn('-mb-px flex h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-sm text-muted hover:text-ink', tab === id ? 'border-primary font-medium text-ink' : 'border-transparent')}
            >
              <Icon className="size-4" strokeWidth={1.75} aria-hidden />
              {label}
            </button>
          ))}
        </nav>

        {/* Panels stay mounted so a half-typed key or a loaded list survives a tab switch. */}
        <div role="tabpanel" id="admin-panel-services" aria-labelledby="admin-tab-services" hidden={tab !== 'services'}>
          <ServiceSettings />
        </div>
        <div role="tabpanel" id="admin-panel-usage" aria-labelledby="admin-tab-usage" hidden={tab !== 'usage'}>
          <UsageSummaryCard />
        </div>
        <div role="tabpanel" id="admin-panel-sources" aria-labelledby="admin-tab-sources" hidden={tab !== 'sources'}>
          <DataSources />
        </div>
        <div role="tabpanel" id="admin-panel-access" aria-labelledby="admin-tab-access" hidden={tab !== 'access'} className="grid items-start gap-5">
          <Users defaultHosts={defaultHosts} />
          <div className="grid items-start gap-5 lg:grid-cols-2">
            <Section title="Your password" icon={KeyRound} desc="Use at least 12 characters. You stay signed in on this device.">
              <div className="p-5">
                <PasswordForm className="max-w-none" />
              </div>
            </Section>
            <Section title="What each role can do" icon={ShieldCheck} desc="Roles are checked on the server for every request, not just hidden in the menu.">
              <dl className="divide-y divide-line">
                {[
                  { t: 'Super admin', d: ['Opens this page and manages users, limits and API keys', 'Sees every scan, including ones from customers', 'Scans any domain with no per-user limit applied'] },
                  { t: 'Customer', d: ['Scans their own domains, up to their host limit', 'Sees only their own scans, reports and monitors', 'Cannot open Administration or see other accounts'] },
                ].map((r) => (
                  <div key={r.t} className="px-5 py-4">
                    <dt className="text-[13px] font-medium">{r.t}</dt>
                    <dd>
                      <ul className="mt-1.5 flex flex-col gap-1 text-[13px] leading-5 text-muted">
                        {r.d.map((x) => (
                          <li key={x} className="flex gap-2">
                            <Check className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                            {x}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ))}
              </dl>
            </Section>
          </div>
        </div>
      </main>
    </div>
  );
}

function ServiceSettings() {
  const [settings, setSettings] = useState<SettingView[] | null>(null);
  const [provider, setProvider] = useState('');
  const [model, setModel] = useState('');
  const [maxHosts, setMaxHosts] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [modelSource, setModelSource] = useState<'live' | 'fallback' | null>(null);
  const [customModel, setCustomModel] = useState(false);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<'save' | 'test' | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  const apply = useCallback((list: SettingView[]) => {
    setSettings(list);
    const get = (k: string) => list.find((s) => s.key === k);
    setProvider(get('AI_PROVIDER')?.display ?? '');
    setModel(get('TRIAGE_MODEL')?.display ?? '');
    setMaxHosts(get('MAX_HOSTS')?.display ?? '');
    setKeys({});
  }, []);

  useEffect(() => {
    api<{ settings: SettingView[] }>('/api/admin/settings')
      .then((r) => apply(r.settings))
      .catch((e: Error) => setNote({ ok: false, text: e.message }));
  }, [apply]);

  useEffect(() => {
    let live = true;
    const q = provider ? `?provider=${provider}` : '';
    api<{ models: string[]; source: 'live' | 'fallback' }>(`/api/admin/models${q}`)
      .then((r) => {
        if (!live) return;
        setModels(r.models);
        setModelSource(r.source);
      })
      .catch(() => live && setModelSource(null));
    return () => {
      live = false;
    };
  }, [provider]);

  const save = async (values: Record<string, string | null>, done = 'Settings saved.') => {
    setBusy('save');
    setNote(null);
    try {
      const r = await api<{ settings: SettingView[] }>('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ values }) });
      apply(r.settings);
      setNote({ ok: true, text: done });
    } catch (e) {
      setNote({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only send keys the admin typed; untouched secrets stay as they are.
    const values: Record<string, string | null> = { AI_PROVIDER: provider || null, TRIAGE_MODEL: model || null, MAX_HOSTS: maxHosts.trim() || null };
    for (const [k, v] of Object.entries(keys)) if (v.trim()) values[k] = v.trim();
    save(values);
  };

  const testWebhook = async () => {
    setBusy('test');
    setNote(null);
    try {
      const r = await api<{ ok: boolean; message: string }>('/api/admin/settings/test-webhook', { method: 'POST' });
      setNote({ ok: r.ok, text: r.message });
    } catch (e) {
      setNote({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const test = async () => {
    setBusy('test');
    setNote(null);
    try {
      const r = await api<{ ok: boolean; message: string }>('/api/admin/settings/test', { method: 'POST' });
      setNote({ ok: r.ok, text: r.message });
    } catch (e) {
      setNote({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  };

  const bySecret = (k: string) => settings?.find((s) => s.key === k);

  return (
    <Section title="AI, data and alert services" icon={ServerCog} desc="Keys are encrypted before they are stored and are never sent back to the browser. A key saved here overrides the matching environment variable.">
      {!settings ? (
        <p className="px-5 py-8 text-muted">{note ? note.text : 'Loading…'}</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col">
          <div className="grid gap-x-5 gap-y-4 border-b border-line px-5 py-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <label htmlFor="provider" className="label">AI provider</label>
              <Select
                id="provider"
                value={provider || 'auto'}
                onValueChange={(v) => setProvider(v === 'auto' ? '' : v)}
                className="w-full"
                options={[
                  { value: 'auto', label: 'Automatic', hint: 'OpenAI first, then Anthropic' },
                  { value: 'openai', label: 'OpenAI' },
                  { value: 'anthropic', label: 'Anthropic' },
                ]}
                renderValue={(o) => (o?.hint ? <>{o.label} <span className="text-muted">· {o.hint}</span></> : o?.label)}
              />
              <p className="hint mt-1.5">Runs triage, the executive brief, attack paths and exploit analysis.</p>
            </div>
            <div>
              <label htmlFor="model" className="label">Model</label>
              {customModel ? (
                <input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="gpt-5-mini / claude-haiku-5-5"
                  spellCheck={false}
                  className="field !h-9 font-mono"
                  autoFocus
                />
              ) : (
                <Select
                  id="model"
                  value={model || 'default'}
                  onValueChange={(v) => setModel(v === 'default' ? '' : v)}
                  className="w-full font-mono"
                  options={[
                    { value: 'default', label: 'Default', hint: 'recommended' },
                    ...(model && !models.includes(model) ? [{ value: model, label: model }] : []),
                    ...models.map((m) => ({ value: m, label: m })),
                  ]}
                  renderValue={(o) => (o?.value === 'default' ? <>Default <span className="text-muted">· recommended</span></> : o?.label)}
                />
              )}
              <p className="hint mt-1.5 flex items-center justify-between gap-3">
                <span>{modelSource === 'live' ? 'Live list from your API key' : modelSource === 'fallback' ? 'Common models. Add a key for the live list.' : 'Model used for AI calls.'}</span>
                <button type="button" className="shrink-0 text-ink underline underline-offset-4 hover:no-underline" onClick={() => setCustomModel((v) => !v)}>
                  {customModel ? 'Pick from list' : 'Custom ID'}
                </button>
              </p>
            </div>
            <div>
              <label htmlFor="max-hosts" className="label">Hosts per scan</label>
              <input id="max-hosts" type="number" inputMode="numeric" min={10} max={500} value={maxHosts} onChange={(e) => setMaxHosts(e.target.value)} placeholder="50" className="field tabular !h-9" />
              <p className="hint mt-1.5">Default for everyone, 10 to 500. A user&apos;s own limit overrides it. More hosts take longer and cost more.</p>
            </div>
          </div>

          <div className="hidden grid-cols-[minmax(0,5fr)_minmax(0,6fr)_92px] gap-x-5 border-b border-line px-5 py-2.5 sm:grid">
            <span className={TH}>Service</span>
            <span className={TH}>Credential</span>
            <span aria-hidden />
          </div>
          <div className="flex flex-col divide-y divide-line">
            {SECRETS.map(({ key, label, help }) => {
              const s = bySecret(key);
              const Icon = SERVICE_ICON[key];
              return (
                <div key={key} className="grid items-start gap-x-5 gap-y-2.5 px-5 py-3.5 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_92px]">
                  <div className="flex min-w-0 gap-3">
                    <Icon className="mt-0.5 size-4 shrink-0 text-muted" strokeWidth={1.75} aria-hidden />
                    <div className="min-w-0">
                      <label htmlFor={key} className="block text-[13px] font-medium leading-5">{label}</label>
                      <p className="hint mt-0.5 leading-5">{help}</p>
                    </div>
                  </div>
                  <div className="flex min-w-0 items-start gap-2 sm:contents">
                  <div className="min-w-0 flex-1">
                    <input
                      id={key}
                      type="password"
                      autoComplete="off"
                      value={keys[key] ?? ''}
                      onChange={(e) => setKeys({ ...keys, [key]: e.target.value })}
                      placeholder={s?.display ? `${s.display}  ·  paste to replace` : key === 'ALERT_WEBHOOK_URL' ? 'https://hooks.slack.com/services/…' : 'Paste key'}
                      spellCheck={false}
                      className="field !h-9 font-mono"
                    />
                    <p className="hint mt-1.5 flex items-center gap-1.5">
                      <span className={cn('size-1.5', s?.source === 'none' ? 'bg-line' : 'bg-ok')} aria-hidden />
                      {SOURCE_LABEL[s?.source ?? 'none']}
                    </p>
                  </div>
                  <Button type="button" variant="outline" className="h-9 w-9 shrink-0 px-0 sm:w-full sm:px-3" aria-label={`Remove ${label}`} disabled={s?.source !== 'database' || busy !== null} onClick={() => save({ [key]: null }, `${label} removed.`)}>
                    <Trash2 />
                    <span className="hidden sm:inline">Remove</span>
                  </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 border-t border-line px-5 py-4">
            <Button type="submit" className="h-9" disabled={busy !== null}>
              {busy === 'save' && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
            <Button type="button" variant="outline" className="h-9" disabled={busy !== null} onClick={test}>
              {busy === 'test' ? <Loader2 className="animate-spin" /> : <Plug />}
              Test AI connection
            </Button>
            <Button type="button" variant="outline" className="h-9" disabled={busy !== null || bySecret('ALERT_WEBHOOK_URL')?.source === 'none'} onClick={testWebhook}>
              <BellRing />
              Send test alert
            </Button>
            {note && <span role="status" className={cn('text-[13px]', note.ok ? 'text-ok' : 'text-crit')}>{note.text}</span>}
          </div>
        </form>
      )}
    </Section>
  );
}

type Created = { email: string; password: string; reset?: boolean };

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Super admin', hint: 'Full access' },
  { value: 'user', label: 'Customer', hint: 'Own scans only' },
];

function Users({ defaultHosts }: { defaultHosts: number }) {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [me, setMe] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [hosts, setHosts] = useState('');
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    api<{ users: UserRow[]; me: string }>('/api/admin/users')
      .then((r) => {
        setUsers(r.users);
        setMe(r.me);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const hostsValue = (v: string) => (v.trim() === '' ? null : Number(v));

  const call = async (key: string, url: string, init: RequestInit) => {
    setBusy(key);
    setError(null);
    try {
      const r = await api<{ users: UserRow[]; created?: Created }>(url, init);
      setUsers(r.users);
      setCreated(r.created ?? null);
      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setBusy(null);
    }
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await call('add', '/api/admin/users', { method: 'POST', body: JSON.stringify({ email, role, maxHosts: hostsValue(hosts) }) })) {
      setEmail('');
      setHosts('');
    }
  };

  const patch = (id: string, change: Record<string, unknown>, key = id) => call(key, '/api/admin/users', { method: 'PATCH', body: JSON.stringify({ id, ...change }) });

  const remove = async (id: string) => {
    setConfirmDelete(null);
    await call(id, `/api/admin/users?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
  };

  const copy = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const date = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never');
  const admins = users.filter((u) => u.role === 'admin').length;

  return (
    <Section
      title={`Users · ${users.length}`}
      icon={UsersIcon}
      desc="Super admins manage the site and see every scan. Customers sign in to scan their own domains and see only their own results. A host limit overrides the default for that person."
      aside={<span className="tabular text-xs text-muted">{admins} super admin{admins === 1 ? '' : 's'} · {users.length - admins} customer{users.length - admins === 1 ? '' : 's'}</span>}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] table-fixed lg:min-w-[820px] border-collapse">
          <colgroup>
            <col />
            <col className="w-[150px]" />
            <col className="w-[110px]" />
            <col className="w-[130px]" />
            <col className="hidden w-[150px] lg:table-column" />
            <col className="w-[96px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-line">
              {['Email', 'Role', 'Host limit', 'Status', 'Last sign-in', ''].map((h, i) => (
                <th key={i} className={cn(TH, 'px-3 py-2.5 text-left first:pl-5 last:pr-5', i === 4 && 'hidden lg:table-cell', i === 5 && 'text-right')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const self = u.id === me;
              const working = busy === u.id;
              return (
                <tr key={u.id} className={cn('border-b border-line [&>td]:h-14 [&>td]:px-3 [&>td:first-child]:pl-5 [&>td:last-child]:pr-5', u.disabled && 'opacity-60')}>
                  <td className="min-w-0">
                    <p className="truncate font-mono text-[13px]">{u.email}{self && <span className="ml-2 font-sans text-xs text-muted">(you)</span>}</p>
                    <p className="tabular text-xs text-muted">{u.scans} scan{u.scans === 1 ? '' : 's'}</p>
                  </td>
                  <td>
                    <Select
                      aria-label={`Role for ${u.email}`}
                      value={u.role}
                      disabled={self || working}
                      onValueChange={(v) => patch(u.id, { role: v })}
                      className="w-full"
                      options={ROLE_OPTIONS.map(({ value, label }) => ({ value, label }))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={10}
                      max={500}
                      key={`${u.id}:${u.maxHosts ?? ''}`}
                      defaultValue={u.maxHosts ?? ''}
                      placeholder={String(defaultHosts)}
                      aria-label={`Host limit for ${u.email}`}
                      className="field tabular !h-9 w-full"
                      onBlur={(e) => {
                        const next = hostsValue(e.target.value);
                        if (next !== u.maxHosts) patch(u.id, { maxHosts: next });
                      }}
                    />
                  </td>
                  <td className="text-[13px]">
                    <span className="inline-flex items-center gap-2">
                      <span className={cn('size-1.5 shrink-0', u.disabled ? 'bg-crit' : u.mustChangePassword ? 'bg-med' : 'bg-ok')} aria-hidden />
                      {u.disabled ? 'Disabled' : u.mustChangePassword ? 'Password pending' : 'Active'}
                    </span>
                  </td>
                  <td className="tabular hidden text-[13px] text-muted lg:table-cell">{date(u.lastLoginAt)}</td>
                  <td className="text-right">
                    {working ? (
                      <Loader2 className="ml-auto size-4 animate-spin text-muted" aria-label="Saving" />
                    ) : confirmDelete === u.id ? (
                      <span className="inline-flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => remove(u.id)} aria-label={`Confirm removing ${u.email}`}>Remove</Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>No</Button>
                      </span>
                    ) : (
                      <span className="inline-flex gap-0.5">
                        <Button variant="ghost" size="sm" onClick={() => patch(u.id, { resetPassword: true })} title="Issue a new one-time password" aria-label={`Reset password for ${u.email}`}>
                          <KeyRound />
                        </Button>
                        {!self && (
                          <Button variant="ghost" size="sm" onClick={() => patch(u.id, { disabled: !u.disabled })} title={u.disabled ? 'Enable account' : 'Disable account'} aria-label={`${u.disabled ? 'Enable' : 'Disable'} ${u.email}`}>
                            {u.disabled ? <UserCheck /> : <UserX />}
                          </Button>
                        )}
                        {!self && (
                          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(u.id)} aria-label={`Remove ${u.email}`}>
                            <Trash2 />
                          </Button>
                        )}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <form onSubmit={add} className="flex flex-col gap-3 p-5">
        <p className="label !mb-0">Add user</p>
        <div className="grid gap-2.5 sm:grid-cols-[minmax(0,1fr)_170px_130px_auto]">
          <input id="new-user" type="email" required aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.co.id" className="field !h-9 min-w-0" />
          <Select aria-label="Role" value={role} onValueChange={setRole} className="w-full" options={ROLE_OPTIONS.map(({ value, label }) => ({ value, label }))} />
          <input type="number" inputMode="numeric" min={10} max={500} aria-label="Host limit" value={hosts} onChange={(e) => setHosts(e.target.value)} placeholder={`Limit ${defaultHosts}`} className="field tabular !h-9" />
          <Button type="submit" variant="outline" className="h-9" disabled={busy === 'add'}>
            {busy === 'add' ? <Loader2 className="animate-spin" /> : <UserPlus />}
            Create
          </Button>
        </div>
        <p className="hint">A one-time password is shown once. They must change it at first sign-in. Leave the host limit empty to use the default ({defaultHosts}).</p>
        {error && <p role="alert" className="text-[13px] text-crit">{error}</p>}
        {created && (
          <div role="status" className="border border-ok bg-bg p-3">
            <p className="text-[13px] leading-5">
              {created.reset ? 'New one-time password' : 'One-time password'} for <b>{created.email}</b>. Pass it on through a private channel.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="border border-line bg-panel px-2 py-1 font-mono text-[13px]">{created.password}</code>
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <Check /> : <Copy />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Section>
  );
}

const fmtUsd = (n: number) => (n < 0.01 && n > 0 ? '<$0.01' : `$${n.toFixed(n < 10 ? 2 : n < 1000 ? 2 : 0)}`);
const fmtInt = (n: number) => n.toLocaleString('en-US');
const fmtTok = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

const OP_LABEL: Record<string, string> = {
  triage: 'Asset triage',
  brief: 'Executive brief',
  'attack-paths': 'Attack paths',
  exploit: 'Exploit analysis',
};

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-panel p-5">
      <p className={TH}>{label}</p>
      <p className="tabular mt-2 text-[28px] font-semibold leading-none tracking-tight">{value}</p>
      {sub && <p className="mt-2 text-xs text-muted">{sub}</p>}
    </div>
  );
}

/** Same column widths on both breakdown tables so their numbers line up side by side. */
function Breakdown({ title, head, rows }: { title: string; head: [string, string, string]; rows: { key: string; name: React.ReactNode; calls: number; extra?: string; cost: number }[] }) {
  return (
    <div className="min-w-0">
      <p className={cn(TH, 'mb-2')}>{title}</p>
      <table className="w-full table-fixed border-collapse text-[13px]">
        <colgroup>
          <col />
          <col className="w-[64px]" />
          <col className="w-[104px]" />
          <col className="w-[72px]" />
        </colgroup>
        <thead>
          <tr className="border-b border-line text-muted">
            <th className="py-2 text-left text-xs font-normal">{head[0]}</th>
            <th className="py-2 text-right text-xs font-normal">Calls</th>
            <th className="py-2 text-right text-xs font-normal">{head[1]}</th>
            <th className="py-2 text-right text-xs font-normal">{head[2]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-b border-line last:border-b-0">
              <td className="truncate py-2.5 pr-3">{r.name}</td>
              <td className="tabular py-2.5 text-right text-muted">{fmtInt(r.calls)}</td>
              <td className="tabular py-2.5 text-right font-mono text-xs text-muted">{r.extra ?? ''}</td>
              <td className="tabular py-2.5 text-right font-medium">{fmtUsd(r.cost)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsageSummaryCard() {
  const [u, setU] = useState<UsageSummary | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<{ summary: UsageSummary }>('/api/admin/usage')
      .then((r) => setU(r.summary))
      .catch((e: Error) => setErr(e.message));
  }, []);

  const maxDay = u ? Math.max(0.0001, ...u.daily.map((d) => d.costUsd)) : 1;
  const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <Section title="AI usage and cost" icon={Gauge} desc="Token counts are exact, as reported by the provider. Costs are estimated from built-in list prices and may differ from your invoice.">
      {err && <p className="px-5 py-6 text-[13px] text-crit">{err}</p>}
      {!u && !err && <p className="px-5 py-8 text-muted">Loading…</p>}
      {u && u.totals.calls === 0 && <p className="px-5 py-8 text-[13px] text-muted">No AI calls recorded yet. Run a scan or an exploit analysis to see usage here.</p>}
      {u && u.totals.calls > 0 && (
        <>
          <div className="grid gap-px border-b border-line bg-line sm:grid-cols-3">
            <Stat label="Est. cost, all time" value={fmtUsd(u.totals.costUsd)} sub={`${fmtInt(u.totals.calls)} calls`} />
            <Stat label="Today" value={fmtUsd(u.today.costUsd)} sub={`${fmtInt(u.today.calls)} calls`} />
            <Stat label="Last 30 days" value={fmtUsd(u.last30d.costUsd)} sub={`${fmtInt(u.last30d.calls)} calls`} />
          </div>

          {u.daily.length > 1 && (
            <div className="border-b border-line p-5">
              <div className="mb-3 flex items-baseline justify-between gap-4">
                <p className={TH}>Daily cost · last 30 days</p>
                <p className="tabular text-xs text-muted">Peak {fmtUsd(maxDay)}</p>
              </div>
              <div className="flex h-24 items-end gap-1 border-b border-line" role="img" aria-label="Daily AI cost for the last 30 days">
                {u.daily.map((d) => (
                  <div key={d.date} className="flex-1" title={`${d.date}: ${fmtUsd(d.costUsd)} · ${d.calls} calls`}>
                    <div className="w-full bg-ink/80 transition-colors hover:bg-ink" style={{ height: `${Math.max(2, (d.costUsd / maxDay) * 96)}px` }} />
                  </div>
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-muted">
                <span>{shortDate(u.daily[0].date)}</span>
                <span>{shortDate(u.daily[u.daily.length - 1].date)}</span>
              </div>
            </div>
          )}

          <div className="grid gap-x-10 gap-y-8 p-5 lg:grid-cols-2">
            <Breakdown
              title="By operation"
              head={['Operation', 'Tokens in / out', 'Cost']}
              rows={u.byOperation.map((o) => ({ key: o.operation, name: OP_LABEL[o.operation] ?? o.operation, calls: o.calls, extra: `${fmtTok(o.inputTokens)} / ${fmtTok(o.outputTokens)}`, cost: o.costUsd }))}
            />
            <Breakdown
              title="By model"
              head={['Model', 'Provider', 'Cost']}
              rows={u.byModel.map((m) => ({ key: `${m.provider}/${m.model}`, name: <span className="font-mono text-xs">{m.model}</span>, calls: m.calls, extra: m.provider, cost: m.costUsd }))}
            />
          </div>
        </>
      )}
    </Section>
  );
}

const DATA_SOURCES = [
  { name: 'crt.sh', provides: 'Certificate Transparency subdomains', key: 'No key' },
  { name: 'Cert Spotter (SSLMate)', provides: 'Second CT source, often broader', key: 'No key' },
  { name: 'HackerTarget', provides: 'Passive DNS host records', key: 'No key · ~free daily quota' },
  { name: 'Wayback Machine', provides: 'Historical hosts from the web archive', key: 'No key' },
  { name: 'Anubis (jldc.me)', provides: 'Aggregated subdomain database', key: 'No key' },
  { name: 'Shodan InternetDB', provides: 'Open ports & CVEs per IP', key: 'Optional Shodan key for the full API' },
  { name: 'Shodan CVEDB', provides: 'CVE severity, KEV & EPSS', key: 'No key' },
  { name: 'AlienVault OTX', provides: 'Passive-DNS subdomains (threat intel)', key: 'Optional free key' },
  { name: 'GitHub code search', provides: 'Leaked secrets & references in public code', key: 'Optional GitHub token' },
];

function DataSources() {
  return (
    <Section title="Passive data sources" icon={Plug} desc="Every scan reads these public OSINT sources. All are passive: Craton never touches the target directly.">
      <div className="hidden grid-cols-[minmax(0,5fr)_minmax(0,6fr)_minmax(0,5fr)] gap-x-5 border-b border-line px-5 py-2.5 sm:grid">
        <span className={TH}>Source</span>
        <span className={TH}>Provides</span>
        <span className={cn(TH, 'text-right')}>Access</span>
      </div>
      <ul className="divide-y divide-line">
        {DATA_SOURCES.map((d) => (
          <li key={d.name} className="grid gap-x-5 gap-y-0.5 px-5 py-3.5 sm:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_minmax(0,5fr)] sm:items-center">
            <span className="text-[13px] font-medium">{d.name}</span>
            <span className="text-[13px] text-muted">{d.provides}</span>
            <span className="text-xs text-muted sm:text-right">{d.key}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
