import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Craton EASM',
    short_name: 'Craton',
    description: 'External attack surface management for Indonesian enterprises.',
    start_url: '/',
    display: 'standalone',
    background_color: '#111418',
    theme_color: '#111418',
    icons: [
      { src: '/icon.png', type: 'image/png', sizes: '512x512' },
      { src: '/brand/icon-192.png', type: 'image/png', sizes: '192x192' },
      { src: '/brand/icon-512-maskable.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
      { src: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  };
}
