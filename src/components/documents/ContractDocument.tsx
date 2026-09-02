'use client';

import { useEffect, useState } from 'react';
import { fetchContractByToken } from '@/lib/api/contracts';
import type { Contract } from '@/lib/api/contracts';

type ContractDocumentProps = {
  token: string;
};

export default function ContractDocument({ token }: ContractDocumentProps) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContractByToken(token).then(setContract).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (!contract) return <div>Contract not found</div>;

  return (
    <div className="bg-white text-slate-900 print:bg-white">
      <div className="mx-auto max-w-5xl px-8 py-10 sm:px-12 sm:py-14">
        {/* HEADER */}
        <div className="flex flex-col gap-8 border-b border-slate-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.35em] text-purple-600">
              Contract
            </p>
            <h1 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl">
              {contract.title}
            </h1>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
              Contract
            </p>
            <p className="mt-1 text-lg font-medium">{contract.contractNumber}</p>
            <div className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-600">
              {contract.status}
            </div>
          </div>
        </div>

        {/* META */}
        <div className="grid grid-cols-1 gap-8 border-b border-slate-200 py-8 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Client
            </p>
            <div className="mt-2 space-y-1 text-sm">
              <p className="font-medium">{contract.client?.name || 'N/A'}</p>
              {contract.client?.email && (
                <p className="text-slate-500">{contract.client.email}</p>
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Created
            </p>
            <p className="mt-2 text-sm">
              {new Date(contract.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="py-8">
          <div className="prose lg:prose-xl">
            <p className="whitespace-pre-wrap">{contract.content || 'No content'}</p>
          </div>
        </div>

        {/* SIGNATURE SECTION */}
        <div className="mt-12">
          <div className="grid grid-cols-1 gap-6 pt-8 border-t border-slate-200 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Creator Signature
              </p>
              <div className="mt-4 h-20 border border-slate-300 rounded" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Client Signature
              </p>
              <div className="mt-4 h-20 border border-slate-300 rounded" />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-12 border-t border-slate-200 pt-6 text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400">
            This is a legally binding agreement.
          </p>
        </div>
      </div>
    </div>
  );
}
