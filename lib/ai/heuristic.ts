import { SEVERITY_RANK } from '../score';
import { SENSITIVE_PORTS } from '../ports';
import type { Bilingual, Category, DiscoveredAsset, ExecutiveBrief, Severity, Triage } from '../types';

/**
 * Rule-based triage. Used when no LLM key is configured, when the LLM call fails,
 * and for any asset the LLM leaves out of its answer. Deterministic, so also handy in tests.
 */
interface Finding {
  severity: Severity;
  why: Bilingual;
  fix: Bilingual;
}

const label = (a: DiscoveredAsset) => a.hostname.split('.')[0];

export function classify(a: DiscoveredAsset): Category {
  const l = label(a);
  const expiredLong = a.http?.tls != null && a.http.tls.daysLeft < -30;
  if (/(^|[-.])(old|legacy|backup|bak|tmp|temp|archive|deprecated)([-.]|$)|20[0-2]\d/.test(l) || expiredLong) return 'Shadow IT / Forgotten Asset';
  if (/(stag|stg|dev|uat|test|sandbox|qa|demo|beta|preprod|sit)/.test(l)) return 'Staging / Dev / UAT';
  if (/(mail|smtp|imap|pop|mx|webmail|vpn|remote|rdp|ftp|ns\d?$|dns|proxy|gw|gateway|fw|firewall|citrix|owa|autodiscover)/.test(l)) return 'Mail / VPN / Infra';
  if (/(^|[-.])(api|graphql|rest|ws|grpc)([-.]|\d|$)/.test(l)) return 'API Endpoint';
  if (/(admin|backoffice|cms|portal|sso|login|auth|hris|erp|crm|dashboard|panel|manage|console|jenkins|gitlab|grafana|kibana)/.test(l) || a.http?.hasLoginForm) return 'Admin / Login Portal';
  if (!a.http) return 'Mail / VPN / Infra';
  return 'Production Web';
}

