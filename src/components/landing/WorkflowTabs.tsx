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
    <div className="">
      {/* Supercut-Style Segmented Navigation Tabs */}
      <div className="scrollbar-none">
        <div className="">
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
                  activeTab === idx ? "text-primary dark:text-primary" : "text-slate-400"
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
      <div className="">
        <div className="">
          {/* Left Text & Capabilities */}
          <div className="">
            <div className="">
              <span className="">
                {current.stepNumber} · {current.badge}
              </span>
            </div>

            <h3 className="">
              {current.headline}
            </h3>

            <p className="">
              {current.description}
            </p>

            {/* Feature Checklist */}
            <div className="">
              {current.capabilities.map((cap, i) => (
                <div key={i} className="">
                  <CheckCircle2 className="" />
                  <span>{cap}</span>
                </div>
              ))}
            </div>

            {/* Metrics Row */}
            <div className="">
              {current.metrics.map((m, i) => (
                <div key={i} className="">
                  <p className="">{m.label}</p>
                  <p className="">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual Image */}
          <div className="">
            <Image
              src={current.image}
              alt={current.title}
              fill
              className=""
              sizes="(max-width: 1024px) 100vw, 550px"
              referrerPolicy="no-referrer"
            />
            <div className="to-transparent" />
            <div className="">
              <span className="">
                {current.title}
              </span>
              <span className="">
                Verified Pipeline
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
