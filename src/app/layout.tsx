// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Outfit, Montserrat } from 'next/font/google';
import Script from 'next/script'; // 👈 Import Next.js Script component
import './globals.css';
import { CreatorProvider } from '@/context/CreatorContext';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#09090b',
};

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700'],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Kipsmthn | Multi-Tenant Creator Platform',
  description: 'Commercial Photography, Brand Films, Motion Graphics & Startup Ecosystem Storytelling.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${montserrat.variable} dark`}
      suppressHydrationWarning
    >
      <head />
      <body className="font-sans antialiased selection:bg-purple-600 selection:text-white">
        {/* 💡 NEXT.JS SCRIPT COMPONENT WITH BEFORE-INTERACTIVE STRATEGY */}
        <Script
          id="theme-persistence"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />

        {/* Multi-Tenant Creator Context */}
        <CreatorProvider>
          {children}
        </CreatorProvider>
      </body>
    </html>
  );
}