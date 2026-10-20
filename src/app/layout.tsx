import type { Metadata, Viewport } from 'next';
import './globals.css';

import { CreatorProvider } from '@/context/CreatorContext';
import ThemeScript from '@/components/ThemeScript';
import QueryProvider from '@/components/QueryProvider';
import { validateEnv } from '@/lib/env';
import { Analytics } from '@vercel/analytics/next';

validateEnv();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#09090b',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Kipsmthn | Creative Platform',
  description: 'Commercial Photography, Brand Films, Motion Graphics & Startup Ecosystem Storytelling.',
  openGraph: {
    title: 'Kipsmthn | Creative Platform',
    description: 'Creative infrastructure for photographers, filmmakers and studios in Nairobi.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'KIPSMTHN — Creative Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kipsmthn | Creative Platform',
    description: 'Creative infrastructure for photographers, filmmakers and studios in Nairobi.',
    images: ['/og-image.svg'],
  },
  icons: { icon: '/site-icon.svg', shortcut: '/site-icon.svg', apple: '/site-icon.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <ThemeScript />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments)} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { send_page_view: false });`,
              }}
            />
          </>
        )}
      </head>
<<<<<<< HEAD
      <body className="font-sans antialiased selection:bg-primary selection:text-primary-foreground">
        <a
          href="#main-content"
          className="absolute left-4 top-2 z-50 -translate-y-24 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-transform focus:translate-y-0"
        >
          Skip to main content
        </a>
=======
      <body className="font-sans antialiased selection:bg-purple-600 selection:text-white">
>>>>>>> c898786fba874637680566941fd0b37ceea58254
        <QueryProvider>
          <CreatorProvider>{children}</CreatorProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
