"use client"

import Image from "next/image";
import Link from "next/link";

const capabilities = [
  {
    number: "01",
    title: "Public Portfolio",
    description:
      "Build a polished public presence for your creative work with projects, imagery, biography, services, location and contact information.",
  },
  {
    number: "02",
    title: "Client Galleries",
    description:
      "Give clients private, branded spaces to view, organize and access their delivered photography, video and creative work.",
  },
  {
    number: "03",
    title: "Proofing & Feedback",
    description:
      "Let clients favorite work, track selections and leave feedback directly against the work instead of managing scattered messages.",
  },
  {
    number: "04",
    title: "Projects & Workflow",
    description:
      "Keep creative projects, clients, deliverables and business activity connected inside one creator workspace.",
  },
  {
    number: "05",
    title: "Quotes & Invoices",
    description:
      "Create professional quotations, convert approved quotes into invoices, calculate VAT and track the commercial side of your work.",
  },
  {
    number: "06",
    title: "Kenyan Tax Tools",
    description:
      "Designed around Kenyan creators with KRA-aware workflows, VAT calculations and an eTIMS-oriented invoicing workflow.",
  },
  {
    number: "07",
    title: "Receipt Intelligence",
    description:
      "Capture business receipts and extract useful merchant information such as KRA PIN details for your records.",
  },
  {
    number: "08",
    title: "High-Res Delivery",
    description:
      "Designed for large creative files and client delivery, with cloud object storage and high-resolution download workflows.",
  },
];


const workflow = [
  {
    number: "01",
    title: "Attract",
    description:
      "Present your work through a portfolio that communicates your style before the first conversation.",
  },
  {
    number: "02",
    title: "Convert",
    description:
      "Turn enquiries into structured clients, projects and professional quotations.",
  },
  {
    number: "03",
    title: "Create",
    description:
      "Keep the project and client relationship organized while you focus on the actual creative work.",
  },
  {
    number: "04",
    title: "Deliver",
    description:
      "Share finished work through private client spaces with proofing, selections and downloads.",
  },
  {
    number: "05",
    title: "Get Paid",
    description:
      "Move from approved quote to invoice and keep the financial side of the project connected.",
  },
];

const pricing = [
  {
    name: "Starter",
    price: "KSh 1,500",
    period: "/ month",
    description: "For independent creators getting their professional presence online.",
    features: [
      "Public creator portfolio",
      "Projects & work showcase",
      "Basic client management",
      "Quote creation",
      "Basic client galleries",
    ],
  },
  {
    name: "Studio",
    price: "KSh 3,500",
    period: "/ month",
    description: "For active creators managing clients, projects and regular deliveries.",
    features: [
      "Everything in Starter",
      "Private client galleries",
      "Proofing & favorites",
      "Invoices & quote conversion",
      "Expanded project management",
      "Professional client portal",
    ],
    featured: true,
  },
  {
    name: "Pro",
    price: "KSh 7,500",
    period: "/ month",
    description: "For established studios with a larger client and delivery workflow.",
    features: [
      "Everything in Studio",
      "Advanced delivery workflows",
      "High-resolution storage",
      "Receipt / tax tools",
      "KRA & eTIMS-oriented workflows",
      "Priority business features",
    ],
  },
];

const faqs = [
  {
    question: "Who is KIPSMTHN for?",
    answer:
      "KIPSMTHN is designed for photographers, filmmakers, designers, artists, creative freelancers, independent studios and other professionals who need both a strong creative presence and practical business tools.",
  },
  {
    question: "Is this only a portfolio builder?",
    answer:
      "No. The portfolio is the public-facing layer. Behind it is a creator workspace for clients, projects, galleries, proofing, quotations, invoices and business administration.",
  },
  {
    question: "Can clients access their work privately?",
    answer:
      "Yes. The platform is designed around private client portals and shareable gallery experiences rather than forcing clients into your internal workspace.",
  },
  {
    question: "Is KIPSMTHN built for Kenya?",
    answer:
      "Yes. The platform includes Kenyan-focused business concepts such as VAT calculations, KRA-related workflows and eTIMS-oriented invoicing.",
  },
];

