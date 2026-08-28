// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'unavatar.io' },
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.clerk.com' },
    ],
  },

  // Redirect uppercase /Portal to lowercase /portal to avoid duplicate route/page conflicts
  async redirects() {
    return [
      {
        source: '/Portal/:path*',
        destination: '/portal/:path*',
        permanent: true,
      },
      {
        source: '/Portal',
        destination: '/portal',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;