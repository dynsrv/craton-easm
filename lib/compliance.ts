// Kept free of Node imports so client components can use it too.
import { SENSITIVE_PORTS } from './ports';
import type { Bilingual, Lang, ScanDTO, Severity } from './types';

/**
 * Indonesian regulations and standards that bear on a company's external attack surface,
 * and how each Craton finding type relates to them.
 *
 * Scope and honesty rules for this file:
 *  - Craton sees only what is public from the outside. A finding is an *indicator* that may
 *    be relevant to a duty; it is never a statement that a company has breached a law.
 *  - Article numbers are given only where the text was checked against a published source.
 *    Everything else is described by topic.
 *  - This is general information, not legal advice. Always check the official text.
 */

export type Sector = 'any' | 'bank' | 'payments' | 'finance' | 'cii';

export interface RegRef {
  label: string;
  url: string;
  /** Primary = the issuing body or an official gazette; secondary = law-firm or press summary. */
  kind: 'official' | 'secondary';
}

export interface Regulation {
  id: string;
  /** Short name used in tags and tables. */
  short: string;
  title: Bilingual;
  issuer: string;
  type: 'law' | 'government' | 'presidential' | 'regulator' | 'standard';
  /** Date or period as published, in words, so it stays true when read next year. */
  dated: Bilingual;
  sectors: Sector[];
  /** One sentence for an executive. */
  gist: Bilingual;
  /** What it asks of the organisation that relates to the external surface. */
  points: Bilingual[];
  /** Plain note on how new it is or what to double check. */
  note?: Bilingual;
  refs: RegRef[];
}

export const SECTORS: { id: Sector; label: Bilingual; hint: Bilingual }[] = [
  { id: 'any', label: { en: 'Any organisation', id: 'Semua organisasi' }, hint: { en: 'Anyone who handles personal data or runs an electronic system', id: 'Siapa pun yang mengelola data pribadi atau sistem elektronik' } },
  { id: 'bank', label: { en: 'Commercial bank', id: 'Bank umum' }, hint: { en: 'Licensed commercial banks, conventional and sharia', id: 'Bank umum berizin, konvensional dan syariah' } },
  { id: 'payments', label: { en: 'Payments and fintech', id: 'Pembayaran dan fintech' }, hint: { en: 'Payment service providers and infrastructure under Bank Indonesia', id: 'Penyedia jasa dan infrastruktur pembayaran di bawah Bank Indonesia' } },
  { id: 'finance', label: { en: 'Financial services', id: 'Jasa keuangan' }, hint: { en: 'Other OJK-regulated providers, such as lenders and insurers', id: 'Pelaku usaha jasa keuangan lain yang diawasi OJK' } },
  { id: 'cii', label: { en: 'Vital infrastructure', id: 'Infrastruktur vital' }, hint: { en: 'Operators designated as vital information infrastructure', id: 'Penyelenggara yang ditetapkan sebagai infrastruktur informasi vital' } },
];

/** True when a rule applies to a sector. Rules marked for everyone always apply. */
export const appliesTo = (r: Regulation, sector: Sector): boolean => r.sectors.includes('any') || r.sectors.includes(sector);

