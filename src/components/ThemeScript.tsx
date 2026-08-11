// src/app/admin/onboarding/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreator, CreatorData } from '@/context/CreatorContext';

export default function CreatorOnboardingPage() {
  const [signupMode, setSignupMode] = useState<'express' | 'full'>('express');
  const [step, setStep] = useState(1);
  const { registerNewCreator } = useCreator();
  const router = useRouter();

  // Basic Profile State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('Commercial Photographer & Visual Lead');
  const [phone, setPhone] = useState('+254 700 000 000');
  const [location, setLocation] = useState('Nairobi, Kenya');

  // Pro Setup State (Tax & Banking)
  const [kraPin, setKraPin] = useState('P000000000X');
  const [bankName, setBankName] = useState('KCB Bank Kenya');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('1234567890');
  const [mpesaPaybill, setMpesaPaybill] = useState('Paybill 522522');

  // 💡 1. QUICK EXPRESS SIGNUP (BASIC PROFILE ONLY)
  const handleExpressSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Please fill in both your Creator Name and Email Address.');
      return;
    }

    const creatorId = `creator_${Date.now()}`;
    const basicCreatorProfile: CreatorData = {
      id: creatorId,
      name,
      handle: `${name.toUpperCase().replace(/\s+/g, '_')}`,
      title: title || 'Creative Director',
      email,
      phone: phone || '+254 700 000 000',
      location: location || 'Nairobi, Kenya',
      kraPin: 'Pending KRA PIN',
      bio: `${name} — ${title || 'Creative Lead'} based in ${location || 'Nairobi, Kenya'}.`,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
      paymentDetails: {
        bankName: 'Bank Details Pending',
        accountName: name,
        accountNumber: 'Pending Edit',
        branch: 'Main Branch',
        mpesaPaybill: 'Pending Edit',
      },
      socials: {
        linkedin: `https://linkedin.com/in/${creatorId}`,
        instagram: `https://instagram.com/${creatorId}`,
        youtube: `https://youtube.com/@${creatorId}`,
        linktree: `https://linktr.ee/${creatorId}`,
      },
      partners: [],
      projects: [], // Clean defaults
      pressFeatures: [], // Clean defaults
      clients: [], // Clean defaults
    };

    registerNewCreator(basicCreatorProfile);
    alert(`🎉 Basic Creator Profile created for ${name}! You can add your KRA PIN & Banking details anytime in Profile or Settings.`);
    router.push('/admin');
  };

  // 💡 2. FULL PRO SETUP
  const handleFinishFullOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Please fill in your Creator Name and Email.');
      return;
    }

    const creatorId = `creator_${Date.now()}`;
    const fullCreatorProfile: CreatorData = {
      id: creatorId,
      name,
      handle: `${name.toUpperCase().replace(/\s+/g, '_')}`,
      title,
      email,
      phone,
      location,
      kraPin,
      bio: `${title} based in ${location}.`,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
      paymentDetails: {
        bankName,
        accountName: accountName || name,
        accountNumber,
        branch: 'Nairobi Main',
        mpesaPaybill,
      },
      socials: {
        linkedin: `https://linkedin.com/in/${creatorId}`,
        instagram: `https://instagram.com/${creatorId}`,
        youtube: `https://youtube.com/@${creatorId}`,
        linktree: `https://linktr.ee/${creatorId}`,
      },
      partners: ['Apex Global', 'Vanguard Studios'],
      projects: [],
      pressFeatures: [],
      clients: [],
    };

    registerNewCreator(fullCreatorProfile);
    alert(`🎉 Pro Creator Profile created for ${name}!`);
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-3xl space-y-8 shadow-2xl relative">
        
        {/* Onboarding Header */}
        <div className="space-y-3 border-b border-slate-200 dark:border-zinc-800 pb-4 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">
            KIPSMTHN PLATFORM
          </p>
          <h1 className="text-3xl font-light text-slate-900 dark:text-white">Register Creator Account</h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-mono">
            Choose quick basic registration or complete full pro setup.
          </p>

          {/* Mode Switcher Pills */}
          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setSignupMode('express');
                setStep(1);
              }}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-widest rounded-full transition-all cursor-pointer ${
                signupMode === 'express' ? 'btn-primary shadow-sm' : 'btn-secondary'
              }`}
            >
              ⚡ Quick Express (Basic Info)
            </button>
            <button
              type="button"
              onClick={() => {
                setSignupMode('full');
                setStep(1);
              }}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-widest rounded-full transition-all cursor-pointer ${
                signupMode === 'full' ? 'btn-primary shadow-sm' : 'btn-secondary'
              }`}
            >
              ⚙️ Full Pro Setup (With KRA & Bank)
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PATHWAY 1: QUICK EXPRESS SIGNUP (BASIC PROFILE ONLY) */}
        {/* ========================================================================= */}
        {signupMode === 'express' && (
          <form onSubmit={handleExpressSignup} className="space-y-6">
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/30 rounded-2xl text-xs font-mono text-purple-900 dark:text-purple-200 space-y-1">
              <p className="font-bold">⚡ Quick Express Mode Selected</p>
              <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                Only basic details required now. You can add your KRA Tax PIN, Bank details, and MPESA Paybill later in Profile or Settings when issuing invoices.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Creator Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Jane Wanjiku"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Primary Email Address *</label>
                <input
                  type="email"
                  placeholder="jane@studio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Professional Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Commercial Photographer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Location</label>
                  <input
                    type="text"
                    placeholder="Nairobi, Kenya"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 btn-primary text-xs font-mono uppercase tracking-widest rounded-xl transition-colors shadow-lg cursor-pointer font-bold"
            >
              ⚡ Complete Basic Registration & Launch Dashboard →
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* PATHWAY 2: COMPLETE PRO SETUP (3-STEP WIZARD) */}
        {/* ========================================================================= */}
        {signupMode === 'full' && (
          <div className="space-y-6">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-slate-900 dark:text-white font-mono">Step 1: Creator Identity</h2>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Creator Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Wanjiku"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Professional Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Commercial Photographer & Director"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Email Address *</label>
                      <input
                        type="email"
                        placeholder="jane@studio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3.5 btn-primary text-xs font-mono uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
                >
                  Next: KRA Tax & Banking Details →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-slate-900 dark:text-white font-mono">Step 2: KRA Tax & Invoicing Banking</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Creator KRA PIN *</label>
                      <input
                        type="text"
                        value={kraPin}
                        onChange={(e) => setKraPin(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-zinc-800">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Bank Name</label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Account Number</label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">MPESA Paybill / Till Number</label>
                    <input
                      type="text"
                      value={mpesaPaybill}
                      onChange={(e) => setMpesaPaybill(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 btn-secondary text-xs font-mono uppercase tracking-widest rounded-lg cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 py-3.5 btn-primary text-xs font-mono uppercase tracking-widest rounded-lg cursor-pointer"
                  >
                    Next: Launch Creator Account →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleFinishFullOnboarding} className="space-y-6 text-center">
                <div className="p-6 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 rounded-2xl space-y-3 font-mono text-xs">
                  <p className="font-bold text-purple-950 dark:text-purple-200 text-sm">Pro Account Ready to Launch!</p>
                  <p>• Creator Name: <strong className="text-slate-900 dark:text-white">{name}</strong></p>
                  <p>• Email: <strong className="text-slate-900 dark:text-white">{email}</strong></p>
                  <p>• KRA PIN: <strong className="text-slate-900 dark:text-white">{kraPin}</strong></p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 btn-primary text-xs font-mono uppercase tracking-widest rounded-xl transition-colors shadow-lg cursor-pointer font-bold"
                >
                  🚀 Launch Full Pro Creator Account
                </button>
              </form>
            )}
          </div>
        )}

        <div className="text-center pt-2 text-[11px] font-mono text-slate-500">
          <Link href="/admin/login" className="text-purple-600 dark:text-purple-400 hover:underline">
            Already have an account? Login here →
          </Link>
        </div>

      </div>
    </div>
  );
}