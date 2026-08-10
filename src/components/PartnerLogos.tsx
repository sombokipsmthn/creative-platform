// src/components/PartnerLogos.tsx
'use client';

import Image from 'next/image';

const partnerDomains = [
  { name: 'iHUB / ccHUB', domain: 'cchub.africa' },
  { name: 'UNDP Timbuktoo', domain: 'undp.org' },
  { name: 'Mastercard Foundation', domain: 'mastercardfdn.org' },
  { name: 'Safaricom Spark', domain: 'safaricom.co.ke' },
  { name: 'BURN Manufacturing', domain: 'burnmfg.com' },
  { name: 'Delta40 Studio', domain: 'delta40.studio' },
  { name: 'GrowthAfrica', domain: 'growthafrica.com' },
  { name: 'FES Kenya', domain: 'kenya.fes.de' },
  { name: 'HEVA Fund', domain: 'hevafund.com' },
  { name: 'Shop Zetu', domain: 'shopzetu.com' },
  { name: 'Estee Lauder', domain: 'esteelauder.com' },
];

export default function PartnerLogos() {
  return (
    <div className="py-12 border-y border-slate-200 dark:border-zinc-900 bg-slate-100/60 dark:bg-zinc-950/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-6">
        <p className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest font-bold text-center md:text-left">
          Programs, Venture Studios & Commercial Brands Documented
        </p>

        {/* Real Logo Ticker Grid */}
        <div className="flex flex-wrap justify-between items-center gap-8 opacity-80 hover:opacity-100 transition-opacity">
          {partnerDomains.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center gap-3 px-3 py-1.5 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xs hover:border-purple-500/50 transition-all"
            >
              <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                <Image
                  src={`https://www.google.com/s2/favicons?domain=${partner.domain}&sz=128`}
                  alt={`${partner.name} Logo`}
                  width={24}
                  height={24}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <span className="text-xs font-mono text-slate-800 dark:text-zinc-200 font-medium">
                {partner.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}