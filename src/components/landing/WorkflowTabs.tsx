"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2,
  Lock,
  ArrowRight,
  Film,
  Camera,
  Volume2,
  Download,
  Share2,
  Cpu,
} from "lucide-react";

interface WorkflowStep {
  id: string;
  stepNumber: string;
  tabLabel: string;
  title: string;
  headline: string;
  description: string;
  capabilities: string[];
  image: string;
  badge: string;
  metrics: { label: string; value: string }[];
}

const STEPS: WorkflowStep[] = [
  {
    id: "step-1",
    stepNumber: "01",
    tabLabel: "Ingest & Multi-Cam",
    title: "Ingest & Multi-Cam Sync",
    headline: "Automated timecode alignment and multi-track audio matching in seconds.",
    description:
      "Connect cinema camera cards and sound field recorders. The platform aligns dual Sony FX6/FX3 A-Roll and B-Roll footage with 32-bit float multitrack sound without manual clapping or slate hunting.",
    capabilities: [
      "Zero-drift SMPTE timecode sync across up to 4 cameras",
      "Automatic ProRes proxy generation for rapid remote editing",
      "Dual A/D 32-bit float audio channel split and peak normalization",
    ],
    image: "/src/assets/images/bento_camera_gear_1792249658422.jpg",
    badge: "Cinema Ingest Engine",
    metrics: [
      { label: "Sync Speed", value: "< 4s" },
      { label: "Max Stream", value: "4K 120p" },
      { label: "Bit Depth", value: "10-bit 4:2:2" },
    ],
  },
  {
    id: "step-2",
    stepNumber: "02",
    tabLabel: "Smart Cutting & Selects",
    title: "Smart Cutting & Scene Selects",
    headline: "Cut out dead air and tag golden takes with precision rhythm markers.",
    description:
      "Rapidly assemble founder stories, factory floor b-roll, and commercial interviews. Instant silence detection and marker indexing isolate the strongest soundbites and visual moments for director review.",
    capabilities: [
      "Speech-synchronized text transcript with click-to-cut navigation",
      "Automatic B-Roll categorization (Factory, Portrait, Landscape, Aerial)",
      "Multi-aspect ratio reframing (16:9 widescreen to 9:16 vertical reels)",
    ],
    image: "/src/assets/images/hero_cinema_editor_1792249656393.jpg",
    badge: "Smart Editorial Studio",
    metrics: [
      { label: "Cut Time", value: "-65%" },
      { label: "Multi-Aspect", value: "1-Click" },
      { label: "Formats", value: "DCI / UHD / 9:16" },
    ],
  },
  {
    id: "step-3",
    stepNumber: "03",
    tabLabel: "Color & Sound Finish",
    title: "Color Grade & Spatial Sound Master",
    headline: "DaVinci Resolve color science with broadcast-grade audio mastering.",
    description:
      "Grade cinema camera logs with studio LUTs calibrated for African skin tones, high-contrast equatorial sunlight, and warm documentary interiors. Audio is normalized strictly to -14 LUFS for streaming and -24 LKFS for broadcast.",
    capabilities: [
      "ACES color management with custom Kodak 2383 and S-Cinetone profiles",
      "Dynamic vocal isolation and de-reverberation on field audio tracks",
      "Lossless master delivery: Apple ProRes 422 HQ and H.265 10-bit MP4",
    ],
    image: "/src/assets/images/bento_drone_cinematography_1792249658520.jpg",
    badge: "Finishing Suite",
    metrics: [
      { label: "Loudness", value: "-14 LUFS" },
      { label: "Gamut", value: "Rec.2020 / P3" },
      { label: "Dynamic Range", value: "15+ Stops" },
    ],
  },
  {
    id: "step-4",
    stepNumber: "04",
    tabLabel: "Private Client Delivery",
    title: "Private Client Portals & Deliverables",
    headline: "Branded client delivery with PIN security, favorites, and 1-click downloads.",
    description:
      "Deliver commercial campaigns directly to clients under your custom studio domain. Clients review cuts with frame-accurate timestamped comments, heart their favorite master selects, and download original full-res files instantly.",
    capabilities: [
      "PIN-protected private client access with optional client watermarking",
      "Client selection tally and instant high-speed ZIP export",
      "Direct integration with accepted quotes, project milestones, and paid invoices",
    ],
    image: "/src/assets/images/bento_client_delivery_1792249657256.jpg",
    badge: "Client Portal Engine",
    metrics: [
      { label: "Client Approval", value: "99.8%" },
      { label: "Download Speed", value: "High-Bandwidth" },
      { label: "Encryption", value: "End-to-End" },
    ],
  },
];

export default function WorkflowTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const current = STEPS[activeTab];

  return (
    <div className="space-y-8">
      {/* Supercut-Style Segmented Navigation Tabs */}
      <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-none">
        <div className="inline-flex rounded-2xl bg-slate-100 p-1.5 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
          {STEPS.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setActiveTab(idx)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === idx
                  ? "bg-white text-slate-900 shadow-md dark:bg-zinc-800 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <span
                className={`font-mono text-[10px] font-bold ${
                  activeTab === idx ? "text-purple-600 dark:text-purple-400" : "text-slate-400"
                }`}
              >
                {step.stepNumber}
              </span>
              <span>{step.tabLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Display Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 transition-all">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-14 items-center">
          {/* Left Text & Capabilities */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                {current.stepNumber} · {current.badge}
              </span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-light tracking-tight text-slate-900 dark:text-white leading-tight">
              {current.headline}
            </h3>

            <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-zinc-400">
              {current.description}
            </p>

            {/* Feature Checklist */}
            <div className="space-y-3 pt-2">
              {current.capabilities.map((cap, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-zinc-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <span>{cap}</span>
                </div>
              ))}
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 dark:border-zinc-900">
              {current.metrics.map((m, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wider">{m.label}</p>
                  <p className="text-xl sm:text-2xl font-light text-slate-900 dark:text-white font-mono">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual Image */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-xl group">
            <Image
              src={current.image}
              alt={current.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 550px"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
              <span className="font-semibold bg-black/60 backdrop-blur px-2.5 py-1 rounded border border-white/10">
                {current.title}
              </span>
              <span className="font-mono text-[10px] text-purple-300 bg-black/60 backdrop-blur px-2 py-1 rounded">
                Verified Pipeline
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
