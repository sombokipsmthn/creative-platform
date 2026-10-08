import type { Metadata } from "next";
import AboutPageClient from "./page-client";

export const metadata: Metadata = {
  title: 'About KIPSMTHN | Creative Platform',
  description: 'KIPSMTHN is a multi-tenant creative portfolio engine and private client delivery platform for photographers, filmmakers, and creative teams.',
  alternates: { canonical: "/about" },
  openGraph: {
    title: 'About KIPSMTHN | Creative Platform',
    description: 'KIPSMTHN is a multi-tenant creative portfolio engine and private client delivery platform for photographers, filmmakers, and creative teams.',
    images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
