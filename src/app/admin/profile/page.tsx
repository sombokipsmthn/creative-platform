// src/app/admin/profile/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Somboriot Kipchilat',
    title: 'Creative Director & Ecosystem Storytelling Specialist',
    email: 'somboriot@gmail.com',
    phone: '+254 722 145 776',
    kraPin: 'A012345678X',
    location: 'Nairobi, Kenya',
    bio: 'Extensive experience producing visual narratives across donor programs, startup accelerators, and venture studios including iHUB, ccHUB, UNDP Timbuktoo, Mastercard Foundation, Safaricom Spark, Delta40 Studio, and BURN Manufacturing USA.',
    linkedin: 'https://www.linkedin.com/in/sombo09/',
    instagram: 'https://www.instagram.com/sombo_kipsmthn/',
    youtube: 'https://www.youtube.com/@kraftdigital7749',
    linktree: 'https://linktr.ee/kipsmthn',
    avatarUrl: 'https://unavatar.io/linkedin/sombo09?fallback=https://github.com/sombokipsmthn.png',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Creator Profile changes saved successfully!');
  };

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
          <div>
            <Link href="/admin" className="text-xs font-mono text-purple-600 dark:text-purple-400 hover:underline">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white mt-1">Creator Profile & Identity</h1>
          </div>

          <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-mono rounded-full font-semibold">
            KIPSMTHN Multi-Tenant Creator #1
          </span>
        </div>

        {/* Profile Card & Edit Form */}
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Avatar Preview Header Card */}
          <div className="p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl flex flex-col sm:flex-row items-center gap-6 shadow-xl">
            <div className="relative w-24 h-24 rounded-full overflow-hidden shrink-0 border-2 border-purple-500 shadow-lg">
              <Image
                src={profile.avatarUrl}
                alt={profile.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2.5 py-0.5 bg-purple-600/20 text-purple-700 dark:text-purple-300 text-[10px] font-mono rounded-full font-semibold uppercase">
                  Verified Creator
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">KRA PIN: {profile.kraPin}</span>
              </div>

              <h2 className="text-2xl font-medium text-slate-900 dark:text-white">{profile.name}</h2>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-mono">{profile.title}</p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">{profile.email} • {profile.phone} • {profile.location}</p>
            </div>
          </div>

          {/* Edit Form Controls */}
          <div className="p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl space-y-6 shadow-xl">
            <div className="border-b border-slate-200 dark:border-zinc-800 pb-3">
              <span className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest font-bold">Personal & Professional Info</span>
              <h3 className="text-lg font-light text-slate-900 dark:text-white">Edit Profile Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Creator Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Professional Title</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Phone Number</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Creator KRA PIN</label>
                <input
                  type="text"
                  value={profile.kraPin}
                  onChange={(e) => setProfile({ ...profile, kraPin: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Profile Avatar URL</label>
              <input
                type="text"
                value={profile.avatarUrl}
                onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Public Bio / Mission</label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase">LinkedIn URL</label>
                <input
                  type="text"
                  value={profile.linkedin}
                  onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase">Instagram URL</label>
                <input
                  type="text"
                  value={profile.instagram}
                  onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 btn-primary text-xs font-mono uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
            >
              Save Creator Profile Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}