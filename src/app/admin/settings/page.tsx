'use client';

import { useState } from 'react';
import WatermarkStudio from '@/components/WatermarkStudio';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SettingsTab = 'branding' | 'watermark' | 'presets' | 'templates' | 'preferences' | 'integrations';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('branding');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // 1. Branding State
  const [domainSlug, setDomainSlug] = useState('kipsmthn.platform.com');
  const [customDomain, setCustomDomain] = useState('kipsmthn.com');
  const [hidePlatformBranding, setHidePlatformBranding] = useState(true);



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

  const settingsFormId = 'platform-settings-form';

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMessage('Workspace settings saved.');
    window.setTimeout(() => setSaveMessage(null), 3000);
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
    <div className="min-h-screen px-4 py-8 font-sans transition-colors duration-300 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <AdminPageHeader
          title="Platform Settings"
          description="Configure how the platform behaves for your workspace, galleries, and client communications."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          primaryAction={activeTab === 'watermark' ? undefined : (
            <Button
              variant="primary"
<<<<<<< HEAD
              type="submit"
              form={settingsFormId}
=======
              type="button"
>>>>>>> c898786fba874637680566941fd0b37ceea58254
              className="w-full"
              onClick={() => (document.getElementById('settings-form') as HTMLFormElement | null)?.requestSubmit()}
            >
              Save Settings Changes
            </Button>
          )}
          tabs={tabs.map(tab => ({
            label: tab.label,
            href: '#',
            active: activeTab === tab.id,
            onClick: () => setActiveTab(tab.id),
          }))}
        />

        {/* TAB CONTENTS */}
<<<<<<< HEAD
        <form id={settingsFormId} onSubmit={handleSaveSettings} className="space-y-8">
=======
        <form id="settings-form" onSubmit={handleSaveSettings} className="space-y-8">
          {saveMessage && <p role="status" className="text-sm text-muted-foreground">{saveMessage}</p>}
