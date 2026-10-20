import Header from '@/components/header';
import Link from 'next/link';
import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: "Contact KIPSMTHN | Start a Project",
  description:
    "Contact KIPSMTHN in Nairobi, Kenya for commercial photography, brand films, motion graphics, and creative production services.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact KIPSMTHN | Start a Project",
    description:
      "Contact KIPSMTHN in Nairobi, Kenya for commercial photography, brand films, motion graphics, and creative production services.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "KIPSMTHN Contact",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact KIPSMTHN | Start a Project",
    description:
      "Contact KIPSMTHN in Nairobi, Kenya for commercial photography, brand films, motion graphics, and creative production services.",
  },
};

export default function ContactPage() {
  return (
    <div className="selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <Header />

      <section className="relative pt-36 pb-20 text-center space-y-8">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-purple-600/15 blur-3xl pointer-events-none rounded-full" />

        <p className="text-xs font-medium uppercase tracking-wider text-purple-600 dark:text-purple-400">
          INITIATE COLLABORATION
        </p>

        <h1 className="text-4xl font-light tracking-tight max-w-4xl mx-auto">
          Start a Project with <span className="font-normal text-[var(--color-accent)]">Kip-Smthn</span>
        </h1>

        <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Based in Nairobi, Kenya. Available for African startup ecosystem programs, venture studios, commercial photography, and brand media.
        </p>
      </section>

      {/* Direct Contact Cards */}
      <main className="py-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto px-6">
        {/* Direct Inquiries Card */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <Badge variant="default" className="bg-purple-500/15 text-purple-700 dark:text-purple-300">
              Direct Inquiries
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight">
              Somboriot Kipchilat
            </h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                📧 Email: <a href="mailto:somboriot@gmail.com" className="text-[var(--color-accent)] font-medium hover:underline">
                  somboriot@gmail.com
                </a>
              </p>
              <p>
                📱 Phone: <a href="tel:+254722145776" className="text-[var(--color-accent)] font-medium hover:underline">
                  +254 722 145 776
                </a>
              </p>
              <p>📍 Location: Nairobi, Kenya</p>
              <p>🧾 KRA eTIMS & WHT Compliant</p>
            </div>
          </CardContent>
        </Card>

        {/* Social & Digital Media Card */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <Badge variant="default" className="bg-purple-500/15 text-purple-700 dark:text-purple-300">
              Social & Digital Media
            </Badge>
            <h2 className="text-2xl font-semibold tracking-tight">
              Channels & Archives
            </h2>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link href="https://www.linkedin.com/in/sombo09/" target="_blank" rel="noopener noreferrer">
                  LinkedIn Profile
                </Link>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link href="https://www.youtube.com/@kraftdigital7749" target="_blank" rel="noopener noreferrer">
                  YouTube / Kraft Digital
                </Link>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link href="https://linktr.ee/kipsmthn" target="_blank" rel="noopener noreferrer">
                  Linktree Directory
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}