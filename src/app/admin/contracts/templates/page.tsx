'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, FilePlus, Loader2, RefreshCw, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import type { ContractTemplate } from '@/lib/types/contracts';

const categories = ['all', 'Photography', 'Video and production', 'Confidentiality and NDAs', 'Intellectual property and licensing', 'Model and location releases', 'Freelance and crew agreements', 'Consulting and creative services', 'General business agreements'];
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
        const response = await fetch('/api/contracts/templates', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load templates');
        const data = await response.json();
        setTemplates(data);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };
    loadTemplates();
  }, []);

  const handleCreate = () => {
    router.push('/admin/contracts/templates/new');
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/contracts/templates', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to refresh templates');
      const data = await response.json();
      setTemplates(data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to refresh templates');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  }).filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="ui-page ui-page-padded">
      <div className="ui-shell">
        <AdminPageHeader
          title="Contract Templates"
          description="Manage reusable contract templates for faster document creation."
          breadcrumb={{ label: 'Dashboard', href: '/admin' }}
          primaryAction={
            <Button onClick={handleCreate} variant="primary">
              + New Template
            </Button>
          }
        />

        <div className="space-y-6">
          <div className="ui-card">
            <div className="ui-card-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="ui-input pl-9 w-full sm:w-64"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="ui-select"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={handleRefresh} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button variant="primary" onClick={handleCreate}>
                  <FilePlus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </div>
            </div>

            <div className="ui-card-content">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
              ) : error ? (
                <div className="p-4 text-red-600 dark:text-red-400">{error}</div>
              ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500 dark:text-slate-400">No templates found.</p>
                  <Button onClick={handleCreate} variant="primary" className="mt-4">
                    Create your first template
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="ui-card ui-card-interactive p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 dark:text-white">{template.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{template.category}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{template.description}</p>
                        </div>
                        <ArrowRight className="text-slate-400 h-5 w-5 shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-zinc-800">
                        <Button variant="secondary" size="sm" onClick={() => router.push(`/admin/contracts/templates/${template.id}/edit`)}>
                          Edit
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => router.push(`/admin/contracts/templates/${template.id}`)}>
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}