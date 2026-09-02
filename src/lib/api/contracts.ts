import { getCurrentUser } from '@/lib/auth/get-current-user';
import { db } from '@/db';
import { contracts, contractTemplates, contractEvents, clients, projects } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
export type { Contract, NewContract, UpdateContractInput, ContractTemplate, ContractEvent, ContractStats, Client, Project } from '@/lib/types/contracts';
import type { Contract, NewContract, UpdateContractInput, ContractTemplate, ContractEvent, ContractStats, Client, Project } from '@/lib/types/contracts';

async function generateContractNumber(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const last = await db
    .select({ contractNumber: contracts.contractNumber })
    .from(contracts)
    .where(and(eq(contracts.creatorId, user.id)))
    .orderBy(contracts.contractNumber)
    .limit(1);
  
  let seq = 1;
  if (last[0]?.contractNumber) {
    const match = last[0].contractNumber.match(/-(\d+)$/);
    if (match) seq = parseInt(match[1], 10) + 1;
  }
  
  return `CNT-${year}${month}${day}-${String(seq).padStart(4, '0')}`;
}

export async function fetchContractStats(): Promise<ContractStats> {
  const user = await getCurrentUser();
  if (!user) return {};
  
  const all = await db.select().from(contracts).where(eq(contracts.creatorId, user.id));
  
  return {
    totalContracts: all.length,
    drafts: all.filter(c => c.status === 'draft').length,
    sent: all.filter(c => c.status === 'sent').length,
    viewed: all.filter(c => c.status === 'viewed').length,
    awaitingSignature: all.filter(c => c.status === 'awaiting_signature').length,
    signed: all.filter(c => c.status === 'signed').length,
    expired: all.filter(c => c.status === 'expired').length,
  };
}

export async function fetchContracts(): Promise<Contract[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  
  return db.select().from(contracts).where(eq(contracts.creatorId, user.id)).orderBy(contracts.createdAt);
}

export async function fetchContract(id: string): Promise<Contract | null> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const result = await db.select().from(contracts).where(and(eq(contracts.id, id), eq(contracts.creatorId, user.id))).limit(1);
  return result[0] ?? null;
}

export async function fetchContractTemplates(): Promise<ContractTemplate[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  
  const result = await db
    .select()
    .from(contractTemplates)
    .where(eq(contractTemplates.isSystemTemplate, true))
    .orderBy(contractTemplates.name);
  
  return result as unknown as ContractTemplate[];
}

export async function createContract(data: NewContract): Promise<Contract> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const contractNumber = await generateContractNumber();
  
  const [contract] = await db
    .insert(contracts)
    .values({
      creatorId: user.id,
      clientId: data.clientId,
      projectId: data.projectId || null,
      quoteId: data.quoteId || null,
      templateId: data.templateId || null,
      title: data.title,
      contractNumber,
      token: uuidv4(),
      content: data.content || null,
      status: 'draft',
      currency: data.currency || null,
      totalAmount: data.totalAmount || null,
    })
    .returning() as any;
  
  await db.insert(contractEvents).values({
    contractId: contract.id,
    eventType: 'created',
    metadata: '{}',
  });
  
  return contract as unknown as Contract;
}

export async function updateContract(id: string, data: UpdateContractInput): Promise<Contract> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const [contract] = await db
    .update(contracts)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(contracts.id, id), eq(contracts.creatorId, user.id)))
    .returning() as any;
  
  if (!contract) throw new Error('Contract not found');
  
  await db.insert(contractEvents).values({
    contractId: id,
    eventType: 'updated',
    metadata: JSON.stringify(data),
  });
  
  return contract as unknown as Contract;
}

export async function deleteContract(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  await db.delete(contracts).where(and(eq(contracts.id, id), eq(contracts.creatorId, user.id)));
  
  await db.insert(contractEvents).values({
    contractId: id,
    eventType: 'deleted',
    metadata: '{}',
  });
}

export async function sendContract(id: string): Promise<Contract> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const [contract] = await db
    .update(contracts)
    .set({ status: 'sent', sentAt: new Date(), updatedAt: new Date() })
    .where(and(eq(contracts.id, id), eq(contracts.creatorId, user.id)))
    .returning() as any;
  
  if (!contract) throw new Error('Contract not found');
  
  await db.insert(contractEvents).values({
    contractId: id,
    eventType: 'sent',
    metadata: '{}',
  });
  
  return contract as unknown as Contract;
}

export async function duplicateContract(id: string): Promise<Contract> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const original = await fetchContract(id);
  if (!original) throw new Error('Contract not found');
  
  const contractNumber = await generateContractNumber();
  
  const [duplicate] = await db
    .insert(contracts)
    .values({
      creatorId: user.id,
      clientId: original.clientId,
      projectId: original.projectId,
      quoteId: original.quoteId,
      templateId: original.templateId,
      title: `${original.title} (Copy)`,
      contractNumber,
      token: uuidv4(),
      content: original.content,
      status: 'draft',
      currency: original.currency,
      totalAmount: original.totalAmount,
    })
    .returning() as any;
  
  await db.insert(contractEvents).values({
    contractId: duplicate.id,
    eventType: 'duplicated',
    metadata: JSON.stringify({ originalContractId: original.id }),
  });
  
  return duplicate as unknown as Contract;
}

export async function saveAsTemplate(id: string, name: string, description: string): Promise<ContractTemplate> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const contract = await fetchContract(id);
  if (!contract) throw new Error('Contract not found');
  
  const [template] = await db
    .insert(contractTemplates)
    .values({
      creatorId: user.id,
      name,
      description,
      category: 'Custom',
      documentType: 'contract',
      content: contract.content || '',
      variables: '[]',
      isSystemTemplate: false,
      isActive: true,
    })
    .returning() as any;
  
  await db.insert(contractEvents).values({
    contractId: id,
    eventType: 'saved_as_template',
    metadata: JSON.stringify({ templateId: template.id }),
  });
  
  return template as unknown as ContractTemplate;
}

export async function fetchContractByToken(token: string): Promise<Contract | null> {
  const result = await db.select().from(contracts).where(eq(contracts.token, token)).limit(1);
  return result[0] ?? null;
}

export async function updateContractStatus(token: string, status: 'signed' | 'declined'): Promise<Contract> {
  const [contract] = await db
    .update(contracts)
    .set({
      status,
      signedAt: status === 'signed' ? new Date() : undefined,
      declinedAt: status === 'declined' ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(contracts.token, token))
    .returning() as any;
  
  if (!contract) throw new Error('Contract not found');
  
  await db.insert(contractEvents).values({
    contractId: contract.id,
    eventType: status,
    metadata: '{}',
  });
  
  return contract as unknown as Contract;
}

export async function fetchContractEvents(contractId: string): Promise<ContractEvent[]> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  
  const [contract] = await db.select().from(contracts).where(and(eq(contracts.id, contractId), eq(contracts.creatorId, user.id))).limit(1);
  if (!contract) throw new Error('Contract not found');
  
  const result = await db.select().from(contractEvents).where(eq(contractEvents.contractId, contractId)).orderBy(contractEvents.createdAt);
  return result as unknown as ContractEvent[];
}

export async function fetchClients(): Promise<Client[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const result = await db.select().from(clients).where(eq(clients.creatorId, user.id));
  return result as unknown as Client[];
}

export async function fetchProjects(): Promise<Project[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  const result = await db.select().from(projects).where(eq(projects.creatorId, user.id));
  return result as unknown as Project[];
}
