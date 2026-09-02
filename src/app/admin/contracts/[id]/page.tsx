'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2Icon, DownloadIcon, MailIcon } from 'lucide-react';
import { fetchContract, updateContract, sendContract } from '@/lib/api/contracts';
import ContractEditor from '@/components/ContractEditor';
import ContractEvents from '@/components/ContractEvents';
import { useState } from 'react';
import { sendEmail } from '@/lib/email';
import type { UpdateContractInput } from '@/lib/api/contracts';

export default function ContractPage() {
  const { id } = useParams();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ to: '', subject: '', message: '' });
  
  const { data: contract, isLoading } = useQuery({
    queryKey: ['contract', id],
    queryFn: () => fetchContract(id as string),
  });

  const { mutate: updateContractMutation } = useMutation({
    mutationFn: (data: UpdateContractInput) => updateContract(id as string, data),
  });

  const { mutate: sendContractMutation } = useMutation({
    mutationFn: () => sendContract(id as string),
    onSuccess: () => {
      setShowEmailModal(false);
    },
  });

  const handleSave = (content: string) => {
    updateContractMutation({ content });
  };

  const handleSend = () => {
    setShowEmailModal(true);
  };

  const handleSendEmail = async () => {
    await sendEmail({
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.message,
    });
    sendContractMutation();
  };

  if (isLoading) {
    return (
      <div className="ui-page flex h-[20vh] items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!contract) return <div>Contract not found</div>;

  return (
    <div className="ui-page">
      <div className="ui-page-header">
        <div>
          <h1 className="ui-page-title">{contract.title}</h1>
        </div>
        <div className="flex gap-2">
          <button className="ui-button ui-button-outline">
            <DownloadIcon className="h-4 w-4" />
            Download PDF
          </button>
          <button 
            onClick={handleSend}
            className="ui-button ui-button-primary"
          >
            <MailIcon className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>

      <div className="ui-contract-container">
        <div className="ui-contract-editor">
          <ContractEditor contract={contract} onUpdate={handleSave} />
        </div>

        <div className="ui-contract-sidebar">
          <ContractEvents contractId={id as string} />
          
          <div className="ui-contract-metadata">
            <h3>Contract Details</h3>
            <dl>
              <dt>Client</dt>
              <dd>{contract.client?.name || 'N/A'}</dd>
              <dt>Project</dt>
              <dd>{contract.project?.name || 'N/A'}</dd>
              <dt>Status</dt>
              <dd><span className="ui-badge">{contract.status}</span></dd>
              <dt>Created</dt>
              <dd>{new Date(contract.createdAt).toLocaleDateString()}</dd>
              <dt>Contract Number</dt>
              <dd>{contract.contractNumber}</dd>
              <dt>Token</dt>
              <dd><code>{contract.token}</code></dd>
            </dl>
          </div>
          
          <div className="ui-contract-actions">
            <button 
              onClick={() => handleSave(contract.content || '')}
              className="ui-button ui-button-primary w-full mb-2"
            >
              Save
            </button>
            <button className="ui-button ui-button-secondary w-full mb-2">
              Preview
            </button>
            <button className="ui-button ui-button-success w-full">
              Duplicate
            </button>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="ui-card w-full max-w-md">
            <div className="ui-card-header">
              <h2 className="ui-card-title">Send Contract</h2>
            </div>
            <div className="ui-card-content">
              <div className="ui-form-group">
                <label>To</label>
                <input
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData({ ...emailData, to: e.target.value })}
                  className="ui-input"
                  placeholder={contract.client?.email || 'Client email'}
                />
              </div>
              <div className="ui-form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  className="ui-input"
                  placeholder={`Contract for ${contract.project?.name || 'your project'}`}
                />
              </div>
              <div className="ui-form-group">
                <label>Message</label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  className="ui-input"
                  rows={4}
                  placeholder="Enter your message..."
                />
              </div>
            </div>
            <div className="ui-card-footer">
              <button 
                onClick={() => setShowEmailModal(false)}
                className="ui-button ui-button-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendEmail}
                className="ui-button ui-button-primary"
              >
                Send Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
