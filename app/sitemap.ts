import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://security.digitalstrategy.id';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/compliance`, changeFrequency: 'monthly', priority: 0.7 },
    ...['terms', 'privacy', 'acceptable-use', 'liability', 'complaints'].map((s) => ({ url: `${SITE_URL}/legal/${s}`, changeFrequency: 'yearly' as const, priority: 0.4 })),
    { url: `${SITE_URL}/login`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
