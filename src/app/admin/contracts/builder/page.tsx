'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ContractBuilder } from '@/components/contracts/ContractBuilder';

function ContractBuilderPageContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId') || undefined;

  return <ContractBuilder mode="new" templateId={templateId} />;
}

export default function ContractBuilderPage() {
  return (
    <Suspense fallback={<div className="" aria-busy="true" />}>
      <ContractBuilderPageContent />
    </Suspense>
  );
}
