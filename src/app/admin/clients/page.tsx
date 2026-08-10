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
  
  // Kenyan Business & Workflow Tracking Fields
  feedbackStatus: 'AWAITING_FEEDBACK' | 'FEEDBACK_RECEIVED' | 'IN_PRODUCTION' | 'COMPLETED';
  contractStatus: 'NOT_SENT' | 'SENT' | 'SIGNED';
  etimsInvoiceStatus: 'NOT_SENT' | 'SENT' | 'PAID';
  taxCertificateStatus: 'NOT_RECEIVED' | 'RECEIVED' | 'NOT_APPLICABLE';
  
  galleries: AssignedGallery[];
}

export default function AdminClientsPage() {
  // Pre-populated Client Data with KRA & Workflow Tracking
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
      taxCertificateStatus: 'NOT_RECEIVED', // Pending WHT Cert
      
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
      taxCertificateStatus: 'RECEIVED', // Tax cert received
      
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

  // New Client Form State
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

  // Filter Logic
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6 md:p-12 font-sans selection:bg-purple-600 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <Link href="/admin" className="text-xs font-mono text-purple-400 hover:underline">← Back to Dashboard</Link>
            <h1 className="text-3xl font-light text-white mt-1">Client CRM & KRA Tax Compliance</h1>
          </div>

          <button
            onClick={() => setIsAddClientOpen(true)}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono uppercase tracking-widest rounded-lg transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)]"
          >
            + Register New Client
          </button>
        </div>

        {/* CRM Business Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 border border-zinc-800/80 bg-zinc-950/60 rounded-2xl space-y-1">
            <p className="text-xs text-amber-400 font-mono uppercase">Awaiting Feedback</p>
            <p className="text-3xl font-light text-white">
              {clients.filter((c) => c.feedbackStatus === 'AWAITING_FEEDBACK').length}
            </p>
          </div>
          <div className="p-6 border border-zinc-800/80 bg-zinc-950/60 rounded-2xl space-y-1">
            <p className="text-xs text-red-400 font-mono uppercase">Pending Tax Certs</p>
            <p className="text-3xl font-light text-white">
              {clients.filter((c) => c.taxCertificateStatus === 'NOT_RECEIVED').length}
            </p>
          </div>
          <div className="p-6 border border-zinc-800/80 bg-zinc-950/60 rounded-2xl space-y-1">
            <p className="text-xs text-purple-400 font-mono uppercase">Contracts Signed</p>
            <p className="text-3xl font-light text-white">
              {clients.filter((c) => c.contractStatus === 'SIGNED').length}
            </p>
          </div>
          <div className="p-6 border border-zinc-800/80 bg-zinc-950/60 rounded-2xl space-y-1">
            <p className="text-xs text-zinc-400 font-mono uppercase">eTIMS Invoices Shared</p>
            <p className="text-3xl font-light text-white">
              {clients.filter((c) => c.etimsInvoiceStatus !== 'NOT_SENT').length}
            </p>
          </div>
        </div>

        {/* Toolbar & Filter Pills */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/40 p-4 border border-zinc-800/80 rounded-2xl">
          <input
            type="text"
            placeholder="Search clients by name, company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 px-4 py-2 bg-zinc-950 border border-zinc-800 text-xs font-mono text-white rounded-xl focus:border-purple-600 focus:outline-none"
          />

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterCategory === 'ALL' ? 'bg-purple-600 border-purple-500 text-white' : 'border-zinc-800 bg-zinc-950 text-zinc-400'
              }`}
            >
              All ({clients.length})
            </button>
            <button
              onClick={() => setFilterCategory('AWAITING_FEEDBACK')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterCategory === 'AWAITING_FEEDBACK' ? 'bg-amber-600 border-amber-500 text-white' : 'border-amber-900/50 bg-amber-950/30 text-amber-400'
              }`}
            >
              Awaiting Feedback ({clients.filter((c) => c.feedbackStatus === 'AWAITING_FEEDBACK').length})
            </button>
            <button
              onClick={() => setFilterCategory('PENDING_TAX_CERT')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterCategory === 'PENDING_TAX_CERT' ? 'bg-red-600 border-red-500 text-white' : 'border-red-900/50 bg-red-950/30 text-red-400'
              }`}
            >
              Pending Tax Certs ({clients.filter((c) => c.taxCertificateStatus === 'NOT_RECEIVED').length})
            </button>
            <button
              onClick={() => setFilterCategory('PENDING_CONTRACT')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterCategory === 'PENDING_CONTRACT' ? 'bg-purple-600 border-purple-500 text-white' : 'border-zinc-800 bg-zinc-950 text-zinc-400'
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
              className="p-6 border border-zinc-800/80 bg-zinc-900/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-purple-600/50 hover:bg-zinc-900/50 transition-all group"
            >
              {/* Client Main Details */}
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-[10px] font-mono rounded-full uppercase">
                    {client.company}
                  </span>

                  {/* Feedback Badge */}
                  {client.feedbackStatus === 'AWAITING_FEEDBACK' && (
                    <span className="px-2.5 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-mono rounded-full">
                      💬 Awaiting Feedback
                    </span>
                  )}

                  {/* Contract Badge */}
                  <span className={`px-2.5 py-0.5 border text-[10px] font-mono rounded-full ${
                    client.contractStatus === 'SIGNED' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}>
                    Contract: {client.contractStatus === 'SIGNED' ? 'Signed ✓' : client.contractStatus === 'SENT' ? 'Sent ⏳' : 'Not Sent'}
                  </span>

                  {/* eTIMS Invoice Badge */}
                  <span className={`px-2.5 py-0.5 border text-[10px] font-mono rounded-full ${
                    client.etimsInvoiceStatus === 'PAID' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : client.etimsInvoiceStatus === 'SENT' ? 'bg-purple-600/20 border-purple-500/30 text-purple-300' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}>
                    eTIMS Invoice: {client.etimsInvoiceStatus}
                  </span>

                  {/* Tax Cert Badge */}
                  <span className={`px-2.5 py-0.5 border text-[10px] font-mono rounded-full ${
                    client.taxCertificateStatus === 'RECEIVED' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : client.taxCertificateStatus === 'NOT_RECEIVED' ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}>
                    Tax Cert: {client.taxCertificateStatus === 'RECEIVED' ? 'Received ✓' : 'Pending ⚠️'}
                  </span>
                </div>

                <h3 className="text-xl font-medium text-white group-hover:text-purple-400 transition-colors">
                  {client.name}
                </h3>

                <p className="text-xs text-zinc-400 font-mono">
                  {client.email} • {client.phone} • {client.location}
                </p>

                {client.notes && (
                  <p className="text-xs text-zinc-500 font-light italic">
                    "{client.notes}"
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <button
                  onClick={() => setSelectedClient(client)}
                  className="px-4 py-2.5 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  Edit Business Status / View ({client.galleries.length})
                </button>

                {client.galleries.length > 0 && (
                  <button
                    onClick={() => copyMagicLink(client.galleries[0].token)}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono rounded-xl transition-colors shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                  >
                    Copy Portal Link 📋
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* MODAL 1: REGISTER NEW CLIENT */}
        {isAddClientOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-white">
            <div className="max-w-xl w-full p-8 border border-zinc-800 bg-zinc-950 rounded-2xl space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsAddClientOpen(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white"
              >
                ✕
              </button>

              <div className="space-y-1">
                <p className="text-xs font-mono uppercase text-purple-400 tracking-widest">CRM & Tax Setup</p>
                <h2 className="text-2xl font-light text-white">Register New Client</h2>
              </div>

              <form onSubmit={handleCreateClient} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase">Contact Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Wanjiku"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase">Email Address *</label>
                    <input
                      type="email"
                      placeholder="jane@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-zinc-400 uppercase">Company / Organization</label>
                    <input
                      type="text"
                      placeholder="e.g. Safaricom Spark"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Business & Tax Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-purple-400 uppercase">Feedback Stage</label>
                    <select
                      value={feedbackStatus}
                      onChange={(e) => setFeedbackStatus(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    >
                      <option value="AWAITING_FEEDBACK">Awaiting Client Feedback 💬</option>
                      <option value="FEEDBACK_RECEIVED">Feedback Received</option>
                      <option value="IN_PRODUCTION">In Production / Retouching</option>
                      <option value="COMPLETED">Completed & Delivered</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-purple-400 uppercase">Contract Status</label>
                    <select
                      value={contractStatus}
                      onChange={(e) => setContractStatus(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    >
                      <option value="NOT_SENT">Not Sent</option>
                      <option value="SENT">Sent for Signature ⏳</option>
                      <option value="SIGNED">Signed & Active ✓</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-purple-400 uppercase">KRA eTIMS Invoice</label>
                    <select
                      value={etimsInvoiceStatus}
                      onChange={(e) => setEtimsInvoiceStatus(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    >
                      <option value="NOT_SENT">Not Generated</option>
                      <option value="SENT">eTIMS Invoice Shared</option>
                      <option value="PAID">Invoice Paid ✓</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-purple-400 uppercase">Withholding Tax Cert</label>
                    <select
                      value={taxCertificateStatus}
                      onChange={(e) => setTaxCertificateStatus(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                    >
                      <option value="NOT_RECEIVED">Pending Tax Cert ⚠️</option>
                      <option value="RECEIVED">Tax Cert Received ✓</option>
                      <option value="NOT_APPLICABLE">Not Applicable</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-zinc-400 uppercase">Internal Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Project deliverables or billing notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono uppercase tracking-widest rounded-lg transition-colors shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                >
                  + Add Client to CRM
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: EDIT CLIENT / EDIT TAX & FEEDBACK STATUS */}
        {selectedClient && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-white">
            <div className="max-w-2xl w-full p-8 border border-zinc-800 bg-zinc-950 rounded-2xl space-y-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedClient(null)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white"
              >
                ✕
              </button>

              <div className="space-y-1 border-b border-zinc-800 pb-4">
                <span className="px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-[10px] font-mono rounded-full uppercase">
                  {selectedClient.company}
                </span>
                <h2 className="text-2xl font-light text-white mt-2">{selectedClient.name}</h2>
                <p className="text-xs font-mono text-zinc-400">
                  {selectedClient.email} • {selectedClient.phone} • {selectedClient.location}
                </p>
              </div>

              {/* Status Update Quick Toggles */}
              <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4 text-xs font-mono">
                <p className="text-purple-400 font-bold uppercase text-[10px]">Update Business & Compliance Tracking</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-zinc-400 text-[10px] uppercase">Feedback Status</label>
                    <select
                      value={selectedClient.feedbackStatus}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setClients(clients.map(c => c.id === selectedClient.id ? { ...c, feedbackStatus: val } : c));
                        setSelectedClient({ ...selectedClient, feedbackStatus: val });
                      }}
                      className="w-full p-2 bg-zinc-950 border border-zinc-800 text-white rounded-lg"
                    >
                      <option value="AWAITING_FEEDBACK">Awaiting Client Feedback 💬</option>
                      <option value="FEEDBACK_RECEIVED">Feedback Received</option>
                      <option value="IN_PRODUCTION">In Production</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 text-[10px] uppercase">Contract Status</label>
                    <select
                      value={selectedClient.contractStatus}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setClients(clients.map(c => c.id === selectedClient.id ? { ...c, contractStatus: val } : c));
                        setSelectedClient({ ...selectedClient, contractStatus: val });
                      }}
                      className="w-full p-2 bg-zinc-950 border border-zinc-800 text-white rounded-lg"
                    >
                      <option value="NOT_SENT">Not Sent</option>
                      <option value="SENT">Sent for Signature ⏳</option>
                      <option value="SIGNED">Signed & Active ✓</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 text-[10px] uppercase">KRA eTIMS Invoice</label>
                    <select
                      value={selectedClient.etimsInvoiceStatus}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setClients(clients.map(c => c.id === selectedClient.id ? { ...c, etimsInvoiceStatus: val } : c));
                        setSelectedClient({ ...selectedClient, etimsInvoiceStatus: val });
                      }}
                      className="w-full p-2 bg-zinc-950 border border-zinc-800 text-white rounded-lg"
                    >
                      <option value="NOT_SENT">Not Generated</option>
                      <option value="SENT">eTIMS Invoice Shared</option>
                      <option value="PAID">Invoice Paid ✓</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-zinc-400 text-[10px] uppercase">Withholding Tax Cert</label>
                    <select
                      value={selectedClient.taxCertificateStatus}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setClients(clients.map(c => c.id === selectedClient.id ? { ...c, taxCertificateStatus: val } : c));
                        setSelectedClient({ ...selectedClient, taxCertificateStatus: val });
                      }}
                      className="w-full p-2 bg-zinc-950 border border-zinc-800 text-white rounded-lg"
                    >
                      <option value="NOT_RECEIVED">Pending Tax Cert ⚠️</option>
                      <option value="RECEIVED">Tax Cert Received ✓</option>
                      <option value="NOT_APPLICABLE">Not Applicable</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Assigned Galleries */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-medium text-white">Assigned Private Galleries</h3>
                  <Link href="/admin/projects" className="text-xs font-mono text-purple-400 hover:underline">
                    + Create Gallery
                  </Link>
                </div>

                {selectedClient.galleries.length === 0 ? (
                  <p className="text-xs text-zinc-500 font-mono italic">No galleries assigned to this client yet.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedClient.galleries.map((g) => (
                      <div key={g.id} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-white">{g.title}</p>
                          <p className="text-[11px] font-mono text-zinc-400">
                            PIN: <span className="text-purple-400 font-bold">{g.pin}</span> • {g.selectsCount} Selects
                          </p>
                        </div>
                        <button
                          onClick={() => copyMagicLink(g.token)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono rounded-lg transition-colors"
                        >
                          Copy Link 📋
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}