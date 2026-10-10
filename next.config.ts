// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},

  // Next.js 16.3 + Vercel currently conflicts with standalone output:
  // Vercel's build adapter expects .next/next-server.js.nft.json, which
  // Next.js 16.3 no longer emits when the Vercel adapter is active.
  // Vercel does not need standalone output, so only enable it for non-Vercel builds.
  output: process.env.VERCEL ? undefined : 'standalone',

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'unavatar.io' },
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
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

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle Node.js modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        'util/types': false,
        crypto: false,
        stream: false,
        buffer: false,
        path: false,
        os: false,
        child_process: false,
        zlib: false,
        http: false,
        https: false,
        querystring: false,
        url: false,
      };
    }

    // Ensure better-auth and related packages are externalized for server
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        '@better-auth/drizzle-adapter',
        'pg',
        'better-auth',
        'jose',
      ];
    }

    return config;
  },
};

export default nextConfig;