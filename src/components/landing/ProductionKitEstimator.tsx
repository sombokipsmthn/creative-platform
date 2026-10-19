"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Camera,
  Film,
  Sparkles,
  Sliders,
  Check,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Clock,
  Layers,
} from "lucide-react";

interface ServiceOption {
  id: string;
  name: string;
  category: "crew" | "gear" | "post";
  dailyRate: number;
  isDaily: boolean;
  desc: string;
}

const PRODUCTION_SERVICES: ServiceOption[] = [
  {
    id: "dop",
    name: "Director of Photography & Director",
    category: "crew",
    dailyRate: 45000,
    isDaily: true,
    desc: "Principal cinematography, shot composition, lighting direction",
  },
  {
    id: "sound_eng",
    name: "Location Sound Recordist & Boom",
    category: "crew",
    dailyRate: 20000,
    isDaily: true,
    desc: "32-bit float multi-track location audio, wireless lavaliers",
  },
  {
    id: "drone_pilot",
    name: "Licensed Drone Pilot & Spotter",
    category: "crew",
    dailyRate: 30000,
    isDaily: true,
    desc: "KCAA commercial drone clearance, 5.1K ProRes aerials",
  },
  {
    id: "fx6_kit",
    name: "Sony FX6 + FX3 Dual Cinema Camera Rig",
    category: "gear",
    dailyRate: 35000,
    isDaily: true,
    desc: "G-Master primes, monitor/recorders, carbon rails, follow focus",
  },
  {
    id: "lighting_kit",
    name: "Aputure 600d Pro + Nanlite RGBWW Tubes",
    category: "gear",
    dailyRate: 16500,
    isDaily: true,
    desc: "Daylight punch, softboxes, c-stands, wireless power distribution",
  },
  {
    id: "teradek_gimbal",
    name: "DJI Ronin RS 3 Pro + Teradek 4K Wireless",
    category: "gear",
    dailyRate: 18500,
    isDaily: true,
    desc: "Zero-latency wireless client monitor feed and camera stabilization",
  },
  {
    id: "post_master",
    name: "Master Editing, Sound Design & Color Grading",
    category: "post",
    dailyRate: 65000,
    isDaily: false, // flat per project
    desc: "4K Master delivery, 3x social cutdowns, -14 LUFS sound mix",
  },
];

export default function ProductionKitEstimator() {
  const [days, setDays] = useState<number>(2);
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "dop",
    "sound_eng",
    "fx6_kit",
    "lighting_kit",
    "post_master",
  ]);

  const toggleService = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const { subtotal, vat, total, deposit, taxShield } = useMemo(() => {
    let sub = 0;
    selectedIds.forEach((id) => {
      const s = PRODUCTION_SERVICES.find((item) => item.id === id);
      if (s) {
        sub += s.isDaily ? s.dailyRate * days : s.dailyRate;
      }
    });

    const v = Math.round(sub * 0.16);
    const tot = sub + v;
    const dep = Math.round(tot * 0.5);
    const shield = Math.round(sub * 0.3); // 30% KRA corporate tax shield

    return { subtotal: sub, vat: v, total: tot, deposit: dep, taxShield: shield };
  }, [days, selectedIds]);

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-8 lg:gap-12 items-start">
        {/* Left: Configuration Controls */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              <Sliders className="h-3.5 w-3.5" />
              Live Production Estimator
            </div>
            <h3 className="mt-2 text-2xl sm:text-3xl font-light tracking-tight text-slate-900 dark:text-white">
              Configure your cinema shoot & calculate instant rates.
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
              Standardized Nairobi commercial production rates with transparent equipment and crew lines.
            </p>
          </div>

          {/* Shoot Duration Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center justify-between">
              <span>Shoot Duration (Production Days)</span>
              <span className="font-mono text-purple-600 dark:text-purple-400 text-sm font-bold">
                {days} {days === 1 ? "Day" : "Days"}
              </span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    days === d
                      ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/20"
                      : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-purple-300"
                  }`}
                >
                  {d} {d === 1 ? "Day" : "Days"}
                </button>
              ))}
            </div>
          </div>

          {/* Service & Kit Selection List */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Include Crew Roles & Cinema Gear Kits
            </label>
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {PRODUCTION_SERVICES.map((service) => {
                const isSelected = selectedIds.includes(service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-purple-50/50 dark:bg-purple-950/20 border-purple-500/40 text-slate-900 dark:text-white"
                        : "bg-slate-50/60 dark:bg-zinc-900/40 border-slate-200/80 dark:border-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-100/50 dark:hover:bg-zinc-900/80"
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          isSelected
                            ? "bg-purple-600 border-purple-600 text-white"
                            : "border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug">{service.name}</p>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                          {service.desc}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="font-mono text-xs font-semibold text-slate-900 dark:text-zinc-100">
                        KES {service.dailyRate.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {service.isDaily ? `/ day` : `flat fee`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Live Quote Summary & Tax Shield Breakdown */}
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 p-6 space-y-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-semibold">
              Live Quotation Breakdown
            </span>
            <div className="mt-2 flex items-baseline justify-between  border-slate-200 dark:border-zinc-800 pb-4">
              <span className="text-sm text-slate-500 dark:text-zinc-400">Total Investment</span>
              <div className="text-right">
                <span className="text-3xl font-light tracking-tight font-sans text-slate-900 dark:text-white">
                  KES {total.toLocaleString()}
                </span>
                <span className="block text-[10px] text-slate-400">VAT Included (16%)</span>
              </div>
            </div>
          </div>

          {/* Breakdown Items */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-zinc-400">
              <span>Production Subtotal</span>
              <span className="font-mono font-medium text-slate-900 dark:text-zinc-200">
                KES {subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-zinc-400">
              <span>VAT (16% eTIMS Compliant)</span>
              <span className="font-mono font-medium text-slate-900 dark:text-zinc-200">
                KES {vat.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-purple-600 dark:text-purple-400 font-medium pt-2 border-t border-slate-200 dark:border-zinc-800">
              <span>50% Mobilization Deposit</span>
              <span className="font-mono font-bold">
                KES {deposit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* KRA Tax Shield Box */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              <span>30% KRA Corporate Tax Shield</span>
            </div>
            <p className="text-[11px] text-emerald-800/90 dark:text-emerald-200/90 leading-relaxed">
              Every production invoice generated is fully deductible against corporate income tax with verified KRA PIN:{" "}
              <strong className="font-mono">KES {taxShield.toLocaleString()}</strong> in estimated corporate tax savings.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            <Link
              href="/admin/quotes/new"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-600/25 transition hover:bg-purple-700 hover:scale-[1.01]"
            >
              Generate Official Quotation <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="w-full inline-flex items-center justify-center py-2.5 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Need custom terms or multi-city logistics? Contact Somboriot →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