export const metadata = {
  title: 'KIPSMTHN — Creative infrastructure for creators',
  description: 'KIPSMTHN connects portfolio, client delivery, quoting and invoicing for independent creators in Nairobi.',
  openGraph: {
    title: 'KIPSMTHN — Creative infrastructure for creators',
    description: 'KIPSMTHN connects portfolio, client delivery, quoting and invoicing for independent creators in Nairobi.',
    images: ['/og-image.svg'],
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-slate-50/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link
            href="/"
            className="text-lg font-semibold tracking-[0.18em]"
          >
            KIPSMTHN
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-slate-600 md:flex">
            <a href="#platform" className="transition hover:text-slate-950">
              Platform
            </a>
            <a href="#workflow" className="transition hover:text-slate-950">
              Workflow
            </a>
            <a href="#work" className="transition hover:text-slate-950">
              Work
            </a>
            <a href="#pricing" className="transition hover:text-slate-950">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className="hidden rounded-full px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 sm:block"
            >
              Sign in
            </Link>

            <Link
             href="/sign-up"
              className="rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="px-5 pb-14 pt-14 lg:px-8 lg:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.24em] text-purple-600">
                Creative infrastructure
              </p>

              <h1 className="max-w-4xl text-5xl font-light leading-[0.95] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
                Make the work.
                <br />
                <span className="text-slate-400">
                  Build the business.
                </span>
              </h1>
            </div>

            <div className="max-w-md lg:pb-1">
              <p className="text-base leading-7 text-slate-500">
                KIPSMTHN gives independent creators one place to
                present their work, manage clients, run projects,
                deliver creative work and handle the business behind
                it.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
  <Link
    href="/sign-up"
    className="rounded-full bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-purple-700"
  >
    Create your workspace
  </Link>

  <a
    href="#platform"
    className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium transition hover:border-slate-500"
  >
    Explore platform
  </a>
</div>
            </div>
          </div>

          <div className="relative mt-10 aspect-2/1 overflow-hidden bg-slate-200">
            <Image
              src="/team-photo.jpg"
              alt="Kips and the team at the studio"
              fill
              priority
              className="object-cover"
            />
 
            <div className="absolute bottom-4 left-4 max-w-xs bg-white/95 px-4 py-3 backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                One creative workspace
              </p>
              <p className="mt-1 text-sm font-medium">
                Portfolio → Client → Project → Delivery → Payment
              </p>
              <p className="mt-2 text-xs text-gray-500">Response time: We reply to enquiries within 24 hours.</p>
            </div>
          </div>

          {/* Sticky mobile call to action */}
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
            <a href="/sign-up" className="w-full rounded-full bg-purple-600 px-4 py-3 text-center text-sm font-medium text-white shadow-lg">Get started — create your workspace</a>
          </div>
        </div>
      </section>

      {/* Structured data: Breadcrumbs + LocalBusiness */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://kipsmthn.com/" }
            ]
          },
          {
            "@type": "LocalBusiness",
            "@id": "https://kipsmthn.com/#business",
            "name": "KIPSMTHN",
            "image": "https://kipsmthn.com/site-icon.svg",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Nairobi",
              "addressCountry": "KE"
            },
            "telephone": "+254700000000",
            "url": "https://kipsmthn.com/",
            "openingHours": "Mo-Fr 09:00-17:00"
          }
        ]
      })}} />

      {/* PLATFORM INTRO */}
      <section
        id="platform"
        className="border-t border-slate-200 px-5 py-16 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.35fr_0.65fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-purple-600">
                The platform
              </p>
            </div>

            <div>
              <h2 className="max-w-4xl text-3xl font-light leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Your creative practice should not be split across
                ten different tools.
              </h2>

              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-500">
                KIPSMTHN connects the public-facing creative
                experience with the operational side of running a
                creative business. Your portfolio, clients,
                projects, galleries, quotes and invoices can live in
                one ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}

      {/* CASE STUDIES */}
      <section className="px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.24em] text-purple-600">Case studies</p>
            <h2 className="mt-5 text-3xl font-light sm:text-4xl">Selected client work and outcomes</h2>
            <p className="mt-3 text-sm text-slate-500">Short case studies showing challenges, approach and outcomes.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-xl border p-4">
              <h3 className="font-medium">Brand launch — Studio X</h3>
              <p className="mt-2 text-sm text-slate-500">Photography, campaign content and launch support that increased engagement by 42%.</p>
            </article>

            <article className="rounded-xl border p-4">
              <h3 className="font-medium">Product film — Alpha Co.</h3>
              <p className="mt-2 text-sm text-slate-500">End-to-end production and post that helped the product reach 1M views.</p>
            </article>

            <article className="rounded-xl border p-4">
              <h3 className="font-medium">Event coverage — Summit 2025</h3>
              <p className="mt-2 text-sm text-slate-500">Full production and rapid delivery to press partners.</p>
            </article>
          </div>
        </div>
      </section>
      <section className="px-5 pb-16 lg:px-8 lg:pb-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid border-t border-slate-200 md:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((item) => (
              <article
                key={item.number}
                className="border-b border-slate-200 p-5 md:border-r md:p-6 lg:min-h-60"
              >
                <span className="text-xs font-medium text-purple-600">
                  {item.number}
                </span>

                <h3 className="mt-9 text-lg font-medium">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE — PORTFOLIO */}
      <section className="bg-slate-950 px-5 py-16 text-white lg:px-8 lg:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-4/3 overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1600&q=85"
              alt="Photographer working"
              fill
              unoptimized
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-purple-400">
              01 / Public presence
            </p>

            <h2 className="mt-5 text-3xl font-light leading-tight tracking-tight sm:text-4xl">
              Your portfolio is your first client meeting.
            </h2>

            <p className="mt-5 max-w-xl leading-7 text-white/55">
              Present selected projects, your creative point of view,
              services and professional identity in an experience
              that feels intentional instead of template-driven.
            </p>

            <ul className="mt-7 grid gap-3 text-sm text-white/75 sm:grid-cols-2">
              <li>• Project-based work presentation</li>
              <li>• Creator profile</li>
              <li>• Services & positioning</li>
              <li>• Contact / enquiry pathway</li>
              <li>• Custom creative identity</li>
              <li>• Light / dark presentation</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CLIENT EXPERIENCE */}
      <section className="px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-purple-600">
                02 / Client experience
              </p>

              <h2 className="mt-5 text-3xl font-light leading-tight tracking-tight sm:text-4xl">
                Make delivery feel as professional as the work.
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="border border-slate-200 p-6">
                <h3 className="font-medium">Private galleries</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Share private project galleries with clients
                  without exposing the rest of your workspace.
                </p>
              </div>

              <div className="border border-slate-200 p-6">
                <h3 className="font-medium">Proofing</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Clients can favorite work and communicate
                  selections without endless email threads.
                </p>
              </div>

              <div className="border border-slate-200 p-6">
                <h3 className="font-medium">Feedback</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Keep comments and project feedback connected to
                  the actual creative work.
                </p>
              </div>

              <div className="border border-slate-200 p-6">
                <h3 className="font-medium">Downloads</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Deliver high-resolution creative assets through a
                  dedicated client experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section
        id="workflow"
        className="border-y border-slate-200 bg-white px-5 py-16 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-purple-600">
              03 / Your workflow
            </p>

            <h2 className="mt-5 text-3xl font-light sm:text-4xl">
              From first impression to final payment.
            </h2>
          </div>

          <div className="grid border-t border-slate-200 md:grid-cols-5">
            {workflow.map((item) => (
              <div
                key={item.number}
                className="border-b border-slate-200 p-5 md:border-r md:border-b-0"
              >
                <span className="text-xs text-purple-600">
                  {item.number}
                </span>

                <h3 className="mt-8 font-medium">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUSINESS TOOLS */}
      <section className="px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-purple-600">
                04 / Business tools
              </p>

              <h2 className="mt-5 text-3xl font-light leading-tight sm:text-4xl">
                The boring business stuff, made part of the
                creative workflow.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-slate-500">
                Quotes, deposits, invoices, VAT calculations,
                client records and project lifecycle management
                should not feel like a completely separate business.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Quotation builder",
                "Quote lifecycle",
                "Invoice conversion",
                "Deposit calculations",
                "VAT calculations",
                "Client records",
                "Project records",
                "KRA / eTIMS workflow",
                "Receipt capture",
                "Business expense intelligence",
              ].map((item) => (
                <div
                  key={item}
                  className="border-b border-slate-200 py-4 text-sm"
                >
                  <span className="mr-3 text-purple-600">+</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WORK */}
      <section
        id="work"
        className="bg-slate-100 px-5 py-16 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-purple-600">
                05 / Work
              </p>

              <h2 className="mt-5 text-3xl font-light sm:text-4xl">
                Let the work do the talking.
              </h2>
            </div>

            <span className="hidden text-xs uppercase tracking-[0.2em] text-slate-400 sm:block">
              Selected possibilities
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-12">
            <div className="md:col-span-7">
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1600&q=85"
                  alt="Creative project"
                  fill
                  unoptimized
                  className="object-cover transition duration-700 hover:scale-105"
                />
              </div>
              <p className="mt-3 text-sm font-medium">
                Brand & Art Direction
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Identity / Campaign / Digital
              </p>
            </div>

            <div className="md:col-span-5 md:pt-20">
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1400&q=85"
                  alt="Creative event"
                  fill
                  unoptimized
                  className="object-cover transition duration-700 hover:scale-105"
                />
              </div>
              <p className="mt-3 text-sm font-medium">
                Photography & Film
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Editorial / Events / Commercial
              </p>
            </div>

            <div className="md:col-span-5">
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1400&q=85"
                  alt="Product design"
                  fill
                  unoptimized
                  className="object-cover transition duration-700 hover:scale-105"
                />
              </div>
              <p className="mt-3 text-sm font-medium">
                Product & Editorial
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Design / Objects / Content
              </p>
            </div>

            <div className="flex items-end md:col-span-7">
              <div className="max-w-lg py-8 md:pl-10">
                <p className="text-2xl font-light leading-snug">
                  A platform designed to make independent creative
                  work look and operate like a serious business.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORAGE */}
      <section className="px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden bg-purple-600 px-6 py-10 text-white sm:px-10">
            <div className="relative z-10 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                06 / Delivery
              </p>

              <h2 className="mt-5 text-3xl font-light sm:text-4xl">
                Your files are part of the experience.
              </h2>

              <p className="mt-5 max-w-xl leading-7 text-white/70">
                KIPSMTHN is designed around high-resolution
                photography and video workflows, including cloud
                object storage and client download experiences.
              </p>
            </div>

            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/20" />
            <div className="absolute -right-5 -top-5 h-44 w-44 rounded-full border border-white/15" />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="pricing"
        className="border-t border-slate-200 px-5 py-16 lg:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-purple-600">
              07 / Pricing
            </p>

            <h2 className="mt-5 text-3xl font-light sm:text-4xl">
              Simple plans for different stages of your practice.
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              These are placeholder prices for the product concept
              and are not current commercial pricing.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {pricing.map((plan) => (
              <article
                key={plan.name}
                className={`relative border p-6 ${
                  plan.featured
                    ? "border-purple-600 bg-purple-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                {plan.featured && (
                  <span className="absolute right-5 top-5 rounded-full bg-purple-600 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                    Popular
                  </span>
                )}

                <h3 className="text-lg font-medium">
                  {plan.name}
                </h3>

                <p className="mt-3 min-h-12 max-w-sm text-sm leading-6 text-slate-500">
                  {plan.description}
                </p>

                <div className="mt-7">
                  <span className="text-3xl font-light">
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-400">
                    {" "}
                    {plan.period}
                  </span>
                </div>

                <Link
                  href="/admin/onboarding"
                  className={`mt-7 block rounded-full px-5 py-2.5 text-center text-sm font-medium ${
                    plan.featured
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "border border-slate-300 hover:border-slate-500"
                  }`}
                >
                  Start with {plan.name}
                </Link>

                <ul className="mt-7 space-y-3 border-t border-slate-200 pt-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-sm text-slate-600"
                    >
                      <span className="mr-2 text-purple-600">
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="bg-slate-950 px-5 py-16 text-white lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-purple-400">
                Why KIPSMTHN
              </p>

              <h2 className="mt-5 text-3xl font-light leading-tight sm:text-4xl">
                Built around the way independent creators actually
                work.
              </h2>
            </div>

            <div className="grid gap-7 sm:grid-cols-2">
              <div>
                <h3 className="font-medium">One identity</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Your public portfolio and private business
                  workspace belong to the same creator identity.
                </p>
              </div>

              <div>
                <h3 className="font-medium">One workflow</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Reduce the gap between enquiry, production,
                  delivery and payment.
                </p>
              </div>

              <div>
                <h3 className="font-medium">Local context</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Kenyan business and tax workflows are considered
                  from the beginning.
                </p>
              </div>

              <div>
                <h3 className="font-medium">Creative first</h3>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  Business tools should support the creative work,
                  not overwhelm it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs uppercase tracking-[0.24em] text-purple-600">
            FAQ
          </p>

          <div className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group py-5"
              >
                <summary className="cursor-pointer list-none text-base font-medium">
                  <div className="flex items-center justify-between gap-5">
                    {faq.question}
                    <span className="text-xl font-light text-purple-600 transition group-open:rotate-45">
                      +
                    </span>
                  </div>
                </summary>

                <p className="mt-4 max-w-3xl pr-8 text-sm leading-6 text-slate-500">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 pb-16 pt-4 lg:px-8 lg:pb-20">
        <div className="mx-auto max-w-7xl bg-purple-600 px-6 py-12 text-white sm:px-10">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                Start building
              </p>

              <h2 className="mt-5 max-w-3xl text-4xl font-light leading-tight sm:text-5xl">
                Your work deserves a home that works as hard as
                you do.
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70">
                Create your KIPSMTHN workspace and bring your
                portfolio, clients, projects and business together.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/onboarding"
                className="rounded-full bg-white px-6 py-3 text-sm font-medium text-purple-700 transition hover:bg-white/90"
              >
                Create account
              </Link>

              <Link
                href="/sign-in"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 px-5 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="font-semibold tracking-[0.18em] text-slate-900"
          >
            KIPSMTHN
          </Link>

          <div className="flex flex-wrap gap-5">
            <a href="#platform" className="hover:text-slate-700">
              Platform
            </a>
            <a href="#workflow" className="hover:text-slate-700">
              Workflow
            </a>
            <a href="#pricing" className="hover:text-slate-700">
              Pricing
            </a>
            <Link href="/sign-in" className="hover:text-slate-700">
              Sign in
            </Link>
            <Link href="/privacy" className="hover:text-slate-700">
              Privacy
            </Link>
            <a href="https://www.google.com/maps/dir/?api=1&destination=Nairobi" target="_blank" rel="noopener noreferrer" className="hover:text-slate-700">
              Maps & directions
            </a>
          </div>
 
          <span>© 2026 KIPSMTHN</span>
        </div>
      </footer>
    </main>
  );
}
