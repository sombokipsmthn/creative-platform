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
    <div className="">
      <div className="">
        <button
          onClick={onClose}
          className=""
        >
          ✕
        </button>

        <div className="">
          <span className="">
            Multi-Creator Account
          </span>
          <h2 className="">Edit Creator Profile</h2>
          <p className="">
            Update your public portfolio bio, contact info, KRA tax PIN, and social links.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="">

          {/* Avatar Preview & URL */}
          <div className="">
            <div className="">
              <Image
                src={formData.avatarUrl || 'https://unavatar.io/linkedin/sombo09'}
                alt={formData.name}
                fill
                className=""
                unoptimized
              />
            </div>
            <div className="">
              <label className="">Profile Avatar URL</label>
              <input
                type="text"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                className=""
              />
            </div>
          </div>

          <div className="">
            <div className="">
              <label className="">Creator Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className=""
              />
            </div>

            <div className="">
              <label className="">Professional Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className=""
              />
            </div>
          </div>

          <div className="">
            <div className="">
              <label className="">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className=""
              />
            </div>

            <div className="">
              <label className="">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className=""
              />
            </div>
          </div>

          <div className="">
            <div className="">
              <label className="">Creator KRA PIN</label>
              <input
                type="text"
                value={formData.kraPin}
                onChange={(e) => setFormData({ ...formData, kraPin: e.target.value })}
                className=""
              />
            </div>

            <div className="">
              <label className="">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className=""
              />
            </div>
          </div>

          {/* Social Handles */}
          <div className="">
            <div className="">
              <label className="">LinkedIn Handle</label>
              <input
                type="text"
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                className=""
              />
            </div>

            <div className="">
              <label className="">Instagram Handle</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className=""
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
          >
            Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  );
}
