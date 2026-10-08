import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/header";
import ThemeToggle from "@/components/ThemeToggle";
import { useCreator } from "@/context/CreatorContext";

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
  const { activeCreator } = useCreator();

  return (
    <main className="min-h-screen bg-white dark:bg-[#09090b]">
      <Header />
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            About KIPSMTHN
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-zinc-400">
            KIPSMTHN is a multi-tenant creative portfolio engine and private
            client delivery platform for photographers, filmmakers, and
            creative teams.
          </p>
        </div>
      </div>
    </main>
  );
}