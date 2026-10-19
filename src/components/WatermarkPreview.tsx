'use client';

import { useState, useRef } from 'react';
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
    <div className="">
      {/* Preview Mode Toggle */}
      <div className="">
        <div className="">
          <button
            onClick={() => setPreviewMode('gallery')}
            className={`px-3 py-1.5 text-xs font-sans rounded-lg transition-colors ${
              previewMode === 'gallery'
                ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Gallery Preview
          </button>
          <button
            onClick={() => setPreviewMode('download')}
            className={`px-3 py-1.5 text-xs font-sans rounded-lg transition-colors ${
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
          className=""
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
            className=""
          >
            Watermark settings saved successfully
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Container */}
      <div className="">
        <div className="">
          LIVE PREVIEW
        </div>

        <div
          ref={imageRef}
          className=""
        >
          <Image
            src="/team-photo.jpg"
            alt="Watermark preview"
            fill
            className=""
            unoptimized
          />

          {/* Watermark Overlay */}
          <div
            className=""
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

        <div className="">
          This is approximately how your client will see {previewMode === 'gallery' ? 'proof images' : 'downloads'}.
        </div>
      </div>

      {/* Position Selector Grid */}
      <div className="">
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
            <span className="">
              {position.replace('-', ' ')}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
