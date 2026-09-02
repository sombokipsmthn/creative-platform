'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import { fetchContractTemplates } from '@/lib/api/contracts';

const categories = [
  'All',
  'Photography',
  'Video',
  'Design',
  'Creative Services',
  'Consulting',
  'Events',
  'General Business',
  'Legal & Protection',
];

export default function ContractTemplatesPage() {
  const { data: templates, isLoading } = useQuery({
    queryKey: ['contract-templates'],
    queryFn: fetchContractTemplates,
  });

  const filteredTemplates = templates?.filter(t => t.isActive) || [];

  return (
    <div className="ui-page">
      <div className="ui-page-header">
        <div>
          <h1 className="ui-page-title">Contract Templates</h1>
          <p className="ui-page-subtitle">
            Start with a contract designed for the work you do.
          </p>
        </div>
      </div>

      <div className="ui-section">
        <div className="ui-section-header">
          <h2 className="ui-section-title">Template Library</h2>
        </div>
        <div className="ui-tab-group">
          {categories.map((category) => (
            <button key={category} className="ui-tab">
              {category}
            </button>
          ))}
        </div>
        <div className="ui-template-grid">
          {isLoading ? (
            <Loader2Icon className="h-8 w-8 animate-spin" />
          ) : (
            filteredTemplates.map((template) => (
              <div key={template.id} className="ui-template-card">
                <div className="ui-template-header">
                  <h3 className="ui-template-title">{template.name}</h3>
                </div>
                <p className="ui-template-description">{template.description}</p>
                <div className="ui-template-footer">
                  <Link
                    href={`/admin/contracts/new?templateId=${template.id}`}
                    className="ui-button ui-button-primary"
                  >
                    Use Template
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
