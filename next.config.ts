import { readFileSync } from 'node:fs';
import type { NextConfig } from 'next';

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

const nextConfig: NextConfig = {
  // Put the (small) stylesheet in the HTML: one network round trip fewer before the first paint.
  experimental: { inlineCss: true },
  // Brand images are not fingerprinted, so cache them for a day and refresh in the background.
  async headers() {
    return [{ source: '/brand/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }] }];
  },
  // Shown in the footer of every page.
  env: { NEXT_PUBLIC_APP_VERSION: version, NEXT_PUBLIC_APP_BUILD: (process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7) },
  // Prisma ships a native query engine; keep it out of the server bundle.
  serverExternalPackages: ['@prisma/client', 'playwright-core', '@sparticuz/chromium'],
  // The serverless Chromium ships as compressed files that are read at runtime: make sure they are deployed.
  outputFileTracingIncludes: {
    '/api/scans': ['./node_modules/@sparticuz/chromium/bin/**'],
    '/api/cron/monitor': ['./node_modules/@sparticuz/chromium/bin/**'],
    '/api/cron/selftest': ['./node_modules/@sparticuz/chromium/bin/**'],
  },
};

export default nextConfig;
