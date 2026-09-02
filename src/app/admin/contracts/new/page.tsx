'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2Icon } from 'lucide-react';
import { fetchClients, fetchProjects, fetchContractTemplates, createContract } from '@/lib/api/contracts';
import type { Client, Project, ContractTemplate } from '@/lib/api/contracts';
import VariableMapper from '@/components/VariableMapper';

type Step = 'template' | 'client' | 'project' | 'details';

export default function NewContractPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');
  const [step, setStep] = useState<Step>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [contractData, setContractData] = useState({ title: '', content: '' });
  const [mappedVariables, setMappedVariables] = useState<Record<string, string>>({});

  const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: fetchClients });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });
  const { data: templates } = useQuery({ queryKey: ['contract-templates'], queryFn: fetchContractTemplates });

  const { mutate: createContractMutation, isPending } = useMutation({
    mutationFn: createContract,
    onSuccess: (contract: any) => {
      router.push(`/admin/contracts/${contract.id}`);
    },
  });

  useEffect(() => {
    if (templateId && templates) {
      const template = templates.find((t: any) => t.id === templateId);
      if (template) setSelectedTemplate(template);
    }
  }, [templateId, templates]);

  const handleNext = () => {
    if (step === 'template') setStep('client');
    else if (step === 'client') setStep('project');
    else if (step === 'project') setStep('details');
    else if (step === 'details') {
      const finalContent = selectedTemplate?.content || contractData.content;
      const resolvedContent = finalContent.replace(/\{\{(\w+)\}\}/g, (match: string, varName: string) => 
        mappedVariables[varName] || match
      );
      createContractMutation({
        ...contractData,
        content: resolvedContent,
        templateId: selectedTemplate?.id,
        clientId: selectedClient?.id,
        projectId: selectedProject?.id,
      });
    }
  };

  return (
    <div className="ui-page">
      <div className="ui-page-header">
        <h1 className="ui-page-title">New Contract</h1>
      </div>

      <div className="ui-step-progress">
        {(['template', 'client', 'project', 'details'] as Step[]).map((s) => (
          <div key={s} className={`ui-step ${step === s ? 'active' : ''}`}>
            <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
          </div>
        ))}
      </div>

      <div className="ui-card">
        {step === 'template' && (
          <div>
            <h2 className="ui-card-title">Choose Template</h2>
            <div className="ui-template-grid">
              <button onClick={() => setStep('client')} className="ui-template-card">
                <h3>Start from Blank</h3>
              </button>
              {templates?.map((template: any) => (
                <button key={template.id} onClick={() => setSelectedTemplate(template)} className={`ui-template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}>
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 'client' && (
          <div>
            <h2 className="ui-card-title">Select Client</h2>
            <div className="ui-client-list">
              {clients?.map((client: any) => (
                <button key={client.id} onClick={() => setSelectedClient(client)} className={`ui-client-card ${selectedClient?.id === client.id ? 'selected' : ''}`}>
                  <h3>{client.name}</h3>
                  <p>{client.email}</p>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 'project' && (
          <div>
            <h2 className="ui-card-title">Link Project (Optional)</h2>
            <div className="ui-project-list">
              <button onClick={() => setStep('details')} className="ui-project-card">
                No Project
              </button>
              {projects?.map((project: any) => (
                <button key={project.id} onClick={() => setSelectedProject(project)} className={`ui-project-card ${selectedProject?.id === project.id ? 'selected' : ''}`}>
                  <h3>{project.name}</h3>
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 'details' && (
          <div>
            <h2 className="ui-card-title">Contract Details</h2>
            <div className="ui-form-group">
              <label>Title</label>
              <input type="text" value={contractData.title} onChange={(e) => setContractData({...contractData, title: e.target.value})} className="ui-input" />
            </div>
            {selectedTemplate && (
              <VariableMapper 
                template={selectedTemplate} 
                client={selectedClient} 
                project={selectedProject}
                onMap={setMappedVariables}
              />
            )}
          </div>
        )}
      </div>

      <div className="ui-step-footer">
        <button onClick={() => {
          if (step === 'template') router.back();
          else if (step === 'client') setStep('template');
          else if (step === 'project') setStep('client');
          else setStep('project');
        }} className="ui-button ui-button-secondary">Back</button>
        <button onClick={handleNext} disabled={isPending} className="ui-button ui-button-primary">
          {isPending ? <Loader2Icon className="animate-spin" /> : step === 'details' ? 'Create Contract' : 'Next'}
        </button>
      </div>
    </div>
  );
}
