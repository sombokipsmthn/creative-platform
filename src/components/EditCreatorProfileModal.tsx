// src/components/EditCreatorProfileModal.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

export interface CreatorProfile {
  name: string;
  title: string;
  email: string;
  phone: string;
  kraPin: string;
  location: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  linktree: string;
  avatarUrl: string;
}

interface EditCreatorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CreatorProfile;
  onSaveProfile: (updatedProfile: CreatorProfile) => void;
}

export default function EditCreatorProfileModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}: EditCreatorProfileModalProps) {
  const [formData, setFormData] = useState<CreatorProfile>(profile);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
    alert('Creator Profile successfully updated!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6 text-slate-900 dark:text-white font-sans">
      <div className="max-w-2xl w-full p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          ✕
        </button>

        <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <span className="px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-[10px] font-mono rounded-full uppercase">
            Multi-Creator Account
          </span>
          <h2 className="text-2xl font-light text-slate-900 dark:text-white mt-2">Edit Creator Profile</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 font-mono">
            Update your public portfolio bio, contact info, KRA tax PIN, and social links.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Avatar Preview & URL */}
          <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl">
            <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-purple-500 shadow-md">
              <Image
                src={formData.avatarUrl || 'https://unavatar.io/linkedin/sombo09'}
                alt={formData.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Profile Avatar URL</label>
              <input
                type="text"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Creator Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Professional Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Creator KRA PIN</label>
              <input
                type="text"
                value={formData.kraPin}
                onChange={(e) => setFormData({ ...formData, kraPin: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-600 dark:text-zinc-400 uppercase">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Social Handles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-zinc-800">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase">LinkedIn Handle</label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase">Instagram Handle</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 btn-primary text-xs font-mono uppercase tracking-widest rounded-lg transition-colors shadow-md cursor-pointer"
          >
            Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  );
}