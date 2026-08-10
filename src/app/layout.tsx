// src/app/layout.tsx
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'SOMBO | Creative Portfolio & Client Portal',
  description: 'Commercial Photography, Brand Films, Motion Graphics & Visual Identity.',
  metadataBase: new URL('https://kipsmthn.com'),
  openGraph: {
    title: 'SOMBO | Creative Director & Visual Artist',
    description: 'Commercial Photography, Brand Films, Motion Graphics & Visual Identity.',
    url: 'https://kipsmthn.com',
    siteName: 'SOMBO',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} dark`}>
      <body className="bg-canvas text-zinc-100 font-sans antialiased selection:bg-brand-purple-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}