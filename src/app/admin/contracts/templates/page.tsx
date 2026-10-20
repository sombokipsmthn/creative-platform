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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ContractTemplate } from '@/lib/types/contracts';

export default function ContractTemplatesPage() {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<ContractTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
        const nextTemplates = Array.isArray(data) ? data : data?.templates;
        if (!Array.isArray(nextTemplates)) throw new Error('Invalid template response');
        setTemplates(nextTemplates);
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
      <div className="min-h-screen min-h-screen p-6">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 p-4 mb-6">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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
            <Button asChild variant="secondary" className="whitespace-nowrap"><Link href="/admin/contracts/builder">Start from Scratch</Link></Button>
          </div>
        </header>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input type="text" placeholder="Search templates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 w-full" />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Categories</SelectItem><SelectItem value="Photography">Photography</SelectItem><SelectItem value="Video">Video</SelectItem><SelectItem value="Design">Design</SelectItem><SelectItem value="Creative Services">Creative Services</SelectItem><SelectItem value="Consulting">Consulting</SelectItem><SelectItem value="Events">Events</SelectItem><SelectItem value="General Business">General Business</SelectItem><SelectItem value="Legal & Protection">Legal & Protection</SelectItem></SelectContent>
          </Select>
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
                  <p className="text-sm text-muted-foreground">{previewTemplate.category}</p>
                  <h2 id="template-preview-title" className="mt-1 text-xl font-semibold">
                    {previewTemplate.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {previewTemplate.description}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Close preview" onClick={() => setPreviewTemplate(null)} className="px-2">✕</Button>
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
                <Button type="button" variant="secondary" onClick={() => setPreviewTemplate(null)}>Close</Button>
                <Button type="button" variant="primary" onClick={() => { handleUseTemplate(previewTemplate); setPreviewTemplate(null); }}>Use Template <ArrowRight className="h-4 w-4" /></Button>
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
              <article
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/15 text-primary dark:text-primary">
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
                    <Button onClick={() => setPreviewTemplate(template)} variant="secondary" size="sm">Preview</Button>
                    <Button onClick={() => handleUseTemplate(template)} variant="primary" size="sm">Use</Button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
