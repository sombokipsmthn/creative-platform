// src/app/admin/clients/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

interface AssignedGallery {
  id: string;
  title: string;
  token: string;
  pin: string;
  status: string;
  selectsCount: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  location: string;
  createdAt: string;
  notes: string;
  feedbackStatus: 'AWAITING_FEEDBACK' | 'FEEDBACK_RECEIVED' | 'IN_PRODUCTION' | 'COMPLETED';
  contractStatus: 'NOT_SENT' | 'SENT' | 'SIGNED';
  etimsInvoiceStatus: 'NOT_SENT' | 'SENT' | 'PAID';
  taxCertificateStatus: 'NOT_RECEIVED' | 'RECEIVED' | 'NOT_APPLICABLE';
  galleries: AssignedGallery[];
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([
    {
      id: 'cli_01',
      name: 'UNDP Timbuktoo & ccHUB Team',
      email: 'timbuktoo@undp.org',
      phone: '+254 700 000 111',
      company: 'iHUB / ccHUB',
      location: 'Nairobi, Kenya',
      createdAt: 'Jan 2026',
      notes: 'Ecosystem storytelling program for Timbuktoo and Mastercard EdTech Fellowship.',
      feedbackStatus: 'AWAITING_FEEDBACK',
      contractStatus: 'SIGNED',
      etimsInvoiceStatus: 'SENT',
      taxCertificateStatus: 'NOT_RECEIVED',
      galleries: [
        {
          id: 'gal_01',
          title: 'UNDP Timbuktoo Summit 2026',
          token: 'xK9_mQ2pL7v',
          pin: '4821',
          status: 'IN_REVIEW',
          selectsCount: 14,
        },
      ],
    },
    {
      id: 'cli_02',
      name: 'BURN Communications Team',
      email: 'media@burnmfg.com',
      phone: '+254 722 000 222',
      company: 'BURN Manufacturing USA LLC',
      location: 'Nairobi & USA',
      createdAt: 'Dec 2025',
      notes: 'Clean energy impact storytelling across African markets.',
      feedbackStatus: 'COMPLETED',
      contractStatus: 'SIGNED',
      etimsInvoiceStatus: 'PAID',
      taxCertificateStatus: 'RECEIVED',
      galleries: [
        {
          id: 'gal_02',
          title: 'Clean Energy Impact Series 2025',
          token: 'burn_impact_2025',
          pin: '1234',
          status: 'FINAL_DELIVERY',
          selectsCount: 42,
        },
      ],
    },
    {
      id: 'cli_03',
      name: 'Delta40 Venture Team',
      email: 'innovate@delta40.studio',
      phone: '+254 711 333 444',
      company: 'Delta40 Venture Studio',
      location: 'Nairobi, Kenya',
      createdAt: 'Feb 2026',
      notes: 'Climate-tech, mobility, and circular economy scale programs.',
      feedbackStatus: 'AWAITING_FEEDBACK',
      contractStatus: 'SENT',
      etimsInvoiceStatus: 'NOT_SENT',
      taxCertificateStatus: 'NOT_RECEIVED',
      galleries: [],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'AWAITING_FEEDBACK' | 'PENDING_TAX_CERT' | 'PENDING_CONTRACT'>('ALL');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('Nairobi, Kenya');
  const [notes, setNotes] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<Client['feedbackStatus']>('AWAITING_FEEDBACK');
  const [contractStatus, setContractStatus] = useState<Client['contractStatus']>('NOT_SENT');
  const [etimsInvoiceStatus, setEtimsInvoiceStatus] = useState<Client['etimsInvoiceStatus']>('NOT_SENT');
  const [taxCertificateStatus, setTaxCertificateStatus] = useState<Client['taxCertificateStatus']>('NOT_RECEIVED');

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterCategory === 'AWAITING_FEEDBACK') return c.feedbackStatus === 'AWAITING_FEEDBACK';
    if (filterCategory === 'PENDING_TAX_CERT') return c.taxCertificateStatus === 'NOT_RECEIVED';
    if (filterCategory === 'PENDING_CONTRACT') return c.contractStatus !== 'SIGNED';

    return true;
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Please fill in Contact Name and Email.');
      return;
    }

    const newClient: Client = {
      id: `cli_${Date.now()}`,
      name,
      email,
      phone: phone || '+254 700 000 000',
      company: company || name,
      location: location || 'Nairobi, Kenya',
      createdAt: 'Just now',
      notes,
      feedbackStatus,
      contractStatus,
      etimsInvoiceStatus,
      taxCertificateStatus,
      galleries: [],
    };

    setClients([newClient, ...clients]);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setNotes('');
    setIsAddClientOpen(false);
    alert(`Client "${name}" registered with KRA & Contract tracking!`);
  };

  const copyMagicLink = (token: string) => {
    const link = `${window.location.origin}/portal/g/${token}`;
    navigator.clipboard.writeText(link);
    alert(`Client Portal Access Link copied:\n${link}`);
  };

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6">
          <div>
            <Link href="/admin" className="text-xs font-mono text-purple-600 dark:text-purple-400 hover:underline">← Back to Dashboard</Link>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white mt-1">Client CRM & KRA Tax Compliance</h1>
          </div>

          <button
            onClick={() => setIsAddClientOpen(true)}
            className="px-5 py-2.5 btn-primary text-xs font-mono uppercase tracking-widest rounded-lg flex items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
          >
            <span>+ Register New Client</span>
          </button>
        </div>

