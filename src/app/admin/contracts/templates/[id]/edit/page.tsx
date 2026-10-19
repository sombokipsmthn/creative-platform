'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/ui/AdminPageHeader';
import { Button } from '@/components/ui/button';
import type { ContractTemplate } from '@/lib/types/contracts';

const categories = ['Photography', 'Video and production', 'Confidentiality and NDAs', 'Intellectual property and licensing', 'Model and location releases', 'Freelance and crew agreements', 'Consulting and creative services', 'General business agreements'];

export default function EditContractTemplatePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [template, setTemplate] = useState<ContractTemplate | null>(null);
  const [form, setForm] = useState({ name: '', description: '', category: categories[0], documentType: 'services', content: '', variables: '' });
  const [state, setState] = useState<'loading' | 'ready' | 'saving' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/contracts/templates/${params.id}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load this template.');
        return response.json();
      })
      .then((data: ContractTemplate) => {
        setTemplate(data);
        setForm({ name: data.name, description: data.description || '', category: data.category, documentType: data.documentType, content: data.content, variables: (data.variables || []).join(', ') });
        setState('ready');
      })
      .catch((error: unknown) => { setMessage(error instanceof Error ? error.message : 'Unable to load this template.'); setState('error'); });
  }, [params.id]);

  async function save() {
    setState('saving'); setMessage('');
    const response = await fetch(`/api/contracts/templates/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, variables: form.variables.split(',').map((item) => item.trim()).filter(Boolean) }) });
    if (!response.ok) { const data = await response.json().catch(() => null); setMessage(data?.error || 'Unable to update this template.'); setState('ready'); return; }
    router.push('/admin/contracts/templates');
  }

  if (state === 'loading') return <div className="ui-page ui-page-padded"><div className="ui-shell"><div className="ui-loading-state p-12">Loading template…</div></div></div>;
  if (state === 'error' || !template) return <div className="ui-page ui-page-padded"><div className="ui-shell"><div className="ui-card ui-empty-state p-12"><p>{message || 'Template not found.'}</p><Link className="ui-button ui-button-secondary" href="/admin/contracts/templates">Back to templates</Link></div></div></div>;

  return <div className="ui-page ui-page-padded"><div className="ui-shell space-y-8"><AdminPageHeader title={`Edit ${template.name}`} description={`Saving creates version ${(template.version || 1) + 1}; existing agreements remain unchanged.`} breadcrumb={{ label: 'Templates', href: '/admin/contracts/templates' }} />
    <div className="ui-card space-y-5 p-6"><div className="grid gap-5 md:grid-cols-2"><label className="space-y-2"><span className="ui-meta">Name</span><input className="ui-input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="space-y-2"><span className="ui-meta">Category</span><select className="ui-input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label></div><label className="space-y-2 block"><span className="ui-meta">Description</span><textarea className="ui-input min-h-24" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label className="space-y-2 block"><span className="ui-meta">Document type</span><input className="ui-input" value={form.documentType} onChange={(event) => setForm({ ...form, documentType: event.target.value })} /></label><label className="space-y-2 block"><span className="ui-meta">Variables, comma separated</span><input className="ui-input" value={form.variables} onChange={(event) => setForm({ ...form, variables: event.target.value })} placeholder="client_name, effective_date" /></label><label className="space-y-2 block"><span className="ui-meta">Document content</span><textarea className="ui-input min-h-[32rem] font-mono text-sm" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} /></label>{message && <p className="text-sm text-red-600">{message}</p>}<div className="flex justify-end gap-3"><Link className="ui-button ui-button-secondary" href="/admin/contracts/templates">Cancel</Link><Button onClick={() => void save()} disabled={state === 'saving'}>{state === 'saving' ? 'Saving…' : 'Save new version'}</Button></div></div>
  </div></div>;
}
