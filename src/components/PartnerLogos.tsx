// src/components/PartnerLogos.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

interface PartnerLogosProps {
  partnersList?: string[];
}

const partnerDomainMap: Record<string, string> = {
  'iHUB / ccHUB': 'cchub.africa',
  'UNDP Timbuktoo': 'undp.org',
  'Mastercard Foundation': 'mastercardfdn.org',
  'Safaricom Spark': 'safaricom.co.ke',
  'BURN Manufacturing': 'burnmfg.com',
  'Delta40 Studio': 'delta40.studio',
  'GrowthAfrica': 'growthafrica.com',
  'FES Kenya': 'kenya.fes.de',
  'HEVA Fund': 'hevafund.com',
  'Shop Zetu': 'shopzetu.com',
  'Estee Lauder': 'esteelauder.com',
};

export default function PartnerLogos({ partnersList }: PartnerLogosProps) {
  const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});

  if (!partnersList || partnersList.length === 0) {
    return null; // 💡 NO CLIENT LOGOS WHEN LOGGED OUT
  }

  const handleImageError = (name: string) => {
    setFailedLogos((prev) => ({ ...prev, [name]: true }));
  };

  return (
    <div className="py-12 border-y border-slate-200 dark:border-zinc-900 bg-slate-100/60 dark:bg-zinc-950/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 space-y-4">
        <p className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest font-bold">
          Creator Program & Brand Partners
        </p>
        <div className="flex flex-wrap justify-between items-center gap-6 text-sm font-mono text-slate-700 dark:text-zinc-300">
          {partnersList.map((partnerName) => {
            const domain = partnerDomainMap[partnerName] || 'google.com';
            const hasFailed = failedLogos[partnerName];

            return (
              <div
                key={partnerName}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl"
              >
                {!hasFailed ? (
                  <div className="relative w-5 h-5 rounded overflow-hidden shrink-0">
                    <Image
                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
                      alt={partnerName}
                      width={20}
                      height={20}
                      className="object-contain"
                      onError={() => handleImageError(partnerName)}
                      unoptimized
                    />
                  </div>
                ) : (
                  <svg className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                )}
                <span>{partnerName}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}