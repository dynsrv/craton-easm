import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Prisma ships a native query engine; keep it out of the server bundle.
  serverExternalPackages: ['@prisma/client', 'playwright-core', '@sparticuz/chromium'],
  // The serverless Chromium ships as compressed files that are read at runtime: make sure they are deployed.
  outputFileTracingIncludes: {
    '/api/scans': ['./node_modules/@sparticuz/chromium/bin/**'],
    '/api/cron/monitor': ['./node_modules/@sparticuz/chromium/bin/**'],
  },
};

export default nextConfig;
