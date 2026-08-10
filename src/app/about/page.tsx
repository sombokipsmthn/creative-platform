// src/app/about/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/header';
import ThemeToggle from '@/components/ThemeToggle';

const resolveImage = (source?: string, fallbackUrl?: string) => {
  if (!source) return fallbackUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80';
  if (source.startsWith('http://') || source.startsWith('https://')) return source;
  return `https://lh3.googleusercontent.com/d/${source}`;
};

const aboutMedia = {
  portrait: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
  behindScenes: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
};

// Verified Press Articles & International Foundation Credits
const pressFeatures = [
  {
    publication: 'Friedrich-Ebert-Stiftung (FES Kenya)',
    title: 'Social Justice, Youth & Democratic Governance Publications',
    excerpt: 'Media, photography, and production credits for FES Kenya policy dialogues, publications, and democratic governance initiatives.',
    link: 'https://kenya.fes.de/',
    tag: 'International Foundation Credits',
  },
  {
    publication: 'Capital FM Kenya',
    title: 'JKUAT Team Wins Microsoft Imagine Cup & Represents Kenya in Russia',
    excerpt: 'Team members Collin Omwenga, Paul Mutie, and Somboriot Kipchallat built Azure cloud solutions to represent Kenya at the World Finals in St. Petersburg.',
    link: 'https://www.capitalfm.co.ke/campus/jkuat-team-to-represent-kenya-in-microsoft-imagine-cup-in-russia/',
    tag: 'Global Press Feature',
  },
  {
    publication: 'HEVA Fund Official Press',
    title: 'Uhuru Market Action Research & Brand System Development',
    excerpt: 'Development of the new brand identity and assets were undertaken by Somboriot Kipchilat, renowned brand creator and graphic designer.',
    link: 'https://www.hevafund.com/',
    tag: 'Design & Policy Feature',
  },
  {
    publication: 'Vivo Fashion Group / Shop Zetu',
    title: 'The Sowairina by Vivo Lea Collection Campaign',
    excerpt: 'Lead photography and visual media direction for Grace Msalame’s maternity collection launch with Vivo Woman and Shop Zetu.',
    link: 'https://www.shopzetu.com/',
    tag: 'Fashion & E-Commerce Media',
  },
  {
    publication: 'Mettā Nairobi / Startup Guide',
    title: 'Mettā Nairobi — Hub of African Innovation',
    excerpt: 'Featured photography documenting Nairobi’s tech hub, connecting African founders, policymakers, and venture investors.',
    link: 'https://startupguide.com/',
    tag: 'Ecosystem Photography',
  },
  {
    publication: 'Women in African Investments (WAI)',
    title: 'WAI Group Impact Report 2024',
    excerpt: 'Official visual media and photography credits for African capital markets and impact investor reporting.',
    link: 'https://womeninafricaninvestments.org/',
    tag: 'Impact Report Credits',
  },
];

const careerTimeline = [
  {
    period: '04/2025 - Present',
    role: 'Visual Storytelling & Media Producer',
    organization: 'BURN Manufacturing USA LLC',
    desc: 'Producing visual storytelling and impact documentaries highlighting clean energy technology across African markets. Collaborating with product teams on web platform UX.',
  },
  {
    period: '03/2023 - 02/2026',
    role: 'Visual Production Lead – Innovation Programs',
    organization: 'iHUB / ccHUB',
    desc: 'Leading visual storytelling across UNDP Timbuktoo, Mastercard Foundation EdTech Fellowship, Safaricom Spark, and ccHUB Creative Economy Practice Program.',
  },
  {
    period: '03/2025 - 11/2025',
    role: 'Visual Storytelling Producer – Venture Studio',
    organization: 'Delta40 Venture Studio',
    desc: 'Documenting climate-tech startups, energy, mobility, and circular economy scale summits in partnership with BESTSELLER Foundation and Lemelson Foundation.',
  },
  {
    period: '05/2020 - 11/2024',
    role: 'Visual Storytelling Consultant',
    organization: 'GrowthAfrica & GIZ',
    desc: 'Media documentation across JICA NINJA Accelerator and Deep Dive Africa, covering cohort founders, demo days, and investor readiness milestones.',
  },
  {
    period: '10/2023 - 06/2024',
    role: 'Content Strategy & Production Lead',
    organization: 'OBY Afrika',
    desc: 'Led digital content workflows and creative campaigns for accounts including Estee Lauder, Bata Kenya, Bet-Afrique, and Standard Chartered.',
  },
  {
    period: '10/2021 - 02/2022',
    role: 'Creative Director & Photographer',
    organization: 'Shop Zetu / Vivo Woman',
    desc: 'Built out Zetu Studios and shaped East Africa’s leading fashion e-commerce marketplace visual identity.',
  },
  {
    period: '02/2021 - 08/2023',
    role: 'E-Commerce Photographer',
    organization: 'Copia Kenya',
    desc: 'Managed large-scale catalogue photography for Copia’s entire e-commerce product catalogue.',
  },
];

