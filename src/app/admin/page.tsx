// src/app/admin/page.tsx
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
      label: 'Contracts Pending',
      value: '1 Unsigned',
      detail: 'Delta40 Venture Contract',
      alert: false,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'eTIMS Invoices',
      value: '2 Shared',
      detail: 'KES 1.8M invoiced via eTIMS',
      alert: false,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  const storageMetrics = [
    { label: 'Active Pipeline Value', value: 'KES 4.2M', sub: '$32,500 USD' },
    { label: 'Cloudflare R2 Storage', value: '142.8 GB', sub: '$0 Egress Bandwidth Fees' },
    { label: 'Total Client Partners', value: '12 Active', sub: 'iHUB, ccHUB, BURN, Delta40' },
    { label: 'High-Res Downloads', value: '84 ZIPs', sub: 'Issued via 4-Digit PINs' },
  ];

  const actionRequiredAlerts = [
    {
      title: 'KRA Withholding Tax Cert Pending',
      client: 'UNDP Timbuktoo / ccHUB',
      desc: 'eTIMS Invoice #042 shared. WHT tax certificate pending from client accounts.',
      action: 'Remind Client',
      type: 'tax',
      href: '/admin/clients',
    },
    {
      title: 'Awaiting Proofing Selections',
      client: 'Delta40 Venture Studio',
      desc: 'Gallery published. Client has favorited 8 photos out of 20 max limit.',
      action: 'View Proofs',
      type: 'feedback',
      href: '/portal/g/xK9_mQ2pL7v',
    },
    {
      title: 'Contract Pending Signature',
      client: 'Delta40 Venture Studio',
      desc: 'Master Agreement sent on Feb 8. Awaiting digital signature.',
      action: 'Check Contract',
      type: 'contract',
      href: '/admin/clients',
    },
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
            <span className="text-sm text-slate-600 dark:text-zinc-400">{creatorConfig.location}</span>
            <span className="text-sm text-slate-600 dark:text-zinc-400">{creatorConfig.baseCurrency}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {coreMetrics.map((metric) => (
            <div key={metric.label} className="rounded-xl border border-slate-200 dark:border-zinc-800 p-5">
              <p className="text-sm text-slate-600 dark:text-zinc-400">{metric.label}</p>
              <p className={`mt-2 text-2xl font-semibold ${metric.color}`}>{metric.value}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">{metric.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}