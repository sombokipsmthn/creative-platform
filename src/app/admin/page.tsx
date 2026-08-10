// src/app/admin/page.tsx
import Link from 'next/link';

export default function AdminDashboardPage() {
  const stats = [
    { label: 'Active Projects', value: '4', detail: '2 in client review' },
    { label: 'Pending Selections', value: '18', detail: 'Updated today' },
    { label: 'Cloudflare R2 Storage', value: '142.8 GB', detail: '0 egress fees' },
    { label: 'Total Clients', value: '12', detail: 'Active partnerships' },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-purple-400">Creator Admin Portal</p>
            <h1 className="text-3xl font-light text-white mt-1">Somboriot Kipchilat Dashboard</h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="p-6 border border-zinc-800/80 bg-zinc-950/60 rounded-2xl space-y-2">
              <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl font-light text-white">{s.value}</p>
              <p className="text-[11px] text-purple-400 font-mono">{s.detail}</p>
            </div>
          ))}
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/clients"
            className="p-8 border border-zinc-800/80 bg-zinc-900/30 hover:border-purple-600/60 rounded-2xl transition-all group space-y-3"
          >
            <span className="text-xs font-mono text-purple-400">01 / CRM & Contacts</span>
            <h2 className="text-2xl font-medium text-white group-hover:text-purple-400 transition-colors">
              Client Management →
            </h2>
            <p className="text-xs text-zinc-400 font-light">
              Manage client emails, companies, assigned projects, and copy direct portal links.
            </p>
          </Link>

          <Link
            href="/admin/projects"
            className="p-8 border border-zinc-800/80 bg-zinc-900/30 hover:border-purple-600/60 rounded-2xl transition-all group space-y-3"
          >
            <span className="text-xs font-mono text-purple-400">02 / Galleries</span>
            <h2 className="text-2xl font-medium text-white group-hover:text-purple-400 transition-colors">
              Gallery Builder →
            </h2>
            <p className="text-xs text-zinc-400 font-light">
              Create client galleries, set 4-digit PINs, configure proofing limits, and download rules.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}