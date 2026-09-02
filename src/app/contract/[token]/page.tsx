import { notFound } from 'next/navigation';
import ContractDocument from '@/components/documents/ContractDocument';
import { UpdateContractStatus } from '@/components/UpdateContractStatus';

type PageProps = {
  params: {
    token: string;
  };
};

export default async function ContractPage({ params }: PageProps) {
  // Contract data fetched via API in client component
  return (
    <div className="ui-page">
      <div className="ui-page-header">
        <h1 className="ui-page-title">Contract</h1>
      </div>
      <div className="ui-contract-viewer">
        <ContractDocument token={params.token} />
      </div>
      <div className="ui-contract-actions mt-6">
        <button className="ui-button ui-button-outline">
          Download PDF
        </button>
        <UpdateContractStatus token={params.token} />
      </div>
    </div>
  );
}
