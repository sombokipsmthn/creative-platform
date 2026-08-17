// src/app/layout.tsx

import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import './globals.css';

import { CreatorProvider } from '@/context/CreatorContext';
import ThemeScript from '@/components/ThemeScript';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#09090b',
};


export const metadata: Metadata = {
  title: 'Kipsmthn | Creative Platform',
  description:
    'Commercial Photography, Brand Films, Motion Graphics & Startup Ecosystem Storytelling.',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;


  return (
    <ClerkProvider publishableKey={publishableKey}>

      <html
        lang="en"
        className="dark"
        suppressHydrationWarning
      >

        <head>
          <ThemeScript />
        </head>


        <body
          className="font-sans antialiased selection:bg-purple-600 selection:text-white"
        >

          <CreatorProvider>
            {children}
          </CreatorProvider>

        </body>

      </html>

    </ClerkProvider>
  );
}