export const REGULATIONS: Regulation[] = [
  {
    id: 'uu-pdp',
    short: 'UU PDP',
    title: { en: 'Law No. 27 of 2022 on Personal Data Protection', id: 'Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi' },
    issuer: 'DPR / Pemerintah RI',
    type: 'law',
    dated: { en: 'Signed 17 October 2022', id: 'Ditandatangani 17 Oktober 2022' },
    sectors: ['any'],
    gist: {
      en: 'Anyone who decides how personal data is processed must protect it, stop unauthorised access, and tell people and the authority when protection fails.',
      id: 'Siapa pun yang menentukan pemrosesan data pribadi wajib melindunginya, mencegah akses tidak sah, dan memberi tahu subjek data serta lembaga bila pelindungan gagal.',
    },
    points: [
      { en: 'Article 35: protect and secure the data with technical and operational measures, set at a level that fits the risk.', id: 'Pasal 35: melindungi dan memastikan keamanan data dengan langkah teknis operasional, pada tingkat yang sesuai dengan risikonya.' },
      { en: 'Article 39: prevent unauthorised access, using a reliable and secure electronic system.', id: 'Pasal 39: mencegah akses tidak sah, dengan sistem keamanan yang andal, aman, dan bertanggung jawab.' },
      { en: 'Article 46: if protection fails, notify the data subjects and the authority in writing within 3 x 24 hours.', id: 'Pasal 46: bila pelindungan gagal, beri tahu subjek data dan lembaga secara tertulis paling lambat 3 x 24 jam.' },
      { en: 'Administrative fines can reach 2% of annual revenue.', id: 'Denda administratif dapat mencapai 2% dari pendapatan tahunan.' },
      { en: 'It applies outside Indonesia too, where the data belongs to Indonesian citizens.', id: 'Berlaku juga di luar Indonesia bila menyangkut data warga negara Indonesia.' },
    ],
    refs: [
      { label: 'Pasal 35', url: 'https://pasal.id/peraturan/uu/uu-no-27-tahun-2022/pasal-35', kind: 'secondary' },
      { label: 'Pasal 39', url: 'https://pasal.id/peraturan/uu/uu-no-27-tahun-2022/pasal-39', kind: 'secondary' },
      { label: 'Pasal 46', url: 'https://pasal.id/peraturan/uu/uu-no-27-tahun-2022/pasal-46', kind: 'secondary' },
    ],
  },
  {
    id: 'pp-33-2026',
    short: 'PP 33/2026',
    title: { en: 'Government Regulation No. 33 of 2026, implementing the Personal Data Protection Law', id: 'Peraturan Pemerintah No. 33 Tahun 2026, pelaksanaan UU Pelindungan Data Pribadi' },
    issuer: 'Pemerintah RI',
    type: 'government',
    dated: { en: 'Enacted 16 July 2026; reported effective 16 January 2027', id: 'Ditetapkan 16 Juli 2026; dilaporkan berlaku 16 Januari 2027' },
    sectors: ['any'],
    gist: {
      en: 'The detailed rules behind the PDP Law: records of processing, impact assessments, a data protection officer, and how the breach clock works.',
      id: 'Aturan rinci di bawah UU PDP: catatan pemrosesan, penilaian dampak, pejabat pelindungan data, dan cara kerja batas waktu notifikasi kebocoran.',
    },
    points: [
      { en: 'Keep records of processing activities and run impact assessments for higher-risk processing.', id: 'Menyimpan catatan kegiatan pemrosesan dan melakukan penilaian dampak untuk pemrosesan berisiko tinggi.' },
      { en: 'Record every incident and have written prevention and response procedures.', id: 'Mencatat setiap insiden dan memiliki prosedur pencegahan dan penanganan tertulis.' },
      { en: 'The 3 x 24 hour notice runs from when a failure is confirmed as certain, proper and reasonable, based on logs or forensic reports.', id: 'Batas 3 x 24 jam berjalan sejak kegagalan dipastikan pasti, patut, dan wajar berdasarkan dokumen seperti log atau laporan forensik.' },
      { en: 'Administrative fines up to 2% of annual revenue (reported as Article 185).', id: 'Denda administratif hingga 2% pendapatan tahunan (dilaporkan sebagai Pasal 185).' },
    ],
    note: {
      en: 'Only a law-firm summary was available when this page was written. Check the official text, especially the effective date.',
      id: 'Saat halaman ini ditulis hanya ada ringkasan kantor hukum. Periksa naskah resmi, terutama tanggal berlaku.',
    },
    refs: [{ label: 'SIP Law Firm summary', url: 'https://siplawfirm.id/resources/pp-33-2026-pelindungan-data-pribadi', kind: 'secondary' }],
  },
  {
    id: 'pp-71-2019',
    short: 'PP 71/2019',
    title: { en: 'Government Regulation No. 71 of 2019 on Electronic Systems and Transactions', id: 'Peraturan Pemerintah No. 71 Tahun 2019 tentang Penyelenggaraan Sistem dan Transaksi Elektronik' },
    issuer: 'Pemerintah RI',
    type: 'government',
    dated: { en: 'Issued 4 October 2019', id: 'Ditetapkan 4 Oktober 2019' },
    sectors: ['any'],
    gist: {
      en: 'Every electronic system operator must run procedures and tools that keep the system secure and prevent disruption, failure and loss.',
      id: 'Setiap penyelenggara sistem elektronik wajib memiliki prosedur dan sarana pengamanan agar terhindar dari gangguan, kegagalan, dan kerugian.',
    },
    points: [
      { en: 'Article 24(1)-(2): have and run security procedures, with systems that prevent and respond to threats and attacks.', id: 'Pasal 24 ayat (1)-(2): memiliki dan menjalankan prosedur pengamanan, dengan sistem pencegahan dan penanggulangan ancaman dan serangan.' },
      { en: 'Article 24(3): after a serious disruption caused by others, secure the data and report at the first opportunity to law enforcement and the relevant ministry or agency.', id: 'Pasal 24 ayat (3): bila terjadi gangguan serius akibat pihak lain, amankan data dan segera laporkan kepada aparat penegak hukum dan kementerian atau lembaga terkait.' },
    ],
    refs: [
      { label: 'Pasal 24', url: 'https://pasal.id/peraturan/pp/pp-no-71-tahun-2019/pasal-24', kind: 'secondary' },
      { label: 'Full text (Komdigi JDIH)', url: 'https://jdih.komdigi.go.id/produk_hukum/unduh/id/695/t/peraturan+pemerintah+nomor+71+tahun+2019', kind: 'official' },
    ],
  },
  {
    id: 'perpres-82-2022',
    short: 'Perpres 82/2022',
    title: { en: 'Presidential Regulation No. 82 of 2022 on Protection of Vital Information Infrastructure', id: 'Peraturan Presiden No. 82 Tahun 2022 tentang Pelindungan Infrastruktur Informasi Vital' },
    issuer: 'Presiden RI',
    type: 'presidential',
    dated: { en: 'Issued 24 May 2022', id: 'Ditetapkan 24 Mei 2022' },
    sectors: ['cii'],
    gist: {
      en: 'Operators of vital information infrastructure follow a protection framework coordinated by BSSN, with incident response teams at national, sector and organisation level.',
      id: 'Penyelenggara infrastruktur informasi vital menerapkan kerangka pelindungan yang dikoordinasikan BSSN, dengan tim tanggap insiden di tingkat nasional, sektoral, dan organisasi.',
    },
    points: [
      { en: 'BSSN is the coordinator. It sets the protection framework (BSSN Regulation 8/2023) and the identification method (BSSN Regulation 7/2023).', id: 'BSSN menjadi koordinator. BSSN menetapkan kerangka pelindungan (Peraturan BSSN 8/2023) dan tata cara identifikasi (Peraturan BSSN 7/2023).' },
      { en: 'Cyber incidents are handled by response teams at national, sector and organisation level. See BSSN Regulation 1/2024 on incident management.', id: 'Insiden siber ditangani tim tanggap insiden tingkat nasional, sektoral, dan organisasi. Lihat Peraturan BSSN 1/2024 tentang pengelolaan insiden siber.' },
    ],
    note: { en: 'Applies only to operators designated as vital information infrastructure.', id: 'Hanya berlaku bagi penyelenggara yang ditetapkan sebagai infrastruktur informasi vital.' },
    refs: [
      { label: 'Perpres 82/2022 (peraturan.go.id)', url: 'https://peraturan.go.id/files/ps82-2022.pdf', kind: 'official' },
      { label: 'BSSN Reg. 8/2023, framework', url: 'https://peraturan.bpk.go.id/Download/350553/%5BSALINAN%5D-Peraturan-BSSN-Nomor-8-Tahun-2023_signed.pdf', kind: 'official' },
      { label: 'BSSN Reg. 7/2023, identification', url: 'https://peraturan.bpk.go.id/Download/350551/%5BSALINAN%5D-Peraturan-BSSN-Nomor-7-Tahun-2023_signed.pdf', kind: 'official' },
    ],
  },
  {
    id: 'pojk-11-2022',
    short: 'POJK 11/2022',
    title: { en: 'OJK Regulation 11/POJK.03/2022 on IT Operations by Commercial Banks', id: 'POJK Nomor 11/POJK.03/2022 tentang Penyelenggaraan Teknologi Informasi oleh Bank Umum' },
    issuer: 'OJK',
    type: 'regulator',
    dated: { en: 'Promulgated 7 July 2022; in force three months later', id: 'Diundangkan 7 Juli 2022; berlaku tiga bulan kemudian' },
    sectors: ['bank'],
    gist: {
      en: 'Banks must govern IT, manage IT risk, and secure information across people, process, technology and physical environment.',
      id: 'Bank wajib menata tata kelola TI, mengelola risiko TI, dan mengamankan informasi pada aspek SDM, proses, teknologi, dan lingkungan fisik.',
    },
    points: [
      { en: 'Replaced POJK 38/2016 on IT risk management.', id: 'Menggantikan POJK 38/2016 tentang manajemen risiko TI.' },
      { en: 'Electronic systems must be placed in Indonesia unless a permitted exception applies.', id: 'Sistem elektronik wajib ditempatkan di Indonesia kecuali ada pengecualian yang diizinkan.' },
      { en: 'Covers data and personal data protection, and the use of third-party IT providers.', id: 'Mengatur pelindungan data dan data pribadi, serta penggunaan penyedia jasa TI pihak ketiga.' },
    ],
    refs: [{ label: 'POJK 11/2022 (peraturan.go.id)', url: 'https://peraturan.go.id/files/pojk11-2022.pdf', kind: 'official' }],
  },
  {
    id: 'padk-1-2026',
    short: 'PADK OJK 1/2026',
    title: { en: 'OJK Board Member Regulation No. 1 of 2026 on IT Operations by Commercial Banks', id: 'Peraturan Anggota Dewan Komisioner OJK Nomor 1 Tahun 2026 tentang Penyelenggaraan Teknologi Informasi oleh Bank Umum' },
    issuer: 'OJK',
    type: 'regulator',
    dated: { en: 'Set 23 January 2026; in force 1 March 2026', id: 'Ditetapkan 23 Januari 2026; berlaku 1 Maret 2026' },
    sectors: ['bank'],
    gist: {
      en: 'The implementing rule for POJK 11/2022. It replaces OJK Circular Letter 21/2017.',
      id: 'Ketentuan pelaksana POJK 11/2022. Menggantikan SEOJK 21/2017.',
    },
    points: [
      { en: 'Covers IT governance, architecture and strategy, IT risk management including securing information and networks, third-party IT providers, offshore placement, data and privacy, internal audit and reporting.', id: 'Mengatur tata kelola TI, arsitektur dan strategi, manajemen risiko TI termasuk pengamanan informasi dan jaringan, penyedia jasa TI, penempatan di luar negeri, data dan privasi, audit internal, dan pelaporan.' },
    ],
    refs: [{ label: 'OJK FAQ on PADK 1/2026', url: 'https://ojk.go.id/id/regulasi/Documents/Pages/PADK-1-Tahun-2026-Penyelenggaraan-Teknologi-Informasi-oleh-Bank-Umum/FAQ%20PADK%201%20Tahun%202026%20Penyelenggaraan%20Teknologi%20Informasi%20oleh%20Bank%20Umum.pdf', kind: 'official' }],
  },
  {
    id: 'seojk-29-2022',
    short: 'SEOJK 29/2022',
    title: { en: 'OJK Circular Letter 29/SEOJK.03/2022 on Cyber Resilience and Security for Commercial Banks', id: 'SEOJK Nomor 29/SEOJK.03/2022 tentang Ketahanan dan Keamanan Siber bagi Bank Umum' },
    issuer: 'OJK',
    type: 'regulator',
    dated: { en: 'Issued 27 December 2022', id: 'Diterbitkan 27 Desember 2022' },
    sectors: ['bank'],
    gist: {
      en: 'Banks must manage cyber risk, test their defences regularly, and report cyber incidents to OJK.',
      id: 'Bank wajib mengelola risiko siber, menguji pertahanan secara berkala, dan melaporkan insiden siber kepada OJK.',
    },
    points: [
      { en: 'Cyber security testing is based on vulnerability analysis and on scenarios. A bank may test itself or use a third party.', id: 'Pengujian keamanan siber berdasarkan analisis kerentanan dan skenario. Bank dapat menguji sendiri atau memakai pihak ketiga.' },
      { en: 'Banks prepare and submit cyber reports to OJK, including incident reports.', id: 'Bank menyusun dan menyampaikan laporan siber kepada OJK, termasuk laporan insiden siber.' },
    ],
    refs: [
      { label: 'SEOJK 29/2022 (ojk.go.id)', url: 'https://www.ojk.go.id/id/regulasi/Documents/Pages/Ketahanan-dan-Keamanan-Siber-Bagi-Bank-Umum/SEOJK%2029%20SEOJK.03%202022.pdf', kind: 'official' },
      { label: 'OJK summary', url: 'https://www.ojk.go.id/id/regulasi/Documents/Pages/Ketahanan-dan-Keamanan-Siber-Bagi-Bank-Umum/RINGKASAN%20SEOJK%2029%20-%2003%20-%202022-1.pdf', kind: 'official' },
    ],
  },
  {
    id: 'pojk-22-2023',
    short: 'POJK 22/2023',
    title: { en: 'OJK Regulation 22 of 2023 on Consumer and Public Protection in the Financial Services Sector', id: 'POJK Nomor 22 Tahun 2023 tentang Pelindungan Konsumen dan Masyarakat di Sektor Jasa Keuangan' },
    issuer: 'OJK',
    type: 'regulator',
    dated: { en: 'In force from 22 December 2023', id: 'Berlaku sejak 22 Desember 2023' },
    sectors: ['bank', 'finance'],
    gist: {
      en: 'Financial service providers must protect consumer data and make sure their information systems are secure and cyber resilient.',
      id: 'Pelaku usaha jasa keuangan wajib melindungi data konsumen dan memastikan keamanan sistem informasi serta ketahanan siber.',
    },
    points: [
      { en: 'Article 24(1): ensure information system security and cyber resilience in business activities, for consumer protection.', id: 'Pasal 24 ayat (1): memastikan keamanan sistem informasi dan ketahanan siber dalam kegiatan usaha untuk pelindungan konsumen.' },
      { en: 'Replaced POJK 6/POJK.07/2022. Follows the PDP Law on how consumer data is handled.', id: 'Menggantikan POJK 6/POJK.07/2022. Mengacu pada UU PDP dalam pengelolaan data konsumen.' },
    ],
    refs: [
      { label: 'POJK 22/2023 (ojk.go.id)', url: 'https://ojk.go.id/id/regulasi/Pages/Pelindungan-Konsumen-dan-Masyarakat-di-Sektor-Jasa-Keuangan.aspx', kind: 'official' },
      { label: 'OJK FAQ', url: 'https://ojk.go.id/id/regulasi/Documents/Pages/Pelindungan-Konsumen-dan-Masyarakat-di-Sektor-Jasa-Keuangan/FAQ%20POJK%20Nomor%2022%20Tahun%202023%20PKM%20SJK.pdf', kind: 'official' },
    ],
  },
  {
    id: 'pbi-2-2024',
    short: 'PBI 2/2024',
    title: { en: 'Bank Indonesia Regulation 2 of 2024 and PADG 24/2024 on Information System Security and Cyber Resilience', id: 'PBI Nomor 2 Tahun 2024 dan PADG Nomor 24 Tahun 2024 tentang Keamanan Sistem Informasi dan Ketahanan Siber' },
    issuer: 'Bank Indonesia',
    type: 'regulator',
    dated: { en: 'PBI 18 April 2024; PADG in force 31 December 2024', id: 'PBI 18 April 2024; PADG berlaku 31 Desember 2024' },
    sectors: ['payments'],
    gist: {
      en: 'Payment service providers, payment infrastructure operators and money and FX market participants must secure their systems and be able to withstand and recover from cyber incidents.',
      id: 'Penyedia jasa pembayaran, penyelenggara infrastruktur sistem pembayaran, dan pelaku pasar uang dan valas wajib mengamankan sistem serta mampu bertahan dan pulih dari insiden siber.',
    },
    points: [
      { en: 'Operators report their cyber security and resilience to Bank Indonesia every year, and when a cyber incident happens.', id: 'Penyelenggara melaporkan KKS kepada Bank Indonesia setiap tahun dan saat terjadi insiden siber.' },
      { en: 'Information system and cyber resilience audits are part of the payment system IT audit duties.', id: 'Audit keamanan sistem informasi dan ketahanan siber menjadi bagian dari kewajiban audit TI sistem pembayaran.' },
    ],
    refs: [
      { label: 'PBI 2/2024 (bi.go.id)', url: 'https://www.bi.go.id/id/publikasi/peraturan/Pages/PBI_022024.aspx', kind: 'official' },
      { label: 'PADG 24/2024 (bi.go.id)', url: 'https://www.bi.go.id/id/publikasi/peraturan/Pages/PADG_242024.aspx', kind: 'official' },
      { label: 'Reporting guideline (bi.go.id)', url: 'https://www.bi.go.id/id/publikasi/peraturan/Documents/Petunjuk-Teknis-Pelaporan-KKS-Eksternal.pdf', kind: 'official' },
    ],
  },
];

