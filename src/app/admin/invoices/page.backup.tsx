// src/app/admin/invoices/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { equipmentDatabase, EquipmentItem } from '@/db/equipmentData';
import { useCreator } from '@/context/CreatorContext';

interface InvoiceLineItem {
  id: string;
  category: string;
  name: string;
  qty: number;
  days: number;
  rate: number;
  notes: string;
}

const categoryFilterTabs = [
  'All',
  'A. Professional Fees',
  'Camera Package',
  'Audio Package',
  'Lighting Package',
  'Grips & Motion',
  'Drones & Action',
  'C. Post Production',
];

const createRandomIdSuffix = () => Math.random().toString(36).substring(2, 9);

export default function AdminInvoicesPage() {
  const { activeUser } = useCreator();
  const [docType, setDocType] = useState<'QUOTATION' | 'OFFICIAL TAX INVOICE'>('QUOTATION');
  const [selectedClient, setSelectedClient] = useState('Apex Global Studios');
  const [quoteDate, setQuoteDate] = useState('2026-08-15');
  const [invoiceNumber, setInvoiceNumber] = useState('QT-2026-0159');
  const [vatPercent, setVatPercent] = useState(0);

  // 💡 DYNAMIC CREATOR PROFILE PULLED FROM ACTIVE USER SESSION
  const creatorProfile = {
    name: activeUser?.name || 'Creator Name',
    title: activeUser?.title || 'Lead Visual Director',
    email: activeUser?.email || 'creator@kipsmthn.com',
    phone: activeUser?.phone || '+254 700 000 000',
    kraPin: activeUser?.kraPin || 'KRA PIN Pending',
    location: activeUser?.location || 'Nairobi, Kenya',
    paymentDetails: activeUser?.paymentDetails || {
      bankName: 'Bank Name Pending',
      accountName: 'Creator Account',
      accountNumber: 'Pending',
      branch: 'Nairobi',
      mpesaPaybill: 'Paybill Pending',
    },
  };

  // Active Line Items
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { id: 'pf_1', category: 'A. Professional Fees', name: 'Videographers (DOP)', qty: 2, days: 1, rate: 35000, notes: 'Video DOP & AD fee' },
    { id: 'cam_a7iv', category: 'Camera Package', name: 'Main Video Cameras (Sony A7 IV)', qty: 2, days: 1, rate: 8000, notes: 'Primary camera (Medium + Closeup)' },
    { id: 'lens_zoom', category: 'Camera Package', name: 'Lenses (24-70mm, 70-200mm)', qty: 4, days: 1, rate: 3000, notes: 'F2.8 Zoom Set' },
    { id: 'grp_tripod', category: 'Grips & Motion', name: 'Tripods (Heavy Duty)', qty: 2, days: 1, rate: 1000, notes: 'Support equipment' },
    { id: 'aud_dji', category: 'Audio Package', name: 'Wireless Lavalier Mic (Dual set - DJI/Rode)', qty: 1, days: 1, rate: 2000, notes: 'Primary interview audio' },
    { id: 'aud_boom', category: 'Audio Package', name: 'Shotgun Mic + Boom', qty: 1, days: 1, rate: 1500, notes: 'Backup / environmental capture' },
    { id: 'aud_zoom', category: 'Audio Package', name: 'Audio Recorder (Zoom H5/H6)', qty: 1, days: 1, rate: 1000, notes: 'Main Event recording' },
    { id: 'lit_200d', category: 'Lighting Package', name: 'Amaran 200D or Neewer LED Panel Lights', qty: 2, days: 1, rate: 3000, notes: 'Portable lighting' },
    { id: 'lit_v1', category: 'Lighting Package', name: 'Godox V1 Speedlights', qty: 1, days: 1, rate: 3000, notes: 'Flash Lighting' },
    { id: 'grp_cstand', category: 'Grips & Motion', name: 'Light stands & modifiers', qty: 2, days: 1, rate: 500, notes: 'Support Stands' },
    { id: 'post_4', category: 'C. Post Production', name: 'Photo Postproduction', qty: 0, days: 1, rate: 10000, notes: 'Color grading' },
    { id: 'post_3', category: 'C. Post Production', name: 'Video Postproduction', qty: 5, days: 1, rate: 7000, notes: 'Coverage + Highlight video + Interviews' },
  ]);

  const [activeCategoryForAdd, setActiveCategoryForAdd] = useState<string | null>(null);
  const [modalFilterCategory, setModalFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const openAddModalForSection = (categoryName: string) => {
    setActiveCategoryForAdd(categoryName);
    setModalFilterCategory(categoryName);
    setSearchQuery('');
  };

  const updateLineItem = (id: string, field: keyof InvoiceLineItem, value: string | number) => {
    setLineItems(
      lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const addGearFromCatalog = (item: EquipmentItem) => {
    const randomSuffix = createRandomIdSuffix();
    const newItem: InvoiceLineItem = {
      id: `${item.id}_${randomSuffix}`,
      category: activeCategoryForAdd || item.category,
      name: item.name,
      qty: 1,
      days: 1,
      rate: item.rateKes,
      notes: item.specs,
    };
    setLineItems([...lineItems, newItem]);
    setActiveCategoryForAdd(null);
    setSearchQuery('');
  };

  const addCustomItemToCategory = (targetCategory: string) => {
    const randomSuffix = createRandomIdSuffix();
    const customItem: InvoiceLineItem = {
      id: `custom_${randomSuffix}`,
      category: targetCategory,
      name: 'Custom Line Item',
      qty: 1,
      days: 1,
      rate: 5000,
      notes: 'Custom production requirement',
    };
    setLineItems([...lineItems, customItem]);
  };

  // Subtotals
  const profFeesSubtotal = lineItems
    .filter((i) => i.category === 'A. Professional Fees')
    .reduce((sum, item) => sum + item.qty * item.days * item.rate, 0);

  const cameraSubtotal = lineItems
    .filter((i) => i.category === 'Camera Package')
    .reduce((sum, item) => sum + item.qty * item.days * item.rate, 0);

  const audioSubtotal = lineItems
    .filter((i) => i.category === 'Audio Package')
    .reduce((sum, item) => sum + item.qty * item.days * item.rate, 0);

  const lightingSubtotal = lineItems
    .filter((i) => i.category === 'Lighting Package')
    .reduce((sum, item) => sum + item.qty * item.days * item.rate, 0);

  const gripsSubtotal = lineItems
    .filter((i) => i.category === 'Grips & Motion')
    .reduce((sum, item) => sum + item.qty * item.days * item.rate, 0);

  const equipmentTotal = cameraSubtotal + audioSubtotal + lightingSubtotal + gripsSubtotal;

  const postproductionSubtotal = lineItems
    .filter((i) => i.category === 'C. Post Production')
    .reduce((sum, item) => sum + item.qty * item.days * item.rate, 0);

  const subtotalExclVat = profFeesSubtotal + equipmentTotal + postproductionSubtotal;
  const vatAmount = (subtotalExclVat * vatPercent) / 100;
  const grandTotalInclVat = subtotalExclVat + vatAmount;
  const depositRequired = grandTotalInclVat * 0.5;

  const currentCategoryCatalog = equipmentDatabase.filter((item) => {
    const matchesCategory =
      modalFilterCategory === 'All' ? true : item.category === modalFilterCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const popularSuggestions = equipmentDatabase.filter((item) => {
    const matchesCategory =
      modalFilterCategory === 'All' ? true : item.category === modalFilterCategory;
    return item.isPopular && matchesCategory;
  });

  return (
    <div className="min-h-screen p-6 md:p-12 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-zinc-800/80 pb-6 print:hidden">
          <div>
            <Link href="/admin" className="text-xs font-mono text-purple-600 dark:text-purple-400 hover:underline">← Back to Dashboard</Link>
            <h1 className="text-3xl font-light text-slate-900 dark:text-white mt-1">PDF Quotation & eTIMS Invoicing Bridge</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const nextType = docType === 'QUOTATION' ? 'OFFICIAL TAX INVOICE' : 'QUOTATION';
                setDocType(nextType);
                setInvoiceNumber(nextType === 'OFFICIAL TAX INVOICE' ? 'INV-2026-0042' : 'QT-2026-0159');
              }}
              className="px-4 py-2.5 btn-secondary text-xs font-mono uppercase tracking-widest rounded-lg cursor-pointer"
            >
              Mode: {docType}
            </button>

            <a
              href="https://etims.kra.go.ke/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono uppercase tracking-widest rounded-lg flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span>🏛️ Open KRA eTIMS Portal ↗</span>
            </a>

            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 btn-primary text-xs font-mono uppercase tracking-widest rounded-lg flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span>🖨️ Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* PRINTABLE PDF TEMPLATE */}
        <div className="p-8 md:p-14 border border-slate-200 dark:border-zinc-800 bg-white text-slate-900 rounded-3xl shadow-2xl space-y-8 font-sans print:border-none print:shadow-none print:p-0 print:m-0">
          
          {/* CREATOR HEADER */}
          <div className="flex justify-between items-start border-b-2 border-purple-900 pb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-wider text-purple-950 uppercase font-sans">
                {creatorProfile.name}
              </h2>
              <p className="text-xs font-mono text-slate-600">{creatorProfile.title}</p>
              <p className="text-xs font-mono text-slate-500">{creatorProfile.phone} • {creatorProfile.email} • {creatorProfile.location}</p>
              <p className="text-[11px] font-mono text-purple-700 font-bold">KRA PIN: {creatorProfile.kraPin}</p>
            </div>

            <div className="text-right space-y-1">
              <h3 className="text-3xl font-extrabold text-purple-800 tracking-wider font-mono">{docType}</h3>
              <p className="text-xs font-mono text-slate-600">
                REF #: <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className="bg-transparent border-b border-slate-300 px-1 font-bold w-32 text-right font-mono print:border-none" />
              </p>
              <p className="text-xs font-mono text-slate-600">
                DATE: <input type="date" value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} className="bg-transparent border-b border-slate-300 px-1 font-bold print:border-none" />
              </p>
            </div>
          </div>

          {/* Client Recipient Info Box */}
          <div className="grid grid-cols-2 gap-8 text-xs font-mono bg-purple-50/50 p-6 rounded-2xl border border-purple-100 print:bg-slate-50 print:border-slate-300">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-purple-800">TO:</p>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full text-sm font-bold text-slate-900 bg-transparent border-b border-slate-300 focus:outline-none print:border-none"
              >
                <option value="Apex Global Studios">Apex Global Studios</option>
                <option value="Vanguard Media Group">Vanguard Media Group</option>
                <option value="Cipher Digital Studio">Cipher Digital Studio</option>
              </select>
              <p className="text-slate-500">Nairobi, Kenya</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase text-purple-800">FOR:</p>
              <p className="text-sm font-bold text-slate-900">Production Services</p>
              <p className="text-slate-500">eTIMS / ETR Compliant Invoicing</p>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse border border-slate-300">
              <thead>
                <tr className="bg-purple-950 text-white font-bold uppercase border-b border-purple-950">
                  <th className="p-2.5 border-r border-purple-800 w-2/5">Item</th>
                  <th className="p-2.5 text-center border-r border-purple-800">Qty</th>
                  <th className="p-2.5 text-center border-r border-purple-800">Days</th>
                  <th className="p-2.5 text-right border-r border-purple-800">Rate (KES)</th>
                  <th className="p-2.5 text-right border-r border-purple-800">Total (KES)</th>
                  <th className="p-2.5 print:w-1/4">Notes / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 text-slate-800">
                
                {/* SECTION A: PROFESSIONAL FEES */}
                <tr className="bg-slate-100 font-bold text-purple-950">
                  <td colSpan={6} className="p-2 border-b border-slate-300 uppercase flex justify-between items-center">
                    <span>A. Professional Fees</span>
                    <button
                      type="button"
                      onClick={() => openAddModalForSection('A. Professional Fees')}
                      className="px-2.5 py-1 bg-purple-900 text-white text-[10px] rounded hover:bg-purple-800 cursor-pointer print:hidden"
                    >
                      + Add Professional Fee
                    </button>
                  </td>
                </tr>
                {lineItems.filter((i) => i.category === 'A. Professional Fees').map((item) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="p-2.5 border-r border-slate-200 font-semibold">{item.name}</td>
                    <td className="p-2.5 text-center border-r border-slate-200"><input type="number" value={item.qty} onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value, 10) || 0)} className="w-10 text-center bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-center border-r border-slate-200"><input type="number" value={item.days} onChange={(e) => updateLineItem(item.id, 'days', parseInt(e.target.value, 10) || 0)} className="w-10 text-center bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-right border-r border-slate-200"><input type="number" value={item.rate} onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)} className="w-20 text-right bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-right font-bold border-r border-slate-200">{(item.qty * item.days * item.rate).toLocaleString()}</td>
                    <td className="p-2.5 text-[11px] text-slate-500 flex justify-between items-center gap-2">
                      <input type="text" value={item.notes} onChange={(e) => updateLineItem(item.id, 'notes', e.target.value)} className="w-full bg-transparent border-b border-dashed border-slate-300 focus:outline-none print:border-none" />
                      <button type="button" onClick={() => removeLineItem(item.id)} className="text-red-500 hover:text-red-700 font-bold px-1 print:hidden cursor-pointer">✕</button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold border-b-2 border-slate-400">
                  <td colSpan={4} className="p-2 text-slate-700">Subtotal - Professional Fees</td>
                  <td className="p-2 text-right text-purple-950 font-bold">{profFeesSubtotal.toLocaleString()}</td>
                  <td></td>
                </tr>

                {/* SECTION B: EQUIPMENT HIRE */}
                <tr className="bg-slate-100 font-bold text-purple-950">
                  <td colSpan={6} className="p-2 border-b border-slate-300 uppercase">
                    B. Equipment Hire (Per Day Rates)
                  </td>
                </tr>

                {/* Camera Package */}
                <tr className="bg-slate-50 font-semibold text-slate-700">
                  <td colSpan={6} className="p-2 text-[11px] uppercase italic flex justify-between items-center">
                    <span>Camera Package</span>
                    <button
                      type="button"
                      onClick={() => openAddModalForSection('Camera Package')}
                      className="px-2 py-0.5 bg-purple-800 text-white text-[10px] rounded hover:bg-purple-700 cursor-pointer print:hidden font-mono"
                    >
                      + Add Camera / Lens
                    </button>
                  </td>
                </tr>
                {lineItems.filter((i) => i.category === 'Camera Package').map((item) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="p-2.5 border-r border-slate-200 font-semibold">{item.name}</td>
                    <td className="p-2.5 text-center border-r border-slate-200"><input type="number" value={item.qty} onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value, 10) || 0)} className="w-10 text-center bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-center border-r border-slate-200"><input type="number" value={item.days} onChange={(e) => updateLineItem(item.id, 'days', parseInt(e.target.value, 10) || 0)} className="w-10 text-center bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-right border-r border-slate-200"><input type="number" value={item.rate} onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)} className="w-20 text-right bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-right font-bold border-r border-slate-200">{(item.qty * item.days * item.rate).toLocaleString()}</td>
                    <td className="p-2.5 text-[11px] text-slate-500 flex justify-between items-center gap-2">
                      <input type="text" value={item.notes} onChange={(e) => updateLineItem(item.id, 'notes', e.target.value)} className="w-full bg-transparent border-b border-dashed border-slate-300 focus:outline-none print:border-none" />
                      <button type="button" onClick={() => removeLineItem(item.id)} className="text-red-500 hover:text-red-700 font-bold px-1 print:hidden cursor-pointer">✕</button>
                    </td>
                  </tr>
                ))}

                {/* Audio Package */}
                <tr className="bg-slate-50 font-semibold text-slate-700">
                  <td colSpan={6} className="p-2 text-[11px] uppercase italic flex justify-between items-center">
                    <span>Audio Package</span>
                    <button
                      type="button"
                      onClick={() => openAddModalForSection('Audio Package')}
                      className="px-2 py-0.5 bg-purple-800 text-white text-[10px] rounded hover:bg-purple-700 cursor-pointer print:hidden font-mono"
                    >
                      + Add Audio Gear
                    </button>
                  </td>
                </tr>
                {lineItems.filter((i) => i.category === 'Audio Package').map((item) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="p-2.5 border-r border-slate-200 font-semibold">{item.name}</td>
                    <td className="p-2.5 text-center border-r border-slate-200"><input type="number" value={item.qty} onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value, 10) || 0)} className="w-10 text-center bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-center border-r border-slate-200"><input type="number" value={item.days} onChange={(e) => updateLineItem(item.id, 'days', parseInt(e.target.value, 10) || 0)} className="w-10 text-center bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-right border-r border-slate-200"><input type="number" value={item.rate} onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)} className="w-20 text-right bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-right font-bold border-r border-slate-200">{(item.qty * item.days * item.rate).toLocaleString()}</td>
                    <td className="p-2.5 text-[11px] text-slate-500 flex justify-between items-center gap-2">
                      <input type="text" value={item.notes} onChange={(e) => updateLineItem(item.id, 'notes', e.target.value)} className="w-full bg-transparent border-b border-dashed border-slate-300 focus:outline-none print:border-none" />
                      <button type="button" onClick={() => removeLineItem(item.id)} className="text-red-500 hover:text-red-700 font-bold px-1 print:hidden cursor-pointer">✕</button>
                    </td>
                  </tr>
                ))}

                {/* Lighting Package */}
                <tr className="bg-slate-50 font-semibold text-slate-700">
                  <td colSpan={6} className="p-2 text-[11px] uppercase italic flex justify-between items-center">
                    <span>Lighting Package</span>
                    <button
                      type="button"
                      onClick={() => openAddModalForSection('Lighting Package')}
                      className="px-2 py-0.5 bg-purple-800 text-white text-[10px] rounded hover:bg-purple-700 cursor-pointer print:hidden font-mono"
                    >
                      + Add Lighting Gear
                    </button>
                  </td>
                </tr>
                {lineItems.filter((i) => i.category === 'Lighting Package').map((item) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="p-2.5 border-r border-slate-200 font-semibold">{item.name}</td>
                    <td className="p-2.5 text-center border-r border-slate-200"><input type="number" value={item.qty} onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value, 10) || 0)} className="w-10 text-center bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-center border-r border-slate-200"><input type="number" value={item.days} onChange={(e) => updateLineItem(item.id, 'days', parseInt(e.target.value, 10) || 0)} className="w-10 text-center bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-right border-r border-slate-200"><input type="number" value={item.rate} onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)} className="w-20 text-right bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-right font-bold border-r border-slate-200">{(item.qty * item.days * item.rate).toLocaleString()}</td>
                    <td className="p-2.5 text-[11px] text-slate-500 flex justify-between items-center gap-2">
                      <input type="text" value={item.notes} onChange={(e) => updateLineItem(item.id, 'notes', e.target.value)} className="w-full bg-transparent border-b border-dashed border-slate-300 focus:outline-none print:border-none" />
                      <button type="button" onClick={() => removeLineItem(item.id)} className="text-red-500 hover:text-red-700 font-bold px-1 print:hidden cursor-pointer">✕</button>
                    </td>
                  </tr>
                ))}

                {/* Grips & Motion */}
                <tr className="bg-slate-50 font-semibold text-slate-700">
                  <td colSpan={6} className="p-2 text-[11px] uppercase italic flex justify-between items-center">
                    <span>Grips & Motion (Gimbals, Tripods, Drones)</span>
                    <button
                      type="button"
                      onClick={() => openAddModalForSection('Grips & Motion')}
                      className="px-2 py-0.5 bg-purple-800 text-white text-[10px] rounded hover:bg-purple-700 cursor-pointer print:hidden font-mono"
                    >
                      + Add Grips / Drones
                    </button>
                  </td>
                </tr>
                {lineItems.filter((i) => i.category === 'Grips & Motion').map((item) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="p-2.5 border-r border-slate-200 font-semibold">{item.name}</td>
                    <td className="p-2.5 text-center border-r border-slate-200"><input type="number" value={item.qty} onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value, 10) || 0)} className="w-10 text-center bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-center border-r border-slate-200"><input type="number" value={item.days} onChange={(e) => updateLineItem(item.id, 'days', parseInt(e.target.value, 10) || 0)} className="w-10 text-center bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-right border-r border-slate-200"><input type="number" value={item.rate} onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)} className="w-20 text-right bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-right font-bold border-r border-slate-200">{(item.qty * item.days * item.rate).toLocaleString()}</td>
                    <td className="p-2.5 text-[11px] text-slate-500 flex justify-between items-center gap-2">
                      <input type="text" value={item.notes} onChange={(e) => updateLineItem(item.id, 'notes', e.target.value)} className="w-full bg-transparent border-b border-dashed border-slate-300 focus:outline-none print:border-none" />
                      <button type="button" onClick={() => removeLineItem(item.id)} className="text-red-500 hover:text-red-700 font-bold px-1 print:hidden cursor-pointer">✕</button>
                    </td>
                  </tr>
                ))}

                <tr className="bg-slate-50 font-bold border-b-2 border-slate-400">
                  <td colSpan={4} className="p-2 text-slate-700">Equipment Total</td>
                  <td className="p-2 text-right text-purple-950 font-bold">{equipmentTotal.toLocaleString()}</td>
                  <td></td>
                </tr>

                {/* SECTION C: POST PRODUCTION */}
                <tr className="bg-slate-100 font-bold text-purple-950">
                  <td colSpan={6} className="p-2 border-b border-slate-300 uppercase flex justify-between items-center">
                    <span>C. Post Production</span>
                    <button
                      type="button"
                      onClick={() => openAddModalForSection('C. Post Production')}
                      className="px-2.5 py-1 bg-purple-900 text-white text-[10px] rounded hover:bg-purple-800 cursor-pointer print:hidden"
                    >
                      + Add Post Production Item
                    </button>
                  </td>
                </tr>
                {lineItems.filter((i) => i.category === 'C. Post Production').map((item) => (
                  <tr key={item.id} className="border-b border-slate-200">
                    <td className="p-2.5 border-r border-slate-200 font-semibold">{item.name}</td>
                    <td className="p-2.5 text-center border-r border-slate-200"><input type="number" value={item.qty} onChange={(e) => updateLineItem(item.id, 'qty', parseInt(e.target.value, 10) || 0)} className="w-10 text-center bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-center border-r border-slate-200"><input type="number" value={item.days} onChange={(e) => updateLineItem(item.id, 'days', parseInt(e.target.value, 10) || 0)} className="w-10 text-center bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-right border-r border-slate-200"><input type="number" value={item.rate} onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)} className="w-20 text-right bg-slate-100 border border-slate-300 rounded px-1 print:border-none print:bg-transparent" /></td>
                    <td className="p-2.5 text-right font-bold border-r border-slate-200">{(item.qty * item.days * item.rate).toLocaleString()}</td>
                    <td className="p-2.5 text-[11px] text-slate-500 flex justify-between items-center gap-2">
                      <input type="text" value={item.notes} onChange={(e) => updateLineItem(item.id, 'notes', e.target.value)} className="w-full bg-transparent border-b border-dashed border-slate-300 focus:outline-none print:border-none" />
                      <button type="button" onClick={() => removeLineItem(item.id)} className="text-red-500 hover:text-red-700 font-bold px-1 print:hidden cursor-pointer">✕</button>
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold border-b-2 border-slate-400">
                  <td colSpan={4} className="p-2 text-slate-700">Postproduction Subtotal</td>
                  <td className="p-2 text-right text-purple-950 font-bold">{postproductionSubtotal.toLocaleString()}</td>
                  <td></td>
                </tr>

              </tbody>
            </table>
          </div>

          {/* Grand Totals & DYNAMIC BANKING / MPESA PAYMENT TERMS BOX */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-6 border-t-2 border-slate-300">
            <div className="space-y-3 text-xs max-w-md">
              <p className="font-bold text-purple-950 font-mono uppercase">Payment Terms & Instructions:</p>
              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 text-slate-800 leading-relaxed font-mono space-y-2">
                <p className="font-bold">A deposit of 50% (KES {depositRequired.toLocaleString()}) is required upon booking and the other 50% payable upon delivery of all requirements.</p>

                <div className="border-t border-purple-200 pt-2 text-[11px] space-y-1 text-slate-700">
                  <p className="font-bold text-purple-950 uppercase">Bank Payment Details:</p>
                  <p>• Bank: <strong className="text-slate-900">{creatorProfile.paymentDetails.bankName}</strong></p>
                  <p>• Account Name: <strong className="text-slate-900">{creatorProfile.paymentDetails.accountName}</strong></p>
                  <p>• Account Number: <strong className="text-slate-900">{creatorProfile.paymentDetails.accountNumber}</strong> ({creatorProfile.paymentDetails.branch})</p>
                  <p>• MPESA Paybill / Till: <strong className="text-slate-900">{creatorProfile.paymentDetails.mpesaPaybill}</strong></p>
                </div>
              </div>
            </div>

            {/* Totals Table Box */}
            <div className="w-full md:w-80 space-y-2 text-xs font-mono bg-slate-50 p-6 rounded-2xl border border-slate-300">
              <div className="flex justify-between text-slate-800 font-semibold">
                <span>Total (Excl. VAT):</span>
                <span>KES {subtotalExclVat.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-slate-800 pt-2 border-t border-slate-200">
                <span>VAT Rate:</span>
                <select
                  value={vatPercent}
                  onChange={(e) => setVatPercent(parseFloat(e.target.value))}
                  className="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-[11px] font-bold print:border-none print:bg-transparent"
                >
                  <option value={0}>0.00 (Exempt)</option>
                  <option value={16}>16.00 (16% KRA VAT)</option>
                </select>
                <span className="font-bold">KES {vatAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-base font-extrabold text-purple-950 pt-3 border-t-2 border-purple-900">
                <span>Total (Incl. VAT):</span>
                <span>KES {grandTotalInclVat.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-xs font-bold text-purple-800 pt-2 border-t border-purple-200">
                <span>50% Booking Deposit:</span>
                <span>KES {depositRequired.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Contact Footer */}
          <div className="pt-8 border-t border-slate-200 text-center text-xs font-mono text-slate-600 space-y-1">
            <p>If you have any questions concerning this quote, kindly contact:</p>
            <p className="font-bold text-purple-950">{creatorProfile.phone} | {creatorProfile.email}</p>
            <p className="italic text-purple-800 pt-2 font-semibold">Thank you for your business!</p>
          </div>

        </div>

        {/* MODAL SEARCHABLE CATALOG FOR IN-LINE SECTION ADDITION */}
        {activeCategoryForAdd && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 text-slate-900 dark:text-white print:hidden">
            <div className="max-w-2xl w-full p-8 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-2xl space-y-6 relative shadow-2xl max-h-[85vh] overflow-y-auto">
              <button
                onClick={() => setActiveCategoryForAdd(null)}
                className="absolute top-6 right-6 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>

              <div className="space-y-1 border-b border-slate-200 dark:border-zinc-800 pb-3">
                <span className="px-2.5 py-0.5 bg-purple-600/20 text-purple-700 dark:text-purple-300 text-[10px] font-mono rounded-full uppercase font-semibold">
                  Equipment Inventory ({equipmentDatabase.length} Total Items)
                </span>
                <h2 className="text-xl font-light text-slate-900 dark:text-white mt-1">
                  Add Item to &quot;{activeCategoryForAdd}&quot;
                </h2>
              </div>

              {/* Category Filter Pills in Modal */}
              <div className="flex gap-2 overflow-x-auto py-1">
                {categoryFilterTabs.map((catName) => (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => setModalFilterCategory(catName)}
                    className={`px-3 py-1 text-[11px] font-mono uppercase rounded-full transition-all whitespace-nowrap cursor-pointer ${
                      modalFilterCategory === catName
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-400'
                    }`}
                  >
                    {catName}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search gear by name or brand (e.g. Sony FX6, Aputure 600d, Ronin RS3, Mavic)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-mono text-slate-900 dark:text-white rounded-xl focus:border-purple-600 focus:outline-none"
              />

              {/* PINNED SECTION 1: MOST POPULAR SUGGESTIONS IN CATEGORY */}
              {popularSuggestions.length > 0 && !searchQuery && (
                <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-zinc-800">
                  <p className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold uppercase">
                    ★ Most Popular in {modalFilterCategory}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {popularSuggestions.map((popItem) => (
                      <button
                        key={popItem.id}
                        type="button"
                        onClick={() => addGearFromCatalog(popItem)}
                        className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-500/40 hover:border-purple-600 rounded-lg text-xs font-mono text-slate-900 dark:text-purple-200 flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <span className="font-bold">{popItem.name}</span>
                        <span className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold">
                          (KSh {popItem.rateKes.toLocaleString()}) +
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Line Item Button */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-zinc-800">
                <span className="text-xs font-mono text-slate-500">
                  Catalog Results ({currentCategoryCatalog.length}):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    addCustomItemToCategory(activeCategoryForAdd);
                    setActiveCategoryForAdd(null);
                  }}
                  className="px-3 py-1.5 btn-secondary text-xs font-mono rounded-lg cursor-pointer"
                >
                  + Add Blank Custom Item
                </button>
              </div>

              {/* Full Equipment Catalog Search Results */}
              <div className="grid grid-cols-1 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {currentCategoryCatalog.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => addGearFromCatalog(item)}
                    className="p-3.5 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800/80 hover:border-purple-600 rounded-xl flex justify-between items-center cursor-pointer transition-all group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {item.isPopular && (
                          <span className="px-2 py-0.2 bg-amber-500/20 text-amber-600 dark:text-amber-300 text-[9px] font-mono rounded font-bold">
                            ★ POPULAR
                          </span>
                        )}
                        <p className="text-xs font-mono font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                          {item.name}
                        </p>
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 mt-0.5">
                        Brand: {item.brand} • {item.specs}
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        KSh {item.rateKes.toLocaleString()} / day
                      </span>
                      <span className="block text-[10px] text-slate-500 dark:text-zinc-400 group-hover:underline">
                        + Add to Quote
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}