        {/* CRM Business Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 rounded-2xl space-y-1 shadow-sm dark:shadow-none">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-mono uppercase">Awaiting Feedback</p>
            <p className="text-3xl font-light text-slate-900 dark:text-white">
              {clients.filter((c) => c.feedbackStatus === 'AWAITING_FEEDBACK').length}
            </p>
          </div>
          <div className="p-6 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 rounded-2xl space-y-1 shadow-sm dark:shadow-none">
            <p className="text-xs text-red-600 dark:text-red-400 font-mono uppercase">Pending Tax Certs</p>
            <p className="text-3xl font-light text-slate-900 dark:text-white">
              {clients.filter((c) => c.taxCertificateStatus === 'NOT_RECEIVED').length}
            </p>
          </div>
          <div className="p-6 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 rounded-2xl space-y-1 shadow-sm dark:shadow-none">
            <p className="text-xs text-purple-600 dark:text-purple-400 font-mono uppercase">Contracts Signed</p>
            <p className="text-3xl font-light text-slate-900 dark:text-white">
              {clients.filter((c) => c.contractStatus === 'SIGNED').length}
            </p>
          </div>
          <div className="p-6 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/60 rounded-2xl space-y-1 shadow-sm dark:shadow-none">
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono uppercase">eTIMS Invoices Shared</p>
            <p className="text-3xl font-light text-slate-900 dark:text-white">
              {clients.filter((c) => c.etimsInvoiceStatus !== 'NOT_SENT').length}
            </p>
          </div>
        </div>

        {/* Toolbar & Filter Pills */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-100 dark:bg-zinc-900/40 p-4 border border-slate-200 dark:border-zinc-800/80 rounded-2xl">
          <input
            type="text"
            placeholder="Search clients by name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 px-4 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-xl focus:border-purple-600 focus:outline-none"
          />

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterCategory === 'ALL' ? 'bg-purple-600 border-purple-500 text-white' : 'btn-secondary'
              }`}
            >
              All ({clients.length})
            </button>
            <button
              onClick={() => setFilterCategory('AWAITING_FEEDBACK')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterCategory === 'AWAITING_FEEDBACK' ? 'bg-amber-600 border-amber-500 text-white' : 'btn-secondary'
              }`}
            >
              Awaiting Feedback ({clients.filter((c) => c.feedbackStatus === 'AWAITING_FEEDBACK').length})
            </button>
            <button
              onClick={() => setFilterCategory('PENDING_TAX_CERT')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterCategory === 'PENDING_TAX_CERT' ? 'bg-red-600 border-red-500 text-white' : 'btn-secondary'
              }`}
            >
              Pending Tax Certs ({clients.filter((c) => c.taxCertificateStatus === 'NOT_RECEIVED').length})
            </button>
            <button
              onClick={() => setFilterCategory('PENDING_CONTRACT')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterCategory === 'PENDING_CONTRACT' ? 'bg-purple-600 border-purple-500 text-white' : 'btn-secondary'
              }`}
            >
              Contracts Pending ({clients.filter((c) => c.contractStatus !== 'SIGNED').length})
            </button>
          </div>
        </div>

        {/* Client Cards List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="p-6 border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-purple-600/50 transition-all group shadow-sm dark:shadow-none"
            >
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-[10px] font-mono rounded-full uppercase">
                    {client.company}
                  </span>

                  {client.feedbackStatus === 'AWAITING_FEEDBACK' && (
                    <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] font-mono rounded-full">
                      💬 Awaiting Feedback
                    </span>
                  )}

                  <span className={`px-2.5 py-0.5 border text-[10px] font-mono rounded-full ${
                    client.contractStatus === 'SIGNED' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                  }`}>
                    Contract: {client.contractStatus === 'SIGNED' ? 'Signed ✓' : client.contractStatus === 'SENT' ? 'Sent ⏳' : 'Not Sent'}
                  </span>

                  <span className={`px-2.5 py-0.5 border text-[10px] font-mono rounded-full ${
                    client.etimsInvoiceStatus === 'PAID' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : client.etimsInvoiceStatus === 'SENT' ? 'bg-purple-600/20 border-purple-500/30 text-purple-700 dark:text-purple-300' : 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                  }`}>
                    eTIMS Invoice: {client.etimsInvoiceStatus}
                  </span>

                  <span className={`px-2.5 py-0.5 border text-[10px] font-mono rounded-full ${
                    client.taxCertificateStatus === 'RECEIVED' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : client.taxCertificateStatus === 'NOT_RECEIVED' ? 'bg-red-500/20 border-red-500/30 text-red-700 dark:text-red-300' : 'bg-slate-100 dark:bg-zinc-800 border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                  }`}>
                    Tax Cert: {client.taxCertificateStatus === 'RECEIVED' ? 'Received ✓' : 'Pending ⚠️'}
                  </span>
                </div>

                <h3 className="text-xl font-medium text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {client.name}
                </h3>

                <p className="text-xs text-slate-600 dark:text-zinc-400 font-mono">
                  {client.email} • {client.phone} • {client.location}
                </p>

                {client.notes && (
                  <p className="text-xs text-slate-500 dark:text-zinc-500 font-light italic">
                    "{client.notes}"
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <button
                  onClick={() => setSelectedClient(client)}
                  className="px-4 py-2.5 btn-secondary text-xs font-mono rounded-xl flex items-center gap-2"
                >
                  <span>Edit Status / View ({client.galleries.length})</span>
                </button>

                {client.galleries.length > 0 && (
                  <button
                    onClick={() => copyMagicLink(client.galleries[0].token)}
                    className="px-4 py-2.5 btn-primary text-xs font-mono rounded-xl flex items-center gap-2 shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Copy Portal Link</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}