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
    <div className="">
      <div className="">
        <button onClick={onClose} className="">✕</button>

        <div className="">
          <p className="">Digital Delivery Engine</p>
          <h2 className="">Download Photos & Video</h2>
        </div>

        <form onSubmit={handleDownload} className="">
          {/* PIN Input if required */}
          {requiresPin && (
            <div className="">
              <label className="">4-Digit Download PIN</label>
              <input
                type="password"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className=""
              />
            </div>
          )}

          {/* Selection Choice */}
          <div className="">
            <label className="">Download Scope</label>
            <div className="">
              <button
                type="button"
                onClick={() => setDownloadType('favorites')}
                className={`p-3 text-xs font-sans rounded-lg border text-left space-y-1 transition-all ${
                  downloadType === 'favorites' ? 'border-purple-500 bg-purple-950/30 text-white' : 'border-zinc-800 bg-zinc-900/50 text-zinc-400'
                }`}
              >
                <p className="">My Selects ({favoritesCount})</p>
                <p className="">Only favorited items</p>
              </button>

              <button
                type="button"
                onClick={() => setDownloadType('all')}
                className={`p-3 text-xs font-sans rounded-lg border text-left space-y-1 transition-all ${
                  downloadType === 'all' ? 'border-purple-500 bg-purple-950/30 text-white' : 'border-zinc-800 bg-zinc-900/50 text-zinc-400'
                }`}
              >
                <p className="">Full Gallery ({totalItemsCount})</p>
                <p className="">All photos & video</p>
              </button>
            </div>
          </div>

          {/* Resolution Choice */}
          <div className="">
            <label className="">Resolution & Format</label>
            <div className="">
              <button
                type="button"
                onClick={() => setResolution('high')}
                className={`p-3 text-xs font-sans rounded-lg border text-left space-y-1 transition-all ${
                  resolution === 'high' ? 'border-purple-500 bg-purple-950/30 text-white' : 'border-zinc-800 bg-zinc-900/50 text-zinc-400'
                }`}
              >
                <p className="">High-Res Original</p>
                <p className="">For print & commercial use</p>
              </button>

              <button
                type="button"
                onClick={() => setResolution('web')}
                className={`p-3 text-xs font-sans rounded-lg border text-left space-y-1 transition-all ${
                  resolution === 'web' ? 'border-purple-500 bg-purple-950/30 text-white' : 'border-zinc-800 bg-zinc-900/50 text-zinc-400'
                }`}
              >
                <p className="">Web-Optimized</p>
                <p className="">Fast social & web upload</p>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className=""
          >
            {isProcessing ? 'Generating ZIP Archive...' : 'Download ZIP Archive'}
          </button>
        </form>
      </div>
    </div>
  );
}
