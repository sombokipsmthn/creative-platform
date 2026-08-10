// src/app/admin/settings/page.tsx
'use client';

import { useState } from 'react';

export default function AdminSettingsPage() {
  // Configurable Parameters State
  const [kraPin, setKraPin] = useState('A012345678X');
  const [defaultCurrency, setDefaultCurrency] = useState('KES');
  const [defaultWhtRate, setDefaultWhtRate] = useState('5%');
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState('Net 30');

  const [defaultSelectionLimit, setDefaultSelectionLimit] = useState(25);
  const [defaultExpiryDays, setDefaultExpiryDays] = useState(60);
  const [defaultPin, setDefaultPin] = useState('4821');
  const [autoWatermark, setAutoWatermark] = useState(true);

  const [creatorName, setCreatorName] = useState('Somboriot Kipchilat');
  const [brandHandle, setBrandHandle] = useState('SOMBO / kipsmthn');
  const [customDomain, setCustomDomain] = useState('kipsmthn.com');
  const [accentColor, setAccentColor] = useState('#7c3aed');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings successfully updated and saved!');
  };

  return (
    <div className="p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Title Bar */}
        <div className="border-b border-zinc-800/80 pb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-purple-400">Settings</p>
          <h1 className="text-3xl font-light text-white mt-1">Platform & Business Parameters</h1>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-8">
          
          {/* SECTION 1: KENYAN TAX & ETIMS CONFIGURATION */}
          <div className="p-8 border border-zinc-800 bg-zinc-950 rounded-2xl space-y-6 shadow-xl">
            <div className="space-y-1 border-b border-zinc-800 pb-3">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">01 / Financials</span>
              <h2 className="text-xl font-light text-white">Kenyan Tax & eTIMS Parameters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-mono">Creator KRA PIN Number</label>
                <input
                  type="text"
                  value={kraPin}
                  onChange={(e) => setKraPin(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-mono">Default Base Currency</label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                >
                  <option value="KES">KES — Kenyan Shilling (KSh)</option>
                  <option value="USD">USD — US Dollar ($)</option>
                  <option value="EUR">EUR — Euro (€)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-mono">Withholding Tax (WHT) Rate</label>
                <select
                  value={defaultWhtRate}
                  onChange={(e) => setDefaultWhtRate(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                >
                  <option value="5%">5% — Resident Professional Services</option>
                  <option value="20%">20% — Non-Resident Fee</option>
                  <option value="0%">0% — Tax Exempt</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-mono">Default Payment Terms</label>
                <select
                  value={defaultPaymentTerms}
                  onChange={(e) => setDefaultPaymentTerms(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                >
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 60">Net 60 Days (International NGOs)</option>
                  <option value="Due on Receipt">Due Upon Receipt</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: GALLERY & PROOFING DEFAULTS */}
          <div className="p-8 border border-zinc-800 bg-zinc-950 rounded-2xl space-y-6 shadow-xl">
            <div className="space-y-1 border-b border-zinc-800 pb-3">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">02 / Client Engine</span>
              <h2 className="text-xl font-light text-white">Gallery & Proofing Defaults</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-mono">Default Selection Limit</label>
                <input
                  type="number"
                  value={defaultSelectionLimit}
                  onChange={(e) => setDefaultSelectionLimit(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-mono">Auto-Expiry (Days)</label>
                <input
                  type="number"
                  value={defaultExpiryDays}
                  onChange={(e) => setDefaultExpiryDays(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-mono">Default PIN</label>
                <input
                  type="text"
                  maxLength={4}
                  value={defaultPin}
                  onChange={(e) => setDefaultPin(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <label className="flex items-center gap-3 text-xs font-mono text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoWatermark}
                  onChange={(e) => setAutoWatermark(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
                Apply subtle watermark on unapproved client proofs
              </label>
            </div>
          </div>

          {/* SECTION 3: BRANDING & CUSTOM DOMAIN */}
          <div className="p-8 border border-zinc-800 bg-zinc-950 rounded-2xl space-y-6 shadow-xl">
            <div className="space-y-1 border-b border-zinc-800 pb-3">
              <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">03 / Identity</span>
              <h2 className="text-xl font-light text-white">Branding & Custom Domain</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-mono">Creator Full Name</label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-mono">Brand Handle</label>
                <input
                  type="text"
                  value={brandHandle}
                  onChange={(e) => setBrandHandle(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-mono">Custom Domain</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-mono">Primary Accent Color</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(124,58,237,0.35)]"
          >
            Save All Settings
          </button>
        </form>
      </div>
    </div>
  );
}