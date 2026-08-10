// src/app/services/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/header';
import ThemeToggle from '@/components/ThemeToggle';

const resolveImage = (source?: string, fallbackUrl?: string) => {
  if (!source) return fallbackUrl || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80';
  if (source.startsWith('http://') || source.startsWith('https://')) return source;
  return `https://lh3.googleusercontent.com/d/${source}`;
};

const serviceModules = [
  {
    num: '01',
    title: 'Startup Ecosystem Storytelling',
    subtitle: 'Accelerator & Donor Program Media',
    desc: 'Translating innovation hubs, founder cohorts, accelerator milestones, and donor impact programs into compelling visual narratives.',
    deliverables: [
      'Program Highlight & Recap Films',
      'Founder Cohort Spotlights & Interviews',
      'Investor Demo Day Coverage',
      'International Donor Impact Reporting Assets',
    ],
    partners: 'iHUB, ccHUB, UNDP Timbuktoo, Mastercard Foundation, GrowthAfrica, JICA NINJA',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  },
  {
    num: '02',
    title: 'Brand Films & Documentary Production',
    subtitle: 'Cinematic Video & Impact Stories',
    desc: 'High-production brand films, climate-tech documentaries, corporate videos, and short-form social reels that convert audience emotion.',
    deliverables: [
      '4K Cinematic Commercials & Brand Films',
      'Climate-Tech & Clean Energy Documentaries',
      'Professional Sound Design & Voiceover',
      'Short-Form Social Video Reels (YouTube, Reels)',
    ],
    partners: 'BURN Manufacturing USA, Delta40 Studio, Kraft Digital',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=800&q=80',
  },
  {
    num: '03',
    title: 'Commercial & E-Commerce Photography',
    subtitle: 'Studio Catalogue & Campaign Media',
    desc: 'High-scale product photography, studio portraiture, and commercial fashion catalogue production engineered for conversion.',
    deliverables: [
      'High-Scale Studio & Location Shoots',
      'E-Commerce Product Catalogue Consistency',
      'High-Res Color Grading & Skin Retouching',
      'Private Gallery Proofing & PIN Delivery',
    ],
    partners: 'Shop Zetu, Vivo Woman, Copia Kenya, Home 254, Estee Lauder',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
  },
  {
    num: '04',
    title: 'Visual Identity, Motion & UI/UX Systems',
    subtitle: 'Brand Strategy & Digital Platforms',
    desc: 'Comprehensive visual architecture, 2D/3D motion graphics, brand design systems, and web platform user experience design.',
    deliverables: [
      'Brand Identity Systems & Design Guidelines',
      '2D/3D Motion Graphics & Title Idents',
      'Web Platform & E-Commerce UX Design',
      'Event Visual Communication & Print Assets',
    ],
    partners: 'HEVA Fund, HustleSasa, TEDx Parklands, Branch International',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
  },
];

