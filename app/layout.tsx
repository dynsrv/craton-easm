import './globals.css';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';

// Self-hosted and preloaded with the HTML, with a metric-matched fallback so text does not jump.
const inter = localFont({
  src: '../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-inter',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://security.digitalstrategy.id';
const DESCRIPTION =
  'Craton maps what attackers can see of your company from the internet: forgotten subdomains, exposed services, subdomain takeover risks, leaked code and open cloud storage. A bilingual executive brief tells you what to fix first. No agents, no integration.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Craton EASM: external attack surface management', template: '%s · Craton EASM' },
  description: DESCRIPTION,
  applicationName: 'Craton EASM',
  keywords: [
    'external attack surface management',
    'EASM',
    'attack surface',
    'subdomain takeover',
    'cyber security Indonesia',
    'keamanan siber',
    'manajemen permukaan serangan',
    'OSINT',
    'vulnerability exposure',
  ],
  authors: [{ name: 'DynSrv' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Craton EASM',
    url: '/',
    title: 'Craton EASM: see your company the way an attacker does',
    description: DESCRIPTION,
    locale: 'en_US',
    alternateLocale: ['id_ID'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Craton EASM: see your company the way an attacker does',
    description: DESCRIPTION,
  },
  // The landing page and sign-in page are public; signed-in pages opt out of indexing themselves.
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#111418' },
    { media: '(prefers-color-scheme: light)', color: '#f6f7f9' },
  ],
};

// Runs before first paint so the saved (or system) theme never flashes the wrong palette.
const THEME_SCRIPT = `(function(){var t;try{t=localStorage.getItem('craton-theme')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {/* The logo is painted through a CSS mask, so the browser would otherwise find it late. */}
        <link rel="preload" href="/brand/craton-logo.png" as="image" />
      </head>
      <body>{children}</body>
    </html>
  );
}
