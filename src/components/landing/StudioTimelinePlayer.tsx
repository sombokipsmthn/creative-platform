"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Volume2,
  VolumeX,
  Sliders,
  Layers,
  Sparkles,
  Film,
  Camera,
  CheckCircle2,
  Clock,
  Scissors,
} from "lucide-react";

interface Scene {
  id: string;
  title: string;
  duration: string;
  camera: string;
  lens: string;
  resolution: string;
  fps: string;
  image: string;
  audioTrack: string;
  markers: number[];
}

const SCENES: Scene[] = [
  {
    id: "sc-1",
    title: "01 · Naivasha Hub — Founder Interview",
    duration: "00:03:24",
    camera: "Sony FX6 Cinema Line",
    lens: "50mm T1.5 Cine Prime",
    resolution: "4K DCI (4096×2160)",
    fps: "24.00 fps S-Log3",
    image: "/src/assets/images/hero_cinema_editor_1792249656393.jpg",
    audioTrack: "Sennheiser EW-DP 32-bit Float",
    markers: [12, 35, 68, 88],
  },
  {
    id: "sc-2",
    title: "02 · Ruiru Factory — Precision Assembly",
    duration: "00:02:48",
    camera: "Sony FX3 High-Speed",
    lens: "24-70mm f/2.8 GM II",
    resolution: "4K UHD (3840×2160)",
    fps: "120.00 fps S-Cinetone",
    image: "/src/assets/images/bento_camera_gear_1792249658422.jpg",
    audioTrack: "Zoom F8n Multi-track Ambiance",
    markers: [20, 50, 75],
  },
  {
    id: "sc-3",
    title: "03 · Great Rift Valley — Sunrise Aerial Sweep",
    duration: "00:01:52",
    camera: "DJI Mavic 3 Pro Cine",
    lens: "Hasselblad 24mm 4/3 CMOS",
    resolution: "5.1K Apple ProRes 422 HQ",
    fps: "60.00 fps D-Log",
    image: "/src/assets/images/bento_drone_cinematography_1792249658520.jpg",
    audioTrack: "Field Stereo Soundscapes",
    markers: [15, 45, 90],
  },
  {
    id: "sc-4",
    title: "04 · Client Review Suite — Private Deliverables",
    duration: "00:04:10",
    camera: "Executive Client Master",
    lens: "Color Master OLED Rec.709",
    resolution: "4K Master Delivery",
    fps: "24.00 fps Broadcast Final",
    image: "/src/assets/images/bento_client_delivery_1792249657256.jpg",
    audioTrack: "Mastered -14 LUFS Stereo",
    markers: [10, 40, 70, 95],
  },
];

const LUTS = [
  { id: "cinetone", label: "S-Cinetone", tint: "contrast-105 saturate-110" },
  { id: "filmprint", label: "Kodak 2383", tint: "sepia-[0.15] contrast-115 saturate-95" },
  { id: "logc", label: "Arri LogC Tone", tint: "brightness-105 contrast-100 saturate-105" },
  { id: "clean", label: "Rec.709 Neutral", tint: "contrast-100 saturate-100" },
];

const RATIOS = [
  { id: "16:9", label: "16:9 Cinema", aspect: "aspect-video" },
  { id: "9:16", label: "9:16 Reels", aspect: "aspect-[9/16] max-w-[280px] mx-auto" },
  { id: "1:1", label: "1:1 Square", aspect: "aspect-square max-w-[420px] mx-auto" },
];

