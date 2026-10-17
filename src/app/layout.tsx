import type { Metadata, Viewport } from 'next';
import './globals.css';

import { CreatorProvider } from '@/context/CreatorContext';
import ThemeScript from '@/components/ThemeScript';
import QueryProvider from '@/components/QueryProvider';
import { validateEnv } from '@/lib/env';
const Analytics = () => null;

validateEnv();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#09090b',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Kipsmthn Creative Platform',
  description: 'A modern, responsive creative platform and portfolio with content management and professional showcase capabilities.',
  openGraph: {
    title: 'Kipsmthn Creative Platform',
    description: 'A modern, responsive creative platform and portfolio with content management and professional showcase capabilities.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Kipsmthn Creative Platform' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kipsmthn Creative Platform',
    description: 'A modern, responsive creative platform and portfolio with content management and professional showcase capabilities.',
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
      <body className="font-sans antialiased selection:bg-purple-600 selection:text-white">
        <QueryProvider>
          <CreatorProvider>{children}</CreatorProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
