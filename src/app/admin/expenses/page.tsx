'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RefreshCw, Filter, Plus } from 'lucide-react';
import { AdminResourceToolbar, type AdminFilterConfig, type AdminToolbarAction } from '@/components/admin/AdminResourceToolbar';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';

type Expense = { id: string; description: string; supplier: string | null; category: string; amount: number; currency: string; expenseDate: string; paymentMethod: string | null; taxAmount: number; notes: string | null; project?: { id: string; name: string } | null };
type Form = { description: string; category: string; amount: string; expenseDate: string; supplier: string; paymentMethod: string; taxAmount: string; notes: string };
const initialForm: Form = { description: '', category: '', amount: '', expenseDate: new Date().toISOString().slice(0, 10), supplier: '', paymentMethod: '', taxAmount: '0', notes: '' };

type ExpenseReceipt = {
  id: string;
  merchant: string;
  merchantKraPin: string;
  category: string;
  amountKes: number;
  vatAmountKes: number;
  date: string;
  receiptImage: string;
  status: string;
};

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
    <div className="min-h-screen px-4 py-8 font-sans transition-colors duration-300 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <AdminPageHeader
          title="KRA Receipt Scanner & Expense Claims"
          description="Scan receipts, capture expenses, and track KRA tax claims."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          primaryAction={
            <Button
              onClick={handleSimulateScan}
              variant="primary"
              disabled={isScanning}
              className="text-xs font-sans uppercase tracking-widest"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                  Scanning...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-2" />
                  Scan Receipt
                </>
              )}
            </Button>
          }
        />

          {/* Metrics Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Total Claimable Expenses</p>
              <p className="text-2xl font-bold">KES {totalClaimable.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">eTIMS & ETR Verified Receipts</p>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Est. KRA Tax Savings</p>
              <p className="text-2xl font-bold">KES {estimatedTaxShield.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Tax Deductible at 30% Corporate Rate</p>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Pending Verification</p>
              <p className="text-2xl font-bold">
                {expenses.filter((e) => e.status === 'PENDING_VERIFICATION').length} Receipts
              </p>
              <p className="text-sm text-muted-foreground">Requires eTIMS PIN confirmation</p>
            </div>
          </div>

        {/* SCANNER FORM */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm-header">
            <h2 className="rounded-xl border bg-card text-card-foreground shadow-sm-title">OCR Receipt Processing</h2>
            <p className="text-sm text-muted-foreground">Scan & Capture KRA Expense Receipt</p>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm-content space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">OCR Receipt Processing</p>
                <h2 className="text-2xl font-semibold tracking-tight">Scan & Capture KRA Expense Receipt</h2>
              </div>

              <Button
                onClick={handleSimulateScan}
                disabled={isScanning}
                variant="primary"
                className="w-full md:w-auto"
              >
                {isScanning ? <span className="flex items-center gap-2"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Scanning Receipt...</span> : 'Scan Receipt Photo (OCR)'}
              </Button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Merchant Name *</label>
                  <Input
                    type="text"
                    placeholder="e.g. Sony Kenya / Text Book Centre"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Merchant KRA PIN *</label>
                  <Input
                    type="text"
                    placeholder="e.g. P051123456Z"
                    value={merchantKraPin}
                    onChange={(e) => setMerchantKraPin(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Category</label>
                  <Select value={category} onValueChange={(value) => setCategory(value as typeof category)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="GEAR">Camera & Production Gear</SelectItem><SelectItem value="TRAVEL">Production Travel & Transport</SelectItem><SelectItem value="SOFTWARE">Software & Cloud Subscriptions</SelectItem><SelectItem value="CREW">Crew & Technical Assistant Fees</SelectItem><SelectItem value="VENUE">Studio & Venue Hire</SelectItem></SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">Total Amount (KES) *</label>
                  <Input
                    type="number"
                    placeholder="e.g. 180000"
                    value={amountKes || ''}
                    onChange={(e) => setAmountKes(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium leading-none">VAT Portion (KES 16%)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 24800"
                    value={vatAmountKes || ''}
                    onChange={(e) => setVatAmountKes(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3.5"
                variant="primary"
              >
                + Record Expense for KRA Tax Return
              </Button>
            </form>
          </div>
        </div>

        {/* Admin Resource Toolbar */}
        <AdminResourceToolbar
          search=""
          onSearchChange={() => {}}
          searchPlaceholder="Search expenses by merchant, category, date…"
          filters={[
            {
              id: 'status',
              label: 'Status',
              value: 'all',
              options: [
                { label: 'All Statuses', value: 'all' },
                { label: 'Claimable', value: 'CLAIMABLE' },
                { label: 'Pending Verification', value: 'PENDING_VERIFICATION' },
              ],
            },
            {
              id: 'category',
              label: 'Category',
              value: 'all',
              options: [
                { label: 'All Categories', value: 'all' },
                { label: 'Camera & Production Gear', value: 'GEAR' },
                { label: 'Production Travel & Transport', value: 'TRAVEL' },
                { label: 'Software & Cloud Subscriptions', value: 'SOFTWARE' },
                { label: 'Crew & Technical Assistant Fees', value: 'CREW' },
                { label: 'Studio & Venue Hire', value: 'VENUE' },
              ],
            },
          ] as AdminFilterConfig[]}
          onFilterChange={() => {}}
          onClearAll={() => {}}
          secondaryActions={[
            {
              label: 'Refresh',
              onClick: () => {}, // No refresh needed for local state
              variant: 'ghost',
              size: 'icon',
              icon: <RefreshCw className="h-4 w-4" />,
            } as AdminToolbarAction,
          ]}
          resultCount={expenses.length}
          filteredCount={expenses.length}
          resultLabel="Receipts"
          loading={isScanning}
        />

        {/* EXPENSES LIST */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm space-y-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm-header">
            <h2 className="text-2xl font-semibold tracking-tight">Logged Receipts & Expenses ({expenses.length})</h2>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm-content">
            <div className="grid grid-cols-1 gap-6">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="rounded-xl border bg-card text-card-foreground shadow-sm rounded-xl border bg-card text-card-foreground shadow-sm transition-colors hover:border-primary/50 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-primary/50 transition-all group shadow-sm dark:shadow-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 shrink-0 bg-slate-100 dark:bg-zinc-900">
                      <Image src={exp.receiptImage} alt={exp.merchant} fill className="object-cover" unoptimized />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-sans bg-primary/10 text-primary dark:text-primary rounded-full uppercase font-semibold">
                          {exp.category}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-sans rounded-full ${
                          exp.status === 'CLAIMABLE' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                        }`}>
                          {exp.status === 'CLAIMABLE' ? 'Claimable ✓' : 'Pending Verification ⚠️'}
                        </span>
                      </div>

                      <h3 className="text-base font-medium text-slate-900 dark:text-white">{exp.merchant}</h3>
                      <p className="text-sm text-muted-foreground">
                        Merchant KRA PIN: <span className="font-bold text-slate-900 dark:text-white">{exp.merchantKraPin}</span> • Date: {exp.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right font-sans">
                    <p className="text-xl font-bold text-slate-900 dark:text-white">KES {exp.amountKes.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Est. Tax Shield: KES {(exp.amountKes * 0.3).toLocaleString()}</p>
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
