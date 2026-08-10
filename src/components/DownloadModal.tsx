// src/components/DownloadModal.tsx
'use client';

import { useState } from 'react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiresPin: boolean;
  correctPin: string;
  totalItemsCount: number;
  favoritesCount: number;
}

export default function DownloadModal({
  isOpen,
  onClose,
  requiresPin,
  correctPin,
  totalItemsCount,
  favoritesCount,
}: DownloadModalProps) {
  const [pin, setPin] = useState('');
  const [downloadType, setDownloadType] = useState<'all' | 'favorites'>('favorites');
  const [resolution, setResolution] = useState<'high' | 'web'>('high');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleDownload = (e: React.FormEvent) => {
    e.preventDefault();

    if (requiresPin && pin !== correctPin) {
      alert('Invalid Download PIN. Please check your gallery invitation email.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      alert(`ZIP Download Started: ${downloadType === 'favorites' ? favoritesCount : totalItemsCount} files (${resolution === 'high' ? 'High-Res Originals' : 'Web-Ready JPEGs'})`);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full p-8 border border-zinc-800 bg-zinc-950 rounded-2xl space-y-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white">✕</button>

        <div className="space-y-1">
          <p className="text-xs font-mono uppercase text-purple-400 tracking-widest">Digital Delivery Engine</p>
          <h2 className="text-2xl font-light text-white">Download Photos & Video</h2>
        </div>

        <form onSubmit={handleDownload} className="space-y-6">
          {/* PIN Input if required */}
          {requiresPin && (
            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-mono">4-Digit Download PIN</label>
              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full text-center text-2xl font-mono tracking-[0.5em] py-2 bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>
          )}

          {/* Selection Choice */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-mono">Download Scope</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDownloadType('favorites')}
                className={`p-3 text-xs font-mono rounded-lg border text-left space-y-1 transition-all ${
                  downloadType === 'favorites' ? 'border-purple-500 bg-purple-950/30 text-white' : 'border-zinc-800 bg-zinc-900/50 text-zinc-400'
                }`}
              >
                <p className="font-bold">My Selects ({favoritesCount})</p>
                <p className="text-[10px] text-zinc-500">Only favorited items</p>
              </button>

              <button
                type="button"
                onClick={() => setDownloadType('all')}
                className={`p-3 text-xs font-mono rounded-lg border text-left space-y-1 transition-all ${
                  downloadType === 'all' ? 'border-purple-500 bg-purple-950/30 text-white' : 'border-zinc-800 bg-zinc-900/50 text-zinc-400'
                }`}
              >
                <p className="font-bold">Full Gallery ({totalItemsCount})</p>
                <p className="text-[10px] text-zinc-500">All photos & video</p>
              </button>
            </div>
          </div>

          {/* Resolution Choice */}
          <div className="space-y-2">
            <label className="text-xs text-zinc-400 font-mono">Resolution & Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setResolution('high')}
                className={`p-3 text-xs font-mono rounded-lg border text-left space-y-1 transition-all ${
                  resolution === 'high' ? 'border-purple-500 bg-purple-950/30 text-white' : 'border-zinc-800 bg-zinc-900/50 text-zinc-400'
                }`}
              >
                <p className="font-bold">High-Res Original</p>
                <p className="text-[10px] text-zinc-500">For print & commercial use</p>
              </button>

              <button
                type="button"
                onClick={() => setResolution('web')}
                className={`p-3 text-xs font-mono rounded-lg border text-left space-y-1 transition-all ${
                  resolution === 'web' ? 'border-purple-500 bg-purple-950/30 text-white' : 'border-zinc-800 bg-zinc-900/50 text-zinc-400'
                }`}
              >
                <p className="font-bold">Web-Optimized</p>
                <p className="text-[10px] text-zinc-500">Fast social & web upload</p>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono uppercase tracking-widest rounded-lg transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-50"
          >
            {isProcessing ? 'Generating ZIP Archive...' : 'Download ZIP Archive'}
          </button>
        </form>
      </div>
    </div>
  );
}