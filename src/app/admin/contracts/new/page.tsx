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
    <div className="ui-page min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="text-gray-600 dark:text-gray-400">Loading contract builder...</p>
      </div>
    </div>
  );
}
