// src/app/admin/onboarding/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCreator, CreatorData } from '@/context/CreatorContext';

export default function CreatorOnboardingPage() {
  const [step, setStep] = useState(1);
  const { registerNewCreator } = useCreator();
  const router = useRouter();

  // Onboarding Form State
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Creative Director & Visual Artist');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+254 700 000 000');
  const [kraPin, setKraPin] = useState('P000000000X');
  const [location, setLocation] = useState('Nairobi, Kenya');
  
  // Banking
  const [bankName, setBankName] = useState('KCB Bank Kenya');
  const [accountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('1234567890');
  const [mpesaPaybill, setMpesaPaybill] = useState('Paybill 522522');

  const handleFinishOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Please fill in your Creator Name and Email.');
      return;
    }

    const creatorId = `creator_${Date.now()}`;
    const newCreatorProfile: CreatorData = {
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
      projects: [], // Clean defaults
      pressFeatures: [], // Clean defaults
      clients: [], // Clean defaults
      passcode: '',
      expenses: [],
    };

    registerNewCreator(newCreatorProfile);
    alert(`🎉 Welcome to KIPSMTHN, ${name}! Your Creator Account is active.`);
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-2xl w-full p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-3xl space-y-8 shadow-2xl relative">
        
        {/* Onboarding Header */}
        <div className="space-y-2 border-b border-slate-200 dark:border-zinc-800 pb-4 text-center">
          <span className="px-3 py-1 bg-purple-600/20 text-purple-700 dark:text-purple-300 text-[10px] font-mono rounded-full uppercase font-bold">
            Step {step} of 3 — Creator Onboarding
          </span>
          <h1 className="text-3xl font-light text-slate-900 dark:text-white">Register on KIPSMTHN</h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-mono">
            Build your isolated creator portfolio, client CRM, and KRA invoicing engine.
          </p>
        </div>

        {/* STEP 1: IDENTITY */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white font-mono">01 / Creator Identity</h2>
            
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

        {/* STEP 2: TAX & BANKING */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white font-mono">02 / KRA Tax & Invoicing Banking</h2>
            
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

        {/* STEP 3: CONFIRM & LAUNCH */}
        {step === 3 && (
          <form onSubmit={handleFinishOnboarding} className="space-y-6 text-center">
            <div className="p-6 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 rounded-2xl space-y-3 font-mono text-xs">
              <p className="font-bold text-purple-950 dark:text-purple-200 text-sm">Account Ready to Launch!</p>
              <p>• Creator Name: <strong className="text-slate-900 dark:text-white">{name}</strong></p>
              <p>• Email: <strong className="text-slate-900 dark:text-white">{email}</strong></p>
              <p>• KRA PIN: <strong className="text-slate-900 dark:text-white">{kraPin}</strong></p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 pt-2">Your portfolio and admin dashboard will initialize with clean defaults.</p>
            </div>

            <button
              type="submit"
              className="w-full py-4 btn-primary text-xs font-mono uppercase tracking-widest rounded-xl transition-colors shadow-lg cursor-pointer font-bold"
            >
              🚀 Launch Isolated Creator Account
            </button>
          </form>
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