const expertisePillars = [
  { num: '01', title: 'Photography', desc: 'Commercial campaigns, e-commerce studio catalogues, and ecosystem event media.' },
  { num: '02', title: 'Videography', desc: 'Impact documentaries, brand films, founder spotlights, and short-form video reels.' },
  { num: '03', title: 'Branding & Design', desc: 'Visual identity systems, merchandise design, event branding, and style guides.' },
  { num: '04', title: 'UI / UX', desc: 'Digital platform strategy, user experience optimization, and e-commerce marketplace design.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 font-sans selection:bg-purple-600 selection:text-white transition-colors duration-300">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="relative pt-36 pb-16 px-6 max-w-7xl mx-auto text-center space-y-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-purple-600/15 blur-3xl pointer-events-none rounded-full" />

        <p className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">
          ABOUT KIPSMTHN & CREATOR
        </p>

        {/* Small Caps Title */}
        <h1 className="heading-editorial text-slate-900 dark:text-white max-w-4xl mx-auto">
          Documenting Africa&apos;s Startup <span className="font-normal text-purple-600 dark:text-purple-400">Ecosystems & Innovation</span>
        </h1>

        <p className="text-sm md:text-base text-slate-600 dark:text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
          Bridging creative direction, visual storytelling, and high-impact media production across Nairobi, East Africa, and global markets.
        </p>
      </section>

      {/* 2. CREATOR BIO BANNER */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="relative border border-slate-200 dark:border-zinc-800 bg-linear-to-r from-purple-100/80 via-slate-50 to-white dark:from-purple-950/40 dark:via-zinc-900/60 dark:to-zinc-950 rounded-3xl p-8 md:p-16 overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-mono rounded-full font-semibold">
              Somboriot Kipchilat — Nairobi, Kenya
            </span>

            <h2 className="text-3xl md:text-5xl font-light text-slate-900 dark:text-white leading-tight">
              Ecosystem Storytelling Specialist & Creative Lead
            </h2>

            <p className="text-sm text-slate-700 dark:text-zinc-300 font-light leading-relaxed">
              My work focuses on translating accelerator programs, founder journeys, donor initiatives, and venture studio portfolios into compelling visual narratives.
            </p>

            <p className="text-sm text-slate-700 dark:text-zinc-300 font-light leading-relaxed">
              Over the last 8+ years, I have documented major innovation ecosystem programs run by iHUB, ccHUB, UNDP Timbuktoo, Mastercard Foundation, Safaricom Spark, Delta40 Studio, GrowthAfrica, Friedrich-Ebert-Stiftung (FES Kenya), and JICA NINJA Accelerator.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <a href="https://www.linkedin.com/in/sombo09/" target="_blank" className="px-6 py-3 btn-primary text-xs uppercase font-medium tracking-widest rounded-full">
                Connect on LinkedIn ↗
              </a>
              <a href="https://linktr.ee/kipsmthn" target="_blank" className="px-6 py-3 btn-secondary text-xs uppercase font-medium tracking-widest rounded-full">
                Linktree ↗
              </a>
            </div>
          </div>

          <div className="relative aspect-square w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl">
            <Image
              src={resolveImage(aboutMedia.portrait)}
              alt="Somboriot Kipchilat"
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-purple-900/20 mix-blend-overlay" />
          </div>

        </div>
      </section>

      {/* 3. VERIFIED PRESS & PUBLIC MEDIA FEATURES */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="border-b border-slate-200 dark:border-zinc-800 pb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">Press & Public Mentions</span>
          <h2 className="text-3xl font-light text-slate-900 dark:text-white mt-1">Articles & Media Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pressFeatures.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 rounded-2xl space-y-4 hover:border-purple-600/60 transition-all group flex flex-col justify-between shadow-sm dark:shadow-none"
            >
              <div className="space-y-3">
                <span className="px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-[10px] font-mono rounded-full font-semibold uppercase">
                  {item.tag}
                </span>
                <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">{item.publication}</p>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 font-light leading-relaxed">{item.excerpt}</p>
              </div>

              <div className="pt-2 flex items-center gap-1 text-xs font-mono text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                <span>Read Article / Feature</span>
                <span>↗</span>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 4. FOUR CORE PILLARS */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12 border-t border-slate-200 dark:border-zinc-800">
        <div className="border-b border-slate-200 dark:border-zinc-800 pb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">Capabilities</span>
          <h2 className="text-3xl font-light text-slate-900 dark:text-white mt-1">Core Production Disciplines</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {expertisePillars.map((p) => (
            <div key={p.num} className="p-6 bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 rounded-2xl space-y-3 shadow-sm dark:shadow-none">
              <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">{p.num}</span>
              <h3 className="text-xl font-medium text-slate-900 dark:text-white">{p.title}</h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 font-light leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CAREER TIMELINE */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="border-b border-slate-200 dark:border-zinc-800 pb-6">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">Track Record</span>
          <h2 className="text-3xl font-light text-slate-900 dark:text-white mt-1">Career Timeline & Key Milestones</h2>
        </div>

        <div className="space-y-6">
          {careerTimeline.map((item, idx) => (
            <div
              key={idx}
              className="p-8 bg-white dark:bg-zinc-900/30 border border-slate-200 dark:border-zinc-800/80 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm dark:shadow-none"
            >
              <div className="space-y-2 max-w-2xl">
                <span className="px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-[10px] font-mono rounded-full uppercase">
                  {item.organization}
                </span>
                <h3 className="text-xl font-medium text-slate-900 dark:text-white">{item.role}</h3>
                <p className="text-xs text-slate-600 dark:text-zinc-300 font-light leading-relaxed">{item.desc}</p>
              </div>

              <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 shrink-0">
                {item.period}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. ACADEMIC & AWARDS RECOGNITION */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="p-8 md:p-12 border border-purple-500/30 bg-purple-100/50 dark:bg-purple-950/20 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">Honors & Education</span>
            <h2 className="text-2xl md:text-3xl font-light text-slate-900 dark:text-white">Awards & Academic Background</h2>
            
            <div className="space-y-3 text-xs font-mono text-slate-700 dark:text-zinc-300">
              <p>🏆 <strong className="text-purple-600 dark:text-purple-400">World Citizenship Winner</strong> – Microsoft Imagine Cup (Russia)</p>
              <p>🏆 <strong className="text-purple-600 dark:text-purple-400">National Final Winner</strong> – Microsoft Imagine Cup</p>
              <p>🎓 <strong className="text-purple-600 dark:text-purple-400">Bachelor of Science (BSc)</strong> – Jomo Kenyatta University of Agriculture and Technology (JKUAT)</p>
              <p>📜 <strong className="text-purple-600 dark:text-purple-400">Seven Seas Certification</strong> – Knowledge Transfer Centre (Network & Cloud Systems)</p>
            </div>
          </div>

          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-xl">
            <Image
              src={resolveImage(aboutMedia.behindScenes)}
              alt="Behind the Scenes Production"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
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