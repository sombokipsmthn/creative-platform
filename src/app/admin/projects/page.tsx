// src/app/admin/projects/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Gallery {
  id: string;
  title: string;
  client: string;
  category: string;
  token: string;
  pin: string;
  selectionLimit: number;
  status: 'DRAFT' | 'ACTIVE' | 'IN_REVIEW' | 'COMPLETED';
  allowDownloads: boolean;
  allowComments: boolean;
  coverImage: string;
  sets: string[];
  submittedSelectionsCount?: number;
  clientCommentsCount?: number;
}

export default function AdminGalleryManagerPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'create' | 'selections'>('all');
  
  const [galleries, setGalleries] = useState<Gallery[]>([
    {
      id: 'gal_01',
      title: 'UNDP Timbuktoo Summit 2026',
      client: 'UNDP / ccHUB',
      category: 'Ecosystem Storytelling',
      token: 'xK9_mQ2pL7v',
      pin: '4821',
      selectionLimit: 20,
      status: 'IN_REVIEW',
      allowDownloads: true,
      allowComments: true,
      coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
      sets: ['Keynotes', 'Panel Sessions', 'Behind the Scenes'],
      submittedSelectionsCount: 14,
      clientCommentsCount: 3,
    },
    {
      id: 'gal_02',
      title: 'Clean Energy Impact Series 2025',
      client: 'BURN Manufacturing USA',
      category: 'Brand Films & Media',
      token: 'burn_impact_2025',
      pin: '1234',
      selectionLimit: 50,
      status: 'COMPLETED',
      allowDownloads: true,
      allowComments: true,
      coverImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1000&q=80',
      sets: ['Factory Operations', 'Community Impact', 'Executive Interviews'],
      submittedSelectionsCount: 42,
      clientCommentsCount: 0,
    },
  ]);

  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [category, setCategory] = useState('Ecosystem Storytelling');
  const [pin, setPin] = useState('4821');
  const [limit, setLimit] = useState(25);
  const [allowDownloads, setAllowDownloads] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [setsInput, setSetsInput] = useState('Keynotes, Panels, Behind the Scenes');

  const handleCreateGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !client) {
      alert('Please fill in both Gallery Title and Client Name.');
      return;
    }

    const secretToken = `token_${Math.random().toString(36).substring(2, 9)}`;
    const parsedSets = setsInput.split(',').map((s) => s.trim()).filter(Boolean);

    const newGallery: Gallery = {
      id: `gal_${Date.now()}`,
      title,
      client,
      category,
      token: secretToken,
      pin,
      selectionLimit: limit,
      status: 'ACTIVE',
      allowDownloads,
      allowComments,
      coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&q=80',
      sets: parsedSets.length > 0 ? parsedSets : ['All Photos'],
      submittedSelectionsCount: 0,
      clientCommentsCount: 0,
    };

    setGalleries([newGallery, ...galleries]);
    setTitle('');
    setClient('');
    setActiveTab('all');
    alert(`Success! Gallery "${title}" published.`);
  };

  const copyShareLink = (token: string) => {
    const link = `${window.location.origin}/portal/g/${token}`;
    navigator.clipboard.writeText(link);
    alert(`Client share link copied to clipboard:\n${link}`);
  };

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
          <div>
            <Link href="/admin" className="text-xs font-mono text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white mt-1">Client Gallery Manager</h1>
          </div>

          {/* Tab Navigation Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-widest rounded-lg transition-all ${
                activeTab === 'all' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              All Galleries ({galleries.length})
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-widest rounded-lg transition-all ${
                activeTab === 'create' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              + New Gallery
            </button>
            <button
              onClick={() => setActiveTab('selections')}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-widest rounded-lg transition-all ${
                activeTab === 'selections' ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              Client Feedback
            </button>
          </div>
        </div>

        {/* TAB 1: ALL GALLERIES GRID */}
        {activeTab === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {galleries.map((gal) => (
              <div
                key={gal.id}
                className="bg-white dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 rounded-2xl overflow-hidden hover:border-purple-600/60 transition-all group flex flex-col justify-between shadow-sm dark:shadow-none"
              >
                <div className="space-y-4">
                  {/* Cover Photo */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 dark:bg-zinc-950">
                    <Image src={gal.coverImage} alt={gal.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-black/70 backdrop-blur-md border border-white/20 text-purple-300 text-[10px] font-mono uppercase rounded-full">
                        {gal.status}
                      </span>
                      <span className="px-3 py-1 bg-black/70 backdrop-blur-md border border-white/20 text-zinc-200 text-[10px] font-mono rounded-full">
                        PIN: {gal.pin}
                      </span>
                    </div>
                  </div>

                  {/* Meta Details */}
                  <div className="p-6 space-y-3">
                    <div className="space-y-1">
                      <p className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase">{gal.client}</p>
                      <h3 className="text-2xl font-medium text-slate-900 dark:text-white">{gal.title}</h3>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-400 font-mono">
                      Selection Limit: <span className="text-slate-900 dark:text-white font-bold">{gal.selectionLimit} Max</span> • Sets: {gal.sets.join(', ')}
                    </p>

                    <div className="p-3 bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 rounded-xl flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-600 dark:text-zinc-400">Client Selections:</span>
                      <span className="text-purple-600 dark:text-purple-400 font-bold">{gal.submittedSelectionsCount} / {gal.selectionLimit} Selected</span>
                    </div>
                  </div>
                </div>

                {/* Actions Bar with Unified Button Classes & Icons */}
                <div className="p-6 pt-0 flex gap-3">
                  <button
                    onClick={() => copyShareLink(gal.token)}
                    className="flex-1 py-2.5 btn-secondary text-xs font-mono uppercase tracking-widest rounded-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy Link
                  </button>
                  <Link
                    href={`/portal/g/${gal.token}`}
                    target="_blank"
                    className="flex-1 py-2.5 btn-primary text-xs font-mono uppercase tracking-widest text-center rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                  >
                    <span>Client View</span>
                    <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: CREATE GALLERY FORM */}
        {activeTab === 'create' && (
          <div className="p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl space-y-8 max-w-3xl mx-auto shadow-xl">
            <div className="space-y-1">
              <p className="text-xs font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400">Pixieset-Style Builder</p>
              <h2 className="text-2xl font-light text-slate-900 dark:text-white">Create Private Client Gallery</h2>
            </div>

            <form onSubmit={handleCreateGallery} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono">Gallery Title</label>
                <input
                  type="text"
                  placeholder="e.g. Safaricom Spark Accelerator Demo Day 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono">Client / Organization Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Safaricom / ccHUB"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono">Service Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  >
                    <option>Ecosystem Storytelling</option>
                    <option>Brand Films & Media</option>
                    <option>Commercial Photography</option>
                    <option>Motion Graphics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono">4-Digit Access & Download PIN</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono">Max Selection Proofing Limit</label>
                  <input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-700 dark:text-zinc-300 font-mono">Sets / Collections (Comma-separated)</label>
                <input
                  type="text"
                  value={setsInput}
                  onChange={(e) => setSetsInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-lg focus:border-purple-600 focus:outline-none"
                />
              </div>

              {/* Toggles */}
              <div className="flex gap-6 border-t border-slate-200 dark:border-zinc-800 pt-4 text-xs font-mono text-slate-700 dark:text-zinc-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDownloads}
                    onChange={(e) => setAllowDownloads(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                  Allow ZIP Downloads
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowComments}
                    onChange={(e) => setAllowComments(e.target.checked)}
                    className="w-4 h-4 accent-purple-600 rounded"
                  />
                  Allow Client Feedback Comments
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 btn-primary text-xs font-mono uppercase tracking-widest rounded-lg flex items-center justify-center gap-2"
              >
                <span>+ Publish Client Gallery</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: CLIENT FEEDBACK & SELECTIONS REVIEW */}
        {activeTab === 'selections' && (
          <div className="space-y-6">
            <h2 className="text-xl font-light text-slate-900 dark:text-white">Client Selection Submissions</h2>

            <div className="space-y-4">
              {galleries.map((g) => (
                <div key={g.id} className="p-6 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl space-y-4 shadow-sm dark:shadow-none">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
                    <div>
                      <p className="text-xs font-mono text-purple-600 dark:text-purple-400">{g.client}</p>
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white">{g.title}</h3>
                    </div>
                    <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/40 text-purple-700 dark:text-purple-300 text-xs font-mono rounded-full">
                      {g.submittedSelectionsCount} Selects Received
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-600 dark:text-zinc-400 space-y-1">
                    <p>• Client PIN: {g.pin}</p>
                    <p>• Status: <span className="text-slate-900 dark:text-white font-bold">{g.status}</span></p>
                    <p>• Comments: {g.clientCommentsCount} unresolved retoucher notes</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Link
                      href={`/portal/g/${g.token}`}
                      target="_blank"
                      className="px-4 py-2 btn-primary text-xs font-mono rounded-lg inline-flex items-center gap-2"
                    >
                      <span>View Submitted Proofs</span>
                      <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}