/** Standards used for cross-reference. They are voluntary unless a contract or regulator requires them. */
export const STANDARDS = {
  iso: {
    short: 'ISO/IEC 27001:2022',
    title: { en: 'Information security management systems, Annex A controls', id: 'Sistem manajemen keamanan informasi, kontrol Annex A' } as Bilingual,
    url: 'https://www.iso.org/standard/27001',
  },
  nist: {
    short: 'NIST CSF',
    title: { en: 'Cybersecurity Framework: Identify, Protect, Detect, Respond, Recover', id: 'Kerangka Keamanan Siber: Identify, Protect, Detect, Respond, Recover' } as Bilingual,
    url: 'https://www.nist.gov/blogs/taking-measure/identify-protect-detect-respond-and-recover-nist-cybersecurity-framework',
  },
};

/* ---------- Signals: what Craton observed, and what it may relate to ---------- */

export type SignalId = 'tls' | 'headers' | 'ports' | 'cve' | 'admin' | 'nonprod' | 'shadow' | 'takeover' | 'bucket' | 'code_leak' | 'email';

export interface Clause {
  reg: string;
  /** Topic-level wording, or an article number only where it was checked. */
  topic: Bilingual;
}

export interface Signal {
  id: SignalId;
  title: Bilingual;
  /** Plain explanation of why this finding matters to a duty. */
  why: Bilingual;
  clauses: Clause[];
  /** ISO/IEC 27001:2022 Annex A control numbers. */
  iso: { id: string; name: string }[];
  /** NIST CSF function and category. */
  nist: { fn: 'Identify' | 'Protect' | 'Detect'; cat: string }[];
}

