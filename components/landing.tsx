'use client';

import {
  ArrowRight,
  Ban,
  BellRing,
  Briefcase,
  Bug,
  CalendarClock,
  Check,
  Cloud,
  Code2,
  Cpu,
  Crosshair,
  FileCheck,
  FileText,
  History,
  Landmark,
  Layers,
  ListOrdered,
  Mail,
  Plus,
  Radar,
  RefreshCw,
  Route,
  ScanEye,
  ScanSearch,
  Search,
  Server,
  ServerCog,
  ShieldCheck,
  Telescope,
  Unplug,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/site-chrome';
import { useLang } from '@/components/lang';
import { LANDING_FAQ } from '@/lib/landing-faq';
import { SEV_VAR } from '@/lib/sev-colors';
import type { Lang, Severity } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Item {
  icon: LucideIcon;
  title: string;
  body: string;
}
interface Fn {
  id: 'discover' | 'classify' | 'assess' | 'prioritise' | 'monitor';
  icon: LucideIcon;
  name: string;
  question: string;
  short: string;
  head: string;
  body: string;
  items: Item[];
}

const FN_ICON = { discover: ScanSearch, classify: Layers, assess: ShieldCheck, prioritise: Route, monitor: Radar } as const;

const COPY = {
  en: {
    nav: { framework: 'Framework', brief: 'The Brief', leaders: 'For Leaders', trust: 'Trust', compliance: 'Compliance' },
    easmGuide: 'New to EASM? Start here',
    easm: {
      label: 'What Is EASM?',
      title: 'Everything of yours that the internet can see.',
      lead: 'External attack surface management, or EASM, means looking at your company from the outside, the way an attacker does. It finds every website, server, cloud app and forgotten test system tied to your name, shows which ones put you at risk, and keeps watching as they change.',
      points: [
        { icon: Search, title: 'Find', body: 'Attackers do not ask for your asset list. They build their own from public records. EASM builds that list first.' },
        { icon: Crosshair, title: 'Judge', body: 'Not every exposure matters. EASM separates the few that open a way in from the many that do not.' },
        { icon: Radar, title: 'Watch', body: 'Your surface changes every week. EASM rescans, flags what is new and proves your fixes worked.' },
      ],
      notTitle: 'Not a vulnerability scanner.',
      notBody: 'A scanner checks the systems you point it at. EASM finds the ones you did not know to point it at, with nothing to install and nothing attacked.',
      link: 'See the five stages',
      findsTitle: 'What it typically finds',
      finds: [
        { icon: Unplug, title: 'A forgotten campaign site', body: 'A microsite from an old promotion, still live, still pointing at a cloud app nobody owns any more.' },
        { icon: Telescope, title: 'A staging server on the open internet', body: 'A test system built for a project, never switched off, sometimes with an admin console and no login.' },
        { icon: Code2, title: 'A credential in public code', body: 'A developer pushed a configuration file to a public repository, and the password inside still works.' },
        { icon: Cloud, title: 'Storage anyone can list', body: 'A cloud bucket set to public by mistake, showing its file names to the whole internet.' },
      ],
      fitTitle: 'Where EASM fits',
      fitLead: 'These approaches complement each other. The differences are typical, and individual products vary.',
      fitCols: ['Approach', 'Starts from', 'Finds what you did not list', 'How often'],
      fitRows: [
        ['Vulnerability scanner', 'The hosts you give it', 'No', 'On a schedule'],
        ['Penetration test', 'An agreed scope', 'Rarely', 'Once or twice a year'],
        ['EASM with Craton', 'One domain name', 'Yes', 'Continuously'],
      ],
    },
    faq: { label: 'Questions', title: 'Straight answers about EASM.' },
    labels: { problem: 'The Problem', framework: 'The Framework', brief: 'The Brief', leaders: 'For Leadership', trust: 'Trust', start: 'Get Started', log: 'Scan Log' },
    kicker: 'External Attack Surface Management',
    signIn: 'Sign in',
    h1: 'See your company the way an attacker does.',
    lead: 'Craton starts from one domain name and maps everything your organisation exposes to the internet. Then it runs the five stages of external attack surface management from the outside, and tells you in plain language which three fixes cut the most risk this week.',
    ctaPrimary: 'Sign in to run a scan',
    ctaSecondary: 'See the framework',
    proof: ['No agents, no integration', 'Passive and non-intrusive', 'Briefs in English and Bahasa Indonesia', 'Results in minutes'],
    problemTitle: 'Your attack surface is bigger than your asset register',
    problems: [
      { icon: Telescope, title: 'Systems nobody remembers', body: 'Staging servers, campaign microsites and vendor portals rarely make it onto the asset list. Attackers find them in minutes from public certificate and DNS records.' },
      { icon: ListOrdered, title: 'Alerts without priorities', body: 'Traditional scanners return thousands of findings. Leaders need to know which few changes actually remove a route into the business.' },
      { icon: Landmark, title: 'Accountability is rising', body: 'Boards, auditors and the Personal Data Protection Law (UU PDP) expect you to know your exposure and show it is going down.' },
    ],
    frameworkTitle: 'Five stages, one outside view',
    frameworkLead: 'Craton runs the full EASM cycle for you, from the outside, without touching your systems. Each stage feeds the next.',
    frameworkNote: 'The stages follow the common EASM lifecycle. Report findings map to NIST CSF categories and ISO/IEC 27001 controls. Craton is independent and is not endorsed or certified by NIST or ISO.',
    fns: [
      {
        id: 'discover',
        name: 'Discover',
        question: 'What do we expose?',
        short: 'Find every exposed asset',
        head: 'Start where an attacker starts.',
        body: 'Attackers begin with a list of your systems. Craton builds the same list from public records, with no agent and no access.',
        items: [
          { icon: Search, title: 'Asset discovery', body: 'Certificate logs and DNS reveal every subdomain, including the ones IT forgot.' },
          { icon: Telescope, title: 'Passive sources', body: 'Existing internet scan data adds what is already known about your hosts. Nothing is sent to your systems.' },
          { icon: Radar, title: 'Live-host check', body: 'Ordinary web requests, like a visitor’s, tell live hosts from dead names.' },
        ],
      },
      {
        id: 'classify',
        name: 'Classify',
        question: 'What is each thing?',
        short: 'Turn names into an inventory',
        head: 'Turn a list of names into an inventory.',
        body: 'A hostname alone says little. Craton adds hosting, technology and purpose, so every asset has a type and can be given an owner.',
        items: [
          { icon: Server, title: 'Host profiling', body: 'Hosting provider, open services, technology and TLS for every live host.' },
          { icon: ScanEye, title: 'Page classification', body: 'Screenshots and AI label each page: login portal, admin console or a parked site.' },
          { icon: ServerCog, title: 'Shadow IT made visible', body: 'Hosting providers and cloud buckets across vendors, in one inventory.' },
        ],
      },
      {
        id: 'assess',
        name: 'Assess',
        question: 'Where are we weak?',
        short: 'Find the gaps that invite attack',
        head: 'See the gaps that invite attack.',
        body: 'Most incidents use a weakness that was already public. Craton checks each asset for the ones attackers look for first.',
        items: [
          { icon: Unplug, title: 'Subdomain takeover', body: 'DNS records that point to deleted cloud apps anyone could claim.' },
          { icon: Cloud, title: 'Public cloud storage', body: 'Buckets that list their files to the whole internet, checked without reading them.' },
          { icon: Code2, title: 'Leaked code and secrets', body: 'Credentials and internal configuration in public repositories.' },
          { icon: Mail, title: 'Email spoofing', body: 'SPF and DMARC settings that let others send mail as your domain.' },
          { icon: Bug, title: 'Known vulnerabilities', body: 'CVEs per service, with CISA KEV and exploit-probability flags.' },
        ],
      },
      {
        id: 'prioritise',
        name: 'Prioritise',
        question: 'What do we fix first?',
        short: 'Break the attack path first',
        head: 'Fix the one thing that matters first.',
        body: 'A long findings list is not a plan. Craton chains findings into attack paths, so effort goes where it breaks the route.',
        items: [
          { icon: Route, title: 'Attack paths', body: 'Realistic breach routes, each with one choke point to cut.' },
          { icon: Crosshair, title: 'Exploitability analysis', body: 'A conceptual walk-through and safe checks to confirm a finding. Nothing is exploited.' },
          { icon: FileText, title: 'Executive brief', body: 'Score, summary and the three fixes that matter, in English or Bahasa Indonesia.' },
        ],
      },
      {
        id: 'monitor',
        name: 'Monitor',
        question: 'What changed, and did the fix hold?',
        short: 'Catch change, prove the fix',
        head: 'Keep watching, and prove the fix held.',
        body: 'Your surface moves every time someone ships a site or a vendor adds a record. Craton rescans, compares and keeps the record.',
        items: [
          { icon: CalendarClock, title: 'Daily monitoring', body: 'Scheduled rescans compare every result with the one before.' },
          { icon: History, title: 'Drift timeline', body: 'New hosts, new open services and new findings, in order.' },
          { icon: BellRing, title: 'Alerts', body: 'High-severity changes go to Slack, Teams or any webhook.' },
          { icon: RefreshCw, title: 'Verify by rescanning', body: 'Run the same scan again and watch closed findings disappear.' },
          { icon: FileCheck, title: 'Printable evidence', body: 'A dated report for audit, the board and UU PDP accountability.' },
        ],
      },
    ] satisfies Omit<Fn, 'icon'>[],
    briefTitle: 'What leadership sees after one scan.',
    briefLead: 'A score that moves, a plain-language summary, the three fixes that matter most and the route an attacker would take. In English or Bahasa Indonesia.',
    preview: {
      scanned: 'Scanned today · 27 live hosts',
      score: 'Exposure Score',
      grade: 'High exposure',
      found: 'What We Found',
      foundText: 'A deleted cloud app still sits behind careers.company.co.id, and a public repository holds staging credentials that lead toward the ERP.',
      fixes: 'Fix These First',
      fixList: ['Delete three dangling DNS records', 'Rotate leaked staging credentials', 'Close the public Kibana console'],
      path: 'Most Likely Attack Path',
      nodes: ['Public API docs', 'Staging credentials', 'ERP data'],
      breakHere: 'Break here',
    },
    leadersTitle: 'Built for every seat at the table',
    leaders: [
      { icon: Briefcase, role: 'CEO and Board', head: 'One score, one page, three decisions.', points: ['Exposure score with the trend since last scan', 'Plain-language summary of what could go wrong', 'Printable executive brief in English or Bahasa Indonesia'] },
      { icon: ShieldCheck, role: 'CISO', head: 'Attack paths, and the fix that breaks each one.', points: ['Findings chained into realistic breach routes', 'One choke point per path, so effort goes where it counts', 'Actively exploited CVEs flagged from CISA KEV'] },
      { icon: Cpu, role: 'CTO', head: 'Every exposed system, with evidence and a fix.', points: ['Subdomains, hosting, open ports and TLS per host', 'Subdomain takeover and leaked secrets in public code', 'Screenshots that show what each page really is'] },
      { icon: ServerCog, role: 'CIO', head: 'Shadow IT made visible, and kept visible.', points: ['Hosting providers and cloud buckets across vendors', 'Daily monitoring with alerts when something new appears', 'A history of how the surface changes over time'] },
    ],
    trustTitle: 'Passive by design',
    trustLead: 'Craton looks at what anyone on the internet can already see. It never attacks, logs in or downloads your data.',
    does: 'What Craton Does',
    doesList: [
      'Reads public certificate logs, DNS and Shodan’s existing internet scan data',
      'Makes ordinary web requests to your public pages, like a visitor',
      'Checks whether cloud storage answers publicly, without reading files',
      'Redacts secrets in memory before anything is stored or sent to AI',
      'Requires authorisation for every scan and records who ran it',
    ],
    never: 'What Craton Never Does',
    neverList: ['Port scanning or brute force', 'Directory fuzzing', 'Credential stuffing or login attempts', 'Exploiting vulnerabilities', 'Downloading files from your storage'],
    finalTitle: 'Know your exposure before the next board meeting.',
    finalBody: 'Run a scan on your own domain and get a brief your leadership team can act on today.',
    invite: 'Access is by invitation for authorised security teams.',
    footer: 'External attack surface management',
    complianceLink: 'Indonesian compliance guide',
  },
  id: {
    nav: { framework: 'Kerangka', brief: 'Laporan', leaders: 'Untuk Pimpinan', trust: 'Keamanan', compliance: 'Kepatuhan' },
    easmGuide: 'Baru mengenal EASM? Mulai di sini',
    easm: {
      label: 'Apa Itu EASM?',
      title: 'Semua milik Anda yang bisa dilihat internet.',
      lead: 'Manajemen permukaan serangan eksternal, atau EASM, berarti memandang perusahaan Anda dari luar, seperti penyerang. EASM menemukan setiap situs web, server, aplikasi cloud, dan sistem uji yang terlupakan atas nama Anda, menunjukkan mana yang membahayakan, dan terus memantau saat semuanya berubah.',
      points: [
        { icon: Search, title: 'Temukan', body: 'Penyerang tidak meminta daftar aset Anda. Mereka menyusunnya sendiri dari catatan publik. EASM menyusun daftar itu lebih dulu.' },
        { icon: Crosshair, title: 'Nilai', body: 'Tidak semua eksposur penting. EASM memisahkan sedikit yang membuka jalan masuk dari banyak yang tidak.' },
        { icon: Radar, title: 'Pantau', body: 'Permukaan serangan Anda berubah setiap minggu. EASM memindai ulang, menandai yang baru, dan membuktikan perbaikan Anda berhasil.' },
      ],
      notTitle: 'Bukan sekadar pemindai kerentanan.',
      notBody: 'Pemindai memeriksa sistem yang Anda arahkan. EASM menemukan sistem yang tidak Anda ketahui untuk diarahkan, tanpa instalasi dan tanpa menyerang apa pun.',
      link: 'Lihat lima tahapnya',
      findsTitle: 'Yang biasanya ditemukan',
      finds: [
        { icon: Unplug, title: 'Situs kampanye yang terlupakan', body: 'Microsite dari promosi lama, masih aktif, masih menunjuk ke aplikasi cloud yang sudah tidak dimiliki siapa pun.' },
        { icon: Telescope, title: 'Server staging di internet terbuka', body: 'Sistem uji untuk sebuah proyek, tidak pernah dimatikan, kadang dengan konsol admin tanpa login.' },
        { icon: Code2, title: 'Kredensial di kode publik', body: 'Seorang pengembang mengunggah file konfigurasi ke repositori publik, dan kata sandi di dalamnya masih berlaku.' },
        { icon: Cloud, title: 'Penyimpanan yang bisa didaftar siapa saja', body: 'Bucket cloud yang tidak sengaja dibuat publik, menampilkan nama filenya ke seluruh internet.' },
      ],
      fitTitle: 'Posisi EASM',
      fitLead: 'Pendekatan-pendekatan ini saling melengkapi. Perbedaannya bersifat umum, dan tiap produk bisa berbeda.',
      fitCols: ['Pendekatan', 'Titik awal', 'Menemukan yang tidak Anda daftarkan', 'Seberapa sering'],
      fitRows: [
        ['Pemindai kerentanan', 'Host yang Anda berikan', 'Tidak', 'Terjadwal'],
        ['Uji penetrasi', 'Cakupan yang disepakati', 'Jarang', 'Sekali atau dua kali setahun'],
        ['EASM dengan Craton', 'Satu nama domain', 'Ya', 'Berkelanjutan'],
      ],
    },
    faq: { label: 'Pertanyaan', title: 'Jawaban lugas tentang EASM.' },
    labels: { problem: 'Masalahnya', framework: 'Kerangka Kerja', brief: 'Laporannya', leaders: 'Untuk Pimpinan', trust: 'Keamanan', start: 'Mulai', log: 'Log Pemindaian' },
    kicker: 'Manajemen Permukaan Serangan Eksternal',
    signIn: 'Masuk',
    h1: 'Lihat perusahaan Anda seperti penyerang melihatnya.',
    lead: 'Craton berangkat dari satu nama domain dan memetakan semua yang terekspos ke internet. Lalu Craton menjalankan lima tahap manajemen permukaan serangan eksternal dari luar, dan menjelaskan dengan bahasa sederhana tiga perbaikan yang paling menurunkan risiko minggu ini.',
    ctaPrimary: 'Masuk untuk memindai',
    ctaSecondary: 'Lihat kerangka kerja',
    proof: ['Tanpa agen, tanpa integrasi', 'Pasif dan tidak mengganggu', 'Laporan dalam Bahasa Indonesia dan Inggris', 'Hasil dalam hitungan menit'],
    problemTitle: 'Permukaan serangan Anda lebih luas dari daftar aset',
    problems: [
      { icon: Telescope, title: 'Sistem yang terlupakan', body: 'Server staging, microsite kampanye, dan portal vendor jarang masuk daftar aset. Penyerang menemukannya dalam hitungan menit dari catatan sertifikat dan DNS publik.' },
      { icon: ListOrdered, title: 'Peringatan tanpa prioritas', body: 'Pemindai tradisional menghasilkan ribuan temuan. Pimpinan perlu tahu beberapa perubahan mana yang benar-benar menutup jalan masuk ke bisnis.' },
      { icon: Landmark, title: 'Akuntabilitas meningkat', body: 'Dewan, auditor, dan UU Pelindungan Data Pribadi (UU PDP) menuntut Anda mengetahui eksposur dan menunjukkan bahwa eksposur itu menurun.' },
    ],
    frameworkTitle: 'Lima tahap, satu pandangan dari luar',
    frameworkLead: 'Craton menjalankan siklus EASM penuh untuk Anda, dari luar, tanpa menyentuh sistem Anda. Setiap tahap mengisi tahap berikutnya.',
    frameworkNote: 'Tahapannya mengikuti siklus EASM yang lazim. Temuan dalam laporan dipetakan ke kategori NIST CSF dan kontrol ISO/IEC 27001. Craton independen dan tidak didukung atau disertifikasi oleh NIST maupun ISO.',
    fns: [
      {
        id: 'discover',
        name: 'Discover',
        question: 'Apa yang kita ekspos?',
        short: 'Temukan setiap aset terekspos',
        head: 'Mulai dari tempat penyerang mulai.',
        body: 'Penyerang memulai dari daftar sistem Anda. Craton menyusun daftar yang sama dari catatan publik, tanpa agen dan tanpa akses.',
        items: [
          { icon: Search, title: 'Penemuan aset', body: 'Log sertifikat dan DNS mengungkap setiap subdomain, termasuk yang dilupakan tim IT.' },
          { icon: Telescope, title: 'Sumber pasif', body: 'Data pemindaian internet yang sudah ada menambah apa yang sudah diketahui tentang host Anda. Tidak ada yang dikirim ke sistem Anda.' },
          { icon: Radar, title: 'Pemeriksaan host aktif', body: 'Permintaan web biasa, seperti pengunjung, membedakan host aktif dari nama yang sudah mati.' },
        ],
      },
      {
        id: 'classify',
        name: 'Classify',
        question: 'Apa masing-masing aset ini?',
        short: 'Ubah nama menjadi inventaris',
        head: 'Ubah daftar nama menjadi inventaris.',
        body: 'Nama host saja tidak banyak bicara. Craton menambahkan hosting, teknologi, dan fungsi, sehingga setiap aset punya jenis dan bisa diberi pemilik.',
        items: [
          { icon: Server, title: 'Profil host', body: 'Penyedia hosting, layanan terbuka, teknologi, dan TLS untuk setiap host aktif.' },
          { icon: ScanEye, title: 'Klasifikasi halaman', body: 'Tangkapan layar dan AI melabeli tiap halaman: portal login, konsol admin, atau situs yang terparkir.' },
          { icon: ServerCog, title: 'Shadow IT terlihat', body: 'Penyedia hosting dan bucket cloud lintas vendor, dalam satu inventaris.' },
        ],
      },
      {
        id: 'assess',
        name: 'Assess',
        question: 'Di mana kita lemah?',
        short: 'Temukan celah yang mengundang serangan',
        head: 'Lihat celah yang mengundang serangan.',
        body: 'Sebagian besar insiden memakai kelemahan yang sudah publik. Craton memeriksa setiap aset untuk kelemahan yang pertama dicari penyerang.',
        items: [
          { icon: Unplug, title: 'Subdomain takeover', body: 'Record DNS yang menunjuk ke aplikasi cloud yang sudah dihapus dan bisa diklaim siapa saja.' },
          { icon: Cloud, title: 'Penyimpanan cloud publik', body: 'Bucket yang menampilkan daftar filenya ke seluruh internet, diperiksa tanpa membaca isinya.' },
          { icon: Code2, title: 'Kode dan rahasia bocor', body: 'Kredensial dan konfigurasi internal di repositori publik.' },
          { icon: Mail, title: 'Pemalsuan email', body: 'Pengaturan SPF dan DMARC yang membuat pihak lain bisa mengirim email atas nama domain Anda.' },
          { icon: Bug, title: 'Kerentanan yang diketahui', body: 'CVE per layanan, dengan penanda CISA KEV dan probabilitas eksploitasi.' },
        ],
      },
      {
        id: 'prioritise',
        name: 'Prioritise',
        question: 'Apa yang diperbaiki dulu?',
        short: 'Putus jalur serangan lebih dulu',
        head: 'Perbaiki satu hal yang paling penting dulu.',
        body: 'Daftar temuan yang panjang bukan rencana. Craton merangkai temuan menjadi jalur serangan, sehingga upaya tertuju pada titik yang memutus rute.',
        items: [
          { icon: Route, title: 'Jalur serangan', body: 'Rute pembobolan yang realistis, masing-masing dengan satu titik putus.' },
          { icon: Crosshair, title: 'Analisis eksploitabilitas', body: 'Penjelasan konseptual dan pemeriksaan aman untuk mengonfirmasi temuan. Tidak ada yang dieksploitasi.' },
          { icon: FileText, title: 'Laporan eksekutif', body: 'Skor, ringkasan, dan tiga perbaikan terpenting, dalam Bahasa Indonesia atau Inggris.' },
        ],
      },
      {
        id: 'monitor',
        name: 'Monitor',
        question: 'Apa yang berubah, dan apakah perbaikan bertahan?',
        short: 'Tangkap perubahan, buktikan perbaikan',
        head: 'Terus pantau, dan buktikan perbaikan bertahan.',
        body: 'Permukaan serangan Anda bergerak setiap kali ada situs baru atau vendor menambah record. Craton memindai ulang, membandingkan, dan menyimpan catatannya.',
        items: [
          { icon: CalendarClock, title: 'Pemantauan harian', body: 'Pemindaian ulang terjadwal membandingkan setiap hasil dengan sebelumnya.' },
          { icon: History, title: 'Linimasa perubahan', body: 'Host baru, layanan terbuka baru, dan temuan baru, berurutan.' },
          { icon: BellRing, title: 'Peringatan', body: 'Perubahan berseverity tinggi dikirim ke Slack, Teams, atau webhook apa pun.' },
          { icon: RefreshCw, title: 'Verifikasi dengan pindai ulang', body: 'Jalankan pemindaian yang sama lagi dan lihat temuan yang sudah ditutup menghilang.' },
          { icon: FileCheck, title: 'Bukti siap cetak', body: 'Laporan bertanggal untuk audit, dewan, dan akuntabilitas UU PDP.' },
        ],
      },
    ] satisfies Omit<Fn, 'icon'>[],
    briefTitle: 'Yang dilihat pimpinan setelah satu pemindaian.',
    briefLead: 'Skor yang bergerak, ringkasan dengan bahasa sederhana, tiga perbaikan terpenting, dan rute yang akan diambil penyerang. Dalam Bahasa Indonesia atau Inggris.',
    preview: {
      scanned: 'Dipindai hari ini · 27 host aktif',
      score: 'Skor Eksposur',
      grade: 'Eksposur tinggi',
      found: 'Temuan Kami',
      foundText: 'Aplikasi cloud yang sudah dihapus masih berada di balik careers.company.co.id, dan repositori publik menyimpan kredensial staging yang mengarah ke ERP.',
      fixes: 'Perbaiki Ini Dulu',
      fixList: ['Hapus tiga record DNS yang menggantung', 'Ganti kredensial staging yang bocor', 'Tutup konsol Kibana yang terbuka'],
      path: 'Jalur Serangan Paling Mungkin',
      nodes: ['Dokumentasi API publik', 'Kredensial staging', 'Data ERP'],
      breakHere: 'Putus di sini',
    },
    leadersTitle: 'Untuk setiap kursi di meja pimpinan',
    leaders: [
      { icon: Briefcase, role: 'CEO dan Dewan', head: 'Satu skor, satu halaman, tiga keputusan.', points: ['Skor eksposur dengan tren sejak pemindaian terakhir', 'Ringkasan risiko dalam bahasa sederhana', 'Laporan eksekutif siap cetak, Indonesia atau Inggris'] },
      { icon: ShieldCheck, role: 'CISO', head: 'Jalur serangan, dan satu perbaikan yang memutusnya.', points: ['Temuan dirangkai menjadi rute pembobolan yang realistis', 'Satu titik putus per jalur, agar upaya tepat sasaran', 'CVE yang sedang dieksploitasi ditandai dari CISA KEV'] },
      { icon: Cpu, role: 'CTO', head: 'Setiap sistem terekspos, dengan bukti dan perbaikan.', points: ['Subdomain, hosting, port terbuka, dan TLS per host', 'Subdomain takeover dan rahasia bocor di kode publik', 'Tangkapan layar yang menunjukkan isi setiap halaman'] },
      { icon: ServerCog, role: 'CIO', head: 'Shadow IT terlihat, dan tetap terpantau.', points: ['Penyedia hosting dan bucket cloud lintas vendor', 'Pemantauan harian dengan peringatan saat ada yang baru', 'Riwayat perubahan permukaan serangan dari waktu ke waktu'] },
    ],
    trustTitle: 'Pasif sejak dirancang',
    trustLead: 'Craton hanya melihat apa yang sudah dapat dilihat siapa pun di internet. Craton tidak pernah menyerang, login, atau mengunduh data Anda.',
    does: 'Yang Craton Lakukan',
    doesList: [
      'Membaca log sertifikat publik, DNS, dan data pemindaian internet Shodan yang sudah ada',
      'Mengirim permintaan web biasa ke halaman publik Anda, seperti pengunjung',
      'Memeriksa apakah penyimpanan cloud dapat diakses publik, tanpa membaca file',
      'Menyamarkan rahasia di memori sebelum disimpan atau dikirim ke AI',
      'Mewajibkan otorisasi untuk setiap pemindaian dan mencatat siapa yang menjalankannya',
    ],
    never: 'Yang Tidak Pernah Craton Lakukan',
    neverList: ['Pemindaian port atau brute force', 'Fuzzing direktori', 'Credential stuffing atau percobaan login', 'Mengeksploitasi kerentanan', 'Mengunduh file dari penyimpanan Anda'],
    finalTitle: 'Ketahui eksposur Anda sebelum rapat dewan berikutnya.',
    finalBody: 'Pindai domain Anda sendiri dan dapatkan laporan yang bisa langsung ditindaklanjuti pimpinan hari ini.',
    invite: 'Akses melalui undangan untuk tim keamanan yang berwenang.',
    footer: 'Manajemen permukaan serangan eksternal',
    complianceLink: 'Panduan kepatuhan Indonesia',
  },
};


const LOG = [
  ['00:00.4', 'ct-logs', '44 names under company.co.id'],
  ['00:03.1', 'dns', '27 resolve · 3 CNAMEs point at deleted cloud apps'],
  ['00:21.8', 'http', '19 live · 9 login pages · 2 consoles without auth'],
  ['00:34.2', 'intel', 'CVE-2021-41773 on hris · actively exploited (CISA KEV)'],
  ['00:41.0', 'code', 'staging credentials in a public repository'],
  ['00:58.6', 'triage', '3 attack paths · 3 choke points · brief ready'],
];

/** Section label: Title Case, readable size. */
function Label({ children, icon: Icon }: { children: React.ReactNode; icon?: LucideIcon }) {
  return (
    <p className="flex items-center gap-2.5 text-[15px] font-medium text-muted">
      {Icon && <Icon className="size-4 text-ink" strokeWidth={1.5} aria-hidden />}
      {children}
    </p>
  );
}

function Band({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn('scroll-mt-14 border-t border-line px-5 sm:px-8', className)}>
      <div className="mx-auto max-w-[1280px]">{children}</div>
    </section>
  );
}

