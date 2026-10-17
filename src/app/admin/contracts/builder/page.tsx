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
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Loading contract builder…
          </p>
        </div>
      }
    >
      <ContractBuilderPageContent />
    </Suspense>
  );
}
