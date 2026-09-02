'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateContractStatus } from '@/lib/api/contracts';

type UpdateContractStatusProps = {
  token: string;
};

export function UpdateContractStatus({ token }: UpdateContractStatusProps) {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSign = async () => {
    setStatus('loading');
    try {
      await updateContractStatus(token, 'signed');
      setStatus('success');
      router.refresh();
    } catch {
      setStatus('error');
    }
  };

  const handleDecline = async () => {
    setStatus('loading');
    try {
      await updateContractStatus(token, 'declined');
      setStatus('success');
      router.refresh();
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-wrap gap-4">
      {status === 'loading' && <span>Processing...</span>}
      {status === 'success' && <span className="text-green-600">Completed!</span>}
      {status === 'error' && <span className="text-red-600">Failed. Please try again.</span>}
      {!['loading', 'success'].includes(status) && (
        <>
          <button onClick={handleSign} className="ui-button ui-button-primary">
            Accept & Sign
          </button>
          <button onClick={handleDecline} className="ui-button ui-button-danger">
            Decline
          </button>
        </>
      )}
    </div>
  );
}
