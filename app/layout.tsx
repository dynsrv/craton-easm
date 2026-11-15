import '@fontsource-variable/inter';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Craton EASM',
  description: 'Zero-integration external attack surface management for Indonesian enterprises.',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
