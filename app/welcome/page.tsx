import type { Metadata } from 'next';
import { Landing } from '@/components/landing';
import { LANDING_FAQ } from '@/lib/landing-faq';
import { PUBLIC_THEME_SCRIPT } from '@/lib/public-theme';

// Static: middleware rewrites "/" here for visitors without a session, so the landing page is served
// from the edge cache instead of waking a serverless function on every visit.
export const dynamic = 'force-static';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default function Welcome() {
  return (
    <>
      {/* Visitors get their saved theme, or dark the first time, before first paint. */}
      <script dangerouslySetInnerHTML={{ __html: PUBLIC_THEME_SCRIPT }} />
      <Landing />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: LANDING_FAQ.en.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          }),
        }}
      />
    </>
  );
}
