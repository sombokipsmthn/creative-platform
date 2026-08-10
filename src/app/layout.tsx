// src/app/layout.tsx
import type { Metadata } from 'next';
import { Outfit, Montserrat } from 'next/font/google';
import './globals.css';

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
  title: 'Kipsmthn | Creative & Client Delivery Engine',
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
      <head>
        <script
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
      </head>
      {/* 💡 Clean body tag without hardcoded dark:bg classes */}
      <body className="font-sans antialiased selection:bg-purple-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}