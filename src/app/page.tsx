import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  CircleDollarSign,
  FileCheck2,
  FolderKanban,
  Images,
  Layers3,
  MessageCircle,
  MoveRight,
  PanelsTopLeft,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import PublicLandingHeader from "@/components/public-landing-header";

export const metadata = {
  title: "KIPSMTHN — The business side of creative work, in sync",
  description:
    "A connected workspace for creative businesses to organize clients, projects, quotes, billing, and client delivery.",
  openGraph: {
    title: "KIPSMTHN — The business side of creative work, in sync",
    description:
      "Bring the moving parts of your creative business into one considered, connected workflow.",
    siteName: "KIPSMTHN",
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KIPSMTHN — The business side of creative work, in sync",
    description:
      "A connected workspace for creative businesses to organize clients, projects, quotes, billing, and delivery.",
  },
};

const workflowSteps = [
  {
    number: "01",
    title: "Organise the work",
    description:
      "Keep client conversations, project context, and next steps connected from the beginning.",
    icon: FolderKanban,
  },
  {
    number: "02",
    title: "Set expectations",
    description:
      "Put the scope, costs, approvals, and important documents in a clearer shared process.",
    icon: FileCheck2,
  },
  {
    number: "03",
    title: "Keep business moving",
    description:
      "Bring project progress and billing into view without piecing together scattered updates.",
    icon: CircleDollarSign,
  },
  {
    number: "04",
    title: "Deliver with care",
    description:
      "Give clients a considered place to review and receive the work you create together.",
    icon: Images,
  },
];

const benefits = [
  {
    number: "01",
    title: "Less admin between the good bits",
    description:
      "Spend less time copying details between disconnected tools and more time moving the work forward.",
    icon: Sparkles,
    className: "md:col-span-2",
  },
  {
    number: "02",
    title: "A more considered client experience",
    description:
      "Keep communication, documents, and delivery feeling like parts of the same professional relationship.",
    icon: MessageCircle,
    className: "",
  },
  {
    number: "03",
    title: "A clearer view of the business",
    description:
      "Bring projects and the business details around them into one easier-to-follow workflow.",
    icon: PanelsTopLeft,
    className: "",
  },
];

const audiences = [
  { title: "Independent creatives", detail: "For people balancing the craft and the business." },
  { title: "Small studios", detail: "For teams coordinating clients, production, and delivery." },
  { title: "Creative production teams", detail: "For work with moving parts, approvals, and handovers." },
];

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[660px]">
      <div aria-hidden="true" className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-neutral-200/70 via-transparent to-neutral-300/60 blur-2xl dark:from-neutral-700/30 dark:to-neutral-800/20" />
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl shadow-neutral-950/10 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-black/30">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
              <Layers3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-tight text-neutral-950 dark:text-white">Your workspace</p>
              <p className="text-[10px] text-neutral-500">PRODUCT PREVIEW PLACEHOLDER</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <span className="h-2 w-2 rounded-full bg-neutral-200 dark:bg-neutral-700" />
            <span className="h-2 w-2 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          </div>
        </div>

        <div className="grid min-h-[340px] grid-cols-[112px_1fr] sm:min-h-[390px] sm:grid-cols-[148px_1fr]">
          <aside className="border-r border-neutral-200 bg-neutral-50/80 p-3 dark:border-neutral-800 dark:bg-neutral-900/60 sm:p-4">
            <div className="mb-5 h-2 w-16 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <div className="space-y-2.5">
              {[PanelsTopLeft, BriefcaseBusiness, FolderKanban, FileCheck2, Images].map((Icon, index) => (
                <div key={index} className={`flex items-center gap-2 rounded-lg px-2 py-2 ${index === 0 ? "bg-neutral-200/80 dark:bg-neutral-800" : ""}`}>
                  <Icon className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                  <span className="hidden h-1.5 w-12 rounded-full bg-neutral-200 dark:bg-neutral-700 sm:block" />
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-lg border border-dashed border-neutral-300 p-2 dark:border-neutral-700">
              <div className="mb-2 h-1.5 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />
              <div className="h-1.5 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800" />
            </div>
          </aside>

          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="mb-2 h-2 w-16 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-5 w-32 rounded-md bg-neutral-900 dark:bg-neutral-100 sm:w-44" />
              </div>
              <div className="h-8 w-20 rounded-lg bg-neutral-900 dark:bg-neutral-100" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
              {["w-9", "w-12", "w-7"].map((width, index) => (
                <div key={index} className={`rounded-xl border border-neutral-200 p-3 dark:border-neutral-800 ${index === 2 ? "hidden sm:block" : ""}`}>
                  <div className="mb-3 h-1.5 w-12 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                  <div className={`h-4 rounded bg-neutral-800 dark:bg-neutral-200 ${width}`} />
                  <div className="mt-3 h-1 w-full rounded-full bg-neutral-100 dark:bg-neutral-900" />
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-neutral-200 p-3.5 dark:border-neutral-800 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="h-2 w-24 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                <div className="h-1.5 w-10 rounded-full bg-neutral-100 dark:bg-neutral-900" />
              </div>
              <div className="mt-4 space-y-3">
                {[0, 1, 2].map((row) => (
                  <div key={row} className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 rounded-lg bg-neutral-100 dark:bg-neutral-900" />
                    <div className="min-w-0 flex-1">
                      <div className={`h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 ${row === 1 ? "w-2/3" : "w-4/5"}`} />
                      <div className="mt-2 h-1 w-1/2 rounded-full bg-neutral-100 dark:bg-neutral-900" />
                    </div>
                    <div className="h-5 w-12 rounded-full border border-neutral-200 dark:border-neutral-800" />
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-center text-[10px] leading-4 text-neutral-400">
              Illustrative layout only · final product screens will replace this preview
            </p>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-800 dark:bg-neutral-900 sm:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100">
          <BadgeCheck className="h-4 w-4" />
        </span>
        <span>
          <span className="block text-xs font-semibold text-neutral-900 dark:text-white">One connected workflow</span>
          <span className="mt-0.5 block text-[10px] text-neutral-500">From brief to delivery</span>
        </span>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-neutral-950 selection:bg-neutral-900 selection:text-white dark:bg-neutral-950 dark:text-neutral-50 dark:selection:bg-white dark:selection:text-neutral-950">
      <PublicLandingHeader />

      <section className="relative isolate">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-120px] h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-neutral-100/90 blur-3xl dark:bg-neutral-900/80" />
          <div className="absolute right-[-160px] top-[340px] h-[300px] w-[300px] rounded-full bg-neutral-100 blur-3xl dark:bg-neutral-900" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:px-10 lg:pb-32 lg:pt-28">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-300">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 dark:bg-white" />
              A connected workspace for creative businesses
            </div>
            <h1 className="mt-7 max-w-2xl text-[clamp(2.8rem,7vw,5.7rem)] font-semibold leading-[0.98] tracking-[-0.065em] text-neutral-950 dark:text-white">
              The business side of creative work.
              <span className="mt-2 block font-normal text-neutral-400 dark:text-neutral-600">Finally in sync.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-neutral-600 dark:text-neutral-400 sm:text-lg sm:leading-8">
              KIPSMTHN brings clients, projects, quotes, billing, and delivery into one considered workflow—so the work behind the work feels easier to manage.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/sign-up" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200">
                Get started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="#how-it-works" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900">
                See how it works <ArrowDownRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Built around real creative workflows</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> One place for the moving parts</span>
            </div>
          </div>
          <div className="relative px-1 pb-4 pt-2 sm:px-4 lg:px-0">
            <ProductPreview />
          </div>
        </div>
      </section>

      <section className="border-y border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900/40">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-8 sm:grid-cols-3 sm:px-8 sm:py-9 lg:px-10">
          {[
            { title: "One connected flow", detail: "Move work forward without losing the context." },
            { title: "A more professional handoff", detail: "Keep client-facing moments considered and clear." },
            { title: "Less operational friction", detail: "Spend less energy keeping disconnected tools aligned." },
          ].map((item, index) => (
            <div key={item.title} className="flex gap-3 sm:px-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-500 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-400">
                0{index + 1}
              </span>
              <div>
                <h2 className="text-sm font-semibold tracking-tight">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">A more connected way to work</p>
              <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl lg:text-5xl">
                From the first conversation to the final handoff.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-neutral-600 dark:text-neutral-400 lg:justify-self-end">
              Creative work has a lot happening around it. KIPSMTHN is designed to help those steps feel less fragmented, with the details of a project staying connected as it moves forward.
            </p>
          </div>

          <div className="mt-12 grid overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 sm:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.number} className={`relative min-h-[230px] p-6 sm:p-7 ${index > 0 ? "border-t border-neutral-200 sm:border-t-0 sm:border-l dark:border-neutral-800" : ""} ${index === 2 ? "sm:border-l-0 lg:border-l" : ""} ${index === 3 ? "lg:border-l" : ""}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-[0.12em] text-neutral-400">{step.number}</span>
                    <Icon className="h-5 w-5 text-neutral-500" strokeWidth={1.7} />
                  </div>
                  <h3 className="mt-9 text-lg font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-400">{step.description}</p>
                  {index < workflowSteps.length - 1 && <MoveRight className="absolute bottom-6 right-6 hidden h-4 w-4 text-neutral-300 lg:block dark:text-neutral-700" />}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="platform" className="scroll-mt-24 bg-neutral-50 py-20 dark:bg-neutral-900/50 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Made to work together</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">Less juggling. More momentum.</h2>
            <p className="mt-5 text-base leading-7 text-neutral-600 dark:text-neutral-400">
              A practical foundation for the work around your creative work—from keeping projects organised to making client delivery feel intentional.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <article key={benefit.number} className={`group rounded-2xl border border-neutral-200 bg-white p-6 transition duration-200 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-lg hover:shadow-neutral-950/5 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700 dark:hover:shadow-black/20 sm:p-7 ${benefit.className}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-[0.12em] text-neutral-400">{benefit.number}</span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-700 dark:border-neutral-800 dark:text-neutral-200">
                      <Icon className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                  </div>
                  <h3 className="mt-8 max-w-sm text-xl font-semibold tracking-tight">{benefit.title}</h3>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-neutral-600 dark:text-neutral-400">{benefit.description}</p>
                  <div className="mt-7 h-px w-full bg-neutral-100 dark:bg-neutral-900" />
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-neutral-500 transition group-hover:text-neutral-950 dark:group-hover:text-white">
                    Thoughtfully connected <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 sm:py-28 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Built for the people behind the work</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl lg:text-5xl">For creative businesses, at every scale.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-neutral-600 dark:text-neutral-400">
              Whether you work independently or alongside a team, the business side should support your creative process—not compete with it.
            </p>
            <Link href="/sign-up" className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-neutral-950 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-900 dark:text-white dark:decoration-neutral-700 dark:hover:decoration-white">
              Find your workflow <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
            {audiences.map((audience, index) => (
              <div key={audience.title} className="flex items-start gap-4 p-5 sm:p-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-900 dark:text-neutral-200">
                  {index === 0 ? <Sparkles className="h-5 w-5" /> : index === 1 ? <Layers3 className="h-5 w-5" /> : <Workflow className="h-5 w-5" />}
                </span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">{audience.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-neutral-500 dark:text-neutral-400">{audience.detail}</p>
                </div>
                <Check className="mt-1 h-4 w-4 shrink-0 text-neutral-400" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-neutral-950 px-6 py-12 text-white dark:bg-neutral-900 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border border-white/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-20 h-56 w-56 rounded-full border border-white/10" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs text-neutral-300">
              <Sparkles className="h-3.5 w-3.5" /> Make room for the work
            </div>
            <h2 className="mt-6 text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl lg:text-6xl">
              Your work has a lot around it. Bring it together.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-300">
              Give your creative business a clearer way to organise projects, work with clients, and deliver what you make.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/sign-up" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200">
                Get started with KIPSMTHN <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/sign-in" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-sm">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"><Layers3 className="h-4 w-4" /></span>
                KIPSMTHN
              </Link>
              <p className="mt-4 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                A connected workspace for the business behind creative work.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-neutral-500 dark:text-neutral-400">
              <Link href="#platform" className="transition hover:text-neutral-950 dark:hover:text-white">Platform</Link>
              <Link href="#how-it-works" className="transition hover:text-neutral-950 dark:hover:text-white">How it works</Link>
              <Link href="/sign-in" className="transition hover:text-neutral-950 dark:hover:text-white">Sign in</Link>
              <Link href="/sign-up" className="transition hover:text-neutral-950 dark:hover:text-white">Get started</Link>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 border-t border-neutral-200 pt-5 text-xs text-neutral-400 dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} KIPSMTHN. All rights reserved.</span>
            <span>Designed for the business behind creative work.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