export default function StudioTimelinePlayer() {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(34);
  const [activeLut, setActiveLut] = useState(LUTS[0]);
  const [activeRatio, setActiveRatio] = useState(RATIOS[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTool, setActiveTool] = useState<"cut" | "marker" | "sync">("cut");

  const currentScene = SCENES[activeSceneIndex];

  // Playback timer simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 0.6;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const formatTimecode = (pct: number) => {
    const totalSeconds = 204; // 3m 24s
    const currentSeconds = Math.floor((pct / 100) * totalSeconds);
    const m = Math.floor(currentSeconds / 60);
    const s = currentSeconds % 60;
    const f = Math.floor(((pct * 24) / 100) % 24);
    return `00:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl rounded-2xl border border-slate-200/80 bg-slate-900/90 text-white shadow-2xl backdrop-blur-xl dark:border-zinc-800 dark:bg-black/85 overflow-hidden">
      {/* Top Application Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-xs bg-slate-950/70">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-slate-400">|</span>
          <span className="font-semibold text-white tracking-wide flex items-center gap-2">
            <Film className="h-3.5 w-3.5 text-primary" />
            KIPSMTHN Studio Engine v4
          </span>
          <span className="hidden sm:inline text-slate-500">/</span>
          <span className="hidden sm:inline text-slate-300 font-medium truncate max-w-[200px]">
            {currentScene.title}
          </span>
        </div>

        {/* Top Control Bar: Ratio & LUT switchers */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Aspect Ratio Switcher */}
          <div className="flex items-center rounded-lg bg-white/5 p-0.5 border border-white/10 text-[11px]">
            {RATIOS.map((ratio) => (
              <button
                key={ratio.id}
                onClick={() => setActiveRatio(ratio)}
                className={`rounded px-2 py-1 transition-colors ${
                  activeRatio.id === ratio.id
                    ? "bg-primary text-white font-medium shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>

          {/* Color LUT Selector */}
          <div className="flex items-center rounded-lg bg-white/5 p-0.5 border border-white/10 text-[11px]">
            {LUTS.map((lut) => (
              <button
                key={lut.id}
                onClick={() => setActiveLut(lut)}
                className={`rounded px-2 py-1 transition-colors ${
                  activeLut.id === lut.id
                    ? "bg-primary text-white font-medium shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {lut.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Preview Monitor & Inspector Split */}
      <div className="grid lg:grid-cols-[1fr_300px] border-b border-white/10 bg-black/60">
        {/* Monitor Viewport */}
        <div className="relative flex flex-col justify-center items-center p-4 sm:p-6 bg-slate-950/40 min-h-[340px] sm:min-h-[440px]">
          {/* Active Canvas Aspect Box */}
          <div
            className={`relative w-full ${activeRatio.aspect} overflow-hidden rounded-xl border border-white/15 shadow-2xl transition-all duration-300 group`}
          >
            <Image
              src={currentScene.image}
              alt={currentScene.title}
              fill
              className={`object-cover transition-all duration-300 ${activeLut.tint}`}
              priority
              referrerPolicy="no-referrer"
            />

            {/* Video Canvas HUD Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-mono text-white/90">
                <span className="bg-black/60 backdrop-blur px-2.5 py-1 rounded border border-white/10 text-primary font-semibold">
                  REC ● 4K 10-BIT PRORES
                </span>
                <span className="bg-black/60 backdrop-blur px-2.5 py-1 rounded border border-white/10">
                  {currentScene.fps}
                </span>
              </div>

              {/* Lower HUD Overlay: Timecode & Active Take */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-white/70 font-sans">{currentScene.camera}</p>
                  <p className="text-sm font-semibold text-white font-sans">{currentScene.title}</p>
                </div>
                <div className="text-right font-mono text-sm tracking-wider bg-black/60 px-3 py-1 rounded border border-white/10">
                  {formatTimecode(progress)}
                </div>
              </div>
            </div>

            {/* Center Big Play Button Overlay on Hover/Paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary/15 text-white shadow-xl hover:scale-105 hover:bg-primary transition-all z-10"
                aria-label="Play video"
              >
                <Play className="h-7 w-7 fill-white ml-1" />
              </button>
            )}
          </div>
        </div>

        {/* Right Inspector & Take Selector */}
        <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-white/10 bg-slate-900/60 p-4 sm:p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Shot Sequences
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeSceneIndex + 1} / {SCENES.length}
              </span>
            </div>

            {/* Scene Selector List */}
            <div className="space-y-2">
              {SCENES.map((scene, idx) => (
                <button
                  key={scene.id}
                  onClick={() => {
                    setActiveSceneIndex(idx);
                    setProgress(15);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs ${
                    activeSceneIndex === idx
                      ? "bg-primary/10 border-primary/50 text-white shadow-sm"
                      : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-white">
                    <span className="truncate">{scene.title.split("·")[1]?.trim() || scene.title}</span>
                    <span className="font-mono text-[10px] text-primary ml-2">{scene.duration}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 truncate">{scene.camera} · {scene.lens}</p>
                </button>
              ))}
            </div>

            {/* Shot Specs Metadata */}
            <div className="pt-3 border-t border-white/10 space-y-2 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Capture Audio</span>
                <span className="text-white font-mono text-[10px]">{currentScene.audioTrack}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Active Color Grade</span>
                <span className="text-primary font-medium">{activeLut.label}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Deliverable Sync</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Ready for Client
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action in Inspector */}
          <div className="pt-4 border-t border-white/10">
            <Link
              href="/admin/galleries"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-primary hover:bg-primary text-xs font-semibold text-white transition-colors"
            >
              Open in Creator Workspace →
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Multi-Track Timeline */}
      <div className="p-4 bg-slate-950/90 space-y-3">
        {/* Playback Controls & Scrubber Head */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-primary hover:bg-primary text-white transition-colors"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
            </button>
            <button
              onClick={() => setProgress(0)}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              aria-label="Restart"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>

            {/* Timecode readouts */}
            <div className="font-mono text-xs text-white/90 bg-white/5 px-2.5 py-1 rounded border border-white/10 ml-2">
              <span className="text-primary">{formatTimecode(progress)}</span>
              <span className="text-slate-500"> / </span>
              <span className="text-slate-400">00:03:24:00</span>
            </div>
          </div>

          {/* Quick Editing Tools */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setActiveTool("cut")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                activeTool === "cut" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Scissors className="h-3 w-3" />
              <span>Split Cut</span>
            </button>
            <button
              onClick={() => setActiveTool("marker")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                activeTool === "marker" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="h-3 w-3" />
              <span>Timestamp Marker</span>
            </button>
          </div>
        </div>

        {/* Timeline Tracks Visualizer */}
        <div
          className="relative h-24 rounded-xl bg-slate-900 border border-white/10 p-2 overflow-hidden cursor-pointer select-none"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newPct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
            setProgress(newPct);
          }}
        >
          {/* Red Playhead Needle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 transition-all duration-75 shadow-lg pointer-events-none"
            style={{ left: `${progress}%` }}
          >
            <div className="w-2.5 h-2.5 -ml-1 bg-rose-500 rotate-45" />
          </div>

          {/* Track 1: Video A-Roll */}
          <div className="relative h-9 mb-1.5 rounded-lg bg-gradient-to-r from-primary/60 via-primary/50 to-primary/60 border border-primary/30 flex items-center px-3 overflow-hidden">
            <span className="text-[10px] font-mono uppercase tracking-wider text-primary z-10 flex items-center gap-1.5">
              <Film className="h-3 w-3" /> V1 · 4K A-Roll Master Cut
            </span>
            {/* Cut dividers */}
            <div className="absolute left-[25%] top-0 bottom-0 w-px bg-white/30" />
            <div className="absolute left-[55%] top-0 bottom-0 w-px bg-white/30" />
            <div className="absolute left-[78%] top-0 bottom-0 w-px bg-white/30" />
          </div>

          {/* Track 2: Audio Multi-Track Waveform */}
          <div className="relative h-8 rounded-lg bg-emerald-950/50 border border-emerald-500/30 flex items-center px-3 overflow-hidden">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 z-10 flex items-center gap-1.5">
              <Volume2 className="h-3 w-3" /> A1 · Boom + Lav 32-bit Float (-14 LUFS)
            </span>
            {/* Waveform graphic bars */}
            <div className="absolute inset-0 flex items-center justify-around opacity-30 px-2 pointer-events-none">
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full"
                  style={{
                    height: `${Math.sin(i * 0.4) * 12 + 16}px`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
