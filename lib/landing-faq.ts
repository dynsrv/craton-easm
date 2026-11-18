/** FAQ copy for the landing page. Kept apart from the client component so the page can also emit it as structured data. */
export interface Faq {
  q: string;
  a: string;
}

export const LANDING_FAQ: { en: Faq[]; id: Faq[] } = {
  en: [
    { q: 'What does EASM stand for?', a: 'External attack surface management. It means finding and watching everything your organisation exposes to the internet, from the outside, the way an attacker would see it.' },
    { q: 'Is EASM the same as vulnerability scanning?', a: 'No. A vulnerability scanner checks the systems you point it at. EASM first finds the systems you did not know about, then checks them. The two work well together.' },
    { q: 'Does Craton touch our systems?', a: 'No. Craton is passive. It reads public records and makes ordinary web requests, like a visitor. It never port scans, brute forces, logs in or exploits a vulnerability.' },
    { q: 'Does EASM replace a penetration test?', a: 'No. A penetration test goes deep on an agreed scope at one point in time. EASM goes wide and keeps running. Use it to decide what to test and to check between tests.' },
    { q: 'Who should run it?', a: 'Security and IT teams authorised to assess the domain. Every scan needs an authorisation confirmation, and access is by invitation.' },
    { q: 'How quickly do I get results?', a: 'A scan takes minutes. Monitoring then rescans daily and compares each result with the one before, so new exposure is caught the day it appears.' },
  ],
  id: [
    { q: 'Apa kepanjangan EASM?', a: 'External attack surface management, atau manajemen permukaan serangan eksternal. Artinya menemukan dan memantau semua yang diekspos organisasi Anda ke internet, dari luar, seperti yang dilihat penyerang.' },
    { q: 'Apakah EASM sama dengan pemindaian kerentanan?', a: 'Tidak. Pemindai kerentanan memeriksa sistem yang Anda arahkan. EASM lebih dulu menemukan sistem yang tidak Anda ketahui, lalu memeriksanya. Keduanya saling melengkapi.' },
    { q: 'Apakah Craton menyentuh sistem kami?', a: 'Tidak. Craton bersifat pasif. Craton membaca catatan publik dan mengirim permintaan web biasa, seperti pengunjung. Craton tidak pernah memindai port, brute force, login, atau mengeksploitasi kerentanan.' },
    { q: 'Apakah EASM menggantikan uji penetrasi?', a: 'Tidak. Uji penetrasi menggali dalam pada cakupan yang disepakati di satu waktu. EASM menjangkau luas dan terus berjalan. Gunakan untuk menentukan apa yang perlu diuji dan memeriksa di antara dua pengujian.' },
    { q: 'Siapa yang sebaiknya menjalankannya?', a: 'Tim keamanan dan TI yang berwenang menilai domain tersebut. Setiap pemindaian memerlukan konfirmasi otorisasi, dan akses melalui undangan.' },
    { q: 'Seberapa cepat hasilnya keluar?', a: 'Satu pemindaian hanya butuh hitungan menit. Pemantauan lalu memindai ulang setiap hari dan membandingkan tiap hasil dengan sebelumnya, sehingga eksposur baru tertangkap di hari yang sama.' },
  ],
};