>>>>>>> c898786fba874637680566941fd0b37ceea58254

          {/* TAB 1: BRANDING */}
          {activeTab === 'branding' && (
            <div className="space-y-6">
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm-header">
                  <h2 className="rounded-xl border bg-card text-card-foreground shadow-sm-title">Domain & Custom URLs</h2>
                  <p className="text-sm text-muted-foreground">Your client galleries are always available on your default site address.</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm-content space-y-4">
                  <div className="space-y-1">
<<<<<<< HEAD
                    <label htmlFor="default-site-address" className="ui-label">Default Site Address</label>
                    <input
                      id="default-site-address"
=======
                    <label className="text-sm font-medium leading-none">Default Site Address</label>
                    <Input
>>>>>>> c898786fba874637680566941fd0b37ceea58254
                      type="text"
                      value={domainSlug}
                      onChange={(e) => setDomainSlug(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Custom Domain</label>
                    <Input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Use your own domain for client galleries (e.g. kipsmthn.com).</p>
                  </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm-footer">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-3 text-xs font-sans text-slate-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hidePlatformBranding}
                        onChange={(e) => setHidePlatformBranding(e.target.checked)}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      Hide default platform branding from client galleries
                    </label>
                  </div>
                </div>
              </div>

              {/* Logo & Favicon Upload Cards */}
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm space-y-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm-header">
                  <h2 className="rounded-xl border bg-card text-card-foreground shadow-sm-title">Logos & Favicon</h2>
                  <p className="text-sm text-muted-foreground">Upload custom brand logos for your client portal header and browser tab icon.</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm-content grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-center space-y-3 bg-slate-50 dark:bg-zinc-900/30">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-secondary flex items-center justify-center text-secondary-foreground font-sans text-xl">+</div>
                    <p className="text-xs font-sans font-bold text-slate-900 dark:text-white">Upload Header Logo</p>
                    <p className="text-[10px] text-slate-500 font-sans">PNG or SVG with transparent background</p>
                  </div>

                  <div className="p-6 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-center space-y-3 bg-slate-50 dark:bg-zinc-900/30">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-secondary flex items-center justify-center text-secondary-foreground font-sans text-xl">+</div>
                    <p className="text-xs font-sans font-bold text-slate-900 dark:text-white">Upload Favicon Icon</p>
                    <p className="text-[10px] text-slate-500 font-sans">32x32 PNG, ICO or SVG file</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WATERMARK */}
<<<<<<< HEAD
          {activeTab === 'watermark' && (
            <div className="space-y-6">
              {/* Watermark Presets */}
              <div className="ui-card">
                <div className="ui-card-header">
                  <h2 className="ui-card-title">Watermark Presets</h2>
                </div>
                <div className="ui-card-content inline-flex rounded-xl bg-slate-100 dark:bg-zinc-900 p-1">
                  <button
                    type="button"
                    onClick={() => setWatermarkPreset('proof')}
                    className={`px-3 py-1.5 text-xs font-sans rounded-lg transition-colors ${
                      watermarkPreset === 'proof'
                        ? 'ui-button ui-button-primary'
                        : 'ui-button ui-button-secondary'
                    }`}
                  >
                    Proof
                  </button>
                  <button
                    type="button"
                    onClick={() => setWatermarkPreset('brand')}
                    className={`px-3 py-1.5 text-xs font-sans rounded-lg transition-colors ${
                      watermarkPreset === 'brand'
                        ? 'ui-button ui-button-primary'
                        : 'ui-button ui-button-secondary'
                    }`}
                  >
                    Brand
                  </button>
                </div>
              </div>

              {/* Watermark Preview Component */}
              <div className="ui-card">
                <WatermarkPreview
                  watermarkText={watermarkText}
                  watermarkOpacity={watermarkOpacity}
                  watermarkPosition={watermarkPosition}
                  watermarkSize={watermarkSize}
                  onWatermarkChange={handleWatermarkChange}
                />
              </div>

              {/* Watermark Controls */}
              <div className="ui-card">
                <div className="ui-card-header">
                  <h2 className="ui-card-title">Watermark Details</h2>
                  <p className="ui-meta">Adjust the watermark text and appearance.</p>
                </div>
                <div className="ui-card-content space-y-4">
                  <div className="space-y-1">
                    <label className="ui-label">Watermark Text</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="ui-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-sans">
                      <span className="text-slate-700 dark:text-zinc-300">Opacity</span>
                      <span className="text-primary font-bold">{watermarkOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={80}
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(parseInt(e.target.value, 10))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-sans">
                      <span className="text-slate-700 dark:text-zinc-300">Size</span>
                      <span className="text-primary font-bold">{watermarkSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={24}
                      max={64}
                      value={watermarkSize}
                      onChange={(e) => setWatermarkSize(parseInt(e.target.value, 10))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <label className="flex items-center gap-3 text-xs font-sans text-slate-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyWatermarkToProofs}
                        onChange={(e) => setApplyWatermarkToProofs(e.target.checked)}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      Apply watermark to all web-resolution proof images automatically
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
=======
          {activeTab === 'watermark' && <WatermarkStudio />}
>>>>>>> c898786fba874637680566941fd0b37ceea58254

          {/* TAB 3: PRESETS */}
          {activeTab === 'presets' && (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm-header">
                <h2 className="rounded-xl border bg-card text-card-foreground shadow-sm-title">Default Gallery Presets</h2>
                <p className="text-sm text-muted-foreground">Pre-fill settings when creating new private client galleries.</p>
              </div>
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm-content">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Default Photo Selection Limit</label>
                    <Input
                      type="number"
                      value={defaultSelectionLimit}
                      onChange={(e) => setDefaultSelectionLimit(parseInt(e.target.value, 10))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Default Expiration (Days)</label>
                    <Input
                      type="number"
                      value={defaultExpiryDays}
                      onChange={(e) => setDefaultExpiryDays(parseInt(e.target.value, 10))}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Default Master PIN</label>
                    <Input
                      type="text"
                      value={defaultPin}
                      onChange={(e) => setDefaultPin(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMAIL TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm-header">
                <h2 className="rounded-xl border bg-card text-card-foreground shadow-sm-title">Email Invitation Templates</h2>
                <p className="text-sm text-muted-foreground">Customize automated client notification emails.</p>
              </div>
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm-content space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Email Subject</label>
                  <Input
                    type="text"
                    value={invitationSubject}
                    onChange={(e) => setInvitationSubject(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Email Message Body</label>
                  <Textarea
                    rows={6}
                    value={invitationBody}
                    onChange={(e) => setInvitationBody(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm-header">
                <h2 className="rounded-xl border bg-card text-card-foreground shadow-sm-title">Kenyan Tax & Business Preferences</h2>
                <p className="text-sm text-muted-foreground">Configure KRA PIN, base currency, and WHT rules.</p>
              </div>
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Creator KRA PIN Number</label>
                    <Input
                      type="text"
                      value={kraPin}
                      onChange={(e) => setKraPin(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Default Currency</label>
                    <Select value={defaultCurrency} onValueChange={setDefaultCurrency}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KES">KES — Kenyan Shilling (KSh)</SelectItem>
                        <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                        <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium leading-none">Withholding Tax (WHT) Rate</label>
                    <Select value={defaultWhtRate} onValueChange={setDefaultWhtRate}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5%">5% — Resident Professional Services</SelectItem>
                        <SelectItem value="20%">20% — Non-Resident Fee</SelectItem>
                        <SelectItem value="0%">0% — Tax Exempt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm-header">
                <h2 className="rounded-xl border bg-card text-card-foreground shadow-sm-title">API Integrations & Storage</h2>
                <p className="text-sm text-muted-foreground">Manage external services connected to KIPSMTHN.</p>
              </div>
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm-content space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slice-200 dark:border-zinc-800 rounded-xl flex justify-between items-center text-xs font-sans">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">KRA eTIMS Taxpayer Portal Bridge</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">Connected to etims.kra.go.ke</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full font-bold">Active ✓</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slice-200 dark:border-zinc-800 rounded-xl flex justify-between items-center text-xs font-sans">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Cloudflare R2 Object Storage</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">142.8 GB Used • $0 Egress Fees</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full font-bold">Active ✓</span>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-zinc-900 border border-slice-200 dark:border-zinc-800 rounded-xl flex justify-between items-center text-xs font-sans">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Google Drive Importer API</p>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">OAuth 2.0 Read-Only Connector</p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                  >
                    Configure
                  </Button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}