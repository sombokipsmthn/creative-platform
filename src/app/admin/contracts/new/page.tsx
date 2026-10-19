'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function NewContractPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the builder
    router.replace('/admin/contracts/builder');
  }, [router]);

  return (
    <div className="ui-page">
      <div className="">
        <Loader2 className="" />
        <p className="">Loading contract builder...</p>
      </div>
    </div>
  );
}
