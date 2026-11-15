import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Prisma ships a native query engine; keep it out of the server bundle.
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
