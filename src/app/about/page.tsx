import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/header";
import AboutPageClient from "./page-client";

export const metadata: Metadata = {
  title: "About KIPSMTHN | Creative Platform",
  description:
    "KIPSMTHN is a multi-tenant creative portfolio engine and private client delivery platform for photographers, filmmakers, and creative teams.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About KIPSMTHN | Creative Platform",
    description:
      "KIPSMTHN is a multi-tenant creative portfolio engine and private client delivery platform for photographers, filmmakers, and creative teams.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "KIPSMTHN About",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About KIPSMTHN | Creative Platform",
    description:
      "KIPSMTHN is a multi-tenant creative portfolio engine and private client delivery platform for photographers, filmmakers, and creative teams.",
  },
};

const resolveImage = (
  source?: string | null,
  fallbackUrl?: string
) => {
  if (!source) {
    return (
      fallbackUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80"
    );
  }

  if (
    source.startsWith("http://") ||
    source.startsWith("https://")
  ) {
    return source;
  }

  return source;
};

export default function AboutPage() {
  return <AboutPageClient />;
}