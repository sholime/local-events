// Web app manifest, so phones can install the app to the home screen (PWA).
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Local Events',
    short_name: 'Local Events',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafaf7',
    theme_color: '#b4442c',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  };
}