const A = (en: string, id: string): Bilingual => ({ en, id });

export const SIGNALS: Signal[] = [
  {
    id: 'tls',
    title: A('Weak or expiring certificates', 'Sertifikat lemah atau hampir kedaluwarsa'),
    why: A('An expired or invalid certificate breaks encryption in transit and trains users to click through warnings.', 'Sertifikat kedaluwarsa atau tidak valid merusak enkripsi saat transit dan membiasakan pengguna mengabaikan peringatan.'),
    clauses: [
      { reg: 'uu-pdp', topic: A('Article 39(2): reliable and secure system', 'Pasal 39 ayat (2): sistem yang andal dan aman') },
      { reg: 'pp-71-2019', topic: A('Article 24: security procedures and tools', 'Pasal 24: prosedur dan sarana pengamanan') },
      { reg: 'pojk-11-2022', topic: A('Information security of networks and communication', 'Pengamanan informasi dan jaringan komunikasi') },
      { reg: 'pbi-2-2024', topic: A('Information system security controls', 'Kontrol keamanan sistem informasi') },
    ],
    iso: [{ id: 'A.8.24', name: 'Use of cryptography' }],
    nist: [{ fn: 'Protect', cat: 'PR.DS Data security' }],
  },
  {
    id: 'headers',
    title: A('Missing browser protections', 'Perlindungan peramban belum ada'),
    why: A('Web servers without HTTPS enforcement or a content security policy are easier to downgrade and to inject into.', 'Server web tanpa penegakan HTTPS atau kebijakan keamanan konten lebih mudah diturunkan keamanannya dan disusupi.'),
    clauses: [
      { reg: 'uu-pdp', topic: A('Article 35: technical and operational measures', 'Pasal 35: langkah teknis operasional') },
      { reg: 'pp-71-2019', topic: A('Article 24: security procedures and tools', 'Pasal 24: prosedur dan sarana pengamanan') },
      { reg: 'pojk-22-2023', topic: A('Article 24(1): information system security', 'Pasal 24 ayat (1): keamanan sistem informasi') },
    ],
    iso: [
      { id: 'A.8.9', name: 'Configuration management' },
      { id: 'A.8.26', name: 'Application security requirements' },
    ],
    nist: [{ fn: 'Protect', cat: 'PR.PS Platform security' }],
  },
  {
    id: 'ports',
    title: A('Databases and remote access reachable from the internet', 'Basis data dan akses jarak jauh terbuka ke internet'),
    why: A('Database and remote desktop ports facing the internet are among the first things attackers test.', 'Port basis data dan desktop jarak jauh yang terbuka ke internet termasuk yang pertama diuji penyerang.'),
    clauses: [
      { reg: 'uu-pdp', topic: A('Article 39(1): prevent unauthorised access', 'Pasal 39 ayat (1): mencegah akses tidak sah') },
      { reg: 'pp-71-2019', topic: A('Article 24(2): prevention of threats and attacks', 'Pasal 24 ayat (2): pencegahan ancaman dan serangan') },
      { reg: 'seojk-29-2022', topic: A('Cyber security testing: vulnerability analysis', 'Pengujian keamanan siber: analisis kerentanan') },
      { reg: 'pojk-11-2022', topic: A('Information security of networks', 'Pengamanan informasi dan jaringan') },
      { reg: 'pbi-2-2024', topic: A('Information system security controls', 'Kontrol keamanan sistem informasi') },
    ],
    iso: [
      { id: 'A.8.20', name: 'Networks security' },
      { id: 'A.8.21', name: 'Security of network services' },
    ],
    nist: [{ fn: 'Protect', cat: 'PR.IR Technology infrastructure resilience' }],
  },
  {
    id: 'cve',
    title: A('Software with known vulnerabilities', 'Perangkat lunak dengan kerentanan yang diketahui'),
    why: A('Public records link the detected software versions to published vulnerabilities, some already exploited in attacks.', 'Catatan publik mengaitkan versi perangkat lunak yang terdeteksi dengan kerentanan yang telah dipublikasikan, sebagian sudah dieksploitasi.'),
    clauses: [
      { reg: 'seojk-29-2022', topic: A('Cyber security testing: vulnerability analysis', 'Pengujian keamanan siber: analisis kerentanan') },
      { reg: 'uu-pdp', topic: A('Article 35: measures that fit the risk', 'Pasal 35: langkah sesuai tingkat risiko') },
      { reg: 'pp-71-2019', topic: A('Article 24: security procedures and tools', 'Pasal 24: prosedur dan sarana pengamanan') },
      { reg: 'pbi-2-2024', topic: A('Information system security controls', 'Kontrol keamanan sistem informasi') },
    ],
    iso: [{ id: 'A.8.8', name: 'Management of technical vulnerabilities' }],
    nist: [
      { fn: 'Identify', cat: 'ID.RA Risk assessment' },
      { fn: 'Protect', cat: 'PR.PS Platform security' },
    ],
  },
  {
    id: 'admin',
    title: A('Admin panels and API docs open to the public', 'Panel admin dan dokumentasi API terbuka untuk publik'),
    why: A('An admin or developer interface reachable by anyone invites password guessing and, if unprotected, direct takeover.', 'Antarmuka admin atau pengembang yang dapat dijangkau siapa saja mengundang tebakan kata sandi dan, bila tanpa proteksi, pengambilalihan langsung.'),
    clauses: [
      { reg: 'uu-pdp', topic: A('Article 39(1): prevent unauthorised access', 'Pasal 39 ayat (1): mencegah akses tidak sah') },
      { reg: 'pp-71-2019', topic: A('Article 24(2): prevention of threats and attacks', 'Pasal 24 ayat (2): pencegahan ancaman dan serangan') },
      { reg: 'pojk-22-2023', topic: A('Article 24(1): information system security', 'Pasal 24 ayat (1): keamanan sistem informasi') },
      { reg: 'pbi-2-2024', topic: A('Information system security controls', 'Kontrol keamanan sistem informasi') },
    ],
    iso: [
      { id: 'A.8.5', name: 'Secure authentication' },
      { id: 'A.8.2', name: 'Privileged access rights' },
    ],
    nist: [{ fn: 'Protect', cat: 'PR.AA Identity management and access control' }],
  },
  {
    id: 'nonprod',
    title: A('Staging, test and development systems online', 'Sistem staging, uji, dan pengembangan di internet'),
    why: A('Test systems often hold real data copies and weaker controls, and are easy to find from certificate records.', 'Sistem uji sering menyimpan salinan data nyata dengan kontrol lebih lemah, dan mudah ditemukan dari catatan sertifikat.'),
    clauses: [
      { reg: 'uu-pdp', topic: A('Article 35: protection level fits the data', 'Pasal 35: tingkat pelindungan sesuai data') },
      { reg: 'pp-71-2019', topic: A('Article 24: security procedures and tools', 'Pasal 24: prosedur dan sarana pengamanan') },
      { reg: 'pojk-11-2022', topic: A('IT risk management', 'Manajemen risiko TI') },
    ],
    iso: [
      { id: 'A.8.31', name: 'Separation of development, test and production environments' },
      { id: 'A.8.33', name: 'Test information' },
    ],
    nist: [{ fn: 'Protect', cat: 'PR.PS Platform security' }],
  },
  {
    id: 'shadow',
    title: A('Forgotten or unowned assets', 'Aset terlupakan atau tanpa pemilik'),
    why: A('A host nobody owns is a host nobody patches, monitors or decommissions.', 'Host tanpa pemilik berarti tidak ada yang menambal, memantau, atau menonaktifkannya.'),
    clauses: [
      { reg: 'seojk-29-2022', topic: A('Cyber risk management framework', 'Kerangka manajemen risiko siber') },
      { reg: 'pojk-11-2022', topic: A('IT governance and architecture', 'Tata kelola dan arsitektur TI') },
      { reg: 'pp-71-2019', topic: A('Article 24: security procedures and tools', 'Pasal 24: prosedur dan sarana pengamanan') },
    ],
    iso: [{ id: 'A.5.9', name: 'Inventory of information and other associated assets' }],
    nist: [{ fn: 'Identify', cat: 'ID.AM Asset management' }],
  },
  {
    id: 'takeover',
    title: A('Subdomains that can be taken over', 'Subdomain yang dapat diambil alih'),
    why: A('A DNS record pointing at a service nobody owns anymore lets an attacker publish content under your name.', 'Catatan DNS yang menunjuk ke layanan tanpa pemilik memungkinkan penyerang menayangkan konten atas nama Anda.'),
    clauses: [
      { reg: 'uu-pdp', topic: A('Article 39(1): prevent unauthorised access', 'Pasal 39 ayat (1): mencegah akses tidak sah') },
      { reg: 'pp-71-2019', topic: A('Article 24(2): prevention of threats and attacks', 'Pasal 24 ayat (2): pencegahan ancaman dan serangan') },
      { reg: 'pojk-22-2023', topic: A('Article 24(1): information system security', 'Pasal 24 ayat (1): keamanan sistem informasi') },
    ],
    iso: [
      { id: 'A.5.9', name: 'Inventory of information and other associated assets' },
      { id: 'A.8.9', name: 'Configuration management' },
    ],
    nist: [
      { fn: 'Identify', cat: 'ID.AM Asset management' },
      { fn: 'Protect', cat: 'PR.PS Platform security' },
    ],
  },
  {
    id: 'bucket',
    title: A('Public cloud storage', 'Penyimpanan cloud publik'),
    why: A('A storage bucket anyone can list may expose documents or personal data without any break-in.', 'Bucket penyimpanan yang dapat dilihat siapa saja dapat membuka dokumen atau data pribadi tanpa peretasan.'),
    clauses: [
      { reg: 'uu-pdp', topic: A('Articles 35 and 39: protect data and prevent unauthorised access', 'Pasal 35 dan 39: melindungi data dan mencegah akses tidak sah') },
      { reg: 'pp-33-2026', topic: A('Incident records and breach notification clock', 'Catatan insiden dan batas waktu notifikasi kebocoran') },
      { reg: 'pojk-22-2023', topic: A('Article 24(1): protect consumer data and systems', 'Pasal 24 ayat (1): melindungi data dan sistem konsumen') },
      { reg: 'pbi-2-2024', topic: A('Information system security controls', 'Kontrol keamanan sistem informasi') },
    ],
    iso: [
      { id: 'A.5.23', name: 'Information security for use of cloud services' },
      { id: 'A.8.3', name: 'Information access restriction' },
      { id: 'A.8.12', name: 'Data leakage prevention' },
    ],
    nist: [{ fn: 'Protect', cat: 'PR.DS Data security' }],
  },
  {
    id: 'code_leak',
    title: A('Secrets or internal details in public code', 'Rahasia atau detail internal di kode publik'),
    why: A('Keys and passwords committed to public repositories are collected automatically within minutes.', 'Kunci dan kata sandi yang terunggah ke repositori publik dikumpulkan secara otomatis dalam hitungan menit.'),
    clauses: [
      { reg: 'uu-pdp', topic: A('Article 39(1): prevent unauthorised access', 'Pasal 39 ayat (1): mencegah akses tidak sah') },
      { reg: 'pp-71-2019', topic: A('Article 24: security procedures and tools', 'Pasal 24: prosedur dan sarana pengamanan') },
      { reg: 'seojk-29-2022', topic: A('Cyber risk management', 'Manajemen risiko siber') },
    ],
    iso: [
      { id: 'A.5.17', name: 'Authentication information' },
      { id: 'A.8.4', name: 'Access to source code' },
      { id: 'A.8.12', name: 'Data leakage prevention' },
    ],
    nist: [
      { fn: 'Protect', cat: 'PR.AA Identity management and access control' },
      { fn: 'Protect', cat: 'PR.DS Data security' },
    ],
  },
  {
    id: 'email',
    title: A('Weak email sender protection', 'Perlindungan pengirim email lemah'),
    why: A('Without enforced SPF and DMARC, criminals can send email that looks like it comes from your domain.', 'Tanpa SPF dan DMARC yang ditegakkan, pelaku kejahatan dapat mengirim email yang tampak berasal dari domain Anda.'),
    clauses: [
      { reg: 'pp-71-2019', topic: A('Article 24: security procedures and tools', 'Pasal 24: prosedur dan sarana pengamanan') },
      { reg: 'uu-pdp', topic: A('Article 35: technical and operational measures', 'Pasal 35: langkah teknis operasional') },
      { reg: 'pojk-22-2023', topic: A('Article 24(1): protect consumers from cyber risk', 'Pasal 24 ayat (1): melindungi konsumen dari risiko siber') },
    ],
    iso: [{ id: 'A.5.14', name: 'Information transfer' }],
    nist: [{ fn: 'Protect', cat: 'PR.PS Platform security' }],
  },
];

