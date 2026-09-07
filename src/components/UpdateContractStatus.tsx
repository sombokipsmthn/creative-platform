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
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [action, setAction] = useState<'signed' | 'declined' | null>(null);

  const handleAction = async (nextStatus: 'signed' | 'declined') => {
    if (signerName.trim().length < 2 || !signerEmail.includes('@') || !consent) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    setAction(nextStatus);
    try {
      await updateContractStatus(token, nextStatus, { signerName, signerEmail });
      setStatus('success');
      router.refresh();
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="space-y-4">
      {status === 'loading' && <span>Recording your response...</span>}
      {status === 'success' && <span className="text-green-600">{action === 'signed' ? 'Signed successfully.' : 'Response recorded.'}</span>}
      {status === 'error' && <span className="text-red-600">Enter your name and a valid email, then try again.</span>}
      {!['loading', 'success'].includes(status) && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="ui-input" placeholder="Your full name" value={signerName} onChange={(event) => setSignerName(event.target.value)} />
            <input className="ui-input" type="email" placeholder="Your email address" value={signerEmail} onChange={(event) => setSignerEmail(event.target.value)} />
          </div>
          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
            <span>I agree that typing my name records my electronic signature for this agreement.</span>
          </label>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => void handleAction('signed')} className="ui-button ui-button-primary">Accept & Sign</button>
            <button onClick={() => void handleAction('declined')} className="ui-button ui-button-danger">Decline</button>
          </div>
        </>
      )}
    </div>
  );
}
