// src/components/PartnerLogos.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Partner {
  name: string;
  domain: string;
  category: string;
}

const partners: Partner[] = [
  { name: 'iHUB / ccHUB', domain: 'cchub.africa', category: 'Innovation Hub' },
  { name: 'UNDP Timbuktoo', domain: 'undp.org', category: 'Global Innovation' },
  { name: 'Mastercard Foundation', domain: 'mastercardfdn.org', category: 'Education & Fellowship' },
  { name: 'Safaricom Spark', domain: 'safaricom.co.ke', category: 'Accelerator' },
  { name: 'BURN Manufacturing', domain: 'burnmfg.com', category: 'Clean Energy' },
  { name: 'Delta40 Studio', domain: 'delta40.studio', category: 'Venture Studio' },
  { name: 'GrowthAfrica', domain: 'growthafrica.com', category: 'Accelerator' },
  { name: 'FES Kenya', domain: 'kenya.fes.de', category: 'Foundation' },
  { name: 'HEVA Fund', domain: 'hevafund.com', category: 'Creative Economy' },
  { name: 'Shop Zetu', domain: 'shopzetu.com', category: 'E-Commerce' },
  { name: 'Estee Lauder', domain: 'esteelauder.com', category: 'Commercial Brand' },
  { name: 'Bata Kenya', domain: 'bata.com', category: 'Commercial Brand' },
  { name: 'Standard Chartered', domain: 'sc.com', category: 'Banking & Finance' },
  { name: 'TEDx Parklands', domain: 'ted.com', category: 'Events & Media' },
  { name: 'Branch International', domain: 'branch.co', category: 'Fintech' },
];

export default function PartnerLogos() {
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  const handleImageError = (domain: string) => {
    setFailedLogos((prev) => ({ ...prev, [domain]: true }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-center md:justify-start gap-3">
        {partners.map((p) => {
          const hasFailed = failedLogos[p.domain];
          return (
            <div
              key={p.domain}
              className="flex items-center gap-3 px-3.5 py-2 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl shadow-xs hover:border-purple-600/50 transition-all group"
            >
              <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0 bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                {!hasFailed ? (
                  <Image
                    src={`https://www.google.com/s2/favicons?domain=${p.domain}&sz=128`}
                    alt={`${p.name} Logo`}
                    width={24}
                    height={24}
                    className="object-contain"
                    onError={() => handleImageError(p.domain)}
                    unoptimized
                  />
                ) : (
                  /* Placeholder SVG Line Icon for Organization */
                  <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 stroke-current fill-none stroke-2" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-mono text-slate-900 dark:text-zinc-200 font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {p.name}
                </span>
                <span className="text-[9px] font-mono text-slate-500 dark:text-zinc-500 uppercase">
                  {p.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}