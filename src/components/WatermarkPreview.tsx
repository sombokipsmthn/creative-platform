'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface WatermarkPreviewProps {
  watermarkText: string;
  watermarkOpacity: number;
  watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  watermarkSize: number;
  onWatermarkChange: (settings: {
    text: string;
    opacity: number;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    size: number;
  }) => void;
}

export default function WatermarkPreview({
  watermarkText,
  watermarkOpacity,
  watermarkPosition,
  watermarkSize,
  onWatermarkChange,
}: WatermarkPreviewProps) {
  const [previewMode, setPreviewMode] = useState<'gallery' | 'download'>('gallery');
  const [showSuccess, setShowSuccess] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const handlePositionSelect = (position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center') => {
    onWatermarkChange({
      text: watermarkText,
      opacity: watermarkOpacity,
      position,
      size: watermarkSize,
    });
  };

  const handleSave = () => {
    onWatermarkChange({
      text: watermarkText,
      opacity: watermarkOpacity,
      position: watermarkPosition,
      size: watermarkSize,
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Preview Mode Toggle */}
      <div className="flex justify-between items-center">
        <div className="inline-flex rounded-xl bg-slate-100 dark:bg-zinc-900 p-1">
          <button
            onClick={() => setPreviewMode('gallery')}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
              previewMode === 'gallery'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gallery Preview
          </button>
          <button
            onClick={() => setPreviewMode('download')}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
              previewMode === 'download'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Download Preview
          </button>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 text-xs font-mono uppercase tracking-widest bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-md shadow-purple-600/20"
        >
          Save Watermark Settings
        </button>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-xl text-xs font-mono shadow-lg"
          >
            Watermark settings saved successfully
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Container */}
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 text-center py-3 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-xs font-mono font-bold text-slate-900 dark:text-white">
          LIVE PREVIEW
        </div>

        <div
          ref={imageRef}
          className="relative aspect-[3/2] rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-xl bg-slate-100 dark:bg-zinc-900"
        >
          <Image
            src="/team-photo.jpg"
            alt="Watermark preview"
            fill
            className="object-cover"
            unoptimized
          />

          {/* Watermark Overlay */}
          <div
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            style={{ opacity: watermarkOpacity / 100 }}
          >
            <div
              className={`absolute text-white font-bold tracking-widest text-shadow-lg ${watermarkPosition === 'center' ? 'flex items-center justify-center' : ''}`}
              style={{ fontSize: `${watermarkSize}px` }}
            >
              {watermarkText}
            </div>
          </div>
        </div>

        <div className="mt-3 text-center text-xs text-slate-500 dark:text-zinc-400 font-mono">
          This is approximately how your client will see {previewMode === 'gallery' ? 'proof images' : 'downloads'}.
        </div>
      </div>

      {/* Position Selector Grid */}
      <div className="grid grid-cols-3 gap-2">
        {(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'] as const).map((position) => (
          <button
            key={position}
            onClick={() => handlePositionSelect(position)}
            className={`h-12 rounded-lg border-2 transition-colors ${
              watermarkPosition === position
                ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/20'
                : 'border-slate-200 dark:border-zinc-800 hover:border-purple-200 dark:hover:border-purple-800'
            }`}
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 dark:text-zinc-400">
              {position.replace('-', ' ')}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
