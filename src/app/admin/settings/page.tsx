'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WatermarkPreview from '@/components/WatermarkPreview';

// ... (previous imports and types remain the same)

export default function AdminSettingsPage() {
  // ... (previous state declarations remain the same)

  // Add new state for watermark size
  const [watermarkSize, setWatermarkSize] = useState(42);

  // Add state for watermark presets
  const [watermarkPreset, setWatermarkPreset] = useState<'proof' | 'brand'>('proof');

  // Apply preset when changed
  useEffect(() => {
    if (watermarkPreset === 'proof') {
      setWatermarkText('KIPSMTHN PROOF');
      setWatermarkOpacity(30);
      setWatermarkPosition('bottom-right');
      setWatermarkSize(42);
    } else {
      setWatermarkText('KIPSMTHN');
      setWatermarkOpacity(55);
      setWatermarkPosition('bottom-right');
      setWatermarkSize(36);
    }
  }, [watermarkPreset]);

  // Handle watermark changes from preview
  const handleWatermarkChange = (settings: {
    text: string;
    opacity: number;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    size: number;
  }) => {
    setWatermarkText(settings.text);
    setWatermarkOpacity(settings.opacity);
    setWatermarkPosition(settings.position);
    setWatermarkSize(settings.size);
  };

  // ... (rest of the component remains the same until the watermark tab)

  {/* TAB 2: WATERMARK */}
  {activeTab === 'watermark' && (
    <div className="space-y-6">
      {/* Watermark Presets */}
      <div className="inline-flex rounded-xl bg-slate-100 dark:bg-zinc-900 p-1">
        <button
          onClick={() => setWatermarkPreset('proof')}
          className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
            watermarkPreset === 'proof'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Proof
        </button>
        <button
          onClick={() => setWatermarkPreset('brand')}
          className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
            watermarkPreset === 'brand'
              ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Brand
        </button>
      </div>

      {/* Watermark Preview Component */}
      <WatermarkPreview
        watermarkText={watermarkText}
        watermarkOpacity={watermarkOpacity}
        watermarkPosition={watermarkPosition}
        watermarkSize={watermarkSize}
        onWatermarkChange={handleWatermarkChange}
      />

      {/* Watermark Controls */}
      <div className="p-8 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 rounded-2xl space-y-6 shadow-sm dark:shadow-none">
        <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-3">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">Watermark Details</h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Adjust the watermark text and appearance.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono font-medium">Watermark Text</label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-700 dark:text-zinc-300">Opacity</span>
              <span className="text-purple-600 font-bold">{watermarkOpacity}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              value={watermarkOpacity}
              onChange={(e) => setWatermarkOpacity(parseInt(e.target.value, 10))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-700 dark:text-zinc-300">Size</span>
              <span className="text-purple-600 font-bold">{watermarkSize}px</span>
            </div>
            <input
              type="range"
              min={24}
              max={64}
              value={watermarkSize}
              onChange={(e) => setWatermarkSize(parseInt(e.target.value, 10))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  )}

  {/* ... (rest of the component remains the same) */}
}
