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
    <div className="">
      <div className="">
        {/* Left: Configuration Controls */}
        <div className="">
          <div>
            <div className="">
              <Sliders className="" />
              Live Production Estimator
            </div>
            <h3 className="">
              Configure your cinema shoot & calculate instant rates.
            </h3>
            <p className="">
              Standardized Nairobi commercial production rates with transparent equipment and crew lines.
            </p>
          </div>

          {/* Shoot Duration Selector */}
          <div className="">
            <label className="">
              <span>Shoot Duration (Production Days)</span>
              <span className="">
                {days} {days === 1 ? "Day" : "Days"}
              </span>
            </label>
            <div className="">
              {[1, 2, 3, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    days === d
                      ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                      : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-primary"
                  }`}
                >
                  {d} {d === 1 ? "Day" : "Days"}
                </button>
              ))}
            </div>
          </div>

          {/* Service & Kit Selection List */}
          <div className="">
            <label className="">
              Include Crew Roles & Cinema Gear Kits
            </label>
            <div className="">
              {PRODUCTION_SERVICES.map((service) => {
                const isSelected = selectedIds.includes(service.id);
                return (
                  <div
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`flex items-start justify-between gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-primary/15 dark:bg-primary/10 border-primary/40 text-slate-900 dark:text-white"
                        : "bg-slate-50/60 dark:bg-zinc-900/40 border-slate-200/80 dark:border-zinc-800/80 text-slate-600 dark:text-zinc-400 hover:bg-slate-100/50 dark:hover:bg-zinc-900/80"
                    }`}
                  >
                    <div className="">
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          isSelected
                            ? "bg-primary border-primary text-white"
                            : "border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                        }`}
                      >
                        {isSelected && <Check className="" />}
                      </div>
                      <div className="">
                        <p className="">{service.name}</p>
                        <p className="">
                          {service.desc}
                        </p>
                      </div>
                    </div>
                    <div className="">
                      <span className="">
                        KES {service.dailyRate.toLocaleString()}
                      </span>
                      <span className="block">
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
        <div className="">
          <div>
            <span className="">
              Live Quotation Breakdown
            </span>
            <div className="items-baseline">
              <span className="">Total Investment</span>
              <div className="">
                <span className="">
                  KES {total.toLocaleString()}
                </span>
                <span className="block">VAT Included (16%)</span>
              </div>
            </div>
          </div>

          {/* Breakdown Items */}
          <div className="">
            <div className="">
              <span>Production Subtotal</span>
              <span className="">
                KES {subtotal.toLocaleString()}
              </span>
            </div>
            <div className="">
              <span>VAT (16% eTIMS Compliant)</span>
              <span className="">
                KES {vat.toLocaleString()}
              </span>
            </div>
            <div className="">
              <span>50% Mobilization Deposit</span>
              <span className="">
                KES {deposit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* KRA Tax Shield Box */}
          <div className="">
            <div className="">
              <ShieldCheck className="" />
              <span>30% KRA Corporate Tax Shield</span>
            </div>
            <p className="">
              Every production invoice generated is fully deductible against corporate income tax with verified KRA PIN:{" "}
              <strong className="">KES {taxShield.toLocaleString()}</strong> in estimated corporate tax savings.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="">
            <Link
              href="/admin/quotes/new"
              className=""
            >
              Generate Official Quotation <ArrowRight className="" />
            </Link>
            <Link
              href="/contact"
              className=""
            >
              Need custom terms or multi-city logistics? Contact Somboriot →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
