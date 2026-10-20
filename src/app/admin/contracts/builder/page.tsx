'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ContractBuilder } from '@/components/contracts/ContractBuilder';

function ContractBuilderInner() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId') || undefined;

  return (
    <ContractBuilder
      mode="new"
      templateId={templateId}
    />
  );
}

export default function ContractBuilderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContractBuilderInner />
    </Suspense>
  );
}