function findings(a: DiscoveredAsset, category: Category): Finding[] {
  const out: Finding[] = [];
  const h = a.http;

  const data = a.ports.filter((p) => SENSITIVE_PORTS[p]?.tier === 'data');
  if (data.length) {
    const list = data.map((p) => `${SENSITIVE_PORTS[p].service} (${p})`).join(', ');
    out.push({
      severity: 'Critical',
      why: { en: `${list} answers from the internet. Exposed data stores are scraped, brute-forced and ransomed by automated bots.`, id: `${list} merespons dari internet. Penyimpanan data yang terbuka menjadi sasaran scraping, brute-force, dan pemerasan oleh bot otomatis.` },
      fix: { en: `Close ${data.join(', ')} to the internet in the firewall or cloud security group; allow only application servers and the VPN.`, id: `Tutup port ${data.join(', ')} dari internet di firewall atau security group cloud; izinkan hanya server aplikasi dan VPN.` },
    });
  }

  if (a.cves.length) {
    const top = a.cves.slice(0, 3).join(', ');
    out.push({
      severity: 'High',
      why: { en: `Shodan links this IP to ${a.cves.length} known CVE(s), including ${top}. Published vulnerabilities are the first thing attackers scan for.`, id: `Shodan mengaitkan IP ini dengan ${a.cves.length} CVE yang diketahui, termasuk ${top}. Kerentanan yang sudah dipublikasikan adalah hal pertama yang dipindai penyerang.` },
      fix: { en: `Confirm the software version on this host and apply the vendor patch for ${a.cves[0]}; restrict access until it is patched.`, id: `Pastikan versi software pada host ini dan pasang patch vendor untuk ${a.cves[0]}; batasi akses sampai selesai di-patch.` },
    });
  }

  const remote = a.ports.filter((p) => SENSITIVE_PORTS[p]?.tier === 'remote');
  if (remote.length) {
    const list = remote.map((p) => `${SENSITIVE_PORTS[p].service} (${p})`).join(', ');
    out.push({
      severity: 'High',
      why: { en: `${list} is open to the internet. Remote-access services are brute-forced constantly and are a common ransomware entry point.`, id: `${list} terbuka ke internet. Layanan akses jarak jauh terus-menerus di-brute-force dan merupakan pintu masuk ransomware yang umum.` },
      fix: { en: `Close ${remote.join(', ')} publicly and reach the server through the VPN or a bastion host.`, id: `Tutup port ${remote.join(', ')} dari publik dan akses server melalui VPN atau bastion host.` },
    });
  }

  if (category === 'Staging / Dev / UAT' && h && h.status < 500) {
    out.push({
      severity: h.hasLoginForm ? 'High' : 'Medium',
      why: { en: `A non-production environment is reachable by anyone${h.hasLoginForm ? ' and shows a login form' : ''}. Test systems tend to have weaker passwords, debug settings and copies of real data.`, id: `Lingkungan non-produksi dapat diakses siapa saja${h.hasLoginForm ? ' dan menampilkan form login' : ''}. Sistem uji cenderung memakai password lemah, mode debug, dan salinan data asli.` },
      fix: { en: 'Put this host behind the VPN or an IP allowlist for office and CI addresses.', id: 'Tempatkan host ini di belakang VPN atau IP allowlist untuk alamat kantor dan CI.' },
    });
  }

  if (h?.tls && h.tls.daysLeft < 0) {
    out.push({
      severity: h.hasLoginForm ? 'High' : 'Medium',
      why: { en: `The TLS certificate expired ${-h.tls.daysLeft} days ago. Users are trained to click through warnings, and an unmaintained certificate usually means an unmaintained server.`, id: `Sertifikat TLS kedaluwarsa ${-h.tls.daysLeft} hari lalu. Pengguna jadi terbiasa mengabaikan peringatan, dan sertifikat yang tidak terurus biasanya menandakan server yang tidak terurus.` },
      fix: { en: 'Renew the certificate with automatic renewal (ACME / Let\'s Encrypt), or remove the DNS record if the system is no longer used.', id: 'Perpanjang sertifikat dengan pembaruan otomatis (ACME / Let\'s Encrypt), atau hapus record DNS jika sistem sudah tidak dipakai.' },
    });
  } else if (h?.tls && h.tls.daysLeft <= 30) {
    out.push({
      severity: h.tls.daysLeft <= 14 ? 'Medium' : 'Low',
      why: { en: `The TLS certificate expires in ${h.tls.daysLeft} days. If it lapses, browsers and API clients will refuse to connect.`, id: `Sertifikat TLS kedaluwarsa dalam ${h.tls.daysLeft} hari. Jika terlewat, browser dan klien API akan menolak koneksi.` },
      fix: { en: 'Renew the certificate now and turn on automatic renewal.', id: 'Perpanjang sertifikat sekarang dan aktifkan pembaruan otomatis.' },
    });
  } else if (h?.tls && !h.tls.valid) {
    out.push({
      severity: 'Low',
      why: { en: `The certificate is not trusted by browsers (${h.tls.error ?? 'untrusted'}), which makes impersonating this host easier.`, id: `Sertifikat tidak dipercaya browser (${h.tls.error ?? 'untrusted'}), sehingga host ini lebih mudah dipalsukan.` },
      fix: { en: 'Install a certificate from a public CA that matches this hostname.', id: 'Pasang sertifikat dari CA publik yang sesuai dengan hostname ini.' },
    });
  }

  if (category === 'Admin / Login Portal' && h?.hasLoginForm) {
    out.push({
      severity: 'Medium',
      why: { en: 'An administrative login page is reachable from anywhere, which invites password spraying with leaked staff credentials.', id: 'Halaman login administratif dapat diakses dari mana saja, sehingga mengundang password spraying dengan kredensial karyawan yang bocor.' },
      fix: { en: 'Require SSO with MFA and restrict the page to VPN or office IP ranges.', id: 'Wajibkan SSO dengan MFA dan batasi halaman ke rentang IP VPN atau kantor.' },
    });
  }

  if (category === 'Shadow IT / Forgotten Asset') {
    out.push({
      severity: 'Medium',
      why: { en: 'This looks like a forgotten system. Unowned hosts miss patches and get taken over to host phishing under your domain.', id: 'Ini tampak seperti sistem yang terlupakan. Host tanpa pemilik tidak mendapat patch dan sering diambil alih untuk phishing di bawah domain Anda.' },
      fix: { en: 'Find the owner; if nobody claims it, remove the DNS record and shut the server down.', id: 'Cari pemiliknya; jika tidak ada yang mengakui, hapus record DNS dan matikan servernya.' },
    });
  }

  if (h && h.status >= 500) {
    out.push({
      severity: 'Low',
      why: { en: `The server answers HTTP ${h.status}. Error pages often leak stack traces, file paths or framework versions.`, id: `Server merespons HTTP ${h.status}. Halaman error sering membocorkan stack trace, path file, atau versi framework.` },
      fix: { en: 'Turn off debug mode and serve a generic error page.', id: 'Matikan mode debug dan tampilkan halaman error generik.' },
    });
  }

  const banner = [h?.server, h?.poweredBy].filter((v): v is string => Boolean(v && /\d/.test(v))).join(', ');
  if (banner) {
    out.push({
      severity: 'Low',
      why: { en: `Response headers reveal exact software versions (${banner}), which lets attackers match known exploits quickly.`, id: `Header respons membocorkan versi software persisnya (${banner}), sehingga penyerang cepat mencocokkan exploit yang ada.` },
      fix: { en: 'Hide version banners (nginx: server_tokens off; Apache: ServerTokens Prod; PHP: expose_php = Off).', id: 'Sembunyikan banner versi (nginx: server_tokens off; Apache: ServerTokens Prod; PHP: expose_php = Off).' },
    });
  }

  if (h?.scheme === 'https' && h.status < 400 && !h.hsts) {
    out.push({
      severity: 'Low',
      why: { en: 'No Strict-Transport-Security header, so a first visit can be downgraded to plain HTTP on hostile Wi-Fi.', id: 'Tidak ada header Strict-Transport-Security, sehingga kunjungan pertama bisa diturunkan ke HTTP biasa di Wi-Fi yang tidak aman.' },
      fix: { en: 'Add "Strict-Transport-Security: max-age=31536000; includeSubDomains" at the web server or load balancer.', id: 'Tambahkan "Strict-Transport-Security: max-age=31536000; includeSubDomains" di web server atau load balancer.' },
    });
  }

  if (h?.scheme === 'http') {
    out.push({
      severity: h.hasLoginForm ? 'High' : 'Low',
      why: { en: `The site is only served over unencrypted HTTP${h.hasLoginForm ? ', so passwords typed here travel in clear text' : ''}.`, id: `Situs hanya tersedia lewat HTTP tanpa enkripsi${h.hasLoginForm ? ', sehingga password yang diketik dikirim dalam teks biasa' : ''}.` },
      fix: { en: 'Enable HTTPS with a valid certificate and redirect port 80 to 443.', id: 'Aktifkan HTTPS dengan sertifikat valid dan alihkan port 80 ke 443.' },
    });
  }

  return out.sort((x, y) => SEVERITY_RANK[x.severity] - SEVERITY_RANK[y.severity]);
}

