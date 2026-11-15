import '@fontsource-variable/inter';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Craton EASM',
  description: 'Zero-integration external attack surface management for Indonesian enterprises.',
  robots: { index: false, follow: false },
};

// Runs before first paint so the saved (or system) theme never flashes the wrong palette.
const THEME_SCRIPT = `(function(){var t;try{t=localStorage.getItem('craton-theme')}catch(e){}if(t!=='light'&&t!=='dark'){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
