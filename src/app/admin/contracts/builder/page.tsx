'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ContractBuilder } from '@/components/contracts/ContractBuilder';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';

function ContractBuilderPageContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId') || undefined;

  return <ContractBuilder mode="new" templateId={templateId} />;
}

export default function ContractBuilderPage() {
  return (
    <div className="ui-page ui-page-padded"><div className="ui-shell"><AdminPageHeader title="Contract builder" description="Create a contract and prepare it for client signing." breadcrumb={{ label: 'Contracts', href: '/admin/contracts' }} /><Suspense fallback={<div className="admin-empty-state" aria-busy="true"><p>Loading builder…</p></div>}><ContractBuilderPageContent /></Suspense></div></div>
  );
}
