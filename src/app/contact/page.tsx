import Header from '@/components/header';
import Link from 'next/link';
import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

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
    <div className="min-h-screen bg-background text-foreground selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <Header />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-36 pb-20 text-center space-y-8">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-purple-600/15 blur-3xl pointer-events-none rounded-full" />

        <p className="text-[0.625rem] font-semibold text-[var(--color-accent)] uppercase tracking-wider">
          INITIATE COLLABORATION
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-foreground max-w-4xl mx-auto">
          Start a Project with <span className="font-normal text-[var(--color-accent)]">Kip-Smthn</span>
        </h1>

        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Based in Nairobi, Kenya. Available for African startup ecosystem programs, venture studios, commercial photography, and brand media.
        </p>
      </section>

      {/* Direct Contact Cards */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {/* Direct Inquiries Card */}
        <Card className="p-6 space-y-4">
          <CardHeader>
            <Badge variant="default">Direct Inquiries</Badge>
            <CardTitle className="text-2xl font-semibold text-foreground">
              Somboriot Kipchilat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
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
            <p className="text-sm text-muted-foreground">📍 Location: Nairobi, Kenya</p>
            <p className="text-sm text-muted-foreground">🧾 KRA eTIMS & WHT Compliant</p>
          </CardContent>
        </Card>

        {/* Social & Digital Media Card */}
        <Card className="p-6 space-y-4">
          <CardHeader>
            <Badge variant="default">Social & Digital Media</Badge>
            <CardTitle className="text-2xl font-semibold text-foreground">
              Channels & Archives
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-0">
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
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}