const btn = 'inline-flex h-12 items-center gap-3 px-6 text-[15px] font-medium transition-colors';
const h2 = 'text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[56px]';
const sub = 'text-sm font-medium text-muted';

/**
 * Section header. It reuses the column template of the content below it, so the lead paragraph starts exactly
 * where the last column of that content starts. The headline spans the columns before it. The lead is nudged
 * so its first line is centred on the headline's first line.
 */
function Head({ title, lead, cols, gap = 'lg:gap-x-10', indent = '', children }: { title: string; lead?: string; cols: string; gap?: string; indent?: string; children?: React.ReactNode }) {
  return (
    <div className={cn('mt-8 grid gap-6', cols, gap)}>
      <h2 className={cn(h2, 'lg:col-[1/-2]')}>{title}</h2>
      {(lead || children) && (
        <div className={cn('lg:col-[-2/-1] lg:pt-[15px]', indent)}>
          {lead && <p className="max-w-[48ch] text-[17px] leading-7 text-muted">{lead}</p>}
          {children}
        </div>
      )}
    </div>
  );
}

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
          <p className={sub}>{c.preview.score}</p>
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
        <p className={sub}>{c.preview.found}</p>
        <p className="mt-4 text-[17px] leading-7">{c.preview.foundText}</p>
        <p className={cn(sub, 'mt-8')}>{c.preview.fixes}</p>
        <ol className="mt-4 flex flex-col">
          {c.preview.fixList.map((f) => (
            <li key={f} className="border-t border-line py-3 text-sm">
              {f}
            </li>
          ))}
        </ol>
      </div>
      <div className="p-6">
        <p className={sub}>{c.preview.path}</p>
        <ol className="mt-6 flex flex-col">
          {c.preview.nodes.map((n, i) => (
            <li key={n} className="relative flex gap-4 pb-8 last:pb-0">
              {i < c.preview.nodes.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-line" aria-hidden />}
              <span className={cn('relative mt-1.5 size-[11px] shrink-0 border', i === 1 ? 'border-ok bg-ok' : 'border-muted bg-bg')} />
              <div>
                <p className={cn('text-[15px]', i === 1 && 'font-semibold')}>{n}</p>
                {i === 1 && <p className="mt-1 text-sm font-medium text-ok">{c.preview.breakHere}</p>}
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

  return (
    <div className="min-h-dvh bg-bg text-ink antialiased">
      {/* The landing sections pad outside a 1280px content box, so the chrome is 64px wider to line up with it. */}
      <SiteHeader lang={lang} setLang={setLang} onLanding />

      <main>
        {/* Hero: type-led, with the five framework functions as the base line */}
        <section className="flex min-h-[100svh] flex-col px-5 pt-14 sm:px-8">
          <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-center py-10">
            <Label>{c.kicker}</Label>
            <h1 className="mt-6 max-w-[20ch] text-[44px] font-semibold leading-[0.98] tracking-[-0.035em] sm:text-[64px] lg:text-[84px]">{c.h1}</h1>
            <p className="mt-6 max-w-[62ch] text-[17px] leading-7 text-muted sm:text-lg sm:leading-8">{c.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className={cn(btn, 'bg-ink text-bg hover:bg-white')}>
                {c.ctaPrimary}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <a href="#framework" className={cn(btn, 'border border-line text-ink hover:border-muted')}>
                {c.ctaSecondary}
              </a>
            </div>
            <a href="#easm" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:no-underline">
              {c.easmGuide}
              <ArrowRight className="size-3.5" aria-hidden />
            </a>
            <ul className="mt-5 flex flex-wrap gap-x-7 gap-y-2.5 text-sm text-muted">
              {c.proof.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <Check className="size-4 text-ink" strokeWidth={1.5} aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <nav aria-label="EASM stages" className="mx-auto grid w-full max-w-[1280px] border-t border-line lg:grid-cols-5">
            {c.fns.map((f, i) => {
              const Icon = FN_ICON[f.id];
              return (
                <a key={f.id} href={`#${f.id}`} className={cn('group flex items-start gap-4 py-5 transition-colors hover:bg-panel max-lg:border-b max-lg:border-line lg:flex-col lg:gap-3 lg:py-6 lg:pr-5', i > 0 && 'lg:border-l lg:border-line lg:pl-6')}>
                  <Icon className="size-6 shrink-0 text-ink" strokeWidth={1.25} aria-hidden />
                  <span>
                    <span className="block text-base font-semibold">{f.name}</span>
                    <span className="mt-0.5 block text-sm leading-5 text-muted">{f.short}</span>
                  </span>
                </a>
              );
            })}
          </nav>
        </section>

        {/* Scan log */}
        <Band className="bg-panel py-10">
          <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
            <p className="text-[15px] font-medium text-muted">{c.labels.log}</p>
            <ol className="font-mono text-[13px] leading-7">
              {LOG.map(([time, src, msg]) => (
                <li key={time} className="grid grid-cols-[72px_80px_minmax(0,1fr)] gap-3 sm:grid-cols-[88px_96px_minmax(0,1fr)]">
                  <span className="text-muted">{time}</span>
                  <span className="text-muted">{src}</span>
                  <span className={cn('truncate', msg.includes('KEV') || msg.includes('credentials') ? 'text-crit' : msg.includes('ready') ? 'text-ok' : '')}>{msg}</span>
                </li>
              ))}
            </ol>
          </div>
        </Band>

        {/* What is EASM */}
        <Band id="easm" className="py-24 sm:py-32">
          <Label icon={Telescope}>{c.easm.label}</Label>
          <Head title={c.easm.title} lead={c.easm.lead} cols="lg:grid-cols-[240px_minmax(0,1fr)_minmax(0,1.25fr)]" />
          <div className="mt-16 grid border-t border-line md:grid-cols-3">
            {c.easm.points.map((p, i) => (
              <div key={p.title} className={cn('py-8 md:pr-8', i > 0 && 'border-t border-line md:border-l md:border-t-0 md:pl-8')}>
                <h3 className="flex items-center gap-3 text-[28px] font-semibold leading-8 tracking-[-0.02em]">
                  <p.icon className="size-6 shrink-0 text-ink" strokeWidth={1.25} aria-hidden />
                  {p.title}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-muted">{p.body}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-4 border-y border-line bg-panel px-6 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <p className="max-w-[70ch] text-[15px] leading-7 text-muted">
              <span className="font-semibold text-ink">{c.easm.notTitle}</span> {c.easm.notBody}
            </p>
            <a href="#framework" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium underline underline-offset-4 hover:no-underline">
              {c.easm.link}
              <ArrowRight className="size-3.5" aria-hidden />
            </a>
          </div>

          <h3 className="mt-20 text-[28px] font-semibold leading-8 tracking-[-0.02em]">{c.easm.findsTitle}</h3>
          <ul className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2">
            {c.easm.finds.map((f) => (
              <li key={f.title} className="flex gap-4 bg-bg p-6">
                <f.icon className="mt-0.5 size-6 shrink-0 text-ink" strokeWidth={1.25} aria-hidden />
                <div>
                  <p className="text-[17px] font-semibold leading-6">{f.title}</p>
                  <p className="mt-1.5 text-[15px] leading-7 text-muted">{f.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <h3 className="mt-20 text-[28px] font-semibold leading-8 tracking-[-0.02em]">{c.easm.fitTitle}</h3>
          <p className="mt-3 max-w-[64ch] text-[15px] leading-7 text-muted">{c.easm.fitLead}</p>
          <div className="mt-6 overflow-x-auto border border-line">
            <table className="w-full min-w-[620px] border-collapse text-left text-[15px] leading-6">
              <thead>
                <tr className="border-b border-line bg-panel">
                  {c.easm.fitCols.map((h) => (
                    <th key={h} scope="col" className="px-5 py-3.5 text-sm font-medium text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {c.easm.fitRows.map((r, i) => (
                  <tr key={r[0]} className={cn('border-b border-line last:border-b-0', i === c.easm.fitRows.length - 1 && 'bg-panel')}>
                    {r.map((cell, j) => (
                      <td key={j} className={cn('px-5 py-4 align-top', j === 0 ? 'font-semibold text-ink' : i === c.easm.fitRows.length - 1 ? 'text-ink' : 'text-muted')}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Band>

        {/* Problem */}
        <Band className="py-24 sm:py-32">
          <Label>{c.labels.problem}</Label>
          <h2 className={cn(h2, 'mt-8')}>{c.problemTitle}</h2>
          <div className="mt-16 grid border-t border-line md:grid-cols-3">
            {c.problems.map((p, i) => (
              <div key={p.title} className={cn('py-8 md:pr-8', i > 0 && 'border-t border-line md:border-l md:border-t-0 md:pl-8')}>
                <p.icon className="size-7 text-ink" strokeWidth={1.25} aria-hidden />
                <h3 className="mt-6 text-xl font-semibold leading-7">{p.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </Band>

        {/* Framework: the five EASM lifecycle stages */}
        <Band id="framework" className="py-24 sm:py-32">
          <Label icon={ShieldCheck}>{c.labels.framework}</Label>
          <Head title={c.frameworkTitle} lead={c.frameworkLead} cols="lg:grid-cols-[240px_minmax(0,1fr)_minmax(0,1.25fr)]" />

          <div className="mt-16 border-b border-line">
            {c.fns.map((f, n) => {
              const Icon = FN_ICON[f.id];
              return (
                <article key={f.id} id={f.id} className="grid scroll-mt-14 gap-x-10 gap-y-6 border-t border-line py-10 lg:grid-cols-[240px_minmax(0,1fr)_minmax(0,1.25fr)]">
                  <div>
                    <div className="flex h-8 items-center gap-3">
                      <Icon className="size-7 shrink-0 text-ink" strokeWidth={1.25} aria-hidden />
                      <h3 className="text-[28px] font-semibold leading-8 tracking-[-0.02em]">{f.name}</h3>
                    </div>
                    <p className="mt-1.5 text-sm text-muted lg:pl-10">{f.question}</p>
                  </div>
                  <div>
                    <p className="text-[22px] font-semibold leading-8 tracking-[-0.015em]">{f.head}</p>
                    <p className="mt-3 text-[15px] leading-7 text-muted">{f.body}</p>
                  </div>
                  <ul className="flex flex-col lg:-mt-0">
                    {f.items.map((it, i) => (
                      <li key={it.title} className={cn('flex gap-4 py-4', i === 0 ? 'lg:pt-1' : 'border-t border-line')}>
                        <it.icon className="mt-0.5 size-5 shrink-0 text-ink" strokeWidth={1.5} aria-hidden />
                        <div>
                          <p className="text-[15px] font-medium leading-6">{it.title}</p>
                          <p className="mt-0.5 text-sm leading-6 text-muted">{it.body}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
          <p className="mt-6 max-w-[80ch] text-[13px] leading-5 text-muted">{c.frameworkNote}</p>
        </Band>

        {/* The brief */}
        <Band id="brief" className="py-24 sm:py-32">
          <Label icon={FileText}>{c.labels.brief}</Label>
          <Head title={c.briefTitle} lead={c.briefLead} cols="lg:grid-cols-[280px_minmax(0,1fr)_minmax(0,1fr)]" gap="" indent="lg:pl-6" />
          <div className="mt-16">
            <BriefPreview c={c} />
          </div>
        </Band>

        {/* Leaders */}
        <Band id="leaders" className="py-24 sm:py-32">
          <Label icon={Briefcase}>{c.labels.leaders}</Label>
          <h2 className={cn(h2, 'mt-8')}>{c.leadersTitle}</h2>
          <div className="mt-16 border-b border-line">
            {c.leaders.map((l) => (
              <article key={l.role} className="grid items-start gap-4 border-t border-line py-10 lg:grid-cols-[240px_minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-10">
                <p className="flex h-8 items-center gap-3 text-base font-medium">
                  <l.icon className="size-6 shrink-0 text-ink" strokeWidth={1.25} aria-hidden />
                  {l.role}
                </p>
                <h3 className="text-[26px] font-semibold leading-8 tracking-[-0.02em]">{l.head}</h3>
                <ul className="flex flex-col gap-2 lg:pt-1">
                  {l.points.map((p) => (
                    <li key={p} className="flex gap-3 text-[15px] leading-6 text-muted">
                      <Check className="mt-1 size-4 shrink-0 text-ink" strokeWidth={1.5} aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Band>

        {/* Trust */}
        <Band id="trust" className="py-24 sm:py-32">
          <Label icon={ShieldCheck}>{c.labels.trust}</Label>
          <Head title={c.trustTitle} lead={c.trustLead} cols="lg:grid-cols-2" gap="" indent="lg:pl-10" />
          <div className="mt-16 grid gap-px border border-line bg-line lg:grid-cols-2">
            {[
              { title: c.does, items: c.doesList, icon: Check, color: 'text-ok' },
              { title: c.never, items: c.neverList, icon: Ban, color: 'text-crit' },
            ].map((col) => (
              <div key={col.title} className="bg-bg p-7 sm:p-10">
                <h3 className="text-base font-semibold">{col.title}</h3>
                <ul className="mt-6 flex flex-col">
                  {col.items.map((d) => (
                    <li key={d} className="flex gap-4 border-t border-line py-4 text-[15px] leading-6">
                      <col.icon className={cn('mt-0.5 size-5 shrink-0', col.color)} strokeWidth={1.5} aria-hidden />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Band>

        {/* FAQ */}
        <Band id="faq" className="py-24 sm:py-32">
          <Label>{c.faq.label}</Label>
          <h2 className={cn(h2, 'mt-8 max-w-[18ch]')}>{c.faq.title}</h2>
          <div className="mt-16 max-w-[900px] border-b border-line">
            {LANDING_FAQ[lang].map((f) => (
              <details key={f.q} className="group border-t border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[19px] font-semibold leading-7 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Plus className="size-5 shrink-0 text-muted transition-transform group-open:rotate-45" strokeWidth={1.5} aria-hidden />
                </summary>
                <p className="max-w-[70ch] pb-6 text-[16px] leading-7 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
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

      <SiteFooter lang={lang} inner="max-w-[1344px]" />
    </div>
  );
}
