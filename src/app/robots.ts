import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/services', '/work', '/contact'],
        disallow: [
          '/admin/',
          '/api/',
          '/sign-in',
          '/sign-up',
          '/portal/',
          '/dashboard/',
          '/settings/',
        ],
      },
    ],
    sitemap: 'https://creative-platform.vercel.app/sitemap.xml',
  }
}