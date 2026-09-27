'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Loader2,
  AlertCircle,
  Save,
  Send,
  Copy,
} from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';

import type { Contract, ContractTemplate, Client, Project } from '@/lib/types/contracts';
import { createContract, updateContract, fetchClients, fetchProjects } from '@/lib/api/contracts';
import { EditableContractDocument } from './EditableContractDocument';
import {
  getFieldMetadata,
  getRequiredFields,
  getClientFields,
  getProjectFields,
} from '@/lib/contracts/fieldMetadata';

interface ContractBuilderProps {
  mode: 'new' | 'edit';
  contractId?: string;
  initialContract?: Contract | null;
  templateId?: string;
}

/**
 * Contract builder with document-first editing
 * All template variables become editable inline fields
 */
export function ContractBuilder({
  mode,
  contractId,
  initialContract,
  templateId,
}: ContractBuilderProps) {
  const router = useRouter();

  // State
  const [title, setTitle] = useState(initialContract?.title ?? '');
  const [selectedClient, setSelectedClient] = useState<Client | null>(
    initialContract?.client && 'id' in initialContract.client ? (initialContract.client as Client) : null
  );
  const [selectedProject, setSelectedProject] = useState<Project | null>(
    initialContract?.project && 'id' in initialContract.project ? (initialContract.project as Project) : null
  );
  const [template, setTemplate] = useState<ContractTemplate | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [currency, setCurrency] = useState(initialContract?.currency ?? 'KES');
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [step, setStep] = useState(1); // 1: build, 2: attach/confirm
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    status: 'active',
    startDate: '',
    endDate: '',
    description: '',
  });

  // Queries
  const clientsQuery = useQuery({ queryKey: ['clients'], queryFn: fetchClients });
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });

  const templatesQuery = useQuery({
    queryKey: ['contract-templates'],
    queryFn: async () => {
      const res = await fetch('/api/contracts/templates');
      if (!res.ok) throw new Error('Failed to fetch templates');
      return res.json();
    },
    enabled: !!templateId,
  });

  // Set template when loaded
  useEffect(() => {
    if (templateId && templatesQuery.data && !template) {
      const found = templatesQuery.data.find((t: ContractTemplate) => t.id === templateId);
      if (found) setTemplate(found);
    }
  }, [templateId, templatesQuery.data, template]);

  // Initialize values from client/project when they change
  useEffect(() => {
    if (!template) return;

    const newValues: Record<string, string> = { ...values };
    const clientFieldKeys = getClientFields();
    const projectFieldKeys = getProjectFields();

    // Populate client fields
    if (selectedClient) {
      if (clientFieldKeys.includes('client_name') && !newValues.client_name) {
        newValues.client_name = selectedClient.name || '';
      }
      if (clientFieldKeys.includes('client_company') && !newValues.client_company) {
        newValues.client_company = selectedClient.company || '';
      }
      if (clientFieldKeys.includes('client_email') && !newValues.client_email) {
        newValues.client_email = selectedClient.email || '';
      }
      if (clientFieldKeys.includes('client_phone') && !newValues.client_phone) {
        newValues.client_phone = selectedClient.phone || '';
      }
      if (clientFieldKeys.includes('client_location') && !newValues.client_location) {
        newValues.client_location = selectedClient.location || '';
      }
    }

    // Populate project fields
    if (selectedProject) {
      if (projectFieldKeys.includes('project_name') && !newValues.project_name) {
        newValues.project_name = selectedProject.name || '';
      }
      if (projectFieldKeys.includes('project_description') && !newValues.project_description) {
        newValues.project_description = selectedProject.description || '';
      }
      if (projectFieldKeys.includes('scope_of_work') && !newValues.scope_of_work) {
        newValues.scope_of_work = selectedProject.scopeOfWork || '';
      }
      if (projectFieldKeys.includes('deliverables') && !newValues.deliverables) {
        newValues.deliverables = selectedProject.deliverables || '';
      }
      if (projectFieldKeys.includes('total_fee') && !newValues.total_fee) {
        newValues.total_fee = selectedProject.totalAmount ? String(selectedProject.totalAmount) : '';
      }
      if (projectFieldKeys.includes('payment_terms') && !newValues.payment_terms) {
        newValues.payment_terms = selectedProject.paymentTerms || '';
      }
      if (projectFieldKeys.includes('revisions_policy') && !newValues.revisions_policy) {
        newValues.revisions_policy = selectedProject.revisionsPolicy || '';
      }
      if (projectFieldKeys.includes('licensing_terms') && !newValues.licensing_terms) {
        newValues.licensing_terms = selectedProject.licensingTerms || '';
      }
      if (projectFieldKeys.includes('notice_period') && !newValues.notice_period) {
        newValues.notice_period = selectedProject.noticePeriod || '';
      }
      if (projectFieldKeys.includes('start_date') && !newValues.start_date) {
        newValues.start_date = selectedProject.startDate
          ? new Date(selectedProject.startDate).toISOString().slice(0, 10)
          : '';
      }
      if (projectFieldKeys.includes('end_date') && !newValues.end_date) {
        newValues.end_date = selectedProject.endDate
          ? new Date(selectedProject.endDate).toISOString().slice(0, 10)
          : '';
      }
    }

    // Set default effective date
    if (!newValues.effective_date && template.variables?.includes('effective_date')) {
      newValues.effective_date = new Date().toISOString().slice(0, 10);
    }

    setValues(newValues);
  }, [template, selectedClient, selectedProject]);

  // Get required fields for this template
  const requiredFields = useMemo(() => {
    if (!template?.variables) return [];
    return getRequiredFields(template.variables).map((f) => f.key);
  }, [template]);

  // Calculate completion
  const completionStats = useMemo(() => {
    const completed = requiredFields.filter((f) => values[f] && values[f].trim()).length;
    const total = requiredFields.length;
    const percentage = total === 0 ? 100 : Math.round((completed / total) * 100);
    return { completed, total, percentage };
  }, [requiredFields, values]);

  // Get missing required fields
  const missingFields = useMemo(() => {
    return requiredFields.filter((f) => !values[f] || !values[f].trim());
  }, [requiredFields, values]);

  // Resolve content with current values
  const resolvedContent = useMemo(() => {
    if (!template) return '';
    return template.content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      const val = values[varName];
      if (!val || val.trim() === '') {
        const metadata = getFieldMetadata(varName);
        return `[Add ${metadata.label.toLowerCase()}]`;
      }
      return val;
    });
  }, [template, values]);

  // Save mutation
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
          projectId: selectedProject?.id || null,
          templateId: template?.id,
          content: resolvedContent,
          currency,
        });
      }
    },
    onSuccess: (contract) => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      if (mode === 'new' && step === 1) {
        // Only auto-navigate in step 1 when saving draft? We don't auto-navigate on save draft.
        // We only navigate when explicitly going to step 2 or when saving and continuing in step 2.
      }
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Failed to save contract');
    },
  });

  // Handlers
  const handleSaveDraft = async () => {
    setSaveStatus('saving');
    try {
      await saveMutation.mutateAsync();
    } catch (err) {
      setSaveStatus('idle');
    }
  };

  const handleNext = async () => {
    setSaveStatus('saving');
    try {
      const contract = await saveMutation.mutateAsync();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contract');
      setSaveStatus('idle');
    }
  };

  const handleValidateAndSend = async () => {
    const missing = requiredFields.filter((f) => !values[f] || !values[f].trim());

    if (missing.length > 0) {
      setValidationErrors(missing);
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

  const handleSaveAndContinue = async () => {
    setSaveStatus('saving');
    try {
      const contract = await saveMutation.mutateAsync();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      // Navigate to contract detail page
      if (contract.id) {
        router.push(`/admin/contracts/${contract.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contract');
      setSaveStatus('idle');
    }
  };

  const handleCreateProject = async () => {
    if (!selectedClient) {
      setError('Please select a client first');
      return;
    }

    // Prepare project data
    const projectData = {
      name: newProject.name,
      clientId: selectedClient.id,
      status: newProject.status,
      startDate: newProject.startDate ? new Date(newProject.startDate) : undefined,
      endDate: newProject.endDate ? new Date(newProject.endDate) : undefined,
      description: newProject.description,
      scopeOfWork: '', // Optional, can be empty
      deliverables: '', // Optional
      totalAmount: 0, // Optional
      currency: 'KES', // Default
      paymentTerms: '', // Optional
      revisionsPolicy: '', // Optional
      licensingTerms: '', // Optional
      noticePeriod: '', // Optional
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!res.ok) {
        throw new Error('Failed to create project');
      }

      const newProjectData = await res.json();
      // Refetch projects to update the list
      projectsQuery.refetch();
      // Set the selected project to the newly created one
      setSelectedProject({
        id: newProjectData.id,
        name: newProjectData.name,
        description: newProjectData.description,
        scopeOfWork: newProjectData.scopeOfWork,
        deliverables: newProjectData.deliverables,
        totalAmount: newProjectData.totalAmount,
        currency: newProjectData.currency,
        paymentTerms: newProjectData.paymentTerms,
        revisionsPolicy: newProjectData.revisionsPolicy,
        licensingTerms: newProjectData.licensingTerms,
        noticePeriod: newProjectData.noticePeriod,
        startDate: newProjectData.startDate ? new Date(newProjectData.startDate) : null,
        endDate: newProjectData.endDate ? new Date(newProjectData.endDate) : undefined,
        createdAt: newProjectData.createdAt ? new Date(newProjectData.createdAt) : undefined,
        updatedAt: newProjectData.updatedAt ? new Date(newProjectData.updatedAt) : undefined,
      } as Project);

      // Reset form and close
      setIsCreatingProject(false);
      setNewProject({
        name: '',
        status: 'active',
        startDate: '',
        endDate: '',
        description: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const handleValueChange = (key: string, newValue: string) => {
    setValues((prev) => ({ ...prev, [key]: newValue }));
    setValidationErrors((prev) => prev.filter((f) => f !== key));
  };

  const isLoading = clientsQuery.isLoading || projectsQuery.isLoading || !template;

  if (isLoading) {
    return (
      <div className="ui-page min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading contract builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-page py-8">
      <div className="mx-auto max-w-5xl px-6">
        {step === 1 ? (
          <>
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

            {/* Errors */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Validation */}
            {validationErrors.length > 0 && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{validationErrors.length} items need your attention</p>
                    <ul className="mt-2 space-y-1">
                      {validationErrors.map((field) => (
                        <li key={field}>
                          • {getFieldMetadata(field).label}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Document Toolbar */}
            <div className="mb-6 rounded-lg bg-white dark:bg-gray-800 px-6 py-4 border border-gray-200 dark:border-gray-700 space-y-4">
              {/* Contract Info */}
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
                  {isCreatingProject ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newProject.name}
                        onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                        placeholder="Project name"
                        className="ui-input w-full text-sm"
                      />
                      <select
                        value={newProject.status}
                        onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                        className="ui-input w-full text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="completed">Completed</option>
                        <option value="on hold">On Hold</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <div className="grid gap-2 grid-cols-2">
                        <input
                          type="date"
                          value={newProject.startDate}
                          onChange={(e) => setNewProject({...newProject, startDate: e.target.value})}
                          className="ui-input w-full text-sm"
                        />
                        <input
                          type="date"
                          value={newProject.endDate}
                          onChange={(e) => setNewProject({...newProject, endDate: e.target.value})}
                          className="ui-input w-full text-sm"
                        />
                      </div>
                      <textarea
                        value={newProject.description}
                        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                        placeholder="Description"
                        rows={2}
                        className="ui-input w-full text-sm"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => setIsCreatingProject(false)}
                          className="ui-button ui-button-ghost"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateProject}
                          className="ui-button ui-button-primary"
                        >
                          Create Project
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <select
                        value={selectedProject?.id ?? ''}
                        onChange={(e) => {
                          const project = projectsQuery.data?.find((p) => p.id === e.target.value) ?? null;
                          setSelectedProject(project);
                        }}
                        className="ui-input w-full text-sm"
                      >
                        <option value="">No project</option>
                        {selectedClient ? (
                          projectsQuery.data
                            ?.filter(project => project.clientId === selectedClient.id)
                            .map(project => (
                              <option key={project.id} value={project.id}>
                                {project.name}
                              </option>
                            ))
                        ) : []}
                      </select>
                      {selectedClient && !projectsQuery.data?.some(p => p.clientId === selectedClient.id) && (
                        <button
                          onClick={() => setIsCreatingProject(true)}
                          className="mt-2 ui-button ui-button-secondary w-full"
                        >
                          Create New Project
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Completion */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Contract completion
                  </p>
                  <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                    {completionStats.percentage}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${completionStats.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {completionStats.completed} / {completionStats.total} required fields complete
                </p>
              </div>
            </div>

            {/* Document */}
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 shadow-sm mb-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{title}</h1>
                )}

                {template && (
                  <EditableContractDocument
                    content={template.content}
                    templateVariables={template.variables || []}
                    values={values}
                    onValueChange={handleValueChange}
                    clients={clientsQuery.data}
                    projects={projectsQuery.data}
                    invalidFields={validationErrors}
                    currency={currency}
                  />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-between items-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Editing {mode === 'new' ? 'new contract' : 'draft'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveDraft}
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

                {mode === 'edit' ? (
                  <button
                    onClick={handleValidateAndSend}
                    className="ui-button ui-button-primary"
                    disabled={saveMutation.isPending}
                  >
                    <Send className="h-4 w-4" /> Send Contract
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="ui-button ui-button-primary"
                    disabled={saveMutation.isPending}
                  >
                    <Send className="h-4 w-4" /> Next
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <button onClick={() => setStep(1)} className="ui-button ui-button-ghost">
                <ArrowLeft className="h-4 w-4" /> Back to Edit
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

            {/* Errors */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Contract Summary */}
            <div className="mb-6 rounded-lg bg-white dark:bg-gray-800 px-6 py-4 border border-gray-200 dark:border-gray-700">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Contract Title
                  </label>
                  <p className="ui-input w-full text-sm text-gray-900 dark:text-gray-50">{title}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Client
                  </label>
                  <p className="ui-input w-full text-sm text-gray-900 dark:text-gray-50">
                    {selectedClient ? `${selectedClient.name} ${selectedClient.company ? `(${selectedClient.company})` : ''}` : 'No client selected'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Project
                  </label>
                  <p className="ui-input w-full text-sm text-gray-900 dark:text-gray-50">
                    {selectedProject ? selectedProject.name : 'No project'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contract Content (Read-only) */}
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 shadow-sm mb-6">
              <div className="prose prose-sm max-w-none text-gray-900 dark:text-gray-50">
                {!!resolvedContent ? (
                  <>
                    {resolvedContent.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-6 leading-7">
                        {paragraph.split('\n').map((line, lineIndex) => (
                          <>
                            {line}
                            {lineIndex < paragraph.split('\n').length - 1 && <br />}
                          </>
                        ))}
                      </p>
                    ))}
                  </>
                ) : (
                  <p className="text-gray-500 italic">No content</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-between items-center">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Review contract details
              </p>
              <div className="flex gap-3">
                {selectedProject ? null : (
                  <button
                    onClick={() => {
                      setStep(1);
                      setIsCreatingProject(true);
                    }}
                    className="ui-button ui-button-secondary"
                  >
                    Create New Project
                  </button>
                )}
                <button
                  onClick={handleSaveAndContinue}
                  disabled={saveMutation.isPending || saveStatus === 'saving'}
                  className="ui-button ui-button-primary"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save & Continue
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
