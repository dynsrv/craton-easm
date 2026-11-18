/** Copy for the public EASM guide (/easm). English first, Bahasa Indonesia second, same shape. */

export const EASM_STAGES = ['discover', 'classify', 'assess', 'prioritise', 'monitor'] as const;
export type EasmStage = (typeof EASM_STAGES)[number];

export const NIST_CSF_URL = 'https://www.nist.gov/cyberframework';

interface Stage {
  name: string;
  question: string;
  what: string;
  craton: string[];
}

const EN = {
  meta: {
    title: 'What is external attack surface management (EASM)?',
    description:
      'EASM is the continuous practice of finding, classifying, assessing and prioritising everything your organisation exposes to the internet. What it is, the five-stage lifecycle, how it differs from vulnerability scanning and how Craton runs it.',
  },
  ui: { onPage: 'On this page', guide: 'EASM guide', cta: 'Sign in to run a scan', compliance: 'Indonesian compliance guide', toLanding: 'Back to the overview', craton: 'How Craton does it', note: 'Note' },
  kicker: 'Guide',
  h1: 'What is external attack surface management?',
  lead: 'External attack surface management (EASM) is the continuous practice of finding everything your organisation exposes to the internet, working out what each thing is, judging which exposures matter, and watching for change. It looks at your company from the outside, the way an attacker does, so it finds what your asset register does not list.',
  toc: [
    ['definition', 'The short version'],
    ['why', 'Why it matters'],
    ['lifecycle', 'The EASM lifecycle'],
    ['compare', 'EASM and other tools'],
    ['passive', 'Passive and outside-in'],
    ['standards', 'EASM and standards'],
    ['indonesia', 'EASM and Indonesian rules'],
    ['faq', 'Common questions'],
  ] as [string, string][],
  definition: {
    h: 'The short version',
    p: [
      'Your external attack surface is every internet-facing asset that an attacker could find and probe. That includes domains and subdomains, IP addresses, web applications and APIs, TLS certificates, cloud storage, DNS and email settings, public code repositories and anything a vendor hosts on your behalf.',
      'EASM keeps answering three questions: what do we expose, where are we weak, and what changed since last time? The word “external” matters. The starting point is not a list of systems you already know, but what the internet can see.',
    ],
    chipsTitle: 'What counts as external attack surface',
    chips: ['Domains and subdomains', 'IP addresses and open services', 'Web apps and APIs', 'Certificates and TLS', 'Cloud storage', 'DNS and email records', 'Public code repositories', 'Vendor-hosted assets'],
  },
  why: {
    h: 'Why it matters',
    items: [
      { t: 'The surface grows without a ticket', b: 'Teams launch microsites, staging servers and cloud apps faster than any register is updated. Acquisitions and vendors add more.' },
      { t: 'Attackers start outside', b: 'Reconnaissance from public data is cheap and usually the first step of an intrusion. If you do not look at what they see, they see it first.' },
      { t: 'Forgotten assets are the easy ones', b: 'DNS records that point to deleted cloud apps, old staging servers and credentials left in public code are all found without breaking in.' },
      { t: 'Accountability is rising', b: 'Boards, auditors and regulators expect you to know your exposure and to show it is going down over time.' },
    ],
  },
  lifecycle: {
    h: 'The EASM lifecycle',
    lead: 'Vendors word it differently, but the work falls into five stages that repeat. Craton covers each one, from one domain name.',
    stages: {
      discover: {
        name: 'Discover',
        question: 'What do we expose?',
        what: 'Build the list an attacker would build. Start from a few seeds, such as your main domain, and expand through certificate transparency logs, DNS and other public sources to find subdomains, hosts and related assets you did not know about.',
        craton: ['Starts from one domain name, with no agent and no access', 'Reads public certificate logs, DNS and existing internet scan data', 'Makes ordinary web requests, like a visitor, to tell live hosts from dead names'],
      },
      classify: {
        name: 'Classify',
        question: 'What is each thing?',
        what: 'Turn names into an inventory. For each asset, record what it is, where it is hosted, what technology it runs and what it is for, so it can be given an owner and a business context.',
        craton: ['Hosting provider, open services, technology and TLS for every live host', 'Screenshots and AI label each page: login portal, admin console or parked site', 'Cloud buckets and vendor-hosted assets sit in the same inventory'],
      },
      assess: {
        name: 'Assess',
        question: 'Where are we weak?',
        what: 'Check each asset for the weaknesses attackers look for first. Work from the outside, with evidence you can verify rather than assumptions.',
        craton: ['Subdomain takeover, public cloud storage, leaked code and secrets, and email spoofing (SPF and DMARC)', 'Known vulnerabilities per service, with CISA KEV and exploit-probability flags', 'Secrets are redacted in memory before anything is stored or sent to AI'],
      },
      prioritise: {
        name: 'Prioritise',
        question: 'What do we fix first?',
        what: 'A long findings list is not a plan. Rank exposure by how likely it is to be abused and what it would cost, and look for the single change that removes the most risk.',
        craton: ['Findings chained into attack paths, each with one choke point to cut', 'Exploitability analysis: a conceptual walk-through and safe checks, with nothing exploited', 'An exposure score and an executive brief in English and Bahasa Indonesia'],
      },
      monitor: {
        name: 'Monitor',
        question: 'What changed, and did the fix hold?',
        what: 'Run the cycle again on a schedule. Compare with the last result, alert on change, and rescan after a fix to prove it worked. Then keep the record.',
        craton: ['Daily monitoring and a drift timeline of new hosts, services and findings', 'Alerts to Slack, Teams or any webhook for high-severity changes', 'Rescans to verify fixes, and dated printable evidence for audit and the board'],
      },
    } as Record<EasmStage, Stage>,
    remediation: 'Where does fixing fit? Remediation is your team’s job, and it sits between Prioritise and Monitor. EASM tells you where to act and then checks that it worked. Craton never changes your systems.',
  },
  compare: {
    h: 'EASM and other tools',
    lead: 'These approaches complement each other. The differences below are typical, and individual products vary.',
    cols: ['Approach', 'Starting point', 'Finds assets you did not list', 'Cadence', 'Touches your systems'],
    rows: [
      ['Vulnerability scanner', 'The hosts you give it', 'No', 'Scheduled', 'Yes, often with credentials'],
      ['Penetration test', 'An agreed scope', 'Rarely', 'Point in time, manual', 'Yes'],
      ['CAASM (internal asset management)', 'Your internal tools, through integrations', 'Only what those tools already know', 'Continuous', 'Reads your tools through APIs'],
      ['EASM', 'One domain name', 'Yes', 'Continuous', 'No, passive'],
    ],
  },
  passive: {
    h: 'Passive and outside-in',
    p: [
      'Craton looks at what anyone on the internet can already see. It reads public records, makes ordinary web requests and checks whether cloud storage answers publicly without reading files. It does not port scan, brute force, fuzz directories, attempt logins or exploit anything.',
      'Every scan needs an authorisation confirmation, and Craton records who ran it. Scan only domains you are authorised to assess.',
    ],
    link: 'See what Craton does and never does',
  },
  standards: {
    h: 'EASM and standards',
    p: [
      'EASM is a practice, not a standard, so it is not certified against anything. It does produce the evidence that several frameworks ask for. Version 2.0 of the NIST Cybersecurity Framework, published in 2024, has six functions: Govern, Identify, Protect, Detect, Respond and Recover. EASM contributes mostly to Identify, Protect and Detect.',
    ],
    cols: ['EASM stage', 'NIST CSF 2.0 function', 'Category it supports'],
    rows: [
      ['Discover and Classify', 'Identify', 'Asset management'],
      ['Assess and Prioritise', 'Identify, Protect', 'Risk assessment, and safeguards that close the gap'],
      ['Monitor', 'Detect', 'Continuous monitoring'],
    ],
    after: 'In its reports, Craton maps each finding type to NIST CSF categories and ISO/IEC 27001:2022 Annex A controls. Craton is independent and is not endorsed or certified by NIST or ISO.',
    link: 'NIST Cybersecurity Framework',
  },
  indonesia: {
    h: 'EASM and Indonesian rules',
    p: [
      'Depending on your sector, the Personal Data Protection Law (UU PDP), PP 71/2019, and rules from OJK, Bank Indonesia and BSSN expect you to protect systems that handle personal data and critical services. Knowing what is exposed, and showing that it is shrinking, is evidence of that effort.',
      'Our compliance guide explains these duties in plain language, with links to the sources and how Craton findings relate to them. It is information, not legal advice.',
    ],
    link: 'Indonesian compliance guide',
  },
  faq: {
    h: 'Common questions',
    items: [
      { q: 'Is EASM the same as vulnerability scanning?', a: 'No. A vulnerability scanner checks the systems you point it at. EASM first finds which systems you have, including the ones nobody listed, and then checks them from the outside. The two work well together.' },
      { q: 'Does it touch our systems?', a: 'Craton is passive. It reads public records and makes ordinary web requests, like a visitor. It never scans ports, brute forces, logs in or exploits a vulnerability.' },
      { q: 'Who should run it?', a: 'Security and IT teams that are authorised to assess the domain. Every scan requires an authorisation confirmation, and access is by invitation.' },
      { q: 'Does it replace a penetration test?', a: 'No. A penetration test goes deep on an agreed scope. EASM goes wide and runs continuously. Use it to find out what to test, and to check between tests.' },
      { q: 'What do I get from a scan?', a: 'An exposure score, a plain-language summary, the three fixes that matter most, attack paths with a choke point each, and an inventory of every exposed asset. It is available in English and Bahasa Indonesia and prints for audit and the board.' },
      { q: 'How often should we run it?', a: 'Continuously. A scan takes minutes, and monitoring rescans daily and compares each result with the one before, so new exposure is caught the day it appears.' },
    ],
  },
  cta: { h: 'See your own attack surface.', b: 'Run a scan on your domain and get a brief your leadership team can act on today. Access is by invitation for authorised security teams.' },
};

