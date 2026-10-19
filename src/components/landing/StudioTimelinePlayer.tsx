"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
    <div className="">
      {/* Top Application Header Bar */}
      <div className="">
        <div className="">
          <div className="">
            <span className="" />
            <span className="" />
            <span className="" />
          </div>
          <span className="">|</span>
          <span className="">
            <Film className="" />
            KIPSMTHN Studio Engine v4
          </span>
          <span className="hidden">/</span>
          <span className="hidden">
            {currentScene.title}
          </span>
        </div>

        {/* Top Control Bar: Ratio & LUT switchers */}
        <div className="">
          {/* Aspect Ratio Switcher */}
          <div className="">
            {RATIOS.map((ratio) => (
              <button
                key={ratio.id}
                onClick={() => setActiveRatio(ratio)}
                className={`rounded px-2 py-1 transition-colors ${
                  activeRatio.id === ratio.id
                    ? "bg-purple-600 text-white font-medium shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {ratio.label}
              </button>
            ))}
          </div>

          {/* Color LUT Selector */}
          <div className="">
            {LUTS.map((lut) => (
              <button
                key={lut.id}
                onClick={() => setActiveLut(lut)}
                className={`rounded px-2 py-1 transition-colors ${
                  activeLut.id === lut.id
                    ? "bg-purple-600 text-white font-medium shadow-sm"
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
      <div className="">
        {/* Monitor Viewport */}
        <div className="">
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
            <div className="to-black/30">
              <div className="">
                <span className="">
                  REC ● 4K 10-BIT PRORES
                </span>
                <span className="">
                  {currentScene.fps}
                </span>
              </div>

              {/* Lower HUD Overlay: Timecode & Active Take */}
              <div className="">
                <div>
                  <p className="">{currentScene.camera}</p>
                  <p className="">{currentScene.title}</p>
                </div>
                <div className="">
                  {formatTimecode(progress)}
                </div>
              </div>
            </div>

            {/* Center Big Play Button Overlay on Hover/Paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="m-auto"
                aria-label="Play video"
              >
                <Play className="" />
              </button>
            )}
          </div>
        </div>

        {/* Right Inspector & Take Selector */}
        <div className="">
          <div className="">
            <div className="">
              <span className="">
                Shot Sequences
              </span>
              <span className="">
                {activeSceneIndex + 1} / {SCENES.length}
              </span>
            </div>

            {/* Scene Selector List */}
            <div className="">
              {SCENES.map((scene, idx) => (
                <button
                  key={scene.id}
                  onClick={() => {
                    setActiveSceneIndex(idx);
                    setProgress(15);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs ${
                    activeSceneIndex === idx
                      ? "bg-purple-600/20 border-purple-500/50 text-white shadow-sm"
                      : "bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="">
                    <span className="">{scene.title.split("·")[1]?.trim() || scene.title}</span>
                    <span className="">{scene.duration}</span>
                  </div>
                  <p className="">{scene.camera} · {scene.lens}</p>
                </button>
              ))}
            </div>

            {/* Shot Specs Metadata */}
            <div className="">
              <div className="">
                <span>Capture Audio</span>
                <span className="">{currentScene.audioTrack}</span>
              </div>
              <div className="">
                <span>Active Color Grade</span>
                <span className="">{activeLut.label}</span>
              </div>
              <div className="">
                <span>Deliverable Sync</span>
                <span className="">
                  <CheckCircle2 className="" /> Ready for Client
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action in Inspector */}
          <div className="">
            <Link
              href="/admin/galleries"
              className=""
            >
              Open in Creator Workspace →
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Multi-Track Timeline */}
      <div className="">
        {/* Playback Controls & Scrubber Head */}
        <div className="">
          <div className="">
            <button
              onClick={togglePlay}
              className=""
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="" /> : <Play className="" />}
            </button>
            <button
              onClick={() => setProgress(0)}
              className=""
              aria-label="Restart"
            >
              <RotateCcw className="" />
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className=""
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="" /> : <Volume2 className="" />}
            </button>

            {/* Timecode readouts */}
            <div className="">
              <span className="">{formatTimecode(progress)}</span>
              <span className=""> / </span>
              <span className="">00:03:24:00</span>
            </div>
          </div>

          {/* Quick Editing Tools */}
          <div className="">
            <button
              onClick={() => setActiveTool("cut")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                activeTool === "cut" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Scissors className="" />
              <span>Split Cut</span>
            </button>
            <button
              onClick={() => setActiveTool("marker")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                activeTool === "marker" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              <Clock className="" />
              <span>Timestamp Marker</span>
            </button>
          </div>
        </div>

        {/* Timeline Tracks Visualizer */}
        <div
          className=""
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newPct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
            setProgress(newPct);
          }}
        >
          {/* Red Playhead Needle */}
          <div
            className=""
            style={{ left: `${progress}%` }}
          >
            <div className="-ml-1" />
          </div>

          {/* Track 1: Video A-Roll */}
          <div className="to-indigo-900/60">
            <span className="">
              <Film className="" /> V1 · 4K A-Roll Master Cut
            </span>
            {/* Cut dividers */}
            <div className="" />
            <div className="" />
            <div className="" />
          </div>

          {/* Track 2: Audio Multi-Track Waveform */}
          <div className="">
            <span className="">
              <Volume2 className="" /> A1 · Boom + Lav 32-bit Float (-14 LUFS)
            </span>
            {/* Waveform graphic bars */}
            <div className="">
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  className=""
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
