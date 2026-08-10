// src/app/page.tsx
import Link from 'next/link';
import Header from '@/components/Header';

const featuredServices = [
  { id: '01', title: 'Commercial Photography', desc: 'Editorial & brand imagery crafted for high-impact campaigns.' },
  { id: '02', title: 'Brand Films', desc: 'Cinematic storytelling and high-production brand visual narratives.' },
  { id: '03', title: 'Motion Graphics', desc: 'Dynamic 2D/3D visual motion for modern visual identity systems.' },
  { id: '04', title: 'Visual Identity', desc: 'Comprehensive art direction, branding frameworks & design systems.' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      <Header />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="max-w-4xl space-y-6">
          <p className="text-brand-purple-500 text-xs uppercase tracking-editorial font-medium">
            Creative Director & Visual Artist
          </p>
          <h1 className="text-5xl md:text-7xl font-light tracking-tight text-white leading-[1.1]">
            Transforming vision into <span className="text-zinc-400 font-normal">cinematic reality</span> & enduring brand identity.
          </h1>
          <p className="text-lg text-zinc-400 font-light max-w-2xl leading-relaxed">
            Specializing in Commercial Photography, Brand Films, Motion Graphics, and Visual Identity for global brands and visionary clients.
          </p>
          
          <div className="pt-4 flex flex-wrap gap-4 items-center">
            <Link
              href="/work"
              className="px-8 py-4 bg-brand-purple-600 text-white font-medium text-sm tracking-wider uppercase rounded-sm hover:bg-brand-purple-700 transition-colors shadow-[0_0_25px_rgba(124,58,237,0.3)]"
            >
              View Selected Work
            </Link>
            <a
              href="https://www.behance.net/Sombo"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-zinc-800 text-zinc-300 font-medium text-sm tracking-wider uppercase rounded-sm hover:bg-zinc-900 hover:text-white transition-colors"
            >
              Behance Portfolio ↗
            </a>
          </div>
        </div>
      </section>

      {/* Featured Services Grid */}
      <section className="py-24 border-t border-zinc-900 bg-canvas-card">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <p className="text-xs text-brand-purple-500 uppercase tracking-editorial font-medium">Capabilities</p>
              <h2 className="text-3xl font-light text-white mt-2">Core Creative Services</h2>
            </div>
            <Link href="/services" className="text-sm text-zinc-400 hover:text-brand-purple-500 tracking-wider uppercase transition-colors">
              All Deliverables →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredServices.map((service) => (
              <div
                key={service.id}
                className="p-8 border border-zinc-800/80 bg-canvas/40 rounded-sm hover:border-brand-purple-600/50 hover:bg-zinc-900/60 transition-all duration-300 group"
              >
                <span className="text-xs font-mono text-brand-purple-500 block mb-6">{service.id}</span>
                <h3 className="text-xl font-medium text-white group-hover:text-brand-purple-500 transition-colors mb-3">
                  {service.title}
                </h3>
                <p className="text-sm text-zinc-400 font-light leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 text-xs text-zinc-500 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} SOMBO (kipsmthn). All rights reserved.</p>
          <div className="flex gap-6">
            <a href="https://www.behance.net/Sombo" target="_blank" className="hover:text-zinc-300 transition-colors">Behance</a>
            <a href="https://linktr.ee/kipsmthn" target="_blank" className="hover:text-zinc-300 transition-colors">Linktree</a>
          </div>
        </div>
      </footer>
    </div>
  );
}