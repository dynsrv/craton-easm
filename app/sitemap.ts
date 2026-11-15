import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://security.digitalstrategy.id';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${SITE_URL}/login`, changeFrequency: 'monthly', priority: 1 }];
}
