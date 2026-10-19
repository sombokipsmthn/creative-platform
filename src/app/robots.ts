import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/workflow', '/about', '/work', '/contact', '/p/'],
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