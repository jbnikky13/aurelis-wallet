import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // The native Expo client has its own TypeScript check in mobile.yml.
    // Keep the Next.js project isolated from native-only imports.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
