// Next.js configuration for the Local Events web app.
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // The shared package ships TypeScript sources, so Next.js compiles it.
  transpilePackages: ['@local-events/shared'],
  typedRoutes: true,
};

export default withNextIntl(nextConfig);
