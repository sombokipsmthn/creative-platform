'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import WatermarkPreview from '@/components/WatermarkPreview';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';

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
  const [watermarkPosition, setWatermarkPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>('bottom-right');
  const [watermarkSize, setWatermarkSize] = useState(42);
  const [watermarkPreset, setWatermarkPreset] = useState<'proof' | 'brand'>('proof');
  const [applyWatermarkToProofs, setApplyWatermarkToProofs] = useState(true);

  // Apply preset when changed
  useEffect(() => {
    const applyPreset = window.setTimeout(() => {
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
    }, 0);
    return () => window.clearTimeout(applyPreset);
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
    <div className="ui-page ui-page-padded">
      <div className="ui-shell">
        <AdminPageHeader
          title="Platform Settings"
          description="Configure how the platform behaves for your workspace, galleries, and client communications."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          primaryAction={
            <Button
              variant="primary"
              className=""
            >
              Save Settings Changes
            </Button>
          }
          tabs={tabs.map(tab => ({
            label: tab.label,
            href: '#',
            active: activeTab === tab.id,
            onClick: () => setActiveTab(tab.id),
          }))}
        />

        {/* TAB CONTENTS */}
        <form onSubmit={handleSaveSettings} className="">

          {/* TAB 1: BRANDING */}
          {activeTab === 'branding' && (
            <div className="">
              <div className="ui-card">
                <div className="ui-card-header">
                  <h2 className="ui-card-title">Domain & Custom URLs</h2>
                  <p className="ui-meta">Your client galleries are always available on your default site address.</p>
                </div>
                <div className="ui-card-content">
                  <div className="">
                    <label className="ui-label">Default Site Address</label>
                    <input
                      type="text"
                      value={domainSlug}
                      onChange={(e) => setDomainSlug(e.target.value)}
                      className="ui-input"
                    />
                  </div>

                  <div className="">
                    <label className="ui-label">Custom Domain</label>
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="ui-input"
                    />
                    <p className="ui-caption">Use your own domain for client galleries (e.g. kipsmthn.com).</p>
                  </div>
                </div>
                <div className="ui-card-footer">
                  <div className="">
                    <label className="">
                      <input
                        type="checkbox"
                        checked={hidePlatformBranding}
                        onChange={(e) => setHidePlatformBranding(e.target.checked)}
                        className=""
                      />
                      Hide default platform branding from client galleries
                    </label>
                  </div>
                </div>
              </div>

              {/* Logo & Favicon Upload Cards */}
              <div className="ui-card">
                <div className="ui-card-header">
                  <h2 className="ui-card-title">Logos & Favicon</h2>
                  <p className="ui-meta">Upload custom brand logos for your client portal header and browser tab icon.</p>
                </div>
                <div className="ui-card-content">
                  <div className="">
                    <div className="">+</div>
                    <p className="">Upload Header Logo</p>
                    <p className="">PNG or SVG with transparent background</p>
                  </div>

                  <div className="">
                    <div className="">+</div>
                    <p className="">Upload Favicon Icon</p>
                    <p className="">32x32 PNG, ICO or SVG file</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WATERMARK */}
          {activeTab === 'watermark' && (
            <div className="">
              {/* Watermark Presets */}
              <div className="ui-card">
                <div className="ui-card-header">
                  <h2 className="ui-card-title">Watermark Presets</h2>
                </div>
                <div className="ui-card-content">
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
                <div className="ui-card-content">
                  <div className="">
                    <label className="ui-label">Watermark Text</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="ui-input"
                    />
                  </div>

                  <div className="">
                    <div className="">
                      <span className="">Opacity</span>
                      <span className="">{watermarkOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={80}
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(parseInt(e.target.value, 10))}
                      className=""
                    />
                  </div>

                  <div className="">
                    <div className="">
                      <span className="">Size</span>
                      <span className="">{watermarkSize}px</span>
                    </div>
                    <input
                      type="range"
                      min={24}
                      max={64}
                      value={watermarkSize}
                      onChange={(e) => setWatermarkSize(parseInt(e.target.value, 10))}
                      className=""
                    />
                  </div>

                  <div className="">
                    <label className="">
                      <input
                        type="checkbox"
                        checked={applyWatermarkToProofs}
                        onChange={(e) => setApplyWatermarkToProofs(e.target.checked)}
                        className=""
                      />
                      Apply watermark to all web-resolution proof images automatically
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRESETS */}
          {activeTab === 'presets' && (
            <div className="ui-card">
              <div className="ui-card-header">
                <h2 className="ui-card-title">Default Gallery Presets</h2>
                <p className="ui-meta">Pre-fill settings when creating new private client galleries.</p>
              </div>
              <div className="ui-card-content">
                <div className="">
                  <div className="">
                    <label className="ui-label">Default Photo Selection Limit</label>
                    <input
                      type="number"
                      value={defaultSelectionLimit}
                      onChange={(e) => setDefaultSelectionLimit(parseInt(e.target.value, 10))}
                      className="ui-input"
                    />
                  </div>

                  <div className="">
                    <label className="ui-label">Default Expiration (Days)</label>
                    <input
                      type="number"
                      value={defaultExpiryDays}
                      onChange={(e) => setDefaultExpiryDays(parseInt(e.target.value, 10))}
                      className="ui-input"
                    />
                  </div>

                  <div className="">
                    <label className="ui-label">Default Master PIN</label>
                    <input
                      type="text"
                      value={defaultPin}
                      onChange={(e) => setDefaultPin(e.target.value)}
                      className="ui-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMAIL TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="ui-card">
              <div className="ui-card-header">
                <h2 className="ui-card-title">Email Invitation Templates</h2>
                <p className="ui-meta">Customize automated client notification emails.</p>
              </div>
              <div className="ui-card-content">
                <div className="">
                  <label className="ui-label">Email Subject</label>
                  <input
                    type="text"
                    value={invitationSubject}
                    onChange={(e) => setInvitationSubject(e.target.value)}
                    className="ui-input"
                  />
                </div>

                <div className="">
                  <label className="ui-label">Email Message Body</label>
                  <textarea
                    rows={6}
                    value={invitationBody}
                    onChange={(e) => setInvitationBody(e.target.value)}
                    className="ui-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="ui-card">
              <div className="ui-card-header">
                <h2 className="ui-card-title">Kenyan Tax & Business Preferences</h2>
                <p className="ui-meta">Configure KRA PIN, base currency, and WHT rules.</p>
              </div>
              <div className="ui-card-content">
                <div className="">
                  <div className="">
                    <label className="ui-label">Creator KRA PIN Number</label>
                    <input
                      type="text"
                      value={kraPin}
                      onChange={(e) => setKraPin(e.target.value)}
                      className="ui-input"
                    />
                  </div>

                  <div className="">
                    <label className="ui-label">Default Currency</label>
                    <select
                      value={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value)}
                      className="ui-select"
                    >
                      <option value="KES">KES — Kenyan Shilling (KSh)</option>
                      <option value="USD">USD — US Dollar ($)</option>
                      <option value="EUR">EUR — Euro (€)</option>
                    </select>
                  </div>

                  <div className="">
                    <label className="ui-label">Withholding Tax (WHT) Rate</label>
                    <select
                      value={defaultWhtRate}
                      onChange={(e) => setDefaultWhtRate(e.target.value)}
                      className="ui-select"
                    >
                      <option value="5%">5% — Resident Professional Services</option>
                      <option value="20%">20% — Non-Resident Fee</option>
                      <option value="0%">0% — Tax Exempt</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="ui-card">
              <div className="ui-card-header">
                <h2 className="ui-card-title">API Integrations & Storage</h2>
                <p className="ui-meta">Manage external services connected to KIPSMTHN.</p>
              </div>
              <div className="ui-card-content">
                <div className="">
                  <div>
                    <p className="">KRA eTIMS Taxpayer Portal Bridge</p>
                    <p className="">Connected to etims.kra.go.ke</p>
                  </div>
                  <span className="">Active ✓</span>
                </div>

                <div className="">
                  <div>
                    <p className="">Cloudflare R2 Object Storage</p>
                    <p className="">142.8 GB Used • $0 Egress Fees</p>
                  </div>
                  <span className="">Active ✓</span>
                </div>

                <div className="">
                  <div>
                    <p className="">Google Drive Importer API</p>
                    <p className="">OAuth 2.0 Read-Only Connector</p>
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
