'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Loader2 } from 'lucide-react';

interface ExpenseReceipt {
  id: string;
  merchant: string;
  merchantKraPin: string;
  category: 'GEAR' | 'TRAVEL' | 'SOFTWARE' | 'CREW' | 'VENUE';
  amountKes: number;
  vatAmountKes: number;
  date: string;
  receiptImage: string;
  status: 'CLAIMABLE' | 'PENDING_VERIFICATION' | 'CLAIMED';
}

export default function AdminExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseReceipt[]>([
    {
      id: 'exp_01',
      merchant: 'Text Book Centre / Camera World',
      merchantKraPin: 'P051123456Z',
      category: 'GEAR',
      amountKes: 245000,
      vatAmountKes: 32000,
      date: '2026-02-05',
      receiptImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      status: 'CLAIMABLE',
    },
    {
      id: 'exp_02',
      merchant: 'Safaricom PLC',
      merchantKraPin: 'P051001234X',
      category: 'SOFTWARE',
      amountKes: 18500,
      vatAmountKes: 2550,
      date: '2026-02-01',
      receiptImage: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=600&q=80',
      status: 'CLAIMABLE',
    },
    {
      id: 'exp_03',
      merchant: 'PrideInn Hotel & Studio',
      merchantKraPin: 'P051998877Y',
      category: 'VENUE',
      amountKes: 120000,
      vatAmountKes: 16500,
      date: '2026-01-20',
      receiptImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80',
      status: 'PENDING_VERIFICATION',
    },
  ]);

  const [isScanning, setIsScanning] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [merchant, setMerchant] = useState('');
  const [merchantKraPin, setMerchantKraPin] = useState('');
  const [category, setCategory] = useState<ExpenseReceipt['category']>('GEAR');
  const [amountKes, setAmountKes] = useState(0);
  const [vatAmountKes, setVatAmountKes] = useState(0);
  const [date, setDate] = useState('2026-02-10');

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setMerchant('Sony Kenya Official Store');
      setMerchantKraPin('P051778899K');
      setCategory('GEAR');
      setAmountKes(180000);
      setVatAmountKes(24800);
      setPreviewImage('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80');
      alert('Receipt scanned via OCR! Captured Merchant: Sony Kenya (P051778899K) - KES 180,000');
    }, 1200);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant || amountKes <= 0) {
      alert('Please scan a receipt or fill in Merchant Name and Amount.');
      return;
    }

    const newExpense: ExpenseReceipt = {
      id: `exp_${Date.now()}`,
      merchant,
      merchantKraPin: merchantKraPin || 'P051000000X',
      category,
      amountKes,
      vatAmountKes,
      date,
      receiptImage: previewImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      status: 'CLAIMABLE',
    };

    setExpenses([newExpense, ...expenses]);
    setMerchant('');
    setMerchantKraPin('');
    setAmountKes(0);
    setVatAmountKes(0);
    setPreviewImage(null);
    alert('Expense recorded and flagged for KRA Tax Return claim!');
  };

  const totalClaimable = expenses
    .filter((e) => e.status === 'CLAIMABLE')
    .reduce((sum, e) => sum + e.amountKes, 0);

  const estimatedTaxShield = totalClaimable * 0.3;

  return (
    <div className="ui-page ui-page-padded">
      <div className="ui-shell">
        <AdminPageHeader title="KRA Receipt Scanner & Expense Claims" description="Capture receipts and track claimable production expenses." breadcrumb={{ label: 'Dashboard', href: '/admin' }} />

          {/* Metrics Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="ui-stat-card">
              <p className="ui-stat-label">Total Claimable Expenses</p>
              <p className="ui-stat-value">KES {totalClaimable.toLocaleString()}</p>
              <p className="ui-meta">eTIMS & ETR Verified Receipts</p>
            </div>

            <div className="ui-stat-card">
              <p className="ui-stat-label">Est. KRA Tax Savings</p>
              <p className="ui-stat-value">KES {estimatedTaxShield.toLocaleString()}</p>
              <p className="ui-meta">Tax Deductible at 30% Corporate Rate</p>
            </div>

            <div className="ui-stat-card">
              <p className="ui-stat-label">Pending Verification</p>
              <p className="ui-stat-value">
                {expenses.filter((e) => e.status === 'PENDING_VERIFICATION').length} Receipts
              </p>
              <p className="ui-meta">Requires eTIMS PIN confirmation</p>
            </div>
          </div>

        {/* SCANNER FORM */}
        <div className="ui-card space-y-6">
          <div className="ui-card-header">
            <h2 className="ui-card-title">OCR Receipt Processing</h2>
            <p className="ui-meta">Scan & Capture KRA Expense Receipt</p>
          </div>
          <div className="ui-card-content space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div>
                <p className="ui-eyebrow">OCR Receipt Processing</p>
                <h2 className="ui-section-title">Scan & Capture KRA Expense Receipt</h2>
              </div>

              <Button
                onClick={handleSimulateScan}
                disabled={isScanning}
                variant="default"
                className="w-full md:w-auto"
              >
                {isScanning ? <span className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Scanning Receipt...</span> : 'Scan Receipt Photo (OCR)'}
              </Button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="ui-label">Merchant Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Sony Kenya / Text Book Centre"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="ui-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="ui-label">Merchant KRA PIN *</label>
                  <input
                    type="text"
                    placeholder="e.g. P051123456Z"
                    value={merchantKraPin}
                    onChange={(e) => setMerchantKraPin(e.target.value)}
                    className="ui-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="ui-label">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as typeof category)}
                    className="ui-select"
                  >
                    <option value="GEAR">Camera & Production Gear</option>
                    <option value="TRAVEL">Production Travel & Transport</option>
                    <option value="SOFTWARE">Software & Cloud Subscriptions</option>
                    <option value="CREW">Crew & Technical Assistant Fees</option>
                    <option value="VENUE">Studio & Venue Hire</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="ui-label">Total Amount (KES) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 180000"
                    value={amountKes || ''}
                    onChange={(e) => setAmountKes(parseFloat(e.target.value) || 0)}
                    className="ui-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="ui-label">VAT Portion (KES 16%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 24800"
                    value={vatAmountKes || ''}
                    onChange={(e) => setVatAmountKes(parseFloat(e.target.value) || 0)}
                    className="ui-input"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3.5"
                variant="default"
              >
                + Record Expense for KRA Tax Return
              </Button>
            </form>
          </div>
        </div>

        {/* EXPENSES LIST */}
        <div className="ui-card space-y-6">
          <div className="ui-card-header">
            <h2 className="ui-section-title">Logged Receipts & Expenses ({expenses.length})</h2>
          </div>
          <div className="ui-card-content">
            <div className="grid grid-cols-1 gap-6">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="ui-card ui-card-interactive p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-purple-600/50 transition-all group shadow-sm dark:shadow-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 shrink-0 bg-slate-100 dark:bg-zinc-900">
                      <Image src={exp.receiptImage} alt={exp.merchant} fill className="object-cover" unoptimized />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-sans bg-purple-600/20 text-purple-700 dark:text-purple-300 rounded-full uppercase font-semibold">
                          {exp.category}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-sans rounded-full ${
                          exp.status === 'CLAIMABLE' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        }`}>
                          {exp.status === 'CLAIMABLE' ? 'Claimable ✓' : 'Pending Verification ⚠️'}
                        </span>
                      </div>

                      <h3 className="text-base font-medium text-slate-900 dark:text-white">{exp.merchant}</h3>
                      <p className="ui-meta">
                        Merchant KRA PIN: <span className="font-bold text-slate-900 dark:text-white">{exp.merchantKraPin}</span> • Date: {exp.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-sans">
                    <p className="text-xl font-bold text-slate-900 dark:text-white">KES {exp.amountKes.toLocaleString()}</p>
                    <p className="ui-meta">Est. Tax Shield: KES {(exp.amountKes * 0.3).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add Loader2 import at the top if not present
