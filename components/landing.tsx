'use client';

import { ArrowRight, ArrowUpRight, Briefcase, Cpu, Landmark, ServerCog, ShieldCheck, Sparkles, Telescope } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { CratonMark } from '@/components/brand';
import { LangToggle, useLang } from '@/components/lang';
import { SEV_VAR, T } from '@/lib/i18n';
import type { Lang, Severity } from '@/lib/types';
import { cn } from '@/lib/utils';

const COPY = {
  en: {
    nav: { how: 'How it works', leaders: 'For leaders', product: 'Capabilities', trust: 'Trust' },
    labels: { problem: 'The problem', how: 'How it works', product: 'The brief', leaders: 'For leadership', modules: 'Capabilities', trust: 'Trust', start: 'Get started' },
    kicker: 'External attack surface management',
    productTitle2: 'What leadership sees after one scan.',
    productLead2: 'A score that moves, a plain-language summary, the three fixes that matter most and the route an attacker would take. In English or Bahasa Indonesia.',
    scroll: 'Scroll',
    logTitle: 'Scan log',
    signIn: 'Sign in',
    eyebrow: 'External attack surface management for Indonesian enterprises',
    h1: 'See your company the way an attacker does.',
    lead: 'Craton starts from one domain name and maps everything your organisation exposes to the internet: forgotten subdomains, open admin panels, leaked code, public cloud storage and known vulnerabilities. Then it tells you, in plain language, the three fixes that cut the most risk this week.',
    ctaPrimary: 'Sign in to run a scan',
    ctaSecondary: 'How it works',
    proof: ['No agents, no integration', 'Passive and non-intrusive', 'Briefs in English and Bahasa Indonesia', 'Results in minutes'],
    sample: 'Sample',
    preview: {
      scanned: 'Scanned today · 27 live hosts',
      score: 'Exposure score',
      grade: 'High exposure',
      found: 'What we found',
      foundText: 'A deleted cloud app still sits behind careers.company.co.id, and a public repository holds staging credentials that lead toward the ERP.',
      fixes: 'Fix these first',
      fixList: ['Delete three dangling DNS records', 'Rotate leaked staging credentials', 'Close the public Kibana console'],
      path: 'Most likely attack path',
      nodes: ['Public API docs', 'Staging credentials', 'ERP data'],
    },
    problemTitle: 'Your attack surface is bigger than your asset register',
    problems: [
      { icon: Telescope, title: 'Systems nobody remembers', body: 'Staging servers, campaign microsites and vendor portals rarely make it onto the asset list. Attackers find them in minutes from public certificate and DNS records.' },
      { icon: Sparkles, title: 'Alerts without priorities', body: 'Traditional scanners return thousands of findings. Leaders need to know which few changes actually remove a route into the business.' },
      { icon: Landmark, title: 'Accountability is rising', body: 'Boards, auditors and the Personal Data Protection Law (UU PDP) expect you to know your exposure and show it is going down.' },
    ],
    howTitle: 'One domain in. A decision-ready brief out.',
    howLead: 'No installation, no credentials, no change requests. A scan takes about two minutes.',
    steps: [
      { title: 'Enter your root domain', body: 'Confirm you are authorised to assess it. That is the only input Craton needs.' },
      { title: 'Discover', body: 'Certificate transparency logs and DNS reveal every subdomain, including the ones IT forgot.' },
      { title: 'Assess', body: 'Each host is checked for TLS, exposed services, known CVEs, takeover risk, leaked code, open buckets and email spoofing.' },
      { title: 'Decide', body: 'AI triage ranks the risks, chains them into attack paths, and writes a one-page brief for leadership.' },
    ],
    leadersTitle: 'Built for every seat at the table',
    leadersLead: 'The same scan, framed for the decision each leader has to make.',
    leaders: [
      { icon: Briefcase, role: 'CEO and board', head: 'One score, one page, three decisions.', points: ['Exposure score with the trend since last scan', 'Plain-language summary of what could go wrong', 'Printable executive brief in English or Bahasa Indonesia'] },
      { icon: ShieldCheck, role: 'CISO', head: 'Attack paths, and the fix that breaks each one.', points: ['Findings chained into realistic breach routes', 'One choke point per path, so effort goes where it counts', 'Actively exploited CVEs flagged from CISA KEV'] },
      { icon: Cpu, role: 'CTO', head: 'Every exposed system, with evidence and a fix.', points: ['Subdomains, hosting, open ports and TLS per host', 'Subdomain takeover and leaked secrets in public code', 'Screenshots that show what each page really is'] },
      { icon: ServerCog, role: 'CIO', head: 'Shadow IT made visible, and kept visible.', points: ['Hosting providers and cloud buckets across vendors', 'Daily monitoring with alerts when something new appears', 'A history of how the surface changes over time'] },
    ],
    productTitle: 'Eight checks, one view',
    productLead: 'Each module answers a question an attacker asks first.',
    trustTitle: 'Passive by design',
    trustLead: 'Craton looks at what anyone on the internet can already see. It never attacks, logs in or downloads your data.',
    does: 'What Craton does',
    doesList: [
      'Reads public certificate logs, DNS and Shodan’s existing internet scan data',
      'Makes ordinary web requests to your public pages, like a visitor',
      'Checks whether cloud storage answers publicly, without reading files',
      'Redacts secrets in memory before anything is stored or sent to AI',
      'Requires authorisation for every scan and records who ran it',
    ],
    never: 'What Craton never does',
    neverList: ['Port scanning or brute force', 'Directory fuzzing', 'Credential stuffing or login attempts', 'Exploiting vulnerabilities', 'Downloading files from your storage'],
    hosted: 'Hosted in Singapore, close to Indonesian infrastructure.',
    finalTitle: 'Know your exposure before the next board meeting.',
    finalBody: 'Run a scan on your own domain and get a brief your leadership team can act on today.',
    invite: 'Access is by invitation for authorised security teams.',
    footer: 'External attack surface management',
  },
  id: {
    nav: { how: 'Cara kerja', leaders: 'Untuk pimpinan', product: 'Kapabilitas', trust: 'Keamanan' },
    labels: { problem: 'Masalahnya', how: 'Cara kerja', product: 'Laporannya', leaders: 'Untuk pimpinan', modules: 'Kapabilitas', trust: 'Keamanan', start: 'Mulai' },
    kicker: 'Manajemen permukaan serangan eksternal',
    productTitle2: 'Yang dilihat pimpinan setelah satu pemindaian.',
    productLead2: 'Skor yang bergerak, ringkasan dengan bahasa sederhana, tiga perbaikan terpenting, dan rute yang akan diambil penyerang. Dalam Bahasa Indonesia atau Inggris.',
    scroll: 'Gulir',
    logTitle: 'Log pemindaian',
    signIn: 'Masuk',
    eyebrow: 'Manajemen permukaan serangan eksternal untuk perusahaan Indonesia',
    h1: 'Lihat perusahaan Anda seperti penyerang melihatnya.',
    lead: 'Craton berangkat dari satu nama domain dan memetakan semua yang terekspos ke internet: subdomain yang terlupakan, panel admin terbuka, kode yang bocor, penyimpanan cloud publik, dan kerentanan yang diketahui. Lalu Craton menjelaskan, dengan bahasa sederhana, tiga perbaikan yang paling menurunkan risiko minggu ini.',
    ctaPrimary: 'Masuk untuk memindai',
    ctaSecondary: 'Cara kerja',
    proof: ['Tanpa agen, tanpa integrasi', 'Pasif dan tidak mengganggu', 'Laporan dalam Bahasa Indonesia dan Inggris', 'Hasil dalam hitungan menit'],
    sample: 'Contoh',
    preview: {
      scanned: 'Dipindai hari ini · 27 host aktif',
      score: 'Skor eksposur',
      grade: 'Eksposur tinggi',
      found: 'Temuan kami',
      foundText: 'Aplikasi cloud yang sudah dihapus masih berada di balik careers.company.co.id, dan repositori publik menyimpan kredensial staging yang mengarah ke ERP.',
      fixes: 'Perbaiki ini dulu',
      fixList: ['Hapus tiga record DNS yang menggantung', 'Ganti kredensial staging yang bocor', 'Tutup konsol Kibana yang terbuka'],
      path: 'Jalur serangan paling mungkin',
      nodes: ['Dokumentasi API publik', 'Kredensial staging', 'Data ERP'],
    },
    problemTitle: 'Permukaan serangan Anda lebih luas dari daftar aset',
    problems: [
      { icon: Telescope, title: 'Sistem yang terlupakan', body: 'Server staging, microsite kampanye, dan portal vendor jarang masuk daftar aset. Penyerang menemukannya dalam hitungan menit dari catatan sertifikat dan DNS publik.' },
      { icon: Sparkles, title: 'Peringatan tanpa prioritas', body: 'Pemindai tradisional menghasilkan ribuan temuan. Pimpinan perlu tahu beberapa perubahan mana yang benar-benar menutup jalan masuk ke bisnis.' },
      { icon: Landmark, title: 'Akuntabilitas meningkat', body: 'Dewan, auditor, dan UU Pelindungan Data Pribadi (UU PDP) menuntut Anda mengetahui eksposur dan menunjukkan bahwa eksposur itu menurun.' },
    ],
    howTitle: 'Satu domain masuk. Laporan siap keputusan keluar.',
    howLead: 'Tanpa instalasi, tanpa kredensial, tanpa permintaan perubahan. Satu pemindaian sekitar dua menit.',
    steps: [
      { title: 'Masukkan domain utama', body: 'Konfirmasi bahwa Anda berwenang menilainya. Hanya itu yang Craton butuhkan.' },
      { title: 'Temukan', body: 'Log certificate transparency dan DNS mengungkap setiap subdomain, termasuk yang dilupakan tim IT.' },
      { title: 'Nilai', body: 'Setiap host diperiksa: TLS, layanan terbuka, CVE, risiko takeover, kode bocor, bucket terbuka, dan pemalsuan email.' },
      { title: 'Putuskan', body: 'Triase AI mengurutkan risiko, merangkainya menjadi jalur serangan, dan menulis laporan satu halaman untuk pimpinan.' },
    ],
    leadersTitle: 'Untuk setiap kursi di meja pimpinan',
    leadersLead: 'Pemindaian yang sama, disajikan untuk keputusan masing-masing pimpinan.',
    leaders: [
      { icon: Briefcase, role: 'CEO dan dewan', head: 'Satu skor, satu halaman, tiga keputusan.', points: ['Skor eksposur dengan tren sejak pemindaian terakhir', 'Ringkasan risiko dalam bahasa sederhana', 'Laporan eksekutif siap cetak, Indonesia atau Inggris'] },
      { icon: ShieldCheck, role: 'CISO', head: 'Jalur serangan, dan satu perbaikan yang memutusnya.', points: ['Temuan dirangkai menjadi rute pembobolan yang realistis', 'Satu titik putus per jalur, agar upaya tepat sasaran', 'CVE yang sedang dieksploitasi ditandai dari CISA KEV'] },
      { icon: Cpu, role: 'CTO', head: 'Setiap sistem terekspos, dengan bukti dan perbaikan.', points: ['Subdomain, hosting, port terbuka, dan TLS per host', 'Subdomain takeover dan rahasia bocor di kode publik', 'Tangkapan layar yang menunjukkan isi setiap halaman'] },
      { icon: ServerCog, role: 'CIO', head: 'Shadow IT terlihat, dan tetap terpantau.', points: ['Penyedia hosting dan bucket cloud lintas vendor', 'Pemantauan harian dengan peringatan saat ada yang baru', 'Riwayat perubahan permukaan serangan dari waktu ke waktu'] },
    ],
    productTitle: 'Delapan pemeriksaan, satu tampilan',
    productLead: 'Setiap modul menjawab pertanyaan pertama seorang penyerang.',
    trustTitle: 'Pasif sejak dirancang',
    trustLead: 'Craton hanya melihat apa yang sudah dapat dilihat siapa pun di internet. Craton tidak pernah menyerang, login, atau mengunduh data Anda.',
    does: 'Yang Craton lakukan',
    doesList: [
      'Membaca log sertifikat publik, DNS, dan data pemindaian internet Shodan yang sudah ada',
      'Mengirim permintaan web biasa ke halaman publik Anda, seperti pengunjung',
      'Memeriksa apakah penyimpanan cloud dapat diakses publik, tanpa membaca file',
      'Menyamarkan rahasia di memori sebelum disimpan atau dikirim ke AI',
      'Mewajibkan otorisasi untuk setiap pemindaian dan mencatat siapa yang menjalankannya',
    ],
    never: 'Yang tidak pernah Craton lakukan',
    neverList: ['Pemindaian port atau brute force', 'Fuzzing direktori', 'Credential stuffing atau percobaan login', 'Mengeksploitasi kerentanan', 'Mengunduh file dari penyimpanan Anda'],
    hosted: 'Di-host di Singapura, dekat dengan infrastruktur Indonesia.',
    finalTitle: 'Ketahui eksposur Anda sebelum rapat dewan berikutnya.',
    finalBody: 'Pindai domain Anda sendiri dan dapatkan laporan yang bisa langsung ditindaklanjuti pimpinan hari ini.',
    invite: 'Akses melalui undangan untuk tim keamanan yang berwenang.',
    footer: 'Manajemen permukaan serangan eksternal',
  },
} satisfies Record<Lang, unknown>;
const MODULE_KEYS = ['discovery', 'takeover', 'visual', 'code_leak', 'bucket', 'email', 'paths', 'drift'] as const;

