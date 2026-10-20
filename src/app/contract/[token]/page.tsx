import ContractDocument from '@/components/documents/ContractDocument';
import { Button } from '@/components/ui/button';
import { UpdateContractStatus } from '@/components/UpdateContractStatus';

type PageProps = {
  params: {
    token: string;
  };
};

export default async function ContractPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <div className="ui-page">
      <div className="ui-page-header">
        <h1 className="ui-page-title">Contract</h1>
      </div>
      <div className="ui-contract-viewer">
        <ContractDocument token={token} />
      </div>
      <div className="ui-contract-actions mt-6">
        <Button variant="outline">Download PDF</Button>
        <UpdateContractStatus token={token} />
      </div>
    </div>
  );
}
