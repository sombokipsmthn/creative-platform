import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#09090b",
};

export const metadata: Metadata = {
  title: "Kipsmthn | Creative Platform",
  description:
    "Commercial Photography, Brand Films, Motion Graphics & Startup Ecosystem Storytelling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey =
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    "pk_test_Y2xlcmsua2lwc210aG4uY29tJA";

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ClerkProvider publishableKey={publishableKey}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}