'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, FilePlus, Loader2, RefreshCw, Search } from 'lucide-react';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';
import type { ContractTemplate } from '@/lib/types/contracts';

const categories = ['all', 'Photography', 'Video and production', 'Confidentiality and NDAs', 'Intellectual property and licensing', 'Model and location releases', 'Freelance and crew agreements', 'Consulting and creative services', 'General business agreements'];

export default function ContractTemplatesPage() {
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [preview, setPreview] = useState<ContractTemplate | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setState('loading'); setError('');
    try {
      const response = await fetch(`/api/contracts/templates?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(response.status === 401 ? 'Please sign in to view templates.' : 'Unable to load contract templates.');
      const data = await response.json();
      const list = Array.isArray(data) ? data : data?.templates;
      if (!Array.isArray(list)) throw new Error('The template response was malformed.');
      setTemplates(list); setState('ready');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to load contract templates.'); setState('error'); }
  }, [search, category]);

  useEffect(() => { void load(); }, [load]);

  async function duplicate(template: ContractTemplate) {
    const response = await fetch(`/api/contracts/templates/${template.id}`, { method: 'POST' });
    if (!response.ok) setError('Unable to duplicate this template.'); else void load();
  }

  async function archive(template: ContractTemplate) {
    if (!window.confirm(`Archive ${template.name}?`)) return;
    const response = await fetch(`/api/contracts/templates/${template.id}`, { method: 'DELETE' });
    if (!response.ok) setError('Unable to archive this template.'); else void load();
  }

  return <div className="ui-page ui-page-padded"><div className="ui-shell space-y-8">
    <AdminPageHeader title="Contract templates" description="Use reviewed starting points for photography, production, licensing and business agreements." breadcrumb={{ label: 'Contracts', href: '/admin/contracts' }} primaryAction={<Link href="/admin/contracts/builder" className="ui-button ui-button-secondary">Start from scratch</Link>} />
    <div className="flex flex-wrap gap-3"><div className="relative min-w-64 flex-1"><Search className="absolute left-3 top-3 h-4 w-4" /><input className="ui-input pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search templates" /></div><select className="ui-input" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item} value={item}>{item === 'all' ? 'All categories' : item}</option>)}</select><Button variant="outline" onClick={() => void load()}><RefreshCw className="h-4 w-4" /> Refresh</Button></div>
    {state === 'loading' && <div className="ui-empty-state p-12"><Loader2 className="animate-spin" /><p>Loading templates…</p></div>}
    {state === 'error' && <div className="ui-card ui-empty-state p-12"><p>{error}</p><Button variant="outline" onClick={() => void load()}>Retry</Button></div>}
    {state === 'ready' && templates.length === 0 && <div className="ui-card ui-empty-state p-12"><FilePlus /><h2 className="ui-section-title">No templates found</h2><p className="ui-body">Try another search or start a contract from scratch.</p><Link href="/admin/contracts/builder" className="ui-button ui-button-primary">Start from scratch</Link></div>}
    {state === 'ready' && templates.length > 0 && <div className="grid gap-4 md:grid-cols-2">{templates.map((template) => <article className="ui-card flex flex-col gap-5 p-5" key={template.id}><div className="flex items-start justify-between gap-4"><div><p className="ui-meta">{template.category} · {template.isSystemTemplate ? 'Built-in' : 'Custom'} · v{template.version || 1}</p><h2 className="ui-section-title mt-2">{template.name}</h2></div><FilePlus className="h-5 w-5" /></div><p className="ui-body flex-1">{template.description || 'A reusable contract starting point.'}</p><p className="ui-meta">{template.variables?.length || 0} fields · Review: {template.reviewStatus || 'unreviewed'}</p><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setPreview(template)}>Preview</Button>{!template.isSystemTemplate && <><Link className="ui-button ui-button-secondary" href={`/admin/contracts/templates/${template.id}/edit`}>Edit</Link><Button variant="outline" onClick={() => void duplicate(template)}>Duplicate</Button><Button variant="outline" onClick={() => void archive(template)}>Archive</Button></>}<Link href={`/admin/contracts/builder?templateId=${template.id}`} className="ui-button ui-button-primary">Use template <ArrowRight className="h-4 w-4" /></Link></div></article>)}</div>}
    {preview && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" role="presentation" onClick={() => setPreview(null)}><section className="w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-background shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="template-preview-title" onClick={(event) => event.stopPropagation()}><header className="flex items-start justify-between gap-4 border-b border-border px-6 py-5"><div><p className="ui-meta">{preview.category} · {preview.isSystemTemplate ? 'Built-in' : 'Custom'} · v{preview.version || 1}</p><h2 id="template-preview-title" className="ui-section-title mt-1">{preview.name}</h2><p className="ui-body mt-1">{preview.description}</p></div><Button variant="ghost" onClick={() => setPreview(null)}>Close</Button></header><article className="max-h-[65vh] overflow-y-auto whitespace-pre-wrap px-6 py-6 text-sm leading-7">{preview.content}</article><footer className="flex justify-end gap-2 border-t border-border px-6 py-4"><Button variant="outline" onClick={() => setPreview(null)}>Cancel</Button><Link href={`/admin/contracts/builder?templateId=${preview.id}`} className="ui-button ui-button-primary">Use template <ArrowRight className="h-4 w-4" /></Link></footer></section></div>}
  </div></div>;
}
