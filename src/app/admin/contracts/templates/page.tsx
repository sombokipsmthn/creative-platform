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

import { Button } from '@/components/ui/Button';
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
    return (
      <div className="ui-page min-h-screen p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mb-4" />
          <p>Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ui-page p-6">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 p-4 mb-6">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-page">
      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                Contract Templates
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Start with a contract template designed for your creative work.
              </p>
            </div>
            <Link
              href="/admin/contracts/builder"
              className="ui-button ui-button-secondary whitespace-nowrap"
            >
              Start from Scratch
            </Link>
          </div>
        </header>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ui-input pl-10 w-full"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="ui-input w-full md:w-48"
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
              className="ui-modal ui-modal-lg max-h-[90vh] overflow-hidden p-0"
              role="dialog"
              aria-modal="true"
              aria-labelledby="template-preview-title"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="flex items-start justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-5">
                <div>
                  <p className="ui-meta">{previewTemplate.category}</p>
                  <h2 id="template-preview-title" className="mt-1 text-xl font-semibold">
                    {previewTemplate.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {previewTemplate.description}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Close preview"
                  onClick={() => setPreviewTemplate(null)}
                  className="ui-button ui-button-ghost px-2"
                >
                  ✕
                </button>
              </header>
              <div className="max-h-[calc(90vh-10rem)] overflow-y-auto px-6 py-6">
                <article className="whitespace-pre-wrap text-sm leading-7 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-xs">
                  {previewTemplate.content}
                </article>
                <p className="mt-4 text-xs text-gray-600 dark:text-gray-400">
                  Items shown as [Add field name] will be filled in as you edit the contract.
                </p>
              </div>
              <footer className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
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
                  Use Template <ArrowRight className="h-4 w-4" />
                </button>
              </footer>
            </section>
          </div>
        )}

        {/* Templates list */}
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No templates found.</p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      <FilePlus className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                        {template.name}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                        {template.category}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {template.description || 'A professional contract template for your needs.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setPreviewTemplate(template)}
                      className="ui-button ui-button-secondary text-sm"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="ui-button ui-button-primary text-sm"
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