/* ---------- Matching a scan to the signals ---------- */

export interface SignalHit {
  signal: Signal;
  count: number;
  worst: Severity | null;
  hosts: string[];
}

const RANK: Record<Severity, number> = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };
const worstOf = (list: (Severity | null | undefined)[]): Severity | null =>
  list.reduce<Severity | null>((w, s) => (s && (!w || RANK[s] < RANK[w]) ? s : w), null);

/** Reads a finished scan and reports, per signal, how many things were seen. Pure and deterministic. */
export function matchScan(scan: ScanDTO): SignalHit[] {
  const live = scan.assets.filter((a) => a.httpStatus != null);
  const exp = (k: string) => scan.exposures.filter((e) => e.kind === k && e.severity !== 'Info');
  const buckets: Record<SignalId, { hosts: string[]; sev: (Severity | null | undefined)[] }> = {
    tls: collect(scan.assets.filter((a) => a.tlsValid === false || (a.tlsDaysLeft != null && a.tlsDaysLeft <= 30))),
    headers: collect(live.filter((a) => a.scheme === 'https' && !a.hsts)),
    ports: collect(scan.assets.filter((a) => a.ports.some((p) => SENSITIVE_PORTS[p] && SENSITIVE_PORTS[p].tier !== 'note'))),
    cve: collect(scan.assets.filter((a) => a.cves.length > 0)),
    admin: collect(scan.assets.filter((a) => a.visualClass === 'Exposed Admin / DevOps Panel' || a.visualClass === 'Unauthenticated API Docs')),
    nonprod: collect(scan.assets.filter((a) => a.category === 'Staging / Dev / UAT')),
    shadow: collect(scan.assets.filter((a) => a.category === 'Shadow IT / Forgotten Asset')),
    takeover: fromExposures(exp('takeover')),
    bucket: fromExposures(exp('bucket')),
    code_leak: fromExposures(exp('code_leak')),
    email: fromExposures(exp('email')),
  };
  return SIGNALS.map((signal) => {
    const b = buckets[signal.id];
    // Asset severity is the host's overall triage, not this finding's, so only exposure findings carry one.
    const own = signal.id === 'takeover' || signal.id === 'bucket' || signal.id === 'code_leak' || signal.id === 'email';
    return { signal, count: b.hosts.length, worst: own ? worstOf(b.sev) : null, hosts: b.hosts.slice(0, 6) };
  });

  function collect(list: ScanDTO['assets']) {
    return { hosts: list.map((a) => a.hostname), sev: list.map((a) => a.severity) };
  }
  function fromExposures(list: ScanDTO['exposures']) {
    return { hosts: list.map((e) => e.hostname ?? e.target), sev: list.map((e) => e.severity) };
  }
}