const workflowSteps = [
  { step: '01', title: 'Discovery & Strategy', desc: 'Analyzing program objectives, brand messaging, target audience, and key production milestones.' },
  { step: '02', title: 'Art Direction & Concept', desc: 'Developing storyboards, shot lists, visual treatments, and production schedules.' },
  { step: '03', title: 'High-Precision Production', desc: 'On-location filming, studio photoshoots, color grading, editing passes, and motion design.' },
  { step: '04', title: 'Private Portal Delivery', desc: 'Secure client proofing, 4-digit PIN access, high-res ZIP downloads, and KRA eTIMS invoicing.' },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="relative pt-36 pb-16 px-6 max-w-7xl mx-auto text-center space-y-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-purple-600/15 blur-3xl pointer-events-none rounded-full" />

        <p className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">
          KIPSMTHN CAPABILITIES
        </p>

        {/* Small Caps Title */}
        <h1 className="heading-editorial text-slate-900 dark:text-white max-w-4xl mx-auto">
          Production & Creative <span className="font-normal text-purple-600 dark:text-purple-400">Storytelling Services</span>
        </h1>

        <p className="text-sm md:text-base text-slate-600 dark:text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
          Delivering end-to-end visual direction, impact documentary films, commercial photography, motion graphics, and UI/UX systems.
        </p>
      </section>

      {/* 2. CORE SERVICE MODULES */}
      <section className="py-12 px-6 max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 gap-12">
          {serviceModules.map((s) => (
            <div
              key={s.num}
              className="p-8 md:p-12 bg-white dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800/80 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center shadow-md dark:shadow-none hover:border-purple-600/50 transition-all"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">{s.num}</span>
                    <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 rounded-full font-semibold">
                      {s.subtitle}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-light text-slate-900 dark:text-white">{s.title}</h2>
                </div>

                <p className="text-xs md:text-sm text-slate-600 dark:text-zinc-300 font-light leading-relaxed">
                  {s.desc}
                </p>

                {/* Deliverables Checklist */}
                <div className="space-y-2 border-t border-slate-200 dark:border-zinc-800 pt-4">
                  <p className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">
                    Key Deliverables:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-700 dark:text-zinc-300">
                    {s.deliverables.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-purple-600 dark:text-purple-400">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                  <strong className="text-slate-700 dark:text-zinc-300">Track Record:</strong> {s.partners}
                </p>

                <div className="pt-2">
                  <Link
                    href="/contact"
                    className="inline-block px-6 py-3 btn-primary text-xs uppercase font-medium tracking-widest rounded-full shadow-sm"
                  >
                    Request Proposal →
                  </Link>
                </div>
              </div>

              {/* Service Cover Image */}
              <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-xl">
                <Image
                  src={resolveImage(s.image)}
                  alt={s.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. WORKFLOW & COMPLIANCE SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12 border-t border-slate-200 dark:border-zinc-800">
        <div className="text-center space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">Methodology</span>
          <h2 className="text-3xl md:text-4xl font-light text-slate-900 dark:text-white">Production & Delivery Workflow</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((w) => (
            <div key={w.step} className="p-6 bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 rounded-2xl space-y-3 shadow-sm dark:shadow-none">
              <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">{w.step}</span>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">{w.title}</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 font-light leading-relaxed">{w.desc}</p>
            </div>
          ))}
        </div>

        {/* KRA eTIMS Notice */}
        <div className="p-8 border border-purple-500/30 bg-purple-100/50 dark:bg-purple-950/20 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="px-2.5 py-0.5 bg-purple-600/20 text-purple-700 dark:text-purple-300 text-[10px] font-mono rounded-full uppercase font-semibold">
              Kenyan Business & Tax Compliant
            </span>
            <h3 className="text-xl font-medium text-slate-900 dark:text-white">KRA eTIMS Invoicing & Multi-Currency Billing</h3>
            <p className="text-xs text-slate-600 dark:text-zinc-300 font-light leading-relaxed">
              Official eTIMS tax invoices issued for all Kenyan corporate & accelerator contracts. Multi-currency billing supported (**KES / USD / EUR**) for international NGOs and donor programs.
            </p>
          </div>

          <Link href="/contact" className="px-6 py-3 btn-primary text-xs uppercase font-medium tracking-widest rounded-full shrink-0">
            Get Invoice Quote
          </Link>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-slate-100 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-900 rounded-t-3xl pt-16 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-light text-slate-900 dark:text-white font-sans uppercase">
                KIPSMTHN<span className="text-purple-500">.</span>
              </h2>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">somboriot@gmail.com • +254 722 145 776</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <a href="https://www.linkedin.com/in/sombo09/" target="_blank" className="px-4 py-2 text-xs font-mono rounded-full bg-purple-600 text-white">
                LinkedIn
              </a>
              <a href="https://www.instagram.com/sombo_kipsmthn/" target="_blank" className="px-4 py-2 text-xs font-mono btn-secondary rounded-full">
                Instagram
              </a>
              <a href="https://www.youtube.com/@kraftdigital7749" target="_blank" className="px-4 py-2 text-xs font-mono btn-secondary rounded-full">
                YouTube
              </a>
              <a href="https://linktr.ee/kipsmthn" target="_blank" className="px-4 py-2 text-xs font-mono btn-secondary rounded-full">
                Linktree
              </a>
              <Link href="/portal" className="px-4 py-2 text-xs font-mono btn-secondary rounded-full">
                Client Delivery Portal
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-zinc-900 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 dark:text-zinc-600 font-mono gap-4">
            <p>© {new Date().getFullYear()} KIPSMTHN Platform. All rights reserved.</p>
            
            <div className="flex items-center gap-6">
              <ThemeToggle />
              <span className="text-slate-500 dark:text-zinc-500">Nairobi, Kenya</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}