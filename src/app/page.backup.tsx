
"use client";

import Link from "next/link";
import Image from "next/image";

import Header from "@/components/header";
import ThemeToggle from "@/components/ThemeToggle";
// Homepage is independent of creator state — no useCreator needed

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80";

function resolveImage(source?: string | null) {
  if (!source) {
    return FALLBACK_IMAGE;
  }

  if (
    source.startsWith("http://") ||
    source.startsWith("https://")
  ) {
    return source;
  }

  return `https://lh3.googleusercontent.com/d/${source}`;
}

const platformFeatures = [
  {
    number: "01",
    title: "Build your creative presence",
    description:
      "Create a polished portfolio that gives your work a professional home and makes it easier for the right clients to discover you.",
  },
  {
    number: "02",
    title: "Manage clients in one place",
    description:
      "Keep client information, projects, quotes, invoices, and production details connected instead of scattered across different tools.",
  },
  {
    number: "03",
    title: "Create professional quotes",
    description:
      "Build clean, branded quotations with equipment, services, production costs, deposits, discounts, tax, and payment terms.",
  },
  {
    number: "04",
    title: "Deliver private galleries",
    description:
      "Give clients a simple private destination for reviewing, selecting, commenting on, and accessing their creative work.",
  },
  {
    number: "05",
    title: "Keep your workflow moving",
    description:
      "Move from enquiry to project, quotation, production, delivery, and payment without rebuilding the same information every time.",
  },
  {
    number: "06",
    title: "Stay in control",
    description:
      "Your creative business deserves a system designed around how you actually work — flexible, visual, and straightforward.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Create",
    text: "Build your profile and showcase the work you want clients to see.",
  },
  {
    step: "02",
    title: "Connect",
    text: "Manage clients and turn enquiries into organized projects.",
  },
  {
    step: "03",
    title: "Quote",
    text: "Create professional quotations using your own services and equipment.",
  },
  {
    step: "04",
    title: "Deliver",
    text: "Give clients a private, polished place to receive their work.",
  },
];

export default function HomePage() {
  // Homepage is independent of creator state — no useCreator needed
  const loading = false;
  const activeUser = null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#09090b] text-slate-900 dark:text-zinc-100">
        <Header />

        <main className="min-h-[70vh] flex items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 rounded-full border-2 border-purple-200 border-t-purple-600 animate-spin" />

            <p className="mt-5 text-sm text-slate-500 dark:text-zinc-400">