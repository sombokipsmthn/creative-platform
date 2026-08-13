<<<<<<< HEAD
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import "./globals.css";
=======
// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Outfit, Montserrat } from 'next/font/google';
import './globals.css';
import { CreatorProvider } from '@/context/CreatorContext';
import ThemeScript from '@/components/ThemeScript';
>>>>>>> 9f8fb121e74b992ce270fd85a042444e53857047

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#09090b",
};

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "Kipsmthn | Creative Platform",
  description:
    "Commercial Photography, Brand Films, Motion Graphics & Startup Ecosystem Storytelling.",
=======
  title: 'Kipsmthn | Multi-Tenant Creator Platform',
  description: 'Commercial Photography, Brand Films, Motion Graphics & Startup Ecosystem Storytelling.',
>>>>>>> 9f8fb121e74b992ce270fd85a042444e53857047
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< HEAD
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ClerkProvider>
          {children}
        </ClerkProvider>
=======
    <html
      lang="en"
      className={`${outfit.variable} ${montserrat.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        {/* 💡 React 19 / Next.js 16 Safe Server HTML Injection */}
        <ThemeScript />
      </head>
      <body className="font-sans antialiased selection:bg-purple-600 selection:text-white">
        <CreatorProvider>
          {children}
        </CreatorProvider>
>>>>>>> 9f8fb121e74b992ce270fd85a042444e53857047
      </body>
    </html>
  );
}