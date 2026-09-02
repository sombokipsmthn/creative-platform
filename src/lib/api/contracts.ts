export type {
  Contract,
  NewContract,
  UpdateContractInput,
  ContractTemplate,
  ContractEvent,
  ContractStats,
  Client,
  Project,
} from '@/lib/types/contracts';

import type {
  Contract,
  NewContract,
  UpdateContractInput,
  ContractTemplate,
  ContractEvent,
  ContractStats,
  Client,
  Project,
} from '@/lib/types/contracts';

export async function fetchContractStats(): Promise<ContractStats> {
  const res = await fetch('/api/contracts', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch contract stats');
  const data = await res.json();
  return data.stats || {};
}

export async function fetchContracts(): Promise<Contract[]> {
  const res = await fetch('/api/contracts', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch contracts');
  const data = await res.json();
  return data.contracts || [];
}

export async function fetchContract(id: string): Promise<Contract | null> {
  const res = await fetch(`/api/contracts/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch contract');
  }
  return res.json();
}

export async function fetchContractTemplates(): Promise<ContractTemplate[]> {
  const res = await fetch('/api/contracts/templates', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch contract templates');
  return res.json();
}

export async function createContract(data: NewContract): Promise<Contract> {
  const res = await fetch('/api/contracts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create contract');
  return res.json();
}

export async function updateContract(id: string, data: UpdateContractInput): Promise<Contract> {
  const res = await fetch(`/api/contracts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update contract');
  return res.json();
}

export async function deleteContract(id: string): Promise<void> {
  const res = await fetch(`/api/contracts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete contract');
}

export async function sendContract(id: string): Promise<Contract> {
  const res = await fetch(`/api/contracts/${id}/send`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to send contract');
  return res.json();
}

export async function duplicateContract(id: string): Promise<Contract> {
  const res = await fetch(`/api/contracts/${id}/duplicate`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to duplicate contract');
  return res.json();
}

export async function saveAsTemplate(id: string, name: string, description: string): Promise<ContractTemplate> {
  const res = await fetch(`/api/contracts/${id}/template`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  if (!res.ok) throw new Error('Failed to save template');
  return res.json();
}

export async function fetchContractByToken(token: string): Promise<Contract | null> {
  const res = await fetch(`/api/public/contracts/${token}`, { cache: 'no-store' });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch contract');
  }
  return res.json();
}

export async function updateContractStatus(token: string, status: 'signed' | 'declined'): Promise<Contract> {
  const res = await fetch(`/api/public/contracts/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update contract status');
  return res.json();
}

export async function fetchContractEvents(contractId: string): Promise<ContractEvent[]> {
  const res = await fetch(`/api/contracts/${contractId}/events`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch contract events');
  return res.json();
}

export async function fetchClients(): Promise<Client[]> {
  const res = await fetch('/api/clients', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json();
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch('/api/projects', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}