/** For each regulation, how many findings relate to it. Used for the roll-up row. */
export function rollUp(hits: SignalHit[]): { reg: Regulation; flagged: number; related: number }[] {
  return REGULATIONS.map((reg) => {
    const rel = hits.filter((h) => h.signal.clauses.some((c) => c.reg === reg.id));
    return { reg, flagged: rel.filter((h) => h.count > 0).length, related: rel.length };
  });
}

export const regById = (id: string): Regulation | undefined => REGULATIONS.find((r) => r.id === id);

/* ---------- Interface copy shared by the scan tab and the guide page ---------- */


export const REVIEWED = { en: 'Reviewed 16 November 2026', id: 'Ditinjau 16 November 2026' } as Bilingual;

export const UI: Record<Lang, {
  navTitle: string; pageTitle: string; lead: string; disclaimer: string;
  whoTitle: string; whoHint: string; whatsNewTitle: string; whatsNew: { when: string; iso: string; what: string }[];
  regsTitle: string; points: string; checks: string; noChecks: string; official: string; secondary: string; ref: string; type: Record<Regulation['type'], string>;
  matrixTitle: string; matrixLead: string; colFinding: string; colRegs: string; colIso: string; colNist: string;
  incidentTitle: string; incidentLead: string; incident: { big: string; who: string; what: string; sectors: Sector[] }[];
  statRules: string; statSectors: string; statChecks: string;
  subnav: { rules: string; map: string; incidents: string; limits: string; sources: string };
  rulesLead: string; tileRules: (n: number) => string; appliesSummary: (n: number, label: string) => string; appliesToYou: string; otherRules: string;
  rulebook: string; keyDatesTitle: string; inDays: (n: number) => string; inForce: string; mapHint: string; dimNote: string; sourcesCount: (n: number) => string; selectRule: string;
  limitsTitle: string; limits: string[]; sourcesTitle: string; fromPage: string; signIn: string; openGuide: string;
  lensTitle: string; lensLead: string; rollTitle: string; hitsTitle: string; clearTitle: string; none: string; findings: (n: number) => string; flagged: (a: number, b: number) => string; touches: string; seen: string; seenOn: string; noScan: string;
}> = {
  en: {
    navTitle: 'Compliance',
    pageTitle: 'Indonesian compliance guide',
    lead: 'The laws and regulators that care about your external attack surface, in plain language, with links to the source. Use it to see which rules apply to you and how Craton findings relate to them.',
    disclaimer: 'General information, not legal advice. Craton sees only what is visible from outside, so a finding is an indicator that a duty may be relevant, never proof that a rule was broken or met.',
    whoTitle: 'Which rules apply to you?',
    whoHint: 'Pick your organisation type. The personal data and electronic system rules apply to everyone.',
    whatsNewTitle: 'Recent and upcoming',
    whatsNew: [
      { when: '1 Mar 2026', iso: '2026-03-01', what: 'OJK Board Member Regulation 1/2026 for commercial banks. It replaced Circular Letter 21/2017.' },
      { when: '16 Jan 2027', iso: '2027-01-16', what: 'PP 33/2026, the implementing rules for the PDP Law, is reported to take effect. Confirm against the official text.' },
    ],
    rulebook: 'Rulebook',
    keyDatesTitle: 'Key dates',
    inDays: (n) => (n === 1 ? 'In 1 day' : `In ${n} days`),
    inForce: 'In force',
    statRules: 'Rules and standards',
    statSectors: 'Sector views',
    statChecks: 'Finding types mapped',
    subnav: { rules: 'Your rules', map: 'Finding map', incidents: 'If exploited', limits: 'Limits', sources: 'Sources' },
    rulesLead: 'Pick the closest match. The rules, the finding map and the incident duties below change to fit.',
    tileRules: (n) => (n === 1 ? '1 rule' : `${n} rules`),
    appliesSummary: (n, label) => `${label}: ${n} ${n === 1 ? 'rule applies' : 'rules apply'}`,
    appliesToYou: 'Applies to you',
    otherRules: 'Other rules, good to know',
    mapHint: 'Dimmed rules do not apply to the sector you picked.',
    dimNote: 'Not for your sector',
    sourcesCount: (n) => `${n} sources`,
    selectRule: 'Choose a rule',
    incidentLead: 'These are the reporting clocks that start when something is exploited, not when it is found. Rules for other sectors are dimmed.',
    regsTitle: 'Regulations and standards',
    points: 'What it asks',
    checks: 'Craton checks that relate',
    noChecks: 'No external check relates directly. This is mostly about governance and process.',
    official: 'Official',
    secondary: 'Summary',
    ref: 'Sources',
    type: { law: 'Law', government: 'Government regulation', presidential: 'Presidential regulation', regulator: 'Regulator rule', standard: 'Standard' },
    matrixTitle: 'How Craton findings map',
    matrixLead: 'Each finding type, the duties it may touch, and the matching ISO/IEC 27001:2022 Annex A controls and NIST CSF categories. Article numbers are given only where we checked the text.',
    colFinding: 'Finding type',
    colRegs: 'Regulations',
    colIso: 'ISO/IEC 27001:2022',
    colNist: 'NIST CSF',
    incidentTitle: 'If an exposure is actually exploited',
    incident: [
      { big: '3 × 24 h', who: 'Tell people and the authority · PDP Law Art. 46', what: 'Written notice to the data subjects and the authority after a protection failure. Under PP 33/2026 the clock runs from when the failure is confirmed, and every incident must be recorded.', sectors: ['any'] },
      { big: 'First chance', who: 'Report to law enforcement · PP 71/2019 Art. 24(3)', what: 'Secure the data and report at the first opportunity to law enforcement and the relevant ministry or agency.', sectors: ['any'] },
      { big: 'OJK', who: 'Commercial banks · SEOJK 29/2022', what: 'Cyber incident reports to OJK as part of the cyber security reporting set.', sectors: ['bank'] },
      { big: 'Bank Indonesia', who: 'Payments and markets · PBI 2/2024', what: 'Incident reports to Bank Indonesia, on top of the annual cyber security and resilience report.', sectors: ['payments'] },
      { big: 'BSSN', who: 'Vital infrastructure · Perpres 82/2022', what: 'Follow the incident handling set by BSSN, with response teams at organisation, sector and national level.', sectors: ['cii'] },
    ],
    limitsTitle: 'What this page does not do',
    limits: [
      'It does not assess governance, policies, people or internal controls. Those need an internal review or audit.',
      'It does not replace legal advice. Obligations depend on your sector, licence, contracts and the data you hold.',
      'It lists the rules most relevant to an external attack surface. It is not a complete register of Indonesian law. UU ITE, sector rules for insurance, capital markets and telecoms, and regional rules are not covered yet.',
    ],
    sourcesTitle: 'All sources',
    fromPage: 'Compliance guide',
    signIn: 'Sign in',
    openGuide: 'Open the full guide',
    lensTitle: 'Compliance lens',
    lensLead: 'What this scan found, and the duties and controls it may touch. These are indicators from outside, not an audit result.',
    rollTitle: 'Where findings land',
    hitsTitle: 'Findings and what they touch',
    clearTitle: 'Checked and clear',
    none: 'None',
    findings: (n) => (n === 1 ? '1 finding' : `${n} findings`),
    flagged: (a, b) => `${a} of ${b} related checks flagged`,
    touches: 'May relate to',
    seen: 'Seen on',
    seenOn: 'and more',
    noScan: 'Run a scan to see how its findings relate to Indonesian rules.',
  },
  id: {
    navTitle: 'Kepatuhan',
    pageTitle: 'Panduan kepatuhan Indonesia',
    lead: 'Undang-undang dan regulator yang berkaitan dengan permukaan serangan eksternal Anda, dalam bahasa sederhana, lengkap dengan tautan sumber. Gunakan untuk melihat aturan mana yang berlaku bagi Anda dan bagaimana temuan Craton berkaitan dengannya.',
    disclaimer: 'Informasi umum, bukan nasihat hukum. Craton hanya melihat apa yang tampak dari luar, sehingga temuan adalah indikator bahwa suatu kewajiban mungkin relevan, bukan bukti pelanggaran atau pemenuhan aturan.',
    whoTitle: 'Aturan mana yang berlaku bagi Anda?',
    whoHint: 'Pilih jenis organisasi Anda. Aturan data pribadi dan sistem elektronik berlaku untuk semua.',
    whatsNewTitle: 'Terbaru dan akan datang',
    whatsNew: [
      { when: '1 Mar 2026', iso: '2026-03-01', what: 'PADK OJK 1/2026 bagi bank umum. Menggantikan SEOJK 21/2017.' },
      { when: '16 Jan 2027', iso: '2027-01-16', what: 'PP 33/2026, aturan pelaksana UU PDP, dilaporkan mulai berlaku. Pastikan dengan naskah resmi.' },
    ],
    rulebook: 'Buku aturan',
    keyDatesTitle: 'Tanggal penting',
    inDays: (n) => `${n} hari lagi`,
    inForce: 'Sudah berlaku',
    statRules: 'Peraturan dan standar',
    statSectors: 'Tampilan sektor',
    statChecks: 'Jenis temuan terpetakan',
    subnav: { rules: 'Aturan Anda', map: 'Peta temuan', incidents: 'Bila dieksploitasi', limits: 'Batasan', sources: 'Sumber' },
    rulesLead: 'Pilih yang paling sesuai. Aturan, peta temuan, dan kewajiban insiden di bawah akan menyesuaikan.',
    tileRules: (n) => `${n} aturan`,
    appliesSummary: (n, label) => `${label}: ${n} aturan berlaku`,
    appliesToYou: 'Berlaku bagi Anda',
    otherRules: 'Aturan lain, baik diketahui',
    mapHint: 'Aturan yang redup tidak berlaku untuk sektor yang Anda pilih.',
    dimNote: 'Bukan untuk sektor Anda',
    sourcesCount: (n) => `${n} sumber`,
    selectRule: 'Pilih aturan',
    incidentLead: 'Ini batas waktu pelaporan yang mulai berjalan saat sesuatu dieksploitasi, bukan saat ditemukan. Aturan sektor lain ditampilkan redup.',
    regsTitle: 'Peraturan dan standar',
    points: 'Isi yang diminta',
    checks: 'Pemeriksaan Craton yang terkait',
    noChecks: 'Tidak ada pemeriksaan eksternal yang terkait langsung. Sebagian besar menyangkut tata kelola dan proses.',
    official: 'Resmi',
    secondary: 'Ringkasan',
    ref: 'Sumber',
    type: { law: 'Undang-undang', government: 'Peraturan pemerintah', presidential: 'Peraturan presiden', regulator: 'Aturan regulator', standard: 'Standar' },
    matrixTitle: 'Pemetaan temuan Craton',
    matrixLead: 'Setiap jenis temuan, kewajiban yang mungkin tersentuh, serta kontrol ISO/IEC 27001:2022 Annex A dan kategori NIST CSF yang sepadan. Nomor pasal hanya dicantumkan bila teksnya sudah kami periksa.',
    colFinding: 'Jenis temuan',
    colRegs: 'Peraturan',
    colIso: 'ISO/IEC 27001:2022',
    colNist: 'NIST CSF',
    incidentTitle: 'Jika paparan benar-benar dieksploitasi',
    incident: [
      { big: '3 × 24 jam', who: 'Beri tahu subjek data dan lembaga · UU PDP Pasal 46', what: 'Pemberitahuan tertulis kepada subjek data dan lembaga setelah kegagalan pelindungan. Menurut PP 33/2026 batas waktu dihitung sejak kegagalan dipastikan, dan setiap insiden wajib dicatat.', sectors: ['any'] },
      { big: 'Segera', who: 'Lapor ke penegak hukum · PP 71/2019 Pasal 24 ayat (3)', what: 'Amankan data dan segera laporkan kepada aparat penegak hukum serta kementerian atau lembaga terkait.', sectors: ['any'] },
      { big: 'OJK', who: 'Bank umum · SEOJK 29/2022', what: 'Laporan insiden siber kepada OJK sebagai bagian dari laporan keamanan siber.', sectors: ['bank'] },
      { big: 'Bank Indonesia', who: 'Pembayaran dan pasar · PBI 2/2024', what: 'Laporan insiden kepada Bank Indonesia, di samping laporan tahunan keamanan dan ketahanan siber.', sectors: ['payments'] },
      { big: 'BSSN', who: 'Infrastruktur vital · Perpres 82/2022', what: 'Ikuti penanganan insiden yang ditetapkan BSSN, dengan tim tanggap di tingkat organisasi, sektoral, dan nasional.', sectors: ['cii'] },
    ],
    limitsTitle: 'Yang tidak dilakukan halaman ini',
    limits: [
      'Tidak menilai tata kelola, kebijakan, SDM, atau kontrol internal. Itu memerlukan tinjauan atau audit internal.',
      'Tidak menggantikan nasihat hukum. Kewajiban bergantung pada sektor, izin, kontrak, dan data yang Anda kelola.',
      'Memuat aturan yang paling relevan dengan permukaan serangan eksternal. Bukan daftar lengkap hukum Indonesia. UU ITE, aturan sektor asuransi, pasar modal, dan telekomunikasi, serta aturan daerah belum tercakup.',
    ],
    sourcesTitle: 'Semua sumber',
    fromPage: 'Panduan kepatuhan',
    signIn: 'Masuk',
    openGuide: 'Buka panduan lengkap',
    lensTitle: 'Lensa kepatuhan',
    lensLead: 'Apa yang ditemukan pemindaian ini, serta kewajiban dan kontrol yang mungkin tersentuh. Ini indikator dari luar, bukan hasil audit.',
    rollTitle: 'Ke mana temuan mengarah',
    hitsTitle: 'Temuan dan yang disentuhnya',
    clearTitle: 'Diperiksa dan aman',
    none: 'Tidak ada',
    findings: (n) => `${n} temuan`,
    flagged: (a, b) => `${a} dari ${b} pemeriksaan terkait ditandai`,
    touches: 'Mungkin terkait',
    seen: 'Terlihat pada',
    seenOn: 'dan lainnya',
    noScan: 'Jalankan pemindaian untuk melihat kaitan temuannya dengan aturan Indonesia.',
  },
};
