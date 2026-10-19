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
    <div className="ui-page">
      <Header />

      <section className="ui-shell">
        <div className="" />

        <p className="ui-eyebrow">
          INITIATE COLLABORATION
        </p>

        <h1 className="ui-page-title">
          Start a Project with <span className="">Kip-Smthn</span>
        </h1>

        <p className="ui-body">
          Based in Nairobi, Kenya. Available for African startup ecosystem programs, venture studios, commercial photography, and brand media.
        </p>
      </section>

      {/* Direct Contact Cards */}
      <main className="ui-shell">
        {/* Direct Inquiries Card */}
        <div className="ui-card">
          <span className="ui-badge ui-badge-accent">
            Direct Inquiries
          </span>
          <h2 className="ui-section-title">
            Somboriot Kipchilat
          </h2>
          <div className="ui-meta">
            <p>
              📧 Email: <a href="mailto:somboriot@gmail.com" className="">
                somboriot@gmail.com
              </a>
            </p>
            <p>
              📱 Phone: <a href="tel:+254722145776" className="">
                +254 722 145 776
              </a>
            </p>
            <p>📍 Location: Nairobi, Kenya</p>
            <p>🧾 KRA eTIMS & WHT Compliant</p>
          </div>
        </div>

        {/* Social & Digital Media Card */}
        <div className="ui-card">
          <span className="ui-badge ui-badge-accent">
            Social & Digital Media
          </span>
          <h2 className="ui-section-title">
            Channels & Archives
          </h2>
          <div className="">
            <Button
              variant="secondary"
              size="sm"
              className=""
              asChild
            >
              <Link href="https://www.linkedin.com/in/sombo09/" target="_blank" rel="noopener noreferrer">
                LinkedIn Profile
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className=""
              asChild
            >
              <Link href="https://www.youtube.com/@kraftdigital7749" target="_blank" rel="noopener noreferrer">
                YouTube / Kraft Digital
              </Link>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className=""
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
