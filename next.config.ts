// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Gallery uploads allow files up to 100MB. The proxy buffers a copy of
  // incoming request bodies before the route handler receives them, so leave
  // room for multipart/form-data boundaries and metadata.
  experimental: {
    proxyClientMaxBodySize: '110mb',
  },

  turbopack: {},

  // Disable trailing slash redirects to prevent 308 loops
  trailingSlash: false,

  images: {
    // Gallery media is served through a same-origin API route with a
    // dynamic ?key= query parameter. Omitting "search" allows that query.
    localPatterns: [
      {
        pathname: '/api/public/galleries/media',
      },
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'unavatar.io' },
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'logo.clearbit.com' },
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
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
