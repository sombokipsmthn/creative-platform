'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, FileText, Loader2, X } from 'lucide-react';

import {
  createContract,
  fetchClients,
  fetchContractTemplates,
  fetchProjects,
} from '@/lib/api/contracts';
import type { Client, ContractTemplate, Project } from '@/lib/types/contracts';
import type { Contract } from '@/lib/types/contracts';

type Step = 'setup' | 'details' | 'review';

const friendlyLabels: Record<string, string> = {
  effective_date: 'Agreement date',
  scope_of_work: 'What you will do',
  services_description: 'Services included',
  project_description: 'Project description',
  deliverables: 'What the client will receive',
  total_fee: 'Total fee',
  fee: 'Fee',
  monthly_fee: 'Monthly fee',
  currency: 'Currency',
  payment_terms: 'Payment terms',
  payment_schedule: 'Payment schedule',
  deposit_percentage: 'Deposit percentage',
  deposit_amount: 'Deposit amount',
  balance: 'Remaining balance',
  payment_due_date: 'Payment due date',
  start_date: 'Start date',
  end_date: 'End date',
  delivery_date: 'Delivery date',
  delivery_timeframe: 'Delivery timeframe',
  completion_date: 'Completion date',
  project_end_date: 'Project end date',
  event_date: 'Event date',
  location: 'Location',
  duration: 'Duration',
  usage_rights: 'Usage rights',
  licensing_terms: 'Licensing terms',
  revisions_policy: 'Included revisions',
  notice_period: 'Notice period',
  acceptance_period: 'Acceptance period',
  term_duration: 'Agreement length',
  payment_method: 'Payment method',
  ip_clause: 'Ownership and usage',
  format: 'File format',
  file_formats: 'File formats',
  delivery_method: 'Delivery method',
  video_type: 'Type of video',
  video_length: 'Video length',
  num_images: 'Number of images',
  num_videos: 'Number of videos',
  pre_production_dates: 'Pre-production dates',
  production_dates: 'Production dates',
  post_production_dates: 'Post-production dates',
  reschedule_notice: 'Rescheduling notice',
};

const dateFields = new Set([
  'effective_date',
  'event_date',
  'start_date',
  'end_date',
  'delivery_date',
  'completion_date',
  'project_end_date',
  'payment_due_date',
  'milestone_1_date',
  'milestone_2_date',
]);

const amountFields = new Set([
  'total_fee',
  'fee',
  'monthly_fee',
  'deposit_amount',
  'balance',
  'milestone_1_amount',
  'milestone_2_amount',
]);
const blankFields = ['services_description', 'deliverables', 'total_fee', 'payment_terms', 'start_date', 'end_date'];

