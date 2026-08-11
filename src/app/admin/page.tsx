// src/app/admin/page.tsx
import Link from 'next/link';

export default function AdminDashboardPage() {
  const creatorConfig = {
    platformName: 'KIPSMTHN PLATFORM',
    creatorName: 'Somboriot Kipchilat',
    kraPin: 'A012345678X',
    location: 'Nairobi, Kenya',
    baseCurrency: 'KES',
  };

  const coreMetrics = [
    {
      label: 'Awaiting Feedback',
      value: '2 Clients',
      detail: 'UNDP Summit & Delta40 Studio',
      alert: true,
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Pending Tax Certs',
      value: '3 Certs',
      detail: 'KRA Withholding Tax pending',
      alert: true,
      color: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Claimable Expenses',
      value: 'KES 383,500',
      detail: 'Est. KRA Tax Shield: KES 115,050',
      alert: false,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'eTIMS Invoices',
      value: '2 Shared',
      detail: 'KES 1.8M invoiced via eTIMS',
      alert: false,
      color: 'text-purple-600 dark:text-purple-400',
    },
  ];

  const socialMetrics = [
    {
      platform: 'Website Inquiries',
      metric: '3 Unread Leads',
      sub: 'New project briefs submitted',
      type: 'mail',
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      platform: 'Social DMs (Insta/LinkedIn)',
      metric: '5 Pending DMs',
      sub: '@sombo_kipsmthn & LinkedIn',
      type: 'chat',
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      platform: 'YouTube (Kraft Digital)',
      metric: '42.8K Views',
      sub: '+1.2K Subscribers this month',
      type: 'video',
      color: 'text-red-600 dark:text-red-400',
    },
    {
      platform: 'Linktree Traffic',
      metric: '1.4K Clicks',
      sub: '72% Portfolio CTR',
      type: 'link',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  const storageMetrics = [
    { label: 'Active Pipeline Value', value: 'KES 4.2M', sub: '$32,500 USD' },
    { label: 'Cloudflare R2 Storage', value: '142.8 GB', sub: '$0 Egress Bandwidth Fees' },
    { label: 'Avg Production Turnaround', value: '4.2 Days', sub: 'Shoot to Final Delivery' },
    { label: 'Proposal Win Rate', value: '68%', sub: 'Inquiry-to-Contract Conversion' },
  ];

  const actionRequiredAlerts = [
    {
      title: 'Unverified Expense Receipt',
      client: 'PrideInn Hotel & Studio',
      desc: 'Receipt KES 120,000 uploaded. Needs eTIMS PIN confirmation before tax return filing.',
      action: 'Verify Receipt',
      href: '/admin/expenses',
    },
    {
      title: 'KRA Withholding Tax Cert Pending',
      client: 'UNDP Timbuktoo / ccHUB',
      desc: 'eTIMS Invoice #042 shared. WHT tax certificate pending from client accounts.',
      action: 'Remind Client',
      href: '/admin/clients',
    },
    {
      title: 'Awaiting Proofing Selections',
      client: 'Delta40 Venture Studio',
      desc: 'Gallery published. Client has favorited 8 photos out of 20 max limit.',
      action: 'View Proofs',
      href: '/portal/g/xK9_mQ2pL7v',
    },
  ];

  const pendingInquiries = [
    { name: 'Dr. Wanjiru N.', organization: 'USAID Climate Grant', service: 'Ecosystem Documentary', budget: 'USD $8,500', time: '2 hours ago' },
    { name: 'Marcus Chen', organization: 'Silicon Savannah VC', service: 'Commercial Photography', budget: 'KES 450,000', time: '5 hours ago' },
  ];

  const recentActivity = [
    { client: 'UNDP Timbuktoo Team', action: 'Favorited 14 retouched photos', project: 'UNDP Summit 2026', time: '20 mins ago' },
    { client: 'BURN Manufacturing USA', action: 'Downloaded Full Gallery ZIP (High-Res)', project: 'Clean Energy Series 2025', time: '2 hours ago' },
    { client: 'Delta40 Venture Studio', action: 'Left 3 feedback notes on proofs', project: 'Climate Tech Summit', time: 'Yesterday' },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Creator Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 font-mono">
              <p className="text-xs uppercase tracking-widest text-purple-600 dark:text-purple-400 font-bold">{creatorConfig.platformName}</p>
              <span className="px-2.5 py-0.5 bg-slate-200 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 text-[10px] rounded-full">
                Creator: {creatorConfig.creatorName}
              </span>
              <span className="px-2.5 py-0.5 bg-slate-200 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-slate-700 dark:text-zinc-400 text-[10px] rounded-full">
                KRA PIN: {creatorConfig.kraPin}
              </span>
            </div>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white mt-1">Creator Command Center</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/expenses"
              className="px-5 py-2.5 btn-primary text-xs font-mono uppercase tracking-widest rounded-lg flex items-center gap-2 shadow-sm"
            >
              <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>Scan Receipt</span>
            </Link>
            <Link
              href="/admin/projects"
              className="px-5 py-2.5 btn-secondary text-xs font-mono uppercase tracking-widest rounded-lg"
            >
              + Create Gallery
            </Link>
          </div>
        </div>

        {/* 1. TOP OPERATIONAL METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreMetrics.map((m, i) => (
            <div key={i} className="p-6 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 rounded-2xl space-y-2 relative overflow-hidden shadow-sm dark:shadow-none">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono uppercase tracking-wider">{m.label}</p>
                {m.alert && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
              </div>
              <p className={`text-3xl font-light ${m.color}`}>{m.value}</p>
              <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">{m.detail}</p>
            </div>
          ))}
        </div>

        {/* 2. SOCIAL MEDIA & AUDIENCE TELEMETRY */}
        <div className="border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm dark:shadow-none">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9M7.7 16.3c-2.3-2.3-2.3-6.1 0-8.5M16.3 7.7c2.3 2.3 2.3 6.1 0 8.5M19.1 4.9c3.9 3.9 3.9 10.3 0 14.2" />
                <circle cx="12" cy="12" r="2" />
              </svg>
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">Social Media & Channel Reach</h2>
            </div>
            <span className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest">Live Audience Telemetry</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {socialMetrics.map((s, i) => (
              <div key={i} className="p-5 bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs font-mono text-slate-500 dark:text-zinc-400">
                  <span>{s.platform}</span>
                  <svg className="w-4 h-4 text-purple-600 dark:text-purple-400 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className={`text-2xl font-light ${s.color}`}>{s.metric}</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. ACTION REQUIRED ALERT CENTER */}
        <div className="border border-purple-500/30 bg-linear-to-r from-purple-100/80 via-slate-50 to-white dark:from-purple-950/30 dark:via-zinc-950 dark:to-zinc-950 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
              <h2 className="text-lg font-medium text-slate-900 dark:text-white">Action Required ({actionRequiredAlerts.length})</h2>
            </div>
            <span className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase tracking-widest">Tasks Needing Your Attention</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {actionRequiredAlerts.map((alert, i) => (
              <div key={i} className="p-5 bg-white dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800/80 rounded-xl space-y-4 flex flex-col justify-between shadow-sm dark:shadow-none">
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-[10px] font-mono rounded-full uppercase">
                    {alert.client}
                  </span>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white">{alert.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 font-light leading-relaxed">{alert.desc}</p>
                </div>

                <Link
                  href={alert.href}
                  className="btn-primary w-full text-center py-2.5 text-xs font-mono uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>{alert.action}</span>
                  <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* 4. INCOMING BRIEFS INBOX */}
        <div className="border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 rounded-2xl p-8 space-y-6 shadow-sm dark:shadow-none">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
            <div>
              <span className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase">Incoming Briefs</span>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mt-0.5">Website Inquiries ({pendingInquiries.length})</h3>
            </div>
            <Link href="/admin/clients" className="text-xs font-mono text-purple-600 dark:text-purple-400 hover:underline">
              Manage All Leads →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingInquiries.map((inq, i) => (
              <div key={i} className="p-5 bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-purple-600/20 text-purple-700 dark:text-purple-300 text-[10px] font-mono rounded-full uppercase font-semibold">
                      {inq.service}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">{inq.time}</span>
                  </div>
                  <h4 className="text-base font-medium text-slate-900 dark:text-white">{inq.name} ({inq.organization})</h4>
                  <p className="text-xs font-mono text-purple-600 dark:text-purple-400 font-bold">Estimated Budget: {inq.budget}</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Link
                    href="/admin/clients"
                    className="flex-1 py-2 btn-primary text-xs font-mono rounded-lg text-center"
                  >
                    Respond & Onboard →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. FINANCIAL & INFRASTRUCTURE METRICS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {storageMetrics.map((s, i) => (
            <div key={i} className="p-6 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/20 rounded-2xl space-y-1 shadow-sm dark:shadow-none">
              <p className="text-xs text-slate-500 dark:text-zinc-500 font-mono uppercase">{s.label}</p>
              <p className="text-2xl font-light text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* 6. ADMIN NAVIGATION MODULES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link
            href="/admin/expenses"
            className="p-8 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 hover:border-purple-600/60 rounded-2xl transition-all group space-y-3 shadow-sm dark:shadow-none"
          >
            <span className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase">01 / KRA Expenses</span>
            <h2 className="text-2xl font-medium text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Receipt Scanner →
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-light leading-relaxed">
              Scan gear, venue & crew receipts to claim KRA 30% tax deductions.
            </p>
          </Link>

          <Link
            href="/admin/clients"
            className="p-8 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 hover:border-purple-600/60 rounded-2xl transition-all group space-y-3 shadow-sm dark:shadow-none"
          >
            <span className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase">02 / CRM & Compliance</span>
            <h2 className="text-2xl font-medium text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Client CRM & KRA Tax →
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-light leading-relaxed">
              Track KRA eTIMS invoices, Withholding Tax certificates & contracts.
            </p>
          </Link>

          <Link
            href="/admin/projects"
            className="p-8 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 hover:border-purple-600/60 rounded-2xl transition-all group space-y-3 shadow-sm dark:shadow-none"
          >
            <span className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase">03 / Proofing Engine</span>
            <h2 className="text-2xl font-medium text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Gallery Builder →
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-light leading-relaxed">
              Create client galleries, set 4-digit PINs & download rules.
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="p-8 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/30 hover:border-purple-600/60 rounded-2xl transition-all group space-y-3 shadow-sm dark:shadow-none"
          >
            <span className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase">04 / Configuration</span>
            <h2 className="text-2xl font-medium text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Platform Settings →
            </h2>
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-light leading-relaxed">
              Customize KRA PIN, base currencies & custom domains.
            </p>
          </Link>
        </div>

        {/* 7. RECENT LIVE ACTIVITY FEED */}
        <div className="border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 rounded-2xl p-8 space-y-6 shadow-sm dark:shadow-none">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-zinc-800 pb-3">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Live Client Portal Activity</h3>
            <span className="text-xs font-mono text-purple-600 dark:text-purple-400 uppercase">Real-Time Feedback</span>
          </div>

          <div className="space-y-4">
            {recentActivity.map((act, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800/80 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-900 dark:text-white">{act.client} — <span className="text-purple-600 dark:text-purple-400">{act.action}</span></p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">Project: {act.project}</p>
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-500">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}