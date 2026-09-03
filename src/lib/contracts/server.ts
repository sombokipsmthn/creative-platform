import { db } from '@/db';
import { contracts, contractTemplates, contractEvents, clients, projects, quotes, users } from '@/db/schema';
import { eq, and, or, ilike, inArray, asc, desc, sql, isNull, isNotNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { generateContractNumber } from '@/lib/utils'; // We'll create this helper if it doesn't exist

// Helper to get current user ID from Clerk (assuming we have a helper)
import { getCurrentUserId } from '@/lib/auth';

// Contracts API functions

export async function fetchContracts({ search, status, clientId, limit = 50, offset = 0 }: {
  search?: string;
  status?: string;
  clientId?: string;
  limit?: number;
  offset?: number;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthenticated');

  let where = and(eq(contracts.creatorId, userId));

  if (search) {
    where = and(where,
      or(
        ilike(contracts.title, `%${search}%`),
        ilike(contracts.contractNumber, `%${search}%`)
      )
    );
  }

  if (status && status !== 'all') {
    where = and(where, eq(contracts.status, status));
  }

  if (clientId && clientId !== 'all') {
    where = and(where, eq(contracts.clientId, clientId));
  }

  const data = await db.select().from(contracts).where(where).limit(limit).offset(offset).orderBy(desc(contracts.createdAt));
  const total = await db.select({ count: sql<number>`count(*)` }).from(contracts).where(where);

  return {
    contracts: data,
    total: Number(total[0].count),
  };
}

export async function fetchContract(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthenticated');

  const [contract] = await db.select().from(contracts).where(and(eq(contracts.id, id), eq(contracts.creatorId, userId)));
  if (!contract) throw new Error('Contract not found or unauthorized');
  return contract;
}

export async function createContract(data: any) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthenticated');

  const contractNumber = await generateContractNumber(); // Assuming this function exists

  const [newContract] = await db.insert(contracts).values({
    id: uuidv4(),
    creatorId: userId,
    clientId: data.clientId,
    projectId: data.projectId ?? null,
    quoteId: data.quoteId ?? null,
    templateId: data.templateId ?? null,
    title: data.title,
    contractNumber,
    status: data.status ?? 'draft',
    content: data.content ?? '',
    currency: data.currency ?? 'KES',
    totalAmount: data.totalAmount ?? null,
    token: uuidv4(), // Generate a unique token for public access
    expiresAt: data.expiresAt ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  // Log event
  await db.insert(contractEvents).values({
    id: uuidv4(),
    contractId: newContract.id,
    eventType: 'created',
    metadata: { ...data },
    createdAt: new Date(),
  });

  return newContract;
}

export async function updateContract(id: string, data: any) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthenticated');

  const [updatedContract] = await db.update(contracts).set({
    ...data,
    updatedAt: new Date(),
  }).where(and(eq(contracts.id, id), eq(contracts.creatorId, userId))).returning();

  // Log event
  await db.insert(contractEvents).values({
    id: uuidv4(),
    contractId: id,
    eventType: 'updated',
    metadata: { ...data },
    createdAt: new Date(),
  });

  return updatedContract;
}

export async function deleteContract(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthenticated');

  const [deletedContract] = await db.delete(contracts).where(and(eq(contracts.id, id), eq(contracts.creatorId, userId))).returning();

  // Log event
  await db.insert(contractEvents).values({
    id: uuidv4(),
    contractId: id,
    eventType: 'deleted',
    metadata: { id: deletedContract.id },
    createdAt: new Date(),
  });

  return deletedContract;
}

export async function sendContract(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthenticated');

  const [updatedContract] = await db.update(contracts).set({
    status: 'sent',
    sentAt: new Date(),
    updatedAt: new Date(),
  }).where(and(eq(contracts.id, id), eq(contracts.creatorId, userId))).returning();

  // Log event
  await db.insert(contractEvents).values({
    id: uuidv4(),
    contractId: id,
    eventType: 'sent',
    metadata: {},
    createdAt: new Date(),
  });

  return updatedContract;
}

export async function duplicateContract(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthenticated');

  const contract = await fetchContract(id);
  const contractNumber = await generateContractNumber();

  const [newContract] = await db.insert(contracts).values({
    id: uuidv4(),
    creatorId: userId,
    clientId: contract.clientId,
    projectId: contract.projectId,
    quoteId: contract.quoteId,
    templateId: contract.templateId,
    title: `${contract.title} (Copy)`,
    contractNumber,
    status: 'draft',
    content: contract.content,
    currency: contract.currency,
    totalAmount: contract.totalAmount,
    token: uuidv4(),
    expiresAt: contract.expiresAt,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  // Log event
  await db.insert(contractEvents).values({
    id: uuidv4(),
    contractId: newContract.id,
    eventType: 'duplicated',
    metadata: { originalContractId: id },
    createdAt: new Date(),
  });

  return newContract;
}

export async function saveContractAsTemplate(id: string, data: any) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthenticated');

  const contract = await fetchContract(id);

  const [newTemplate] = await db.insert(contractTemplates).values({
    id: uuidv4(),
    creatorId: userId,
    name: data.name ?? contract.title,
    description: data.description ?? '',
    category: data.category ?? 'General Business',
    documentType: data.documentType ?? 'services',
    content: contract.content,
    variables: data.variables ?? [],
    isSystemTemplate: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  // Log event
  await db.insert(contractEvents).values({
    id: uuidv4(),
    contractId: id,
    eventType: 'saved_as_template',
    metadata: { templateId: newTemplate.id },
    createdAt: new Date(),
  });

  return newTemplate;
}

export async function fetchContractStats() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthenticated');

  const stats = await db.select({
    total: sql<number>`count(*)`.map(Number),
    draft: sql<number>`count(*) filter (where ${eq(contracts.status, 'draft')})`.map(Number),
    sent: sql<number>`count(*) filter (where ${eq(contracts.status, 'sent')})`.map(Number),
    viewed: sql<number>`count(*) filter (where ${eq(contracts.status, 'viewed')})`.map(Number),
    awaiting_signature: sql<number>`count(*) filter (where ${eq(contracts.status, 'awaiting_signature')})`.map(Number),
    signed: sql<number>`count(*) filter (where ${eq(contracts.status, 'signed')})`.map(Number),
    declined: sql<number>`count(*) filter (where ${eq(contracts.status, 'declined')})`.map(Number),
    expired: sql<number>`count(*) filter (where ${eq(contracts.status, 'expired')})`.map(Number),
    cancelled: sql<number>`count(*) filter (where ${eq(contracts.status, 'cancelled')})`.map(Number),
  }).from(contracts).where(eq(contracts.creatorId, userId));

  return stats[0];
}

export async function fetchContractTemplates({ search, category, limit = 50, offset = 0 }: {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthenticated');

  let where = and(
    or(
      eq(contractTemplates.isSystemTemplate, true),
      eq(contractTemplates.creatorId, userId)
    ),
    eq(contractTemplates.isActive, true)
  );

  if (search) {
    where = and(where,
      or(
        ilike(contractTemplates.name, `%${search}%`),
        ilike(contractTemplates.description, `%${search}%`)
      )
    );
  }

  if (category && category !== 'all') {
    where = and(where, eq(contractTemplates.category, category));
  }

  const data = await db.select().from(contractTemplates).where(where).limit(limit).offset(offset).orderBy(desc(contractTemplates.createdAt));
  const total = await db.select({ count: sql<number>`count(*)` }).from(contractTemplates).where(where);

  return {
    templates: data,
    total: Number(total[0].count),
  };
}

export async function createContractTemplate(data: any) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthenticated');

  const [newTemplate] = await db.insert(contractTemplates).values({
    id: uuidv4(),
    creatorId: userId,
    name: data.name,
    description: data.description ?? '',
    category: data.category,
    documentType: data.documentType,
    content: data.content,
    variables: data.variables ?? [],
    isSystemTemplate: data.isSystemTemplate ?? false,
    isActive: data.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  return newTemplate;
}

export async function updateContractTemplate(id: string, data: any) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthenticated');

  const [updatedTemplate] = await db.update(contractTemplates).set({
    ...data,
    updatedAt: new Date(),
  }).where(and(eq(contractTemplates.id, id), or(
    eq(contractTemplates.isSystemTemplate, true),
    eq(contractTemplates.creatorId, userId)
  ))).returning();

  return updatedTemplate;
}

export async function deleteContractTemplate(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthenticated');

  const [deletedTemplate] = await db.delete(contractTemplates).where(and(eq(contractTemplates.id, id), or(
    eq(contractTemplates.isSystemTemplate, true),
    eq(contractTemplates.creatorId, userId)
  ))).returning();

  return deletedTemplate;
}

// Public API functions (no authentication required for viewing/signing by client)

export async function getPublicContract(token: string) {
  const [contract] = await db.select().from(contracts).where(eq(contracts.token, token));
  if (!contract) throw new Error('Contract not found');
  return contract;
}

export async function signPublicContract(token: string, signatureData: any) {
  const [contract] = await db.update(contracts).set({
    status: 'signed',
    signedAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(contracts.token, token)).returning();

  // Log event
  await db.insert(contractEvents).values({
    id: uuidv4(),
    contractId: contract.id,
    eventType: 'signed',
    metadata: signatureData,
    createdAt: new Date(),
  });

  return contract;
}

// Add the named exports that the API routes expect
export const fetchContractByToken = getPublicContract;
export const updateContractStatus = updateContract; // thin wrapper
export const fetchContractEvents = async (contractId: string) => {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('Unauthenticated');
  return db.select().from(contractEvents).where(eq(contractEvents.contractId, contractId));
};
export const saveAsTemplate = saveContractAsTemplate;
