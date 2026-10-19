'use client';

import { useEffect, useState } from 'react';
import { fetchContractByToken } from '@/lib/api/contracts';
import type { Contract } from '@/lib/api/contracts';

type ContractDocumentProps = {
  token: string;
};

export default function ContractDocument({ token }: ContractDocumentProps) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContractByToken(token).then(setContract).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (!contract) return <div>Contract not found</div>;

  return (
    <div className="">
      <div className="">
        {/* HEADER */}
        <div className="">
          <div>
            <p className="">
              Contract
            </p>
            <h1 className="">
              {contract.title}
            </h1>
          </div>
          <div className="">
            <p className="">
              Contract
            </p>
            <p className="">{contract.contractNumber}</p>
            <div className="">
              {contract.status}
            </div>
          </div>
        </div>

        {/* META */}
        <div className="">
          <div>
            <p className="">
              Client
            </p>
            <div className="">
              <p className="">{contract.client?.name || 'N/A'}</p>
              {contract.client?.email && (
                <p className="">{contract.client.email}</p>
              )}
            </div>
          </div>
          <div>
            <p className="">
              Created
            </p>
            <p className="">
              {new Date(contract.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="py-8">
          <div className="typeset typeset-docs max-w-[37em]">
            <div className="prose lg:prose-xl">
              <p className="whitespace-pre-wrap">{contract.content || 'No content'}</p>
            </div>
          </div>
        </div>

        {/* SIGNATURE SECTION */}
        <div className="">
          <div className="">
            <div>
              <p className="">
                Creator Signature
              </p>
              <div className="" />
            </div>
            <div>
              <p className="">
                Client Signature
              </p>
              <div className="" />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="">
          <p className="">
            This is a legally binding agreement.
          </p>
        </div>
      </div>
    </div>
  );
}
