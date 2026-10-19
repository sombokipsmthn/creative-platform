'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FilePlus,
  Loader2,
  Search,
  ArrowRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import type { ContractTemplate } from '@/lib/types/contracts';

export default function ContractTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<ContractTemplate | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/contracts/templates?search=${encodeURIComponent(search)}&category=${selectedCategory}`,
          {
            cache: 'no-store',
          }
        );
        if (!res.ok) throw new Error('Failed to fetch templates');
        const data = await res.json();
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    void loadTemplates();
  }, [search, selectedCategory]);

  const handleUseTemplate = (template: ContractTemplate) => {
    router.push(`/admin/contracts/builder?templateId=${template.id}`);
  };

  if (loading) {
    return <div className="ui-page ui-page-padded"><div className="ui-shell"><div className="admin-empty-state" role="status"><Loader2 aria-hidden="true" /><p>Loading templates…</p></div></div></div>;
  }

  if (error) {
    return <div className="ui-page ui-page-padded"><div className="ui-shell"><div className="ui-card admin-empty-state" role="alert"><p>{error}</p><Button variant="outline" onClick={() => window.location.reload()}>Retry</Button></div></div></div>;
  }

  return (
    <div className="ui-page ui-page-padded">
      <div className="ui-shell">
        <AdminPageHeader title="Contract templates" description="Start with a contract template designed for your creative work." breadcrumb={{ label: 'Contracts', href: '/admin/contracts' }} primaryAction={<Link href="/admin/contracts/builder" className="ui-button ui-button-secondary">Start from scratch</Link>} />

        {/* Filters */}
        <div className="">
          <div className="">
            <Search className="" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ui-input"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="ui-input"
          >
            <option value="all">All Categories</option>
            <option value="Photography">Photography</option>
            <option value="Video">Video</option>
            <option value="Design">Design</option>
            <option value="Creative Services">Creative Services</option>
            <option value="Consulting">Consulting</option>
            <option value="Events">Events</option>
            <option value="General Business">General Business</option>
            <option value="Legal & Protection">Legal & Protection</option>
          </select>
        </div>

        {/* Template preview modal */}
        {previewTemplate && (
          <div
            className="ui-overlay"
            role="presentation"
            onClick={() => setPreviewTemplate(null)}
          >
            <section
              className="ui-modal ui-modal-lg"
              role="dialog"
              aria-modal="true"
              aria-labelledby="template-preview-title"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="">
                <div>
                  <p className="ui-meta">{previewTemplate.category}</p>
                  <h2 id="template-preview-title" className="">
                    {previewTemplate.name}
                  </h2>
                  <p className="">
                    {previewTemplate.description}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close preview"
                  onClick={() => setPreviewTemplate(null)}
                  className="ui-button ui-button-ghost"
                >
                  ✕
                </button>
              </header>
              <div className="">
                <article className="">
                  {previewTemplate.content}
                </article>
                <p className="">
                  Items shown as [Add field name] will be filled in as you edit the contract.
                </p>
              </div>
              <footer className="">
                <button
                  type="button"
                  className="ui-button ui-button-secondary"
                  onClick={() => setPreviewTemplate(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="ui-button ui-button-primary"
                  onClick={() => {
                    handleUseTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                >
                  Use Template <ArrowRight className="" />
                </button>
              </footer>
            </section>
          </div>
        )}

        {/* Templates list */}
        <div className="">
          {templates.length === 0 ? (
            <div className="">
              <p className="">No templates found.</p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className=""
              >
                <div className="">
                  <div className="">
                    <div className="">
                      <FilePlus className="" />
                    </div>
                    <div className="">
                      <h2 className="">
                        {template.name}
                      </h2>
                      <p className="">
                        {template.category}
                      </p>
                      <p className="">
                        {template.description || 'A professional contract template for your needs.'}
                      </p>
                    </div>
                  </div>
                  <div className="">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="ui-button ui-button-secondary"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="ui-button ui-button-primary"
                    >
                      Use
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
