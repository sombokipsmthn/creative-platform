'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Loader2,
  AlertCircle,
  Save,
  Send,
  Copy,
  Edit2,
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';

import type { Contract, ContractTemplate, Client, Project } from '@/lib/types/contracts';
import { createContract, updateContract, fetchClients, fetchProjects } from '@/lib/api/contracts';
import { ContractDocument } from './ContractDocument';

interface ContractBuilderProps {
  mode: 'new' | 'edit';
  contractId?: string;
  initialContract?: Contract | null;
  templateId?: string;
}

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

const requiredFields = new Set(['total_fee', 'payment_terms', 'start_date', 'end_date']);

function labelFor(variable: string) {
  return (
    friendlyLabels[variable] ??
    variable.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

function getRequiredFields(template: ContractTemplate | null): Set<string> {
  const required = new Set(requiredFields);
  return required;
}

function initialValues(
  template: ContractTemplate | null,
  client: Client | null,
  project: Project | null
) {
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
    start_date: project?.startDate
      ? new Date(project.startDate).toISOString().slice(0, 10)
      : '',
    end_date: project?.endDate ? new Date(project.endDate).toISOString().slice(0, 10) : '',
    currency: project?.currency ?? 'KES',
    effective_date: new Date().toISOString().slice(0, 10),
  };

  for (const variable of template?.variables ?? []) {
    if (values[variable] === undefined) values[variable] = '';
  }
  return values;
}

export function ContractBuilder({
  mode,
  contractId,
  initialContract,
  templateId,
}: ContractBuilderProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialContract?.title ?? '');
  
  // Extract client from contract if it has id, otherwise null
  const getClientFromContract = (): Client | null => {
    if (!initialContract?.client) return null;
    const c = initialContract.client;
    // Check if it looks like a full Client object with id
    if ('id' in c && c.id) {
      return c as Client;
    }
    return null;
  };

  const getProjectFromContract = (): Project | null => {
    if (!initialContract?.project) return null;
    const p = initialContract.project;
    if ('id' in p && p.id) {
      return p as Project;
    }
    return null;
  };

  const [selectedClient, setSelectedClient] = useState<Client | null>(
    getClientFromContract()
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    getProjectFromContract()
  );
  const [values, setValues] = useState<Record<string, string>>({});
  const [currency, setCurrency] = useState(initialContract?.currency ?? 'KES');
  const [template, setTemplate] = useState<ContractTemplate | null>(null);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const clientsQuery = useQuery({ queryKey: ['clients'], queryFn: fetchClients });
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });

  // Fetch template by ID
  const templatesQuery = useQuery({
    queryKey: ['contract-templates'],
    queryFn: async () => {
      const res = await fetch('/api/contracts/templates');
      if (!res.ok) throw new Error('Failed to fetch templates');
      return res.json();
    },
    enabled: !!templateId,
  });

  // Set template when it's loaded
  useEffect(() => {
    if (templateId && templatesQuery.data && !template) {
      const found = templatesQuery.data.find((t: ContractTemplate) => t.id === templateId);
      if (found) setTemplate(found);
    }
  }, [templateId, templatesQuery.data, template]);

  // Initialize values
  useEffect(() => {
    const init = initialValues(template, selectedClient, selectedProject);
    setValues(init);
  }, [template, selectedClient, selectedProject]);

  const requiredFieldsSet = useMemo(() => getRequiredFields(template), [template]);

  const resolvedContent = useMemo(() => {
    const content = template?.content ?? '';
    return content.replace(/\{\{(\w+)\}\}/g, (match, variable: string) => {
      const val = values[variable];
      if (!val || val.trim() === '') {
        return `[Add ${labelFor(variable).toLowerCase()}]`;
      }
      return val;
    });
  }, [template, values]);

  const missingFields = useMemo(() => {
    const missing: string[] = [];
    for (const field of requiredFieldsSet) {
      if (!values[field] || !values[field].trim()) {
        missing.push(field);
      }
    }
    return missing;
  }, [values, requiredFieldsSet]);

  const completionPercentage = useMemo(() => {
    if (requiredFieldsSet.size === 0) return 100;
    const completed = requiredFieldsSet.size - missingFields.length;
    return Math.round((completed / requiredFieldsSet.size) * 100);
  }, [requiredFieldsSet, missingFields]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (mode === 'edit' && contractId) {
        return updateContract(contractId, {
          title: title.trim(),
          content: resolvedContent,
          currency,
        });
      } else {
        if (!selectedClient) throw new Error('Please select a client');
        return createContract({
          title: title.trim(),
          clientId: selectedClient.id,
          projectId: selectedProject?.id,
          templateId: template?.id,
          content: resolvedContent,
          currency,
        });
      }
    },
    onSuccess: (contract) => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      if (mode === 'new') {
        // For new contracts, navigate to the detail page
        router.push(`/admin/contracts/${contract.id}`);
      }
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to save contract');
    },
  });

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await saveMutation.mutateAsync();
    } catch (err) {
      setSaveStatus('idle');
    }
  };

  const handleValidateAndSend = async () => {
    const errors = [];
    for (const field of requiredFieldsSet) {
      if (!values[field] || !values[field].trim()) {
        errors.push(field);
      }
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaveStatus('saving');
    try {
      const contract = await saveMutation.mutateAsync();
      
      // Send the contract
      const res = await fetch(`/api/contracts/${contract.id}/send`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to send contract');
      
      router.push('/admin/contracts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send contract');
      setSaveStatus('idle');
    }
  };

  const setValue = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setValidationErrors((errs) => errs.filter((e) => e !== key));
  };

  const isLoading = clientsQuery.isLoading || projectsQuery.isLoading;

  return (
    <div className="ui-page py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => router.back()} className="ui-button ui-button-ghost">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-4">
            {saveStatus === 'saving' && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Check className="h-4 w-4" />
                Saved
              </div>
            )}
          </div>
        </div>

        {/* Error messages */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Validation errors */}
        {validationErrors.length > 0 && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{validationErrors.length} items need your attention</p>
                <ul className="mt-2 space-y-1">
                  {validationErrors.map((field) => (
                    <li key={field}>• {labelFor(field)}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Document Info Bar */}
        <div className="mb-6 rounded-lg bg-white dark:bg-gray-800 px-6 py-4 border border-gray-200 dark:border-gray-700">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Contract Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Brand Photography Agreement"
                className="ui-input w-full text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Client
              </label>
              <select
                value={selectedClient?.id ?? ''}
                onChange={(e) => {
                  const client = clientsQuery.data?.find((c) => c.id === e.target.value) ?? null;
                  setSelectedClient(client);
                }}
                className="ui-input w-full text-sm"
                disabled={mode === 'edit'}
              >
                <option value="">Select a client...</option>
                {clientsQuery.data?.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                    {client.company ? ` (${client.company})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Project (optional)
              </label>
              <select
                value={selectedProject?.id ?? ''}
                onChange={(e) => {
                  const project = projectsQuery.data?.find((p) => p.id === e.target.value) ?? null;
                  setSelectedProject(project);
                }}
                className="ui-input w-full text-sm"
              >
                <option value="">No project</option>
                {projectsQuery.data?.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Completion indicator */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Contract completion
              </p>
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                {completionPercentage}%
              </p>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              {requiredFieldsSet.size - missingFields.length} of {requiredFieldsSet.size} required
              fields complete
            </p>
          </div>
        </div>

        {/* Document */}
        <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 shadow-sm mb-6">
          <div className="max-w-2xl mx-auto">
            {/* Title */}
            {title && (
              <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-50">{title}</h1>
            )}

            {/* Contract document */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ContractDocument content={resolvedContent} />
            </div>
          </div>
        </div>

        {/* Action footer */}
        <div className="flex gap-3 justify-between items-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Editing {mode === 'new' ? 'new contract' : 'draft'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending || saveStatus === 'saving'}
              className="ui-button ui-button-secondary"
            >
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Draft
                </>
              )}
            </button>

            {mode === 'edit' && (
              <button
                onClick={handleValidateAndSend}
                className="ui-button ui-button-primary"
                disabled={saveMutation.isPending}
              >
                <Send className="h-4 w-4" /> Send Contract
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
