// src/app/contact/page.tsx
import Header from '@/components/header';
import ThemeToggle from '@/components/ThemeToggle';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <Header />

      <section className="relative pt-36 pb-20 px-6 max-w-7xl mx-auto text-center space-y-8">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-purple-600/15 blur-3xl pointer-events-none rounded-full" />

        <p className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">
          INITIATE COLLABORATION
        </p>

        <h1 className="heading-editorial text-slate-900 dark:text-white max-w-4xl mx-auto">
          Start a Project with <span className="font-normal text-purple-600 dark:text-purple-400">Kip-Smthn</span>
        </h1>

        <p className="text-sm md:text-base text-slate-600 dark:text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
          Based in Nairobi, Kenya. Available for African startup ecosystem programs, venture studios, commercial photography, and brand media.
        </p>
      </section>

      {/* Direct Contact Cards */}
      <main className="py-12 px-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 rounded-3xl space-y-4 shadow-sm dark:shadow-none">
          <span className="px-3 py-1 bg-purple-600/20 text-purple-700 dark:text-purple-300 text-xs font-mono rounded-full font-semibold uppercase">
            Direct Inquiries
          </span>
          <h2 className="text-2xl font-light text-slate-900 dark:text-white">Somboriot Kipchilat</h2>
          <div className="space-y-2 text-xs font-mono text-slate-600 dark:text-zinc-300">
            <p>📧 Email: <a href="mailto:somboriot@gmail.com" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">somboriot@gmail.com</a></p>
            <p>📱 Phone: <a href="tel:+254722145776" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">+254 722 145 776</a></p>
            <p>📍 Location: Nairobi, Kenya</p>
            <p>🧾 KRA eTIMS & WHT Compliant</p>
          </div>
        </div>

        <div className="p-8 bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 rounded-3xl space-y-4 shadow-sm dark:shadow-none">
          <span className="px-3 py-1 bg-purple-600/20 text-purple-700 dark:text-purple-300 text-xs font-mono rounded-full font-semibold uppercase">
            Social & Digital Media
          </span>
          <h2 className="text-2xl font-light text-slate-900 dark:text-white">Channels & Archives</h2>
          <div className="flex flex-col gap-2 text-xs font-mono pt-2">
            <a href="https://www.linkedin.com/in/sombo09/" target="_blank" className="px-4 py-2.5 btn-secondary rounded-xl flex justify-between items-center">
              <span>LinkedIn Profile</span>
              <span>↗</span>
            </a>
            <a href="https://www.youtube.com/@kraftdigital7749" target="_blank" className="px-4 py-2.5 btn-secondary rounded-xl flex justify-between items-center">
              <span>YouTube / Kraft Digital</span>
              <span>↗</span>
            </a>
            <a href="https://linktr.ee/kipsmthn" target="_blank" className="px-4 py-2.5 btn-secondary rounded-xl flex justify-between items-center">
              <span>Linktree Directory</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-900 rounded-t-3xl pt-16 pb-12 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 dark:text-zinc-600 font-mono gap-4">
          <p>© {new Date().getFullYear()} KIPSMTHN Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <span>Nairobi, Kenya</span>
          </div>
        </div>
      </footer>
    </div>
  );
}