'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';

export default function NewContractPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the builder
    router.replace('/admin/contracts/builder');
  }, [router]);

  return (
    <div className="ui-page ui-page-padded"><div className="ui-shell"><AdminPageHeader title="New contract" description="Build a contract from scratch or start with a template." breadcrumb={{ label: 'Contracts', href: '/admin/contracts' }} /><div className="admin-empty-state" role="status"><Loader2 aria-hidden="true" /><p>Loading contract builder…</p></div></div></div>
  );
}
