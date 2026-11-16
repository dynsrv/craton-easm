import type { Metadata } from 'next';
import { PUBLIC_THEME_SCRIPT } from '@/lib/public-theme';
import { notFound } from 'next/navigation';
import { LegalPage } from '@/components/legal-page';
import { LEGAL_SLUGS, type LegalSlug } from '@/lib/legal';
import { LEGAL } from '@/lib/legal-content';

// Static: the five legal pages are built once and served from the edge.
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

const isSlug = (s: string): s is LegalSlug => (LEGAL_SLUGS as readonly string[]).includes(s);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!isSlug(slug)) return {};
  return { title: LEGAL[slug].title[0], description: LEGAL[slug].summary[0], alternates: { canonical: `/legal/${slug}` } };
}

export default async function Legal({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();
  return (
    <>
      {/* Same always-dark look as the landing page, set before first paint. */}
      <script dangerouslySetInnerHTML={{ __html: PUBLIC_THEME_SCRIPT }} />
      <LegalPage slug={slug} />
    </>
  );
}
