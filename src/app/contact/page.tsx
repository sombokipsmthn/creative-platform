import Header from '@/components/header';
import Link from 'next/link';
import type { Metadata } from 'next';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/Button';

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
    <div className="ui-page selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <Header />

      <section className="ui-shell relative pt-36 pb-20 text-center space-y-8">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-purple-600/15 blur-3xl pointer-events-none rounded-full" />

        <p className="ui-eyebrow">
          INITIATE COLLABORATION
        </p>

        <h1 className="ui-page-title text-4xl max-w-4xl mx-auto">
          Start a Project with <span className="font-normal text-[var(--color-accent)]">Kip-Smthn</span>
        </h1>

        <p className="ui-body max-w-2xl mx-auto leading-relaxed">
          Based in Nairobi, Kenya. Available for African startup ecosystem programs, venture studios, commercial photography, and brand media.
        </p>
      </section>

      {/* Direct Contact Cards */}
      <main className="ui-shell py-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        {/* Direct Inquiries Card */}
        <div className="ui-card p-6 space-y-4">
          <span className="ui-badge ui-badge-accent">
            Direct Inquiries
          </span>
          <h2 className="ui-section-title text-2xl">
            Somboriot Kipchilat
          </h2>
          <div className="ui-meta space-y-2">
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
        </div>

        {/* Social & Digital Media Card */}
        <div className="ui-card p-6 space-y-4">
          <span className="ui-badge ui-badge-accent">
            Social & Digital Media
          </span>
          <h2 className="ui-section-title text-2xl">
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
        </div>
      </main>

      <Footer />
    </div>
  );
}