/** The landing page is always dark, independent of the workspace theme. */
const NIGHT = {
  '--color-bg': '#000000',
  '--color-panel': '#0a0a0a',
  '--color-panel2': '#161616',
  '--color-line': '#262626',
  '--color-ink': '#f5f5f5',
  '--color-primary': '#f5f5f5',
  '--color-accent': '#8ab4ff',
  '--color-muted': '#8f8f8f',
  '--color-field': '#000000',
  '--color-inverse': '#000000',
  '--color-crit': '#ff5a5f',
  '--color-high': '#f5a14a',
  '--color-med': '#e6c34a',
  '--color-low': '#4fd18b',
  '--color-info': '#8f8f8f',
  colorScheme: 'dark',
} as React.CSSProperties;

const LOG = [
  ['00:00.4', 'ct-logs', '44 names under company.co.id'],
  ['00:03.1', 'dns', '27 resolve · 3 CNAMEs point at deleted cloud apps'],
  ['00:21.8', 'http', '19 live · 9 login pages · 2 consoles without auth'],
  ['00:34.2', 'intel', 'CVE-2021-41773 on hris · actively exploited (CISA KEV)'],
  ['00:41.0', 'code', 'staging credentials in a public repository'],
  ['00:58.6', 'triage', '3 attack paths · 3 choke points · brief ready'],
];

/** Deterministic pseudo-random points: same picture on server and client. */
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

/** Hero graphic: a field of hosts, the links between them, and the few an attacker would use. */
function SurfaceMap() {
  const { nodes, edges, hot } = useMemo(() => {
    const r = rng(7);
    const nodes = Array.from({ length: 150 }, () => ({ x: 20 + r() * 760, y: 20 + r() * 560, s: r() }));
    const edges: [number, number][] = [];
    nodes.forEach((a, i) => {
      const near = nodes
        .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
        .filter((n) => n.j !== i)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2);
      near.forEach((n) => n.d < 95 && i < n.j && edges.push([i, n.j]));
    });
    // Highlight three hosts in the right-hand part of the map, clear of the headline.
    const pick = (x: number, y: number) =>
      nodes
        .map((n, i) => ({ i, d: Math.hypot(n.x - x, n.y - y) }))
        .filter(({ i }) => nodes[i].x > 650 && nodes[i].x < 770)
        .sort((a, b) => a.d - b.d)[0].i;
    const hot = [
      { i: pick(690, 140), label: 'staging.company.co.id' },
      { i: pick(755, 320), label: 'kibana.company.co.id' },
      { i: pick(680, 480), label: 'erp.company.co.id' },
    ];
    return { nodes, edges, hot };
  }, []);
  const path = hot.map((h) => h.i);
  return (
    <svg viewBox="0 0 800 600" className="h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
      <g stroke="var(--color-line)" strokeWidth="1">
        {edges.map(([a, b], k) => (
          <line key={k} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} />
        ))}
      </g>
      <polyline
        points={path.map((i) => `${nodes[i].x},${nodes[i].y}`).join(' ')}
        fill="none"
        stroke="var(--color-crit)"
        strokeWidth="1.25"
        strokeDasharray="4 4"
        className="landing-dash"
      />
      {nodes.map((n, k) => (
        <circle key={k} cx={n.x} cy={n.y} r={n.s > 0.85 ? 2.4 : 1.5} fill={n.s > 0.85 ? '#d4d4d4' : '#4a4a4a'} />
      ))}
      {hot.map((h) => {
        const n = nodes[h.i];
        return (
          <g key={h.i}>
            <circle cx={n.x} cy={n.y} r="10" fill="none" stroke="var(--color-crit)" strokeWidth="1" className="landing-pulse" />
            <circle cx={n.x} cy={n.y} r="3.5" fill="var(--color-crit)" />
            <line x1={n.x - 6} y1={n.y - 6} x2={n.x - 28} y2={n.y - 28} stroke="var(--color-crit)" strokeWidth="1" className="max-lg:hidden" />
            <text className="max-lg:hidden" x={n.x - 32} y={n.y - 31} textAnchor="end" fill="var(--color-ink)" fontSize="12" fontFamily="var(--font-mono)">
              {h.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{children}</p>;
}

function Band({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn('scroll-mt-14 border-t border-line px-5 sm:px-8', className)}>
      <div className="mx-auto max-w-[1280px]">{children}</div>
    </section>
  );
}

const btn = 'inline-flex h-12 items-center gap-3 px-6 text-[15px] font-medium transition-colors';

/** Sample brief, styled as the product renders it. */
function BriefPreview({ c }: { c: (typeof COPY)['en'] }) {
  const sev: [Severity, number][] = [
    ['Critical', 2],
    ['High', 6],
    ['Medium', 5],
    ['Low', 8],
    ['Info', 6],
  ];
  const total = sev.reduce((n, [, v]) => n + v, 0);
  return (
    <div className="grid border border-line bg-panel lg:grid-cols-[280px_minmax(0,1fr)_minmax(0,1fr)]" aria-hidden>
      <div className="flex flex-col justify-between gap-8 border-b border-line p-6 lg:border-b-0 lg:border-r">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{c.preview.score}</p>
          <p className="tabular mt-3 text-[88px] font-semibold leading-none tracking-[-0.04em]">38</p>
          <p className="mt-3 text-sm font-medium" style={{ color: SEV_VAR.High }}>
            {c.preview.grade}
          </p>
        </div>
        <div>
          <div className="flex h-1 overflow-hidden">
            {sev.map(([s, v]) => (
              <i key={s} className="block h-full" style={{ width: `${(v / total) * 100}%`, background: SEV_VAR[s] }} />
            ))}
          </div>
          <p className="mt-3 font-mono text-xs text-muted">company.co.id · {c.preview.scanned}</p>
        </div>
      </div>
      <div className="border-b border-line p-6 lg:border-b-0 lg:border-r">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{c.preview.found}</p>
        <p className="mt-4 text-[17px] leading-7">{c.preview.foundText}</p>
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{c.preview.fixes}</p>
        <ol className="mt-4 flex flex-col">
          {c.preview.fixList.map((f) => (
            <li key={f} className="border-t border-line py-3 text-sm">
              {f}
            </li>
          ))}
        </ol>
      </div>
      <div className="p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{c.preview.path}</p>
        <ol className="mt-6 flex flex-col">
          {c.preview.nodes.map((n, i) => (
            <li key={n} className="relative flex gap-4 pb-8 last:pb-0">
              {i < c.preview.nodes.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-line" aria-hidden />}
              <span className={cn('relative mt-1.5 size-[11px] shrink-0 border', i === 1 ? 'border-low bg-low' : 'border-muted bg-bg')} />
              <div>
                <p className={cn('text-[15px]', i === 1 && 'font-semibold')}>{n}</p>
                {i === 1 && <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-low">Break here</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function Landing() {
  const [lang, setLang] = useLang();
  const c = COPY[lang];
  const t = T[lang];
  const navLinks: [string, string][] = [
    ['#how', c.nav.how],
    ['#leaders', c.nav.leaders],
    ['#modules', c.nav.product],
    ['#trust', c.nav.trust],
  ];

  return (
    <div style={NIGHT} className="min-h-dvh bg-bg text-ink antialiased">
      <style>{`
        @keyframes landing-dash { to { stroke-dashoffset: -64; } }
        @keyframes landing-pulse { 0% { opacity: .9; transform: scale(.6); } 100% { opacity: 0; transform: scale(2.2); } }
        .landing-dash { animation: landing-dash 3s linear infinite; }
        .landing-pulse { transform-box: fill-box; transform-origin: center; animation: landing-pulse 2.4s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) { .landing-dash, .landing-pulse { animation: none; } }
      `}</style>

      <header className="fixed inset-x-0 top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-6 px-5 sm:px-8">
          <Link href="/" aria-label="Craton home" className="flex shrink-0 items-center gap-2.5">
            <CratonMark className="size-5" />
            <span className="text-sm font-semibold tracking-[0.22em]">CRATON</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Sections">
            {navLinks.map(([href, label]) => (
              <a key={href} href={href} className="text-[13px] text-muted transition-colors hover:text-ink">
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <LangToggle lang={lang} setLang={setLang} />
            <Link href="/login" className="inline-flex h-8 shrink-0 items-center gap-2 whitespace-nowrap bg-ink px-3.5 text-[13px] font-medium text-bg hover:bg-white">
              {c.signIn}
              <ArrowUpRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero: full height, type-led, with the attack surface drawn behind */}
        <section className="relative flex min-h-[100svh] flex-col overflow-hidden px-5 pt-14 sm:px-8">
          <div className="pointer-events-none absolute inset-0 opacity-90 [mask-image:linear-gradient(to_right,transparent_25%,black_70%)] max-lg:opacity-40 max-lg:[mask-image:linear-gradient(to_bottom,transparent_20%,black_90%)]">
            <SurfaceMap />
          </div>
          <div className="relative mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center py-16">
            <Label>{c.kicker}</Label>
            <h1 className="mt-8 max-w-[14ch] text-[48px] font-semibold leading-[0.98] tracking-[-0.035em] sm:text-[72px] lg:text-[96px]">{c.h1}</h1>
            <p className="mt-8 max-w-[58ch] text-[17px] leading-7 text-muted sm:text-lg sm:leading-8">{c.lead}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/login" className={cn(btn, 'bg-ink text-bg hover:bg-white')}>
                {c.ctaPrimary}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a href="#how" className={cn(btn, 'border border-line text-ink hover:border-muted')}>
                {c.ctaSecondary}
              </a>
            </div>
          </div>
          <dl className="relative mx-auto grid w-full max-w-[1280px] grid-cols-2 border-t border-line lg:grid-cols-4">
            {c.proof.map((p, i) => (
              <div key={p} className={cn('py-5 pr-4', i > 0 && 'lg:border-l lg:border-line lg:pl-6', i % 2 === 1 && 'max-lg:border-l max-lg:border-line max-lg:pl-4')}>
                <dd className="text-sm">{p}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Scan log */}
        <Band className="bg-panel py-10">
          <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{c.logTitle}</p>
            <ol className="font-mono text-[13px] leading-7">
              {LOG.map(([time, src, msg]) => (
                <li key={time} className="grid grid-cols-[72px_80px_minmax(0,1fr)] gap-3 sm:grid-cols-[88px_96px_minmax(0,1fr)]">
                  <span className="text-muted">{time}</span>
                  <span className="text-muted">{src}</span>
                  <span className={cn('truncate', msg.includes('KEV') || msg.includes('credentials') ? 'text-crit' : msg.includes('ready') ? 'text-low' : '')}>{msg}</span>
                </li>
              ))}
            </ol>
          </div>
        </Band>

        {/* Problem */}
        <Band className="py-24 sm:py-32">
          <Label>{c.labels.problem}</Label>
          <h2 className="mt-8 text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px]">{c.problemTitle}</h2>
          <div className="mt-16 grid border-t border-line md:grid-cols-3">
            {c.problems.map((p, i) => (
              <div key={p.title} className={cn('py-8 md:pr-8', i > 0 && 'border-t border-line md:border-l md:border-t-0 md:pl-8')}>
                <h3 className="text-xl font-semibold leading-7">{p.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </Band>

        {/* How it works */}
        <Band id="how" className="py-24 sm:py-32">
          <Label>{c.labels.how}</Label>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
            <h2 className="text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px]">{c.howTitle}</h2>
            <p className="text-[17px] leading-7 text-muted">{c.howLead}</p>
          </div>
          <ol className="mt-16 grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
            {c.steps.map((s) => (
              <li key={s.title} className="flex flex-col bg-bg p-7">
                <h3 className="text-xl font-semibold leading-7">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-6 text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </Band>

        {/* The brief */}
        <Band className="py-24 sm:py-32">
          <Label>{c.labels.product}</Label>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
            <h2 className="text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px]">{c.productTitle2}</h2>
            <p className="text-[17px] leading-7 text-muted">{c.productLead2}</p>
          </div>
          <div className="mt-16">
            <BriefPreview c={c} />
          </div>
        </Band>

        {/* Leaders */}
        <Band id="leaders" className="py-24 sm:py-32">
          <Label>{c.labels.leaders}</Label>
          <h2 className="mt-8 text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px]">{c.leadersTitle}</h2>
          <div className="mt-16 border-b border-line">
            {c.leaders.map((l) => (
              <article key={l.role} className="grid gap-4 border-t border-line py-10 lg:grid-cols-[220px_minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{l.role}</p>
                <h3 className="text-[26px] font-semibold leading-8 tracking-[-0.02em]">{l.head}</h3>
                <ul className="flex flex-col gap-2">
                  {l.points.map((p) => (
                    <li key={p} className="flex gap-3 text-[15px] leading-6 text-muted">
                      <span className="font-mono text-ink" aria-hidden>
                        →
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Band>

        {/* Capabilities */}
        <Band id="modules" className="py-24 sm:py-32">
          <Label>{c.labels.modules}</Label>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
            <h2 className="text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px]">{c.productTitle}</h2>
            <p className="text-[17px] leading-7 text-muted">{c.productLead}</p>
          </div>
          <div className="mt-16 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {MODULE_KEYS.map((k) => (
              <div key={k} className="flex flex-col bg-bg p-7 transition-colors hover:bg-panel">
                <h3 className="text-lg font-semibold leading-6">
                  {k === 'discovery' ? (lang === 'id' ? 'Penemuan aset' : 'Asset discovery') : (t.mod as Record<string, string>)[k]}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">{t.modDesc[k]}</p>
              </div>
            ))}
          </div>
        </Band>

        {/* Trust */}
        <Band id="trust" className="py-24 sm:py-32">
          <Label>{c.labels.trust}</Label>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
            <h2 className="text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px]">{c.trustTitle}</h2>
            <p className="text-[17px] leading-7 text-muted">{c.trustLead}</p>
          </div>
          <div className="mt-16 grid gap-px border border-line bg-line lg:grid-cols-2">
            {[
              { title: c.does, items: c.doesList, mark: '+', color: 'text-low' },
              { title: c.never, items: c.neverList, mark: '−', color: 'text-crit' },
            ].map((col) => (
              <div key={col.title} className="bg-bg p-7 sm:p-10">
                <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{col.title}</h3>
                <ul className="mt-6 flex flex-col">
                  {col.items.map((d) => (
                    <li key={d} className="flex gap-4 border-t border-line py-4 text-[15px] leading-6">
                      <span className={cn('w-3 shrink-0 font-mono', col.color)} aria-hidden>
                        {col.mark}
                      </span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-muted">{c.hosted}</p>
        </Band>

        {/* Closing */}
        <Band className="py-28 sm:py-40">
          <Label>{c.labels.start}</Label>
          <h2 className="mt-8 max-w-[18ch] text-[44px] font-semibold leading-[1] tracking-[-0.035em] sm:text-[72px]">{c.finalTitle}</h2>
          <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[17px] leading-7 text-muted">{c.finalBody}</p>
              <p className="mt-2 text-sm text-muted">{c.invite}</p>
            </div>
            <Link href="/login" className={cn(btn, 'shrink-0 bg-ink text-bg hover:bg-white')}>
              {c.ctaPrimary}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Band>
      </main>

      <footer className="border-t border-line px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2.5">
            <CratonMark className="size-4" />
            <span className="text-xs font-semibold tracking-[0.22em]">CRATON</span>
            <span className="text-xs text-muted">· {c.footer}</span>
          </span>
          <span className="flex flex-wrap items-center gap-6 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
            <span>security.digitalstrategy.id</span>
            <span>© 2026</span>
            <Link href="/login" className="hover:text-ink">
              {c.signIn}
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
