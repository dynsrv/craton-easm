import { CONTACT_EMAIL, type LegalSlug, OPERATOR, PRODUCT, SITE_HOST, SLA } from './legal';

/** A bilingual string: [English, Bahasa Indonesia]. */
export type T = readonly [string, string];
export type Block = { p: T } | { ul: T[] };
export interface Section {
  h: T;
  body: Block[];
}
export interface LegalDoc {
  title: T;
  summary: T;
  sections: Section[];
}

const P = (en: string, id: string): Block => ({ p: [en, id] });
const UL = (...items: [string, string][]): Block => ({ ul: items });

const op = `${OPERATOR}`;
const email = CONTACT_EMAIL;

export const LEGAL: Record<LegalSlug, LegalDoc> = {
  terms: {
    title: ['Terms of Service', 'Ketentuan Layanan'],
    summary: [
      `The rules for using ${PRODUCT}. Short version: assess only domains you are allowed to assess, and treat the results as a guide, not a guarantee.`,
      `Aturan penggunaan ${PRODUCT}. Singkatnya: nilai hanya domain yang boleh Anda nilai, dan anggap hasilnya sebagai panduan, bukan jaminan.`,
    ],
    sections: [
      {
        h: ['1. Who we are and what the service is', '1. Siapa kami dan apa layanannya'],
        body: [
          P(
            `${PRODUCT} is an external attack surface management service operated by ${op} at ${SITE_HOST}. You give it a root domain; it maps what an outsider can see about that organisation from the internet and reports it. These terms are the agreement between ${op} and the organisation or person using the service ("you").`,
            `${PRODUCT} adalah layanan manajemen permukaan serangan eksternal yang dioperasikan oleh ${op} di ${SITE_HOST}. Anda memberikan satu domain utama; layanan ini memetakan apa yang dapat dilihat pihak luar tentang organisasi tersebut dari internet, lalu melaporkannya. Ketentuan ini adalah perjanjian antara ${op} dan organisasi atau orang yang menggunakan layanan ("Anda").`,
          ),
          P(
            'By signing in or using the service you accept these terms, the Acceptable Use Policy and the Privacy Policy. If you use the service for an organisation, you confirm that you may bind it.',
            'Dengan masuk atau menggunakan layanan, Anda menyetujui ketentuan ini, Kebijakan Penggunaan yang Dapat Diterima, dan Kebijakan Privasi. Jika Anda menggunakan layanan untuk suatu organisasi, Anda menyatakan berwenang mengikat organisasi tersebut.',
          ),
        ],
      },
      {
        h: ['2. Accounts', '2. Akun'],
        body: [
          UL(
            ['Accounts are issued by an administrator. You are responsible for keeping your password secret and for everything done under your account.', 'Akun diterbitkan oleh administrator. Anda bertanggung jawab menjaga kerahasiaan kata sandi dan atas semua tindakan yang dilakukan melalui akun Anda.'],
            ['Do not share an account between people. Tell us at once if you think it was used without your knowledge.', 'Jangan berbagi akun antarorang. Beri tahu kami segera jika Anda menduga akun digunakan tanpa sepengetahuan Anda.'],
            ['Customer accounts see only their own scans. Administrators can see all scans.', 'Akun pelanggan hanya melihat pindai miliknya sendiri. Administrator dapat melihat semua pindai.'],
          ),
        ],
      },
      {
        h: ['3. Authority to assess a domain', '3. Kewenangan menilai sebuah domain'],
        body: [
          P(
            'Before every scan you must confirm that you are authorised to assess the domain. That means you own it, or the owner has given you permission, ideally in writing. You are responsible for that confirmation being true.',
            'Sebelum setiap pindai Anda wajib menyatakan bahwa Anda berwenang menilai domain tersebut. Artinya Anda memilikinya, atau pemiliknya telah memberi izin, sebaiknya tertulis. Anda bertanggung jawab atas kebenaran pernyataan itu.',
          ),
          P(
            `We may ask you to prove control of a domain (for example with a DNS record) and may refuse or stop a scan if you cannot. If you assess a domain without authority you break these terms and may also break the law, including Indonesian electronic information and transactions law (UU ITE).`,
            'Kami dapat meminta Anda membuktikan kendali atas domain (misalnya dengan catatan DNS) dan dapat menolak atau menghentikan pindai jika Anda tidak dapat membuktikannya. Menilai domain tanpa kewenangan melanggar ketentuan ini dan dapat melanggar hukum, termasuk undang-undang informasi dan transaksi elektronik (UU ITE).',
          ),
        ],
      },
      {
        h: ['4. How the service works', '4. Cara kerja layanan'],
        body: [
          P(
            `${PRODUCT} is outside-in and passive. It reads public certificate logs, DNS and third-party internet scan data, sends one standard web request and takes one screenshot per host, runs public code search and checks cloud storage names. It does not log in, send exploits, run intrusive tests or download your data.`,
            `${PRODUCT} bekerja dari luar dan bersifat pasif. Layanan ini membaca log sertifikat publik, DNS, dan data pemindaian internet pihak ketiga, mengirim satu permintaan web standar dan mengambil satu tangkapan layar per host, menjalankan pencarian kode publik, dan memeriksa nama penyimpanan cloud. Layanan ini tidak masuk ke sistem, tidak mengirim eksploitasi, tidak menjalankan pengujian intrusif, dan tidak mengunduh data Anda.`,
          ),
          P(
            'Results depend on third-party data sources and on what is visible at the time of the scan. See the Liability page for what that means for accuracy.',
            'Hasil bergantung pada sumber data pihak ketiga dan pada apa yang terlihat saat pindai. Lihat halaman Tanggung Jawab untuk dampaknya terhadap akurasi.',
          ),
        ],
      },
      {
        h: ['5. Your results and our software', '5. Hasil Anda dan perangkat lunak kami'],
        body: [
          UL(
            ['You own the scan results about your own domains. You may use, share and export them for your business, including with your auditors and regulators.', 'Anda memiliki hasil pindai atas domain Anda sendiri. Anda dapat menggunakan, membagikan, dan mengekspornya untuk bisnis Anda, termasuk kepada auditor dan regulator.'],
            [`${op} owns the software, the design, the text and the way findings are scored. You may not copy, resell, reverse engineer or build a competing service from them.`, `${op} memiliki perangkat lunak, desain, teks, dan cara penilaian temuan. Anda tidak boleh menyalin, menjual kembali, merekayasa balik, atau membangun layanan pesaing darinya.`],
            ['Data we receive from third-party sources stays subject to those sources\' own terms.', 'Data yang kami terima dari sumber pihak ketiga tetap tunduk pada ketentuan sumber tersebut.'],
          ),
        ],
      },
      {
        h: ['6. Fees', '6. Biaya'],
        body: [
          P(
            'Fees, quotas and billing periods are set out in your plan or order. Unless the order says otherwise, fees are non-refundable once the period has started, and are exclusive of taxes. We will tell you in advance before changing prices for a period you have already paid for.',
            'Biaya, kuota, dan periode penagihan tercantum dalam paket atau pesanan Anda. Kecuali pesanan menyatakan lain, biaya tidak dapat dikembalikan setelah periode berjalan, dan belum termasuk pajak. Kami akan memberi tahu sebelumnya jika harga berubah untuk periode yang sudah Anda bayar.',
          ),
        ],
      },
      {
        h: ['7. Availability and changes', '7. Ketersediaan dan perubahan'],
        body: [
          P(
            'We aim to keep the service running but do not promise uninterrupted access unless a written service-level agreement says so. We may change, add or remove features, and update these terms. If a change materially affects you we will give notice on the site or by email before it applies.',
            'Kami berupaya menjaga layanan tetap berjalan tetapi tidak menjanjikan akses tanpa gangguan kecuali ada perjanjian tingkat layanan tertulis. Kami dapat mengubah, menambah, atau menghapus fitur, serta memperbarui ketentuan ini. Jika perubahan berdampak material bagi Anda, kami akan memberi pemberitahuan di situs atau melalui email sebelum berlaku.',
          ),
        ],
      },
      {
        h: ['8. Suspension and ending', '8. Penangguhan dan pengakhiran'],
        body: [
          P(
            'You may stop using the service at any time and ask us to delete your data (see the Privacy Policy). We may suspend or end access immediately if you break these terms or the Acceptable Use Policy, if we must by law, or if your use puts others or the service at risk. Where we can, we will tell you why and give you a chance to fix the problem first.',
            'Anda dapat berhenti menggunakan layanan kapan saja dan meminta kami menghapus data Anda (lihat Kebijakan Privasi). Kami dapat menangguhkan atau mengakhiri akses segera jika Anda melanggar ketentuan ini atau Kebijakan Penggunaan yang Dapat Diterima, jika hukum mewajibkan, atau jika penggunaan Anda membahayakan pihak lain atau layanan. Bila memungkinkan, kami akan menjelaskan alasannya dan memberi kesempatan memperbaiki terlebih dahulu.',
          ),
        ],
      },
      {
        h: ['9. Law and disputes', '9. Hukum dan sengketa'],
        body: [
          P(
            'These terms are governed by the laws of the Republic of Indonesia. We will first try to settle any dispute by talking to each other in good faith (see the Complaints page). If that does not work, the courts of Jakarta, Indonesia have jurisdiction. If you are in Indonesia and the English and Indonesian versions differ, the Indonesian version prevails.',
            'Ketentuan ini diatur oleh hukum Republik Indonesia. Kami akan lebih dahulu berupaya menyelesaikan sengketa melalui musyawarah dengan itikad baik (lihat halaman Pengaduan). Jika tidak berhasil, pengadilan di Jakarta, Indonesia berwenang. Jika Anda berada di Indonesia dan versi bahasa Inggris dan Indonesia berbeda, versi bahasa Indonesia yang berlaku.',
          ),
        ],
      },
    ],
  },

  privacy: {
    title: ['Privacy Policy', 'Kebijakan Privasi'],
    summary: [
      `What ${PRODUCT} collects, why, who else sees it, and the rights you have over personal data under Indonesian law (UU 27/2022).`,
      `Data apa yang dikumpulkan ${PRODUCT}, untuk apa, siapa lagi yang melihatnya, dan hak Anda atas data pribadi menurut hukum Indonesia (UU 27/2022).`,
    ],
    sections: [
      {
        h: ['1. Who is responsible', '1. Siapa yang bertanggung jawab'],
        body: [
          P(
            `${op} is the controller of account data. For scan data about your own domains, you decide why and how it is used and ${op} processes it for you. Contact: ${email}.`,
            `${op} adalah pengendali data akun. Untuk data pindai atas domain Anda sendiri, Anda menentukan tujuan dan caranya dan ${op} memprosesnya untuk Anda. Kontak: ${email}.`,
          ),
        ],
      },
      {
        h: ['2. What we collect', '2. Data yang kami kumpulkan'],
        body: [
          UL(
            ['Account data: your email address, your role, and a salted hash of your password (never the password itself).', 'Data akun: alamat email, peran, dan hash berbumbu dari kata sandi Anda (bukan kata sandi itu sendiri).'],
            ['Scan data: the domain you assess, discovered hostnames and IP addresses, open ports, certificate and HTTP response details, page titles, one screenshot per host, findings, AI-written summaries, change history and the reports you generate.', 'Data pindai: domain yang Anda nilai, nama host dan alamat IP yang ditemukan, port terbuka, detail sertifikat dan respons HTTP, judul halaman, satu tangkapan layar per host, temuan, ringkasan yang ditulis AI, riwayat perubahan, dan laporan yang Anda buat.'],
            ['Usage records: which account ran which scan and when, and AI usage and cost per scan.', 'Catatan penggunaan: akun mana yang menjalankan pindai apa dan kapan, serta penggunaan dan biaya AI per pindai.'],
            ['Technical data our hosting provider logs, such as IP address and request time, for security and reliability.', 'Data teknis yang dicatat penyedia hosting kami, seperti alamat IP dan waktu permintaan, untuk keamanan dan keandalan.'],
          ),
          P(
            'Scan data describes organisations and their systems, but it can incidentally contain personal data, for example a person\'s name in a certificate, a page title or an exposed file name. We keep it to what the scan finds and do not seek out personal data.',
            'Data pindai menggambarkan organisasi dan sistemnya, tetapi dapat secara tidak sengaja memuat data pribadi, misalnya nama seseorang dalam sertifikat, judul halaman, atau nama berkas yang terbuka. Kami membatasinya pada apa yang ditemukan pindai dan tidak mencari data pribadi.',
          ),
        ],
      },
      {
        h: ['3. Why we use it', '3. Untuk apa kami menggunakannya'],
        body: [
          UL(
            ['To provide the service: sign you in, run scans, show results and produce reports.', 'Untuk menyediakan layanan: memasukkan Anda, menjalankan pindai, menampilkan hasil, dan membuat laporan.'],
            ['To keep the service secure and prevent abuse, including enforcing the Acceptable Use Policy.', 'Untuk menjaga keamanan layanan dan mencegah penyalahgunaan, termasuk menegakkan Kebijakan Penggunaan yang Dapat Diterima.'],
            ['To meet legal duties and to handle complaints and disputes.', 'Untuk memenuhi kewajiban hukum dan menangani pengaduan serta sengketa.'],
          ),
          P('We do not sell personal data and we do not use it for advertising.', 'Kami tidak menjual data pribadi dan tidak menggunakannya untuk iklan.'),
        ],
      },
      {
        h: ['4. Who else receives it', '4. Siapa lagi yang menerimanya'],
        body: [
          P('To run a scan we must send the domain or IP addresses being assessed to other services. We use:', 'Untuk menjalankan pindai, kami harus mengirim domain atau alamat IP yang dinilai ke layanan lain. Kami menggunakan:'),
          UL(
            ['Public data sources: certificate transparency services, public DNS resolvers, internet scan databases such as Shodan, subdomain and web archive services, and GitHub code search.', 'Sumber data publik: layanan transparansi sertifikat, resolver DNS publik, basis data pemindaian internet seperti Shodan, layanan subdomain dan arsip web, serta pencarian kode GitHub.'],
            ['AI providers (OpenAI or Anthropic, depending on configuration) to write summaries. They receive technical facts about discovered assets, not account passwords or stored credentials.', 'Penyedia AI (OpenAI atau Anthropic, sesuai konfigurasi) untuk menulis ringkasan. Mereka menerima fakta teknis tentang aset yang ditemukan, bukan kata sandi akun atau kredensial tersimpan.'],
            ['Infrastructure providers that host the application and the database.', 'Penyedia infrastruktur yang menghosting aplikasi dan basis data.'],
          ),
          P('We share data with authorities only when the law requires it.', 'Kami hanya membagikan data kepada otoritas jika diwajibkan hukum.'),
        ],
      },
      {
        h: ['5. Where it is processed', '5. Di mana data diproses'],
        body: [
          P(
            'The application runs in a data centre region in Singapore, and our providers may process data in other countries. Where personal data leaves Indonesia we rely on contractual and technical safeguards as the law requires.',
            'Aplikasi berjalan di wilayah pusat data di Singapura, dan penyedia kami dapat memproses data di negara lain. Jika data pribadi keluar dari Indonesia, kami mengandalkan perlindungan kontraktual dan teknis sebagaimana diwajibkan hukum.',
          ),
        ],
      },
      {
        h: ['6. Security', '6. Keamanan'],
        body: [
          P(
            'Passwords are stored as salted hashes. Third-party API keys and webhook addresses saved in the admin area are encrypted before they are stored and never shown in full. Sessions use a secure, HTTP-only cookie. No system is perfectly secure; if a breach affects your personal data we will notify you and the authority as the law requires.',
            'Kata sandi disimpan sebagai hash berbumbu. Kunci API pihak ketiga dan alamat webhook yang disimpan di area admin dienkripsi sebelum disimpan dan tidak pernah ditampilkan utuh. Sesi memakai cookie aman dan HTTP-only. Tidak ada sistem yang sepenuhnya aman; jika pelanggaran memengaruhi data pribadi Anda, kami akan memberi tahu Anda dan otoritas sebagaimana diwajibkan hukum.',
          ),
        ],
      },
      {
        h: ['7. Cookies and local storage', '7. Cookie dan penyimpanan lokal'],
        body: [
          P(
            'We use one strictly necessary session cookie to keep you signed in. Your browser also stores your theme and language choice locally. We use no advertising or analytics cookies.',
            'Kami memakai satu cookie sesi yang benar-benar diperlukan agar Anda tetap masuk. Peramban Anda juga menyimpan pilihan tema dan bahasa secara lokal. Kami tidak memakai cookie iklan maupun analitik.',
          ),
        ],
      },
      {
        h: ['8. How long we keep it', '8. Berapa lama kami menyimpan'],
        body: [
          UL(
            ['Scan results stay until you or an administrator delete the scan. Screenshots of older scans are removed automatically to save space.', 'Hasil pindai tersimpan sampai Anda atau administrator menghapus pindai tersebut. Tangkapan layar pindai lama dihapus otomatis untuk menghemat ruang.'],
            ['Account data stays while the account is active. When an account is closed, tell us if you also want its scans deleted; otherwise they remain available to administrators.', 'Data akun tersimpan selama akun aktif. Saat akun ditutup, beri tahu kami jika Anda juga ingin pindainya dihapus; jika tidak, pindai tetap tersedia bagi administrator.'],
            ['We may keep limited records longer where the law requires or to deal with a dispute.', 'Kami dapat menyimpan catatan terbatas lebih lama jika hukum mewajibkan atau untuk menangani sengketa.'],
          ),
        ],
      },
      {
        h: ['9. Your rights', '9. Hak Anda'],
        body: [
          P(
            `Under Indonesian personal data protection law (UU 27/2022) you may ask to access your personal data, correct it, delete it, restrict or object to its use, withdraw consent, and receive a copy. Write to ${email}. We reply within ${SLA.dataRequestDays} days. If you are not satisfied you may complain to us (see the Complaints page) and to the competent Indonesian authority.`,
            `Menurut hukum pelindungan data pribadi Indonesia (UU 27/2022), Anda dapat meminta akses, perbaikan, penghapusan, pembatasan atau keberatan atas penggunaan, penarikan persetujuan, dan salinan data pribadi Anda. Tulis ke ${email}. Kami membalas dalam ${SLA.dataRequestDays} hari. Jika tidak puas, Anda dapat mengadu kepada kami (lihat halaman Pengaduan) dan kepada otoritas Indonesia yang berwenang.`,
          ),
          P('We will update this policy when our practices change and show the date at the top of the page.', 'Kami akan memperbarui kebijakan ini saat praktik kami berubah dan menampilkan tanggalnya di bagian atas halaman.'),
        ],
      },
    ],
  },

  'acceptable-use': {
    title: ['Acceptable Use Policy', 'Kebijakan Penggunaan yang Dapat Diterima'],
    summary: [
      `What you may and may not do with ${PRODUCT}. It exists to protect the organisations that are assessed and the people who run the service.`,
      `Apa yang boleh dan tidak boleh Anda lakukan dengan ${PRODUCT}. Kebijakan ini ada untuk melindungi organisasi yang dinilai dan pihak yang menjalankan layanan.`,
    ],
    sections: [
      {
        h: ['1. The basic rule', '1. Aturan dasar'],
        body: [
          P(
            `Use ${PRODUCT} to understand and reduce the exposure of systems you are responsible for, or have written permission to assess. Nothing else.`,
            `Gunakan ${PRODUCT} untuk memahami dan mengurangi eksposur sistem yang menjadi tanggung jawab Anda, atau yang telah Anda dapatkan izin tertulis untuk menilainya. Tidak untuk hal lain.`,
          ),
        ],
      },
      {
        h: ['2. You must not', '2. Anda tidak boleh'],
        body: [
          UL(
            ['Assess a domain you do not own and have no permission to assess, or confirm authority you do not have.', 'Menilai domain yang bukan milik Anda dan tanpa izin, atau menyatakan kewenangan yang tidak Anda miliki.'],
            ['Use findings to attack, extort, blackmail, harass or embarrass an organisation or person, or to sell access to a weakness.', 'Menggunakan temuan untuk menyerang, memeras, mengancam, melecehkan, atau mempermalukan organisasi atau orang, atau menjual akses ke suatu kelemahan.'],
            ['Publish or pass on another organisation\'s findings without its consent.', 'Menerbitkan atau meneruskan temuan organisasi lain tanpa persetujuannya.'],
            ['Run scans to build lists of other organisations\' systems, or to monitor people.', 'Menjalankan pindai untuk membuat daftar sistem organisasi lain, atau untuk memantau orang.'],
            ['Overload the service or the sources it relies on, bypass quotas or rate limits, or use automation that the service does not offer.', 'Membebani layanan atau sumber yang diandalkannya, menghindari kuota atau batas laju, atau memakai otomatisasi yang tidak disediakan layanan.'],
            ['Share your account, or resell, sublicense or white-label the service or its data without a written agreement.', 'Membagikan akun Anda, atau menjual kembali, mensublisensikan, atau melabeli ulang layanan atau datanya tanpa perjanjian tertulis.'],
            ['Probe, test or attack the service itself, upload malicious content, or try to reach other customers\' data.', 'Menguji, menyerang layanan itu sendiri, mengunggah konten berbahaya, atau mencoba mengakses data pelanggan lain.'],
            ['Break the law, including Indonesian laws on electronic information, personal data and computer misuse.', 'Melanggar hukum, termasuk hukum Indonesia tentang informasi elektronik, data pribadi, dan penyalahgunaan komputer.'],
          ),
        ],
      },
      {
        h: ['3. Handling what you find', '3. Menangani temuan'],
        body: [
          P(
            'If a scan shows a serious weakness in a system you are responsible for, fix it. If it shows one in someone else\'s system, tell the owner privately and give them time to fix it. Do not use or demonstrate the weakness.',
            'Jika pindai menunjukkan kelemahan serius pada sistem yang menjadi tanggung jawab Anda, perbaiki. Jika menunjukkan kelemahan pada sistem milik orang lain, beri tahu pemiliknya secara pribadi dan beri waktu untuk memperbaikinya. Jangan menggunakan atau memperagakan kelemahan tersebut.',
          ),
        ],
      },
      {
        h: ['4. How we enforce this', '4. Cara kami menegakkannya'],
        body: [
          UL(
            ['We record which account ran each scan and may review scans for abuse.', 'Kami mencatat akun yang menjalankan setiap pindai dan dapat meninjau pindai untuk mendeteksi penyalahgunaan.'],
            ['We may warn you, limit your quota, stop a scan, suspend or close your account, and delete scan data if the policy is broken.', 'Kami dapat memperingatkan Anda, membatasi kuota, menghentikan pindai, menangguhkan atau menutup akun, dan menghapus data pindai jika kebijakan dilanggar.'],
            ['Where the law requires, or to protect someone from harm, we may cooperate with the owner of an assessed domain and with the authorities.', 'Jika hukum mewajibkan, atau untuk melindungi seseorang dari kerugian, kami dapat bekerja sama dengan pemilik domain yang dinilai dan dengan otoritas.'],
          ),
          P(
            `To report abuse, or to tell us a domain was assessed without your permission, write to ${email}. We act on abuse reports within ${SLA.abuseHours} hours (see the Complaints page).`,
            `Untuk melaporkan penyalahgunaan, atau memberi tahu bahwa domain Anda dinilai tanpa izin, tulis ke ${email}. Kami menindaklanjuti laporan penyalahgunaan dalam ${SLA.abuseHours} jam (lihat halaman Pengaduan).`,
          ),
        ],
      },
    ],
  },

  liability: {
    title: ['Liability', 'Tanggung Jawab'],
    summary: [
      `What ${PRODUCT} can and cannot promise about its results, and how far our responsibility goes.`,
      `Apa yang dapat dan tidak dapat dijanjikan ${PRODUCT} tentang hasilnya, dan sejauh mana tanggung jawab kami.`,
    ],
    sections: [
      {
        h: ['1. What the results are', '1. Apa arti hasilnya'],
        body: [
          P(
            'Results describe what could be observed from outside, from third-party data, at the time of the scan. They help you find and prioritise problems. They are not a penetration test, an audit, a certification, or legal or compliance advice.',
            'Hasil menggambarkan apa yang dapat diamati dari luar, dari data pihak ketiga, pada saat pindai. Hasil membantu Anda menemukan dan memprioritaskan masalah. Hasil bukan uji penetrasi, audit, sertifikasi, maupun nasihat hukum atau kepatuhan.',
          ),
        ],
      },
      {
        h: ['2. Limits you should know', '2. Batasan yang perlu Anda ketahui'],
        body: [
          UL(
            ['Completeness: a clean result does not prove a system is secure. Hosts, ports or flaws we cannot see from outside will not appear.', 'Kelengkapan: hasil bersih tidak membuktikan sistem aman. Host, port, atau celah yang tidak terlihat dari luar tidak akan muncul.'],
            ['Freshness: third-party data such as open ports can be days or weeks old, so a port or flaw may already be fixed, or newly opened, without showing yet.', 'Kebaruan: data pihak ketiga seperti port terbuka dapat berusia berhari-hari atau berminggu-minggu, sehingga port atau celah mungkin sudah diperbaiki, atau baru dibuka, tanpa tampil.'],
            ['Known vulnerabilities (CVEs) are matched to the software version a third party saw. We do not test them. Some may not apply, for example when a vendor patched without changing the version number. Confirm before you act.', 'Kerentanan yang diketahui (CVE) dicocokkan dengan versi perangkat lunak yang dilihat pihak ketiga. Kami tidak mengujinya. Sebagian mungkin tidak berlaku, misalnya saat vendor menambal tanpa mengubah nomor versi. Pastikan sebelum bertindak.'],
            ['"Resolved" or "no longer seen" means we could not observe a finding at the last scan. It is not proof that it was patched.', '"Selesai" atau "tidak terlihat lagi" berarti kami tidak dapat mengamati temuan pada pindai terakhir. Itu bukan bukti bahwa temuan telah ditambal.'],
            ['AI-written summaries can be wrong or incomplete. Check them against the evidence shown.', 'Ringkasan yang ditulis AI dapat keliru atau tidak lengkap. Periksa terhadap bukti yang ditampilkan.'],
            ['Compliance notes summarise public regulations in plain language and link to the source. They are not legal advice; ask a qualified adviser.', 'Catatan kepatuhan merangkum peraturan publik dalam bahasa sederhana dan menautkan sumbernya. Itu bukan nasihat hukum; tanyakan kepada penasihat yang berkualifikasi.'],
          ),
        ],
      },
      {
        h: ['3. No warranty', '3. Tanpa jaminan'],
        body: [
          P(
            'The service is provided "as is" and "as available". To the extent the law allows, we give no warranty that it is error-free, uninterrupted, complete or fit for a particular purpose, and we do not guarantee that using it will prevent an incident.',
            'Layanan disediakan "apa adanya" dan "sebagaimana tersedia". Sejauh hukum mengizinkan, kami tidak menjamin layanan bebas kesalahan, tidak terputus, lengkap, atau cocok untuk tujuan tertentu, dan kami tidak menjamin penggunaannya mencegah suatu insiden.',
          ),
        ],
      },
      {
        h: ['4. Limit of our responsibility', '4. Batas tanggung jawab kami'],
        body: [
          UL(
            [`To the extent the law allows, ${op} is not liable for indirect or consequential loss, lost profit, lost data or lost business, or for loss caused by actions you take or do not take based on a result.`, `Sejauh hukum mengizinkan, ${op} tidak bertanggung jawab atas kerugian tidak langsung atau lanjutan, hilangnya keuntungan, data, atau bisnis, maupun kerugian akibat tindakan yang Anda ambil atau tidak ambil berdasarkan suatu hasil.`],
            ['Our total liability for all claims in connection with the service is limited to the fees you paid for it in the 12 months before the event that gave rise to the claim (or, if you pay nothing, a nominal amount agreed in writing).', 'Total tanggung jawab kami atas semua klaim terkait layanan dibatasi sebesar biaya yang Anda bayar untuk layanan dalam 12 bulan sebelum peristiwa yang menimbulkan klaim (atau, jika Anda tidak membayar, jumlah nominal yang disepakati tertulis).'],
            ['Nothing here limits liability that the law does not allow us to limit, such as for intentional wrongdoing or gross negligence.', 'Tidak ada ketentuan di sini yang membatasi tanggung jawab yang menurut hukum tidak boleh kami batasi, seperti untuk perbuatan yang disengaja atau kelalaian berat.'],
          ),
        ],
      },
      {
        h: ['5. Your responsibility', '5. Tanggung jawab Anda'],
        body: [
          UL(
            ['You are responsible for having authority over every domain you assess. You will compensate us for claims and costs that arise because you assessed a domain without it, or broke the Acceptable Use Policy.', 'Anda bertanggung jawab memiliki kewenangan atas setiap domain yang Anda nilai. Anda akan mengganti klaim dan biaya yang timbul karena Anda menilai domain tanpa kewenangan, atau melanggar Kebijakan Penggunaan yang Dapat Diterima.'],
            ['You are responsible for deciding what to fix and for testing and applying changes to your own systems.', 'Anda bertanggung jawab memutuskan apa yang diperbaiki serta menguji dan menerapkan perubahan pada sistem Anda sendiri.'],
          ),
        ],
      },
      {
        h: ['6. Things outside our control', '6. Hal di luar kendali kami'],
        body: [
          P(
            'We are not responsible for failures of third-party data sources, hosting, networks or events beyond our reasonable control, such as outages, attacks, or changes in a provider\'s terms or availability.',
            'Kami tidak bertanggung jawab atas kegagalan sumber data pihak ketiga, hosting, jaringan, atau peristiwa di luar kendali wajar kami, seperti gangguan, serangan, atau perubahan ketentuan atau ketersediaan penyedia.',
          ),
        ],
      },
    ],
  },

  complaints: {
    title: ['Complaints', 'Pengaduan'],
    summary: [
      'How to tell us something went wrong, what we will do, and how fast. This also covers reports from owners of assessed domains and data requests.',
      'Cara memberi tahu kami jika ada yang tidak beres, apa yang akan kami lakukan, dan seberapa cepat. Halaman ini juga mencakup laporan dari pemilik domain yang dinilai dan permintaan data.',
    ],
    sections: [
      {
        h: ['1. How to complain', '1. Cara mengadu'],
        body: [
          P(
            `Email ${email}. Please include your name and contact details, the account or domain concerned, what happened and when, what you would like us to do, and any evidence such as screenshots or links. You can write in English or Bahasa Indonesia.`,
            `Kirim email ke ${email}. Mohon sertakan nama dan kontak Anda, akun atau domain yang bersangkutan, apa yang terjadi dan kapan, apa yang Anda inginkan kami lakukan, dan bukti seperti tangkapan layar atau tautan. Anda dapat menulis dalam bahasa Inggris atau Indonesia.`,
          ),
        ],
      },
      {
        h: ['2. What happens next', '2. Apa yang terjadi selanjutnya'],
        body: [
          UL(
            [`We confirm we received it within ${SLA.ackDays} working days.`, `Kami mengonfirmasi penerimaan dalam ${SLA.ackDays} hari kerja.`],
            [`We investigate and send you a reasoned answer within ${SLA.resolveDays} days. If it needs longer we tell you why and when to expect an answer.`, `Kami menyelidiki dan mengirim jawaban beralasan dalam ${SLA.resolveDays} hari. Jika perlu waktu lebih lama, kami menjelaskan alasannya dan kapan jawaban dapat diharapkan.`],
            ['A person who was not involved in the original decision reviews your complaint where we can arrange it.', 'Jika memungkinkan, orang yang tidak terlibat dalam keputusan awal meninjau pengaduan Anda.'],
            ['If you are not satisfied, you may ask us to review again, and you keep the right to go to the courts or the competent authority.', 'Jika Anda tidak puas, Anda dapat meminta kami meninjau ulang, dan Anda tetap berhak menempuh jalur pengadilan atau otoritas yang berwenang.'],
          ),
        ],
      },
      {
        h: ['3. Your domain was assessed without your permission', '3. Domain Anda dinilai tanpa izin'],
        body: [
          P(
            `Tell us the domain and, if you can, the time you noticed the activity. We treat this as urgent: we act within ${SLA.abuseHours} hours, which can include stopping scans of that domain, suspending the account and, where the law requires, passing details to the authorities. We can tell you whether the domain was assessed and when.`,
            `Beri tahu kami domainnya dan, jika bisa, waktu Anda melihat aktivitas tersebut. Kami menanganinya sebagai hal mendesak: kami bertindak dalam ${SLA.abuseHours} jam, yang dapat mencakup menghentikan pindai domain itu, menangguhkan akun, dan, jika hukum mewajibkan, meneruskan rincian kepada otoritas. Kami dapat memberi tahu apakah dan kapan domain tersebut dinilai.`,
          ),
        ],
      },
      {
        h: ['4. Personal data requests', '4. Permintaan data pribadi'],
        body: [
          P(
            `To access, correct or delete personal data, or to withdraw consent, write to ${email} and say which right you are using. We will confirm who you are first, and answer within ${SLA.dataRequestDays} days. The Privacy Policy explains your rights.`,
            `Untuk mengakses, memperbaiki, atau menghapus data pribadi, atau menarik persetujuan, tulis ke ${email} dan sebutkan hak yang Anda gunakan. Kami akan lebih dahulu memastikan identitas Anda, dan menjawab dalam ${SLA.dataRequestDays} hari. Kebijakan Privasi menjelaskan hak Anda.`,
          ),
        ],
      },
      {
        h: ['5. Reporting a security problem in Craton', '5. Melaporkan masalah keamanan di Craton'],
        body: [
          P(
            `If you find a vulnerability in ${PRODUCT} itself, email ${email} with the details. Please give us reasonable time to fix it before you share it, and do not access other people\'s data or disrupt the service. We will not take action against good-faith research that follows these rules.`,
            `Jika Anda menemukan kerentanan pada ${PRODUCT} itu sendiri, kirim rincian ke ${email}. Mohon beri kami waktu yang wajar untuk memperbaikinya sebelum Anda membagikannya, dan jangan mengakses data orang lain atau mengganggu layanan. Kami tidak akan mengambil tindakan terhadap riset beritikad baik yang mengikuti aturan ini.`,
          ),
        ],
      },
      {
        h: ['6. Disputes', '6. Sengketa'],
        body: [
          P(
            'If a complaint becomes a dispute, the Terms of Service say how it is settled: first by talking in good faith, then in the courts of Jakarta, Indonesia.',
            'Jika pengaduan menjadi sengketa, Ketentuan Layanan menjelaskan penyelesaiannya: pertama melalui musyawarah dengan itikad baik, kemudian di pengadilan di Jakarta, Indonesia.',
          ),
        ],
      },
    ],
  },
};
