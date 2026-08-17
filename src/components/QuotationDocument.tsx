// src/components/QuotationDocument.tsx
'use client';

import React from 'react';

export interface QuoteLineItem {
  id: string;
  section: string; // e.g. "A. Professional Fees (Core)", "Camera Package (Podcast Video)", etc.
  category: 'professional' | 'camera' | 'audio' | 'lighting' | 'data' | 'logistics' | 'postproduction' | 'extra';
  item: string;
  qty: number;
  days: number;
  rate: number; // in KES or active currency
  notes?: string;
}

export interface QuotationData {
  quoteNumber: string;
  date: string;
  clientName: string;
  clientCompany?: string;
  clientLocation?: string;
  projectFor: string;
  currency: string;
  vatRate: number; // e.g. 0 or 16
  items: QuoteLineItem[];
  paymentTerms?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function QuotationDocument({ data }: { data: QuotationData }) {
  const {
    date,
    clientName,
    clientCompany,
    clientLocation,
    projectFor,
    currency = 'KES',
    vatRate = 0,
    items,
    paymentTerms = 'A deposit of 50% is required upon booking and the other 50% payable upon delivery of all requirements. Payment details will be included with invoice before commencement of work.',
    contactPhone = '+254 722 145 776',
    contactEmail = 'somboriot@gmail.com',
  } = data;

  // Calculate categorized subtotals for the Executive Summary
  const professionalItems = items.filter((i) => i.category === 'professional');
  const equipmentItems = items.filter((i) =>
    ['camera', 'audio', 'lighting', 'data', 'extra'].includes(i.category)
  );
  const logisticsItems = items.filter((i) => i.category === 'logistics');
  const postproductionItems = items.filter((i) => i.category === 'postproduction');

  const calcSectionTotal = (list: QuoteLineItem[]) =>
    list.reduce((sum, item) => sum + (item.qty || 0) * (item.days || 1) * (item.rate || 0), 0);

  const profTotal = calcSectionTotal(professionalItems);
  const equipTotal = calcSectionTotal(equipmentItems);
  const logisticsTotal = calcSectionTotal(logisticsItems);
  const postTotal = calcSectionTotal(postproductionItems);

  const subtotalExclVat = profTotal + equipTotal + logisticsTotal + postTotal;
  const vatAmount = (subtotalExclVat * vatRate) / 100;
  const grandTotal = subtotalExclVat + vatAmount;

  // Group items by specific sectionName for the detailed table
  const sectionsOrdered = [
    { key: 'A. Professional Fees (Core)', cat: 'professional', title: 'A. Professional Fees (Core)', subtotalLabel: 'Subtotal - Professional Fees' },
    { key: 'Camera Package (Podcast Video)', cat: 'camera', title: 'Camera Package (Podcast Video)' },
    { key: 'Camera Package (Coverage Video)', cat: 'camera', title: 'Camera Package (Coverage Video)' },
    { key: 'Camera Package (Photo)', cat: 'camera', title: 'Camera Package (Photo)', subtotalLabel: 'Subtotal - Camera Package' },
    { key: 'Camera Package (Cinema)', cat: 'camera', title: 'Camera Package (Cinema & Aerial)' },
    { key: 'Audio Package', cat: 'audio', title: 'Audio Package', subtotalLabel: 'Subtotal - Audio Package' },
    { key: 'Lighting Package', cat: 'lighting', title: 'Lighting Package', subtotalLabel: 'Subtotal - Lighting Package' },
    { key: 'Data & Storage', cat: 'data', title: 'Data & Storage', subtotalLabel: 'Subtotal - Data & Storage' },
    { key: 'Extra costs', cat: 'extra', title: 'Extra costs', subtotalLabel: 'Equipment Total', isEquipFinal: true },
    { key: 'C. Travel & Logistics', cat: 'logistics', title: 'C. Travel & Logistics', subtotalLabel: 'Subtotal - Travel & Logistics' },
    { key: 'Postproduction (Per output billing)', cat: 'postproduction', title: 'Postproduction (Per output billing)', subtotalLabel: 'Postproduction Subtotal' },
  ];

  // Also collect any dynamic sections that might have been added
  const renderedSectionKeys = new Set<string>();

  return (
    <div className="quotation-print-container bg-white text-slate-900 font-sans p-8 md:p-12 max-w-[850px] mx-auto shadow-xl border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
      
      {/* 1. Header Banner */}
      <div className="flex items-start justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-wider text-[#6B21A8] uppercase">
            SOMBORIOT KIPCHILAT
          </h1>
        </div>

        <div className="text-right">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider text-[#6B21A8] uppercase">
            QUOTATION
          </h2>
          <p className="mt-2 text-xs font-semibold text-slate-700">
            <span className="text-[#6B21A8] font-bold">DATE</span> {date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* 2. Client & Project Info */}
      <div className="grid grid-cols-2 gap-8 my-6 text-xs leading-relaxed">
        <div>
          <p className="font-bold text-slate-900 uppercase text-[11px] mb-1">TO</p>
          <p className="font-bold text-slate-900 text-sm">{clientName || 'Tech Safari'}</p>
          {clientCompany && <p className="text-slate-700 font-medium">{clientCompany}</p>}
          {clientLocation && <p className="text-slate-600">{clientLocation}</p>}
        </div>

        <div className="text-right">
          <p className="text-slate-500 font-medium">
            <span className="font-bold text-[#6B21A8] uppercase text-[11px]">FOR</span> {projectFor || 'Production Services'}
          </p>
        </div>
      </div>

      {/* 3. Executive Summary Block */}
      <div className="my-6 max-w-sm">
        <table className="w-full border-collapse border border-slate-800 text-xs">
          <thead>
            <tr className="bg-purple-50/70 border-b border-slate-800">
              <th className="border-r border-slate-800 px-3 py-1.5 text-left font-bold text-slate-900">
                Summary
              </th>
              <th className="px-3 py-1.5 text-right font-bold text-slate-900">
                Totals ({currency})
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-800">
              <td className="border-r border-slate-800 px-3 py-1 text-slate-800">Professional Fees</td>
              <td className="px-3 py-1 text-right font-medium text-slate-900">{formatCurrency(profTotal)}</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="border-r border-slate-800 px-3 py-1 text-slate-800">Equipment</td>
              <td className="px-3 py-1 text-right font-medium text-slate-900">{formatCurrency(equipTotal)}</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="border-r border-slate-800 px-3 py-1 text-slate-800">Travel & Logistics</td>
              <td className="px-3 py-1 text-right font-medium text-slate-900">{formatCurrency(logisticsTotal)}</td>
            </tr>
            <tr className="border-b border-slate-800">
              <td className="border-r border-slate-800 px-3 py-1 text-slate-800">Postproduction</td>
              <td className="px-3 py-1 text-right font-medium text-slate-900">{formatCurrency(postTotal)}</td>
            </tr>
            <tr className="bg-purple-100/60 font-bold">
              <td className="border-r border-slate-800 px-3 py-1.5 text-slate-900">Total</td>
              <td className="px-3 py-1.5 text-right text-slate-900">{formatCurrency(subtotalExclVat)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. Detailed Line Items Table */}
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse border border-slate-800 text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-800 font-bold text-slate-900">
              <th className="border-r border-slate-800 px-3 py-2 text-left">Item</th>
              <th className="border-r border-slate-800 px-2 py-2 text-center w-12">Qty</th>
              <th className="border-r border-slate-800 px-2 py-2 text-center w-12">Days</th>
              <th className="border-r border-slate-800 px-3 py-2 text-right w-24">Rate ({currency})</th>
              <th className="border-r border-slate-800 px-3 py-2 text-right w-28">Total ({currency})</th>
              <th className="px-3 py-2 text-left w-48">Notes</th>
            </tr>
          </thead>
          <tbody>
            {sectionsOrdered.map((sec) => {
              const secItems = items.filter((i) => i.section === sec.key);
              if (secItems.length === 0 && !sec.isEquipFinal) return null;
              renderedSectionKeys.add(sec.key);

              const secSubtotal = calcSectionTotal(secItems);
              // Camera package subtotal combined check
              const isCameraPhotoSec = sec.key === 'Camera Package (Photo)';
              const cameraAllItems = items.filter((i) => i.category === 'camera');
              const cameraAllSubtotal = calcSectionTotal(cameraAllItems);

              return (
                <React.Fragment key={sec.key}>
                  {/* Section Title Header Row */}
                  <tr className="bg-purple-50/60 border-t border-b border-slate-800 font-bold text-slate-900">
                    <td colSpan={6} className="px-3 py-1.5 text-[#6B21A8]">
                      {sec.title}
                    </td>
                  </tr>

                  {/* Section Items */}
                  {secItems.map((item) => {
                    const rowTotal = (item.qty || 0) * (item.days || 1) * (item.rate || 0);
                    return (
                      <tr key={item.id} className="border-b border-slate-300 hover:bg-slate-50/50">
                        <td className="border-r border-slate-800 px-3 py-1.5 text-slate-900 font-medium">
                          {item.item}
                        </td>
                        <td className="border-r border-slate-800 px-2 py-1.5 text-center text-slate-700">
                          {item.qty}
                        </td>
                        <td className="border-r border-slate-800 px-2 py-1.5 text-center text-slate-700">
                          {item.days}
                        </td>
                        <td className="border-r border-slate-800 px-3 py-1.5 text-right text-slate-800 font-mono">
                          {formatCurrency(item.rate)}
                        </td>
                        <td className="border-r border-slate-800 px-3 py-1.5 text-right font-semibold text-slate-900 font-mono">
                          {formatCurrency(rowTotal)}
                        </td>
                        <td className="px-3 py-1.5 text-slate-600 text-[11px] leading-tight">
                          {item.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Section Specific Subtotal Row */}
                  {sec.subtotalLabel && !sec.isEquipFinal && (
                    <tr className="border-b border-slate-800 bg-slate-100/80 font-bold text-slate-900">
                      <td colSpan={4} className="border-r border-slate-800 px-3 py-1.5">
                        {sec.subtotalLabel}
                      </td>
                      <td className="border-r border-slate-800 px-3 py-1.5 text-right font-mono">
                        {formatCurrency(isCameraPhotoSec ? cameraAllSubtotal : secSubtotal)}
                      </td>
                      <td className="px-3 py-1.5" />
                    </tr>
                  )}

                  {/* Equipment Total Row */}
                  {sec.isEquipFinal && (
                    <tr className="border-b border-slate-800 bg-purple-100/70 font-extrabold text-slate-900">
                      <td colSpan={4} className="border-r border-slate-800 px-3 py-2 uppercase tracking-wide">
                        Equipment Total
                      </td>
                      <td className="border-r border-slate-800 px-3 py-2 text-right font-mono text-sm">
                        {formatCurrency(equipTotal)}
                      </td>
                      <td className="px-3 py-2" />
                    </tr>
                  )}
                </React.Fragment>
              );
            })}

            {/* Custom or Unmatched Sections */}
            {items
              .filter((i) => !renderedSectionKeys.has(i.section))
              .map((item) => {
                const rowTotal = (item.qty || 0) * (item.days || 1) * (item.rate || 0);
                return (
                  <tr key={item.id} className="border-b border-slate-300">
                    <td className="border-r border-slate-800 px-3 py-1.5 text-slate-900 font-medium">
                      {item.item}
                    </td>
                    <td className="border-r border-slate-800 px-2 py-1.5 text-center">{item.qty}</td>
                    <td className="border-r border-slate-800 px-2 py-1.5 text-center">{item.days}</td>
                    <td className="border-r border-slate-800 px-3 py-1.5 text-right font-mono">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="border-r border-slate-800 px-3 py-1.5 text-right font-semibold font-mono">
                      {formatCurrency(rowTotal)}
                    </td>
                    <td className="px-3 py-1.5 text-slate-600 text-[11px]">{item.notes || '—'}</td>
                  </tr>
                );
              })}

            {/* Grand Total & VAT Rows */}
            <tr className="border-t-2 border-slate-900 bg-slate-100/90 font-bold text-slate-900">
              <td colSpan={4} className="border-r border-slate-800 px-3 py-2">
                Total (Excl. VAT)
              </td>
              <td className="border-r border-slate-800 px-3 py-2 text-right font-mono text-sm">
                {formatCurrency(subtotalExclVat)}
              </td>
              <td className="px-3 py-2" />
            </tr>

            {vatRate > 0 && (
              <tr className="border-b border-slate-800 bg-slate-50 font-medium text-slate-900">
                <td colSpan={4} className="border-r border-slate-800 px-3 py-1.5">
                  VAT ({vatRate}%)
                </td>
                <td className="border-r border-slate-800 px-3 py-1.5 text-right font-mono">
                  {formatCurrency(vatAmount)}
                </td>
                <td className="px-3 py-1.5 text-[11px] text-slate-500">Value Added Tax</td>
              </tr>
            )}

            <tr className="border-b-2 border-slate-900 bg-purple-200/80 font-extrabold text-slate-950 text-sm">
              <td colSpan={4} className="border-r border-slate-800 px-3 py-2.5 uppercase tracking-wide">
                Total (Incl. VAT)
              </td>
              <td className="border-r border-slate-800 px-3 py-2.5 text-right font-mono text-base text-[#6B21A8]">
                {formatCurrency(grandTotal)}
              </td>
              <td className="px-3 py-2.5" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. Payment Terms & Contact Info Footer */}
      <div className="mt-8 pt-6 border-t border-slate-200 text-xs space-y-3">
        <div>
          <h4 className="font-bold text-[#6B21A8] text-sm mb-1">Payment Terms</h4>
          <p className="text-slate-700 leading-relaxed max-w-2xl">{paymentTerms}</p>
        </div>

        <div className="pt-2 text-slate-600">
          <p>
            If you have any questions concerning this quote kindly contact{' '}
            <span className="font-semibold text-slate-900">{contactPhone}</span> |{' '}
            <a href={`mailto:${contactEmail}`} className="text-[#6B21A8] underline font-semibold">
              {contactEmail}
            </a>
          </p>
          <p className="mt-2 font-serif italic text-slate-800 text-sm">Thank you for your business!</p>
        </div>
      </div>

      {/* Page indicator styling for print */}
      <div className="mt-12 text-center text-[10px] text-slate-400 font-mono print:block">
        Somboriot Kipchilat • Media & Production Services • Nairobi, Kenya
      </div>
    </div>
  );
}
