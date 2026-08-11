// src/app/admin/settings/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

type SettingsTab = 'branding' | 'watermark' | 'presets' | 'templates' | 'preferences' | 'integrations';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('branding');

  // 1. Branding State
  const [domainSlug, setDomainSlug] = useState('kipsmthn.platform.com');
  const [customDomain, setCustomDomain] = useState('kipsmthn.com');
  const [hidePlatformBranding, setHidePlatformBranding] = useState(true);

  // 2. Watermark State
  const [watermarkText, setWatermarkText] = useState('KIPSMTHN PROOF');
  const [watermarkOpacity, setWatermarkOpacity] = useState(30);
  const [watermarkPosition, setWatermarkPosition] = useState<'CENTER' | 'TILE' | 'BOTTOM_RIGHT'>('TILE');
  const [applyWatermarkToProofs, setApplyWatermarkToProofs] = useState(true);

  // 3. Presets State
  const [defaultSelectionLimit, setDefaultSelectionLimit] = useState(25);
  const [defaultExpiryDays, setDefaultExpiryDays] = useState(60);
  const [defaultPin, setDefaultPin] = useState('4821');

  // 4. Email Templates State
  const [invitationSubject, setInvitationSubject] = useState('Your Private Client Gallery is Ready — KIPSMTHN');
  const [invitationBody, setInvitationBody] = useState('Hello {ClientName},\n\nYour private gallery "{GalleryTitle}" is now live on KIPSMTHN.\n\nUse your access PIN: {PIN} to view, favorite, and download your deliverables.\n\nBest regards,\nSomboriot Kipchilat');

  // 5. Preferences State
  const [kraPin, setKraPin] = useState('A012345678X');
  const [defaultCurrency, setDefaultCurrency] = useState('KES');
  const [defaultWhtRate, setDefaultWhtRate] = useState('5%');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Settings successfully saved for tab: ${activeTab.toUpperCase()}`);
  };

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'branding', label: 'Branding' },
    { id: 'watermark', label: 'Watermark' },
    { id: 'presets', label: 'Presets' },
    { id: 'templates', label: 'Email Templates' },
    { id: 'preferences', label: 'Preferences' },
    { id: 'integrations', label: 'Integrations' },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Title Bar */}
        <div className="border-b border-slate-200 dark:border-zinc-800/80 pb-6">
          <Link href="/admin" className="text-xs font-mono text-purple-600 dark:text-purple-400 hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-light text-slate-900 dark:text-white mt-1">
            Platform Settings
          </h1>
        </div>

        {/* 💡 PIXIESET-STYLE SUB-NAVIGATION TABS */}
        <div className="border-b border-slate-200 dark:border-zinc-800">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-xs font-mono uppercase tracking-widest cursor-pointer transition-all border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
                    : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENTS */}
        <form onSubmit={handleSaveSettings} className="space-y-8">
          
          {/* TAB 1: BRANDING */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div className="p-8 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 rounded-2xl space-y-6 shadow-sm dark:shadow-none">
                <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-3">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-white">Domain & Custom URLs</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Your client galleries are always available on your default site address.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono font-medium">Default Site Address</label>
                    <input
                      type="text"
                      value={domainSlug}
                      onChange={(e) => setDomainSlug(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono font-medium">Custom Domain</label>
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-500 font-mono">Use your own domain for client galleries (e.g. kipsmthn.com).</p>
                  </div>
                </div>
              </div>

              {/* Logo & Favicon Upload Cards */}
              <div className="p-8 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 rounded-2xl space-y-6 shadow-sm dark:shadow-none">
                <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-3">
                  <h2 className="text-lg font-medium text-slate-900 dark:text-white">Logos & Favicon</h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Upload custom brand logos for your client portal header and browser tab icon.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-center space-y-3 bg-slate-50 dark:bg-zinc-900/30">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-mono text-xl">+</div>
                    <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">Upload Header Logo</p>
                    <p className="text-[10px] text-slate-500 font-mono">PNG or SVG with transparent background</p>
                  </div>

                  <div className="p-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-center space-y-3 bg-slate-50 dark:bg-zinc-900/30">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-purple-600/20 flex items-center justify-center text-purple-600 dark:text-purple-400 font-mono text-xl">+</div>
                    <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">Upload Favicon Icon</p>
                    <p className="text-[10px] text-slate-500 font-mono">32x32 PNG, ICO or SVG file</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
                  <label className="flex items-center gap-3 text-xs font-mono text-slate-700 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hidePlatformBranding}
                      onChange={(e) => setHidePlatformBranding(e.target.checked)}
                      className="w-4 h-4 accent-purple-600 rounded"
                    />
                    Hide default platform branding from client galleries
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WATERMARK */}
          {activeTab === 'watermark' && (
            <div className="p-8 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 rounded-2xl space-y-6 shadow-sm dark:shadow-none">
              <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <h2 className="text-lg font-medium text-slate-900 dark:text-white">Watermark Protection Settings</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Protect unapproved proofing photos with custom text or image watermarks.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono font-medium">Watermark Text</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono font-medium">Position Style</label>
                  <select
                    value={watermarkPosition}
                    onChange={(e) => setWatermarkPosition(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  >
                    <option value="TILE">Grid Tile Across Photo</option>
                    <option value="CENTER">Center Stamp</option>
                    <option value="BOTTOM_RIGHT">Bottom Right Corner</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 dark:text-zinc-300">Watermark Opacity</span>
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

              <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
                <label className="flex items-center gap-3 text-xs font-mono text-slate-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyWatermarkToProofs}
                    onChange={(e) => setApplyWatermarkToProofs(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                  Automatically apply watermark on all unapproved client proofing galleries
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: PRESETS */}
          {activeTab === 'presets' && (
            <div className="p-8 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 rounded-2xl space-y-6 shadow-sm dark:shadow-none">
              <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <h2 className="text-lg font-medium text-slate-900 dark:text-white">Default Gallery Presets</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Set default values applied whenever you publish a new gallery.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono font-medium">Default Selection Limit</label>
                  <input
                    type="number"
                    value={defaultSelectionLimit}
                    onChange={(e) => setDefaultSelectionLimit(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono font-medium">Auto-Expiry (Days)</label>
                  <input
                    type="number"
                    value={defaultExpiryDays}
                    onChange={(e) => setDefaultExpiryDays(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono font-medium">Default PIN</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={defaultPin}
                    onChange={(e) => setDefaultPin(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMAIL TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="p-8 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 rounded-2xl space-y-6 shadow-sm dark:shadow-none">
              <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <h2 className="text-lg font-medium text-slate-900 dark:text-white">Email Invitation Templates</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Customize automated client notification emails.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono font-medium">Email Subject</label>
                  <input
                    type="text"
                    value={invitationSubject}
                    onChange={(e) => setInvitationSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono font-medium">Email Message Body</label>
                  <textarea
                    rows={6}
                    value={invitationBody}
                    onChange={(e) => setInvitationBody(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="p-8 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 rounded-2xl space-y-6 shadow-sm dark:shadow-none">
              <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <h2 className="text-lg font-medium text-slate-900 dark:text-white">Kenyan Tax & Business Preferences</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Configure KRA PIN, base currency, and WHT rules.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono font-medium">Creator KRA PIN Number</label>
                  <input
                    type="text"
                    value={kraPin}
                    onChange={(e) => setKraPin(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono font-medium">Default Currency</label>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  >
                    <option value="KES">KES — Kenyan Shilling (KSh)</option>
                    <option value="USD">USD — US Dollar ($)</option>
                    <option value="EUR">EUR — Euro (€)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono font-medium">Withholding Tax (WHT) Rate</label>
                  <select
                    value={defaultWhtRate}
                    onChange={(e) => setDefaultWhtRate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  >
                    <option value="5%">5% — Resident Professional Services</option>
                    <option value="20%">20% — Non-Resident Fee</option>
                    <option value="0%">0% — Tax Exempt</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="p-8 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 rounded-2xl space-y-6 shadow-sm dark:shadow-none">
              <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <h2 className="text-lg font-medium text-slate-900 dark:text-white">API Integrations & Storage</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Manage external services connected to KIPSMTHN.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex justify-between items-center text-xs font-mono">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">KRA eTIMS Taxpayer Portal Bridge</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Connected to etims.kra.go.ke</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full font-bold">Active ✓</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex justify-between items-center text-xs font-mono">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Cloudflare R2 Object Storage</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">142.8 GB Used • $0 Egress Fees</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full font-bold">Active ✓</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex justify-between items-center text-xs font-mono">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Google Drive Importer API</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">OAuth 2.0 Read-Only Connector</p>
                  </div>
                  <button type="button" className="px-3 py-1 btn-secondary text-xs rounded-full">Configure</button>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 btn-primary text-xs font-mono uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
          >
            Save Settings Changes
          </button>
        </form>

      </div>
    </div>
  );
}