'use client';

import {
  ArrowRight,
  Ban,
  Briefcase,
  CircleCheck,
  Cpu,
  FileText,
  Globe,
  Landmark,
  Lock,
  Network,
  Radar,
  Scissors,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Telescope,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { Wordmark } from '@/components/brand';
import { LangToggle, useLang } from '@/components/lang';
import { ThemeToggle } from '@/components/theme-toggle';
import { MODULE } from '@/lib/modules';
import { SEV_VAR, T } from '@/lib/i18n';
import type { Lang, Severity } from '@/lib/types';
import { cn } from '@/lib/utils';

const COPY = {
  en: {
    nav: { how: 'How it works', leaders: 'For leaders', product: 'Modules', trust: 'Trust' },
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
    nav: { how: 'Cara kerja', leaders: 'Untuk pimpinan', product: 'Modul', trust: 'Keamanan' },
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

function Section({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn('scroll-mt-20 px-4 sm:px-6', className)}>
      <div className="mx-auto max-w-[1200px]">{children}</div>
    </section>
  );
}

function SectionHead({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="mb-10">
      <h2 className="text-[28px] font-semibold leading-9 tracking-tight sm:text-[32px] sm:leading-10">{title}</h2>
      {lead && <p className="mt-3 text-base leading-7 text-muted">{lead}</p>}
    </div>
  );
}

/** Static product preview for the hero: shows the real layout with sample data. */
function ProductPreview({ c }: { c: (typeof COPY)['en'] }) {
  const sev: [Severity, number][] = [
    ['Critical', 2],
    ['High', 6],
    ['Medium', 5],
    ['Low', 8],
    ['Info', 6],
  ];
  const total = sev.reduce((n, [, v]) => n + v, 0);
  const score = 38;
  const len = Math.PI * 52;
  return (
    <div className="relative rounded-xl border border-line bg-panel p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)] sm:p-6" aria-hidden>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-semibold">company.co.id</p>
          <p className="mt-0.5 text-xs text-muted">{c.preview.scanned}</p>
        </div>
        <span className="rounded-sm border border-line px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em] text-muted">{c.sample}</span>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-[150px_minmax(0,1fr)]">
        <div className="flex flex-col items-center rounded-lg border border-line bg-bg p-4">
          <p className="self-start text-xs font-medium text-muted">{c.preview.score}</p>
          <svg width="136" height="76" viewBox="0 0 136 76" className="mt-2">
            <path d="M16 70a52 52 0 0 1 104 0" fill="none" stroke="var(--color-panel2)" strokeWidth="10" strokeLinecap="round" />
            <path d="M16 70a52 52 0 0 1 104 0" fill="none" stroke={SEV_VAR.High} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(len * score) / 100} ${len}`} />
          </svg>
          <p className="tabular -mt-7 text-[30px] font-semibold leading-none">{score}</p>
          <p className="mt-3 rounded-sm border px-2 py-0.5 text-[11px] font-medium" style={{ color: SEV_VAR.High, borderColor: SEV_VAR.High }}>
            {c.preview.grade}
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <p className="text-xs font-medium text-muted">{c.preview.found}</p>
          <p className="text-[13px] leading-5">{c.preview.foundText}</p>
          <div className="mt-auto flex h-1.5 overflow-hidden rounded-full">
            {sev.map(([s, v]) => (
              <i key={s} className="block h-full" style={{ width: `${(v / total) * 100}%`, background: SEV_VAR[s] }} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
        <div>
          <p className="mb-2.5 text-xs font-medium text-muted">{c.preview.fixes}</p>
          <ol className="flex flex-col gap-2">
            {c.preview.fixList.map((f, i) => (
              <li key={f} className="flex items-start gap-2.5 text-[13px] leading-5">
                <span className="tabular mt-px text-xs font-semibold text-muted">0{i + 1}</span>
                {f}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="mb-2.5 text-xs font-medium text-muted">{c.preview.path}</p>
          <ol className="flex flex-col gap-2">
            {c.preview.nodes.map((n, i) => (
              <li key={n} className="flex items-center gap-2.5 text-[13px] leading-5">
                <span
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-full border text-[10px] font-semibold',
                    i === 1 ? 'border-low bg-low text-[var(--color-inverse)]' : 'border-line text-muted',
                  )}
                >
                  {i === 1 ? <Scissors className="size-3" /> : i + 1}
                </span>
                <span className={i === 1 ? 'font-medium' : ''}>{n}</span>
              </li>
            ))}
          </ol>
        </div>
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
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-20 border-b border-line bg-panel/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-3 px-4 sm:gap-6 sm:px-6">
          <Link href="/" aria-label="Craton home" className="shrink-0">
            <Wordmark compact />
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
            {navLinks.map(([href, label]) => (
              <a key={href} href={href} className="rounded-md px-3 py-1.5 text-sm text-muted hover:bg-panel2 hover:text-ink">
                {label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LangToggle lang={lang} setLang={setLang} />
            <ThemeToggle />
            <Link href="/login" className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-primary bg-primary px-3 text-[13px] font-medium text-white hover:brightness-110 sm:px-3.5">
              {c.signIn}
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <Section className="pb-20 pt-14 sm:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-xs font-medium text-muted">
                <Radar className="size-3.5" strokeWidth={1.75} aria-hidden />
                {c.eyebrow}
              </p>
              <h1 className="mt-6 text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] sm:text-[52px]">{c.h1}</h1>
              <p className="mt-6 text-[17px] leading-7 text-muted">{c.lead}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="inline-flex h-11 items-center gap-2 rounded-md border border-primary bg-primary px-5 text-[15px] font-medium text-white hover:brightness-110">
                  {c.ctaPrimary}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <a href="#how" className="inline-flex h-11 items-center rounded-md border border-line bg-panel px-5 text-[15px] font-medium hover:bg-panel2">
                  {c.ctaSecondary}
                </a>
              </div>
              <ul className="mt-8 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {c.proof.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-muted">
                    <CircleCheck className="size-4 shrink-0 text-low" strokeWidth={1.75} aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <ProductPreview c={c} />
          </div>
        </Section>

        {/* Problem */}
        <Section className="border-y border-line bg-panel py-20">
          <SectionHead title={c.problemTitle} />
          <div className="grid gap-8 md:grid-cols-3">
            {c.problems.map((p) => (
              <Feature key={p.title} icon={p.icon} title={p.title} body={p.body} />
            ))}
          </div>
        </Section>

        {/* How it works */}
        <Section id="how" className="py-20">
          <SectionHead title={c.howTitle} lead={c.howLead} />
          <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {c.steps.map((s, i) => (
              <li key={s.title} className="flex flex-col gap-3 rounded-lg border border-line bg-panel p-6">
                <span className="tabular grid size-8 place-items-center rounded-full border border-line text-[13px] font-semibold text-muted">{i + 1}</span>
                <h3 className="text-base font-semibold leading-6">{s.title}</h3>
                <p className="text-sm leading-6 text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Leaders */}
        <Section id="leaders" className="border-y border-line bg-panel py-20">
          <SectionHead title={c.leadersTitle} lead={c.leadersLead} />
          <div className="grid gap-4 md:grid-cols-2">
            {c.leaders.map((l) => (
              <article key={l.role} className="flex flex-col gap-4 rounded-lg border border-line bg-bg p-6 sm:p-7">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                  <l.icon className="size-4" strokeWidth={1.75} aria-hidden />
                  {l.role}
                </p>
                <h3 className="text-xl font-semibold leading-7">{l.head}</h3>
                <ul className="flex flex-col gap-2.5">
                  {l.points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm leading-6 text-muted">
                      <ArrowRight className="mt-1 size-3.5 shrink-0" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Section>

        {/* Modules */}
        <Section id="modules" className="py-20">
          <SectionHead title={c.productTitle} lead={c.productLead} />
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {MODULE_KEYS.map((k) => (
              <Feature
                key={k}
                icon={MODULE[k].icon}
                title={k === 'discovery' ? (lang === 'id' ? 'Penemuan aset' : 'Asset discovery') : (t.mod as Record<string, string>)[k]}
                body={t.modDesc[k]}
              />
            ))}
          </div>
        </Section>

        {/* Trust */}
        <Section id="trust" className="border-y border-line bg-panel py-20">
          <SectionHead title={c.trustTitle} lead={c.trustLead} />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="rounded-lg border border-line bg-bg p-6 sm:p-7">
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <ShieldCheck className="size-4 text-low" strokeWidth={1.75} aria-hidden />
                {c.does}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {c.doesList.map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-sm leading-6">
                    <CircleCheck className="mt-1 size-4 shrink-0 text-low" strokeWidth={1.75} aria-hidden />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-lg border border-line bg-bg p-6 sm:p-7">
              <h3 className="flex items-center gap-2 text-base font-semibold">
                <Ban className="size-4 text-crit" strokeWidth={1.75} aria-hidden />
                {c.never}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {c.neverList.map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-sm leading-6">
                    <Ban className="mt-1 size-4 shrink-0 text-muted" strokeWidth={1.75} aria-hidden />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-muted">
            <Globe className="size-4" strokeWidth={1.75} aria-hidden />
            {c.hosted}
          </p>
        </Section>

        {/* Final CTA */}
        <Section className="py-24">
          <div className="flex flex-col items-start gap-6 rounded-xl border border-line bg-panel p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[28px] font-semibold leading-9 tracking-tight">{c.finalTitle}</h2>
              <p className="mt-3 text-base leading-7 text-muted">{c.finalBody}</p>
              <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                <Lock className="size-4" strokeWidth={1.75} aria-hidden />
                {c.invite}
              </p>
            </div>
            <Link href="/login" className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-primary bg-primary px-5 text-[15px] font-medium text-white hover:brightness-110">
              {c.ctaPrimary}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </Section>
      </main>

      <footer className="border-t border-line px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-4 text-sm text-muted">
          <span className="flex items-center gap-3">
            <Wordmark />
            <span className="hidden sm:inline">· {c.footer}</span>
          </span>
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Network className="size-4" strokeWidth={1.75} aria-hidden />
              security.digitalstrategy.id
            </span>
            <span>© 2026</span>
            <Link href="/login" className="inline-flex items-center gap-1.5 hover:text-ink">
              <FileText className="size-4" strokeWidth={1.75} aria-hidden />
              {c.signIn}
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-3">
      <Icon className="size-6 text-muted" strokeWidth={1.5} aria-hidden />
      <h3 className="text-base font-semibold leading-6">{title}</h3>
      <p className="text-sm leading-6 text-muted">{body}</p>
    </div>
  );
}
