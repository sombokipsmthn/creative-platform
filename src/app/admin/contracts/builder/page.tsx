'use client';

import { useSearchParams } from 'next/navigation';
import { ContractBuilder } from '@/components/contracts/ContractBuilder';

export default function ContractBuilderPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId') || undefined;

  return (
    <ContractBuilder
      mode="new"
      templateId={templateId}
    />
  );
}