function labelFor(variable: string) {
  return friendlyLabels[variable] ?? variable.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function initialValues(template: ContractTemplate | null, client: Client | null, project: Project | null) {
  const values: Record<string, string> = {
    client_name: client?.name ?? '',
    client_company: client?.company ?? '',
    client_email: client?.email ?? '',
    client_phone: client?.phone ?? '',
    client_location: client?.location ?? '',
    project_name: project?.name ?? '',
    project_description: project?.description ?? '',
    scope_of_work: project?.scopeOfWork ?? '',
    deliverables: project?.deliverables ?? '',
    total_fee: project?.totalAmount ? String(project.totalAmount) : '',
    payment_terms: project?.paymentTerms ?? '',
    revisions_policy: project?.revisionsPolicy ?? '',
    licensing_terms: project?.licensingTerms ?? '',
    notice_period: project?.noticePeriod ?? '',
    start_date: project?.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : '',
    end_date: project?.endDate ? new Date(project.endDate).toISOString().slice(0, 10) : '',
    currency: project?.currency ?? 'KES',
    effective_date: new Date().toISOString().slice(0, 10),
  };

  for (const variable of template?.variables ?? []) {
    if (values[variable] === undefined) values[variable] = '';
  }
  return values;
}

function fieldPlaceholder(variable: string) {
  if (variable.includes('rights') || variable.includes('terms') || variable.includes('policy') || variable.includes('description')) {
    return 'Add the details the client should know';
  }
  return `Enter ${labelFor(variable).toLowerCase()}`;
}

export default function NewContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTemplateId = searchParams.get('templateId');
  const [step, setStep] = useState<Step>('setup');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null | undefined>(undefined);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [currency, setCurrency] = useState('KES');
  const [error, setError] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<ContractTemplate | null>(null);

  const clientsQuery = useQuery({ queryKey: ['clients'], queryFn: fetchClients });
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });
  const templatesQuery = useQuery({ queryKey: ['contract-templates'], queryFn: fetchContractTemplates });

  const requestedTemplate = templatesQuery.data?.find((item) => item.id === requestedTemplateId) ?? null;
  const activeTemplate = selectedTemplate === undefined ? requestedTemplate : selectedTemplate;

  const variables = useMemo(
    () => (activeTemplate?.variables ?? blankFields).filter((variable) => ![
      'client_name', 'client_company', 'client_email', 'client_phone', 'project_name',
    ].includes(variable)),
    [activeTemplate],
  );

  const setValue = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const openTemplatePreview = (template: ContractTemplate) => {
    if (!selectedClient) {
      setError('Choose a client first so the preview can be personalized.');
      return;
    }
    setError('');
    setPreviewTemplate(template);
  };

  const previewContent = previewTemplate
    ? previewTemplate.content.replace(/\{\{(\w+)\}\}/g, (match, variable: string) => {
      const previewValues = initialValues(previewTemplate, selectedClient, selectedProject);
      return previewValues[variable] || `[${labelFor(variable)}]`;
    })
    : '';

  const resolvedContent = useMemo(() => {
    const content = activeTemplate?.content ?? [
      `Agreement between ${values.client_name || 'the client'} and the service provider.`,
      '',
      `Services: ${values.services_description || 'To be agreed.'}`,
      `Deliverables: ${values.deliverables || 'To be agreed.'}`,
      `Fee: ${values.total_fee ? `${values.currency || currency} ${values.total_fee}` : 'To be agreed.'}`,
      `Payment terms: ${values.payment_terms || 'To be agreed.'}`,
    ].join('\n');
    return content.replace(/\{\{(\w+)\}\}/g, (match, variable: string) => values[variable] || match);
  }, [activeTemplate, currency, values]);

  const createMutation = useMutation({
    mutationFn: createContract,
    onSuccess: (contract: Contract) => router.push(`/admin/contracts/${contract.id}`),
    onError: () => setError('We could not save this contract. Check the required fields and try again.'),
  });

  const goToDetails = () => {
    if (!selectedClient) {
      setError('Choose the client this agreement is for.');
      return;
    }
    setError('');
    setStep('details');
  };

  const goToReview = () => {
    if (!title.trim() || variables.some((variable) => !values[variable]?.trim())) {
      setError('Complete the agreement details before continuing.');
      return;
    }
    setError('');
    setStep('review');
  };

  const handleCreate = () => {
    if (!selectedClient) return;
    createMutation.mutate({
      title: title.trim(),
      content: resolvedContent,
      templateId: activeTemplate?.id,
      clientId: selectedClient.id,
      projectId: selectedProject?.id,
      currency,
    });
  };

  const loading = clientsQuery.isLoading || projectsQuery.isLoading || templatesQuery.isLoading;

  if (loading) {
    return <div className="ui-page flex min-h-screen items-center justify-center"><Loader2 className="animate-spin" /><span className="ml-3">Loading contract builder...</span></div>;
  }

  return (
    <div className="ui-page">
      <div className="mx-auto max-w-5xl">
        <button onClick={() => router.back()} className="ui-button ui-button-ghost mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="ui-page-header">
          <h1 className="ui-page-title">Create a contract</h1>
          <p className="ui-page-subtitle">Choose a starting point, fill in the agreement details, and review it before sending.</p>
        </div>

        <div className="mb-8 flex items-center gap-2 text-sm">
          {(['setup', 'details', 'review'] as Step[]).map((item, index) => (
            <div key={item} className={`flex items-center gap-2 ${step === item ? 'font-semibold text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
              <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${step === item ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-white' : 'border-[var(--color-border-strong)]'}`}>{index + 1}</span>
              <span>{item === 'setup' ? 'Set up' : item === 'details' ? 'Agreement details' : 'Review'}</span>
              {index < 2 && <ArrowRight className="h-4 w-4 text-[var(--color-text-faint)]" />}
            </div>
          ))}
        </div>

        {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {step === 'setup' && (
          <div className="flex flex-col gap-6">
            <section className="ui-card order-3">
              <div className="ui-card-header"><h2 className="ui-card-title">Choose a document</h2><p className="ui-body">Once you choose a client, preview a document with their details already added.</p></div>
              <div className="ui-card-content">
              <div className="ui-template-grid">
                <button type="button" onClick={() => { setSelectedTemplate(null); setTitle('New client agreement'); setValues(initialValues(null, selectedClient, selectedProject)); }} className={`ui-template-card text-left ${activeTemplate === null ? 'selected' : ''}`}>
                  <FileText className="mb-3 h-5 w-5 text-[var(--color-accent)]" />
                  <h3>Start from scratch</h3>
                  <p>Build a simple agreement with only the details you need.</p>
                  <span className="mt-3 block text-xs text-[var(--color-text-muted)]">Flexible</span>
                </button>
                {templatesQuery.data?.map((template) => (
                  <div key={template.id} className={`ui-template-card ${activeTemplate?.id === template.id ? 'selected' : ''}`}>
                    <FileText className="mb-3 h-5 w-5 text-[var(--color-accent)]" />
                    <h3>{template.name}</h3>
                    <p>{template.description || 'A clear starting point for your next agreement.'}</p>
                    <span className="mt-3 block text-xs text-[var(--color-text-muted)]">{template.category}</span>
                    <div className="mt-auto flex w-full gap-2 pt-4">
                      <button type="button" onClick={() => openTemplatePreview(template)} className="ui-button ui-button-secondary flex-1">
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </section>

            <section className="ui-card order-1">
              <div className="ui-card-header"><h2 className="ui-card-title">Who is this for?</h2><p className="ui-body">Client information will be added automatically wherever it belongs.</p></div>
              <div className="ui-card-content">
              {clientsQuery.data?.length ? <div className="grid gap-4 md:grid-cols-2">
                {clientsQuery.data.map((client) => (
                  <button type="button" key={client.id} onClick={() => { setSelectedClient(client); setValues(initialValues(activeTemplate, client, selectedProject)); }} className={`rounded-lg border p-4 text-left transition ${selectedClient?.id === client.id ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]' : 'border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)]'}`}>
                    <p className="font-semibold">{client.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">{client.company || client.email || 'No additional details'}</p>
                  </button>
                ))}
              </div> : <p className="ui-body">Add a client first, then return here to create an agreement for them.</p>}
              </div>
            </section>

            <section className="ui-card order-2">
              <div className="ui-card-content">
              <label className="ui-label" htmlFor="project">Related project (optional)</label>
              <select id="project" className="ui-select mt-2 max-w-xl" value={selectedProject?.id ?? ''} onChange={(event) => { const project = projectsQuery.data?.find((item) => item.id === event.target.value) ?? null; setSelectedProject(project); setValues(initialValues(activeTemplate, selectedClient, project)); }}>
                <option value="">No project</option>
                {projectsQuery.data?.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
              </div>
            </section>
          </div>
        )}

        {step === 'details' && selectedClient && (
          <section className="ui-card">
            <div className="ui-card-header"><h2 className="ui-card-title">Make it yours</h2><p className="ui-body">Fill in the details below. Your client information is already filled in.</p></div>
            <div className="ui-card-content grid gap-5 md:grid-cols-2">
              <div className="ui-form-group md:col-span-2"><label className="ui-label" htmlFor="title">Contract title</label><input id="title" className="ui-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Brand photography agreement" /></div>
              {variables.map((variable) => (
                <div key={variable} className={variable.includes('description') || variable.includes('scope') || variable.includes('rights') || variable.includes('policy') || variable.includes('terms') ? 'ui-form-group md:col-span-2' : 'ui-form-group'}>
                  <label className="ui-label" htmlFor={variable}>{labelFor(variable)}</label>
                  {variable.includes('description') || variable.includes('scope') || variable.includes('rights') || variable.includes('policy') || variable.includes('terms') ? (
                    <textarea id={variable} className="ui-textarea" rows={4} value={values[variable] ?? ''} onChange={(event) => setValue(variable, event.target.value)} placeholder={fieldPlaceholder(variable)} />
                  ) : (
                    <input id={variable} className="ui-input" type={dateFields.has(variable) ? 'date' : amountFields.has(variable) ? 'number' : 'text'} value={values[variable] ?? ''} onChange={(event) => setValue(variable, event.target.value)} placeholder={fieldPlaceholder(variable)} />
                  )}
                </div>
              ))}
              <div className="ui-form-group"><label className="ui-label" htmlFor="currency">Currency</label><select id="currency" className="ui-select" value={currency} onChange={(event) => setCurrency(event.target.value)}><option>KES</option><option>USD</option><option>EUR</option><option>GBP</option></select></div>
            </div>
          </section>
        )}

        {step === 'review' && (
          <section className="ui-card">
            <div className="ui-card-header"><h2 className="ui-card-title">Review your contract</h2><p className="ui-body">Make sure everything looks right. You can edit it later before sending.</p></div>
            <div className="mb-6 grid gap-4 rounded-lg bg-[var(--color-bg-soft)] p-5 sm:grid-cols-3"><div><p className="ui-meta">Title</p><p className="mt-1 font-medium">{title}</p></div><div><p className="ui-meta">Client</p><p className="mt-1 font-medium">{selectedClient?.name}</p></div><div><p className="ui-meta">Starting point</p><p className="mt-1 font-medium">{activeTemplate?.name ?? 'From scratch'}</p></div></div>
            <article className="max-h-[32rem] overflow-y-auto whitespace-pre-wrap rounded-lg border border-[var(--color-border-subtle)] p-6 text-sm leading-7">{resolvedContent}</article>
          </section>
        )}

        {previewTemplate && (
          <div className="ui-overlay" role="presentation" onClick={() => setPreviewTemplate(null)}>
            <section className="ui-modal ui-modal-lg max-h-[90vh] overflow-hidden p-0" role="dialog" aria-modal="true" aria-labelledby="contract-preview-title" onClick={(event) => event.stopPropagation()}>
              <header className="flex items-start justify-between border-b border-[var(--color-border-subtle)] px-6 py-5">
                <div>
                  <p className="ui-meta">{previewTemplate.category}</p>
                  <h2 id="contract-preview-title" className="mt-1 text-xl font-semibold">{previewTemplate.name}</h2>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">This preview includes the selected client and project details.</p>
                </div>
                <button type="button" aria-label="Close preview" onClick={() => setPreviewTemplate(null)} className="ui-button ui-button-ghost px-2">
                  <X className="h-5 w-5" />
                </button>
              </header>
              <div className="max-h-[calc(90vh-10rem)] overflow-y-auto px-6 py-6">
                <article className="whitespace-pre-wrap rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-soft)] p-6 text-sm leading-7">
                  {previewContent}
                </article>
                <p className="mt-4 text-xs text-[var(--color-text-muted)]">Items shown in brackets will be filled in during the agreement details step.</p>
              </div>
              <footer className="flex justify-end gap-3 border-t border-[var(--color-border-subtle)] px-6 py-4">
                <button type="button" className="ui-button ui-button-secondary" onClick={() => setPreviewTemplate(null)}>Close</button>
                <button type="button" className="ui-button ui-button-primary" onClick={() => { setSelectedTemplate(previewTemplate); setTitle(previewTemplate.name); setValues(initialValues(previewTemplate, selectedClient, selectedProject)); setPreviewTemplate(null); }}>Use this document <ArrowRight className="h-4 w-4" /></button>
              </footer>
            </section>
          </div>
        )}

        <div className="ui-step-footer">
          <button className="ui-button ui-button-secondary" onClick={() => setStep(step === 'review' ? 'details' : 'setup')}><ArrowLeft className="h-4 w-4" /> Back</button>
          {step === 'setup' && <button className="ui-button ui-button-primary" onClick={goToDetails}>Continue <ArrowRight className="h-4 w-4" /></button>}
          {step === 'details' && <button className="ui-button ui-button-primary" onClick={goToReview}>Review contract <ArrowRight className="h-4 w-4" /></button>}
          {step === 'review' && <button className="ui-button ui-button-primary" disabled={createMutation.isPending} onClick={handleCreate}>{createMutation.isPending ? <Loader2 className="animate-spin" /> : <Check className="h-4 w-4" />} Create contract</button>}
        </div>
      </div>
    </div>
  );
}
