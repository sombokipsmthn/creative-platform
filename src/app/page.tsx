import Link from "next/link";
import Header from "@/components/header";

export const metadata = {
  title: 'KIPSMTHN — Creative infrastructure for creators',
  description: 'Portfolio, client delivery, quoting and invoicing for independent creators.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-page text-primary font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <Header />
      
      <main>
        {/* HERO */}
        <section className="relative overflow-hidden pt-36 pb-20 px-6 max-w-7xl mx-auto">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-purple-600/15 blur-3xl rounded-full pointer-events-none" />
          <div className="max-w-5xl relative z-10">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-purple-600 mb-6">Creative Operating System</p>
            <h1 className="heading-editorial text-slate-900 dark:text-white leading-[0.95] max-w-4xl">
              Your practice.<br />
              <span className="text-slate-400 dark:text-zinc-500">Fully connected.</span>
            </h1>
            <p className="mt-8 text-base md:text-lg text-slate-500 dark:text-zinc-400 max-w-2xl leading-relaxed font-light">
              KIPSMTHN connects portfolio, client delivery, quoting and invoicing into one coherent workspace for photographers, filmmakers, and creative studios.
            </p>
            <div className="mt-10 flex gap-3">
              <Link href="/sign-up" className="btn-primary rounded-full px-7 py-3.5 text-sm font-medium shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 transition-all">Create workspace</Link>
              <Link href="#platform" className="btn-secondary rounded-full px-7 py-3.5 text-sm font-medium transition-all">Explore platform</Link>
            </div>
          </div>
        </section>

        {/* PLATFORM */}
        <section id="platform" className="border-t border-subtle px-6 py-16 lg:px-8 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-purple-600">The platform</p>
              <h2 className="mt-5 text-3xl md:text-5xl font-light tracking-tight text-slate-900 dark:text-white leading-tight">Your creative business should not live in ten different tools.</h2>
              <p className="mt-5 text-base text-slate-500 dark:text-zinc-400 leading-relaxed">From public portfolio to private delivery, from quote to invoice — everything stays in one workspace.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