export function heuristicTriage(a: DiscoveredAsset): Triage {
  const category = classify(a);
  const list = findings(a, category);
  if (list.length === 0) {
    return {
      hostname: a.hostname,
      category,
      severity: 'Info',
      exposureReasoning: { en: 'Nothing unusual is visible from outside.', id: 'Tidak ada hal mencurigakan yang terlihat dari luar.' },
      remediationStep: { en: 'No action needed. Keep it in the asset inventory.', id: 'Tidak perlu tindakan. Tetap catat dalam inventaris aset.' },
      source: 'heuristic',
    };
  }
  const [top, second] = list;
  return {
    hostname: a.hostname,
    category,
    severity: top.severity,
    exposureReasoning: {
      en: [top.why.en, second?.why.en].filter(Boolean).join(' '),
      id: [top.why.id, second?.why.id].filter(Boolean).join(' '),
    },
    remediationStep: top.fix,
    source: 'heuristic',
  };
}

export function heuristicBrief(domain: string, triage: Triage[]): ExecutiveBrief {
  const ranked = [...triage].sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
  const urgent = ranked.filter((t) => t.severity === 'Critical' || t.severity === 'High');
  const count = (s: Severity) => triage.filter((t) => t.severity === s).length;
  return {
    summary: {
      en: `We found ${triage.length} internet-facing systems under ${domain}. ${count('Critical')} need action today and ${count('High')} more this week.`,
      id: `Kami menemukan ${triage.length} sistem yang menghadap internet di bawah ${domain}. ${count('Critical')} perlu ditangani hari ini dan ${count('High')} lainnya minggu ini.`,
    },
    topFixes: (urgent.length ? urgent : ranked.filter((t) => t.severity !== 'Info')).slice(0, 3).map((t) => ({
      title: { en: `Fix ${t.hostname}`, id: `Perbaiki ${t.hostname}` },
      detail: t.remediationStep,
      hostnames: [t.hostname],
    })),
  };
}