type Copy = typeof EN;

const ID: Copy = {
  meta: {
    title: 'Apa itu manajemen permukaan serangan eksternal (EASM)?',
    description:
      'EASM adalah praktik berkelanjutan untuk menemukan, mengklasifikasi, menilai, dan memprioritaskan semua yang diekspos organisasi Anda ke internet. Pengertian, siklus lima tahap, perbedaannya dengan pemindaian kerentanan, dan cara Craton menjalankannya.',
  },
  ui: { onPage: 'Di halaman ini', guide: 'Panduan EASM', cta: 'Masuk untuk memindai', compliance: 'Panduan kepatuhan Indonesia', toLanding: 'Kembali ke ringkasan', craton: 'Cara Craton melakukannya', note: 'Catatan' },
  kicker: 'Panduan',
  h1: 'Apa itu manajemen permukaan serangan eksternal?',
  lead: 'Manajemen permukaan serangan eksternal (EASM) adalah praktik berkelanjutan untuk menemukan semua yang diekspos organisasi Anda ke internet, memahami apa masing-masing, menilai eksposur mana yang penting, dan memantau perubahannya. EASM memandang perusahaan Anda dari luar, seperti penyerang, sehingga menemukan apa yang tidak tercatat di daftar aset Anda.',
  toc: [
    ['definition', 'Singkatnya'],
    ['why', 'Mengapa penting'],
    ['lifecycle', 'Siklus EASM'],
    ['compare', 'EASM dan alat lain'],
    ['passive', 'Pasif dan dari luar'],
    ['standards', 'EASM dan standar'],
    ['indonesia', 'EASM dan regulasi Indonesia'],
    ['faq', 'Pertanyaan umum'],
  ],
  definition: {
    h: 'Singkatnya',
    p: [
      'Permukaan serangan eksternal Anda adalah setiap aset yang terhubung ke internet dan dapat ditemukan serta diperiksa penyerang. Itu mencakup domain dan subdomain, alamat IP, aplikasi web dan API, sertifikat TLS, penyimpanan cloud, pengaturan DNS dan email, repositori kode publik, dan apa pun yang di-hosting vendor atas nama Anda.',
      'EASM terus menjawab tiga pertanyaan: apa yang kita ekspos, di mana kita lemah, dan apa yang berubah sejak terakhir kali? Kata “eksternal” itu penting. Titik awalnya bukan daftar sistem yang sudah Anda ketahui, melainkan apa yang dapat dilihat internet.',
    ],
    chipsTitle: 'Yang termasuk permukaan serangan eksternal',
    chips: ['Domain dan subdomain', 'Alamat IP dan layanan terbuka', 'Aplikasi web dan API', 'Sertifikat dan TLS', 'Penyimpanan cloud', 'Record DNS dan email', 'Repositori kode publik', 'Aset yang di-hosting vendor'],
  },
  why: {
    h: 'Mengapa penting',
    items: [
      { t: 'Permukaan tumbuh tanpa tiket', b: 'Tim meluncurkan microsite, server staging, dan aplikasi cloud lebih cepat daripada daftar aset diperbarui. Akuisisi dan vendor menambah lagi.' },
      { t: 'Penyerang mulai dari luar', b: 'Pengintaian dari data publik murah dan biasanya langkah pertama sebuah intrusi. Jika Anda tidak melihat apa yang mereka lihat, mereka melihatnya lebih dulu.' },
      { t: 'Aset terlupakan adalah yang termudah', b: 'Record DNS yang menunjuk ke aplikasi cloud yang sudah dihapus, server staging lama, dan kredensial yang tertinggal di kode publik semuanya ditemukan tanpa membobol apa pun.' },
      { t: 'Akuntabilitas meningkat', b: 'Dewan, auditor, dan regulator mengharapkan Anda mengetahui eksposur dan menunjukkan bahwa eksposur itu menurun dari waktu ke waktu.' },
    ],
  },
  lifecycle: {
    h: 'Siklus EASM',
    lead: 'Vendor memakai istilah berbeda, tetapi pekerjaannya jatuh ke dalam lima tahap yang berulang. Craton mencakup semuanya, dari satu nama domain.',
    stages: {
      discover: {
        name: 'Discover (Temukan)',
        question: 'Apa yang kita ekspos?',
        what: 'Susun daftar yang akan disusun penyerang. Mulai dari beberapa titik awal, seperti domain utama, lalu perluas lewat log transparansi sertifikat, DNS, dan sumber publik lain untuk menemukan subdomain, host, dan aset terkait yang belum Anda ketahui.',
        craton: ['Berangkat dari satu nama domain, tanpa agen dan tanpa akses', 'Membaca log sertifikat publik, DNS, dan data pemindaian internet yang sudah ada', 'Mengirim permintaan web biasa, seperti pengunjung, untuk membedakan host aktif dari nama yang sudah mati'],
      },
      classify: {
        name: 'Classify (Klasifikasi)',
        question: 'Apa masing-masing aset ini?',
        what: 'Ubah nama menjadi inventaris. Untuk setiap aset, catat apa itu, di mana di-hosting, teknologi apa yang dipakai, dan untuk apa, sehingga bisa diberi pemilik dan konteks bisnis.',
        craton: ['Penyedia hosting, layanan terbuka, teknologi, dan TLS untuk setiap host aktif', 'Tangkapan layar dan AI melabeli tiap halaman: portal login, konsol admin, atau situs terparkir', 'Bucket cloud dan aset vendor berada dalam inventaris yang sama'],
      },
      assess: {
        name: 'Assess (Nilai)',
        question: 'Di mana kita lemah?',
        what: 'Periksa setiap aset untuk kelemahan yang pertama dicari penyerang. Bekerja dari luar, dengan bukti yang dapat diverifikasi, bukan asumsi.',
        craton: ['Subdomain takeover, penyimpanan cloud publik, kode dan rahasia bocor, serta pemalsuan email (SPF dan DMARC)', 'Kerentanan yang diketahui per layanan, dengan penanda CISA KEV dan probabilitas eksploitasi', 'Rahasia disamarkan di memori sebelum disimpan atau dikirim ke AI'],
      },
      prioritise: {
        name: 'Prioritise (Prioritaskan)',
        question: 'Apa yang diperbaiki dulu?',
        what: 'Daftar temuan yang panjang bukan rencana. Urutkan eksposur berdasarkan kemungkinan disalahgunakan dan biayanya, lalu cari satu perubahan yang menghilangkan risiko terbanyak.',
        craton: ['Temuan dirangkai menjadi jalur serangan, masing-masing dengan satu titik putus', 'Analisis eksploitabilitas: penjelasan konseptual dan pemeriksaan aman, tanpa mengeksploitasi apa pun', 'Skor eksposur dan laporan eksekutif dalam Bahasa Indonesia dan Inggris'],
      },
      monitor: {
        name: 'Monitor (Pantau)',
        question: 'Apa yang berubah, dan apakah perbaikan bertahan?',
        what: 'Jalankan siklus lagi sesuai jadwal. Bandingkan dengan hasil sebelumnya, beri peringatan saat ada perubahan, dan pindai ulang setelah perbaikan untuk membuktikan hasilnya. Lalu simpan catatannya.',
        craton: ['Pemantauan harian dan linimasa perubahan untuk host, layanan, dan temuan baru', 'Peringatan ke Slack, Teams, atau webhook apa pun untuk perubahan berseverity tinggi', 'Pindai ulang untuk memverifikasi perbaikan, dan bukti bertanggal siap cetak untuk audit dan dewan'],
      },
    },
    remediation: 'Di mana posisi perbaikan? Remediasi adalah tugas tim Anda, dan letaknya di antara Prioritise dan Monitor. EASM menunjukkan di mana harus bertindak, lalu memeriksa apakah berhasil. Craton tidak pernah mengubah sistem Anda.',
  },
  compare: {
    h: 'EASM dan alat lain',
    lead: 'Pendekatan-pendekatan ini saling melengkapi. Perbedaan di bawah bersifat umum, dan tiap produk bisa berbeda.',
    cols: ['Pendekatan', 'Titik awal', 'Menemukan aset yang tidak Anda daftarkan', 'Frekuensi', 'Menyentuh sistem Anda'],
    rows: [
      ['Pemindai kerentanan', 'Host yang Anda berikan', 'Tidak', 'Terjadwal', 'Ya, sering dengan kredensial'],
      ['Uji penetrasi', 'Cakupan yang disepakati', 'Jarang', 'Sesaat, manual', 'Ya'],
      ['CAASM (manajemen aset internal)', 'Alat internal Anda, lewat integrasi', 'Hanya yang sudah diketahui alat itu', 'Berkelanjutan', 'Membaca alat Anda lewat API'],
      ['EASM', 'Satu nama domain', 'Ya', 'Berkelanjutan', 'Tidak, pasif'],
    ],
  },
  passive: {
    h: 'Pasif dan dari luar',
    p: [
      'Craton hanya melihat apa yang sudah dapat dilihat siapa pun di internet. Craton membaca catatan publik, mengirim permintaan web biasa, dan memeriksa apakah penyimpanan cloud dapat diakses publik tanpa membaca file. Craton tidak memindai port, brute force, fuzzing direktori, mencoba login, atau mengeksploitasi apa pun.',
      'Setiap pemindaian memerlukan konfirmasi otorisasi, dan Craton mencatat siapa yang menjalankannya. Pindai hanya domain yang Anda berwenang untuk menilainya.',
    ],
    link: 'Lihat yang Craton lakukan dan tidak pernah lakukan',
  },
  standards: {
    h: 'EASM dan standar',
    p: [
      'EASM adalah praktik, bukan standar, jadi tidak disertifikasi terhadap apa pun. EASM menghasilkan bukti yang diminta beberapa kerangka kerja. NIST Cybersecurity Framework versi 2.0, terbit pada 2024, memiliki enam fungsi: Govern, Identify, Protect, Detect, Respond, dan Recover. EASM terutama berkontribusi pada Identify, Protect, dan Detect.',
    ],
    cols: ['Tahap EASM', 'Fungsi NIST CSF 2.0', 'Kategori yang didukung'],
    rows: [
      ['Discover dan Classify', 'Identify', 'Manajemen aset'],
      ['Assess dan Prioritise', 'Identify, Protect', 'Penilaian risiko, dan pengamanan yang menutup celah'],
      ['Monitor', 'Detect', 'Pemantauan berkelanjutan'],
    ],
    after: 'Dalam laporannya, Craton memetakan setiap jenis temuan ke kategori NIST CSF dan kontrol ISO/IEC 27001:2022 Annex A. Craton independen dan tidak didukung atau disertifikasi oleh NIST maupun ISO.',
    link: 'NIST Cybersecurity Framework',
  },
  indonesia: {
    h: 'EASM dan regulasi Indonesia',
    p: [
      'Tergantung sektor Anda, UU Pelindungan Data Pribadi (UU PDP), PP 71/2019, serta aturan OJK, Bank Indonesia, dan BSSN mengharapkan Anda melindungi sistem yang memproses data pribadi dan layanan penting. Mengetahui apa yang terekspos, dan menunjukkan bahwa eksposur itu menyusut, adalah bukti upaya tersebut.',
      'Panduan kepatuhan kami menjelaskan kewajiban ini dengan bahasa sederhana, dengan tautan ke sumber dan kaitannya dengan temuan Craton. Ini informasi, bukan nasihat hukum.',
    ],
    link: 'Panduan kepatuhan Indonesia',
  },
  faq: {
    h: 'Pertanyaan umum',
    items: [
      { q: 'Apakah EASM sama dengan pemindaian kerentanan?', a: 'Tidak. Pemindai kerentanan memeriksa sistem yang Anda arahkan. EASM lebih dulu menemukan sistem apa yang Anda punya, termasuk yang tidak dicatat siapa pun, lalu memeriksanya dari luar. Keduanya saling melengkapi.' },
      { q: 'Apakah ini menyentuh sistem kami?', a: 'Craton bersifat pasif. Craton membaca catatan publik dan mengirim permintaan web biasa, seperti pengunjung. Craton tidak pernah memindai port, brute force, login, atau mengeksploitasi kerentanan.' },
      { q: 'Siapa yang sebaiknya menjalankannya?', a: 'Tim keamanan dan TI yang berwenang menilai domain tersebut. Setiap pemindaian memerlukan konfirmasi otorisasi, dan akses melalui undangan.' },
      { q: 'Apakah menggantikan uji penetrasi?', a: 'Tidak. Uji penetrasi menggali dalam pada cakupan yang disepakati. EASM menjangkau luas dan berjalan terus-menerus. Gunakan untuk mengetahui apa yang perlu diuji, dan untuk memeriksa di antara dua pengujian.' },
      { q: 'Apa yang saya dapat dari satu pemindaian?', a: 'Skor eksposur, ringkasan dengan bahasa sederhana, tiga perbaikan terpenting, jalur serangan dengan satu titik putus masing-masing, dan inventaris setiap aset terekspos. Tersedia dalam Bahasa Indonesia dan Inggris, dan bisa dicetak untuk audit dan dewan.' },
      { q: 'Seberapa sering sebaiknya dijalankan?', a: 'Terus-menerus. Satu pemindaian hanya butuh hitungan menit, dan pemantauan memindai ulang setiap hari serta membandingkan tiap hasil dengan sebelumnya, sehingga eksposur baru tertangkap di hari yang sama.' },
    ],
  },
  cta: { h: 'Lihat permukaan serangan Anda sendiri.', b: 'Pindai domain Anda dan dapatkan laporan yang bisa langsung ditindaklanjuti pimpinan hari ini. Akses melalui undangan untuk tim keamanan yang berwenang.' },
};

export const EASM_COPY = { en: EN, id: ID } as const;
