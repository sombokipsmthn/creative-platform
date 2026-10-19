import { db } from '@/db';
import { clients, contractEvents, contractTemplates, contracts, projects } from '@/db/schema';
import { and, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { generateContractNumber } from '@/lib/utils';
import getCurrentUser from '@/lib/auth/get-current-user';

const WORKFLOW_STATUSES = ['draft', 'sent', 'viewed', 'awaiting_signature', 'signed', 'declined', 'expired', 'cancelled'] as const;
type ContractInput = {
  clientId?: string; projectId?: string | null; quoteId?: string | null; templateId?: string | null;
  title?: string; status?: string; content?: string; currency?: string; totalAmount?: number | null;
  expiresAt?: Date | string | null; contractType?: string | null; effectiveAt?: Date | string | null;
  termStartAt?: Date | string | null; termEndAt?: Date | string | null; renewalAt?: Date | string | null;
  noticeDeadline?: Date | string | null; signatories?: Array<{ name?: string; email?: string; role?: string }>;
};
type NewContractInput = ContractInput & { clientId: string; title: string };
type ContractTemplateInput = { name?: string; description?: string; category?: string; documentType?: string; content?: string; variables?: string[]; isSystemTemplate?: boolean; isActive?: boolean };

async function userId() { const user = await getCurrentUser(); if (!user?.id) throw new Error('Unauthenticated'); return user.id; }
function dateValue(value: Date | string | null | undefined) { return value ? new Date(value) : null; }
async function event(contractId: string, eventType: string, actorId: string | null, metadata: Record<string, unknown> = {}, outcome = 'confirmed') {
  await db.insert(contractEvents).values({ id: uuidv4(), contractId, eventType, actorId, metadata, outcome, createdAt: new Date() });
}

export async function fetchContracts({ search, status, clientId, projectId, contractType, limit = 50, offset = 0 }: { search?: string; status?: string; clientId?: string; projectId?: string; contractType?: string; limit?: number; offset?: number }) {
  const creatorId = await userId();
  let where = and(eq(contracts.creatorId, creatorId));
  if (search) where = and(where, or(ilike(contracts.title, `%${search}%`), ilike(contracts.contractNumber, `%${search}%`)));
  if (status && status !== 'all') where = and(where, eq(contracts.status, status));
  if (clientId && clientId !== 'all') where = and(where, eq(contracts.clientId, clientId));
  if (projectId && projectId !== 'all') where = and(where, eq(contracts.projectId, projectId));
  if (contractType && contractType !== 'all') where = and(where, eq(contracts.contractType, contractType));
  const [data, count] = await Promise.all([
    db.select({ contract: contracts, client: { id: clients.id, name: clients.name, company: clients.company }, project: { id: projects.id, name: projects.name } }).from(contracts).leftJoin(clients, eq(contracts.clientId, clients.id)).leftJoin(projects, eq(contracts.projectId, projects.id)).where(where).limit(Math.min(limit, 100)).offset(Math.max(offset, 0)).orderBy(desc(contracts.updatedAt)),
    db.select({ count: sql<number>`count(*)` }).from(contracts).where(where),
  ]);
  return { contracts: data.map(({ contract, client, project }) => ({ ...contract, client, project })), total: Number(count[0]?.count ?? 0) };
}

export async function fetchContract(id: string) {
  const creatorId = await userId();
  const [row] = await db.select({ contract: contracts, client: { id: clients.id, name: clients.name, email: clients.email, company: clients.company, phone: clients.phone }, project: { id: projects.id, name: projects.name } }).from(contracts).leftJoin(clients, eq(contracts.clientId, clients.id)).leftJoin(projects, eq(contracts.projectId, projects.id)).where(and(eq(contracts.id, id), eq(contracts.creatorId, creatorId)));
  if (!row) throw new Error('Contract not found');
  return { ...row.contract, client: row.client, project: row.project };
}

export async function createContract(data: NewContractInput) {
  const creatorId = await userId();
  if (!data.clientId || !data.title?.trim()) throw new Error('Client and title are required');
  if (data.projectId) { const [project] = await db.select({ id: projects.id }).from(projects).where(and(eq(projects.id, data.projectId), eq(projects.creatorId, creatorId), eq(projects.clientId, data.clientId))); if (!project) throw new Error('Project not found'); }
  let templateVersion: number | null = null; let templateSnapshot: string | null = null;
  if (data.templateId) { const [template] = await db.select().from(contractTemplates).where(and(eq(contractTemplates.id, data.templateId), or(eq(contractTemplates.isSystemTemplate, true), eq(contractTemplates.creatorId, creatorId)), eq(contractTemplates.isActive, true))); if (!template) throw new Error('Template not found'); templateVersion = template.version; templateSnapshot = template.content; }
  const id = uuidv4();
  const [created] = await db.insert(contracts).values({ id, creatorId, clientId: data.clientId, projectId: data.projectId ?? null, quoteId: data.quoteId ?? null, templateId: data.templateId ?? null, templateVersion, templateSnapshot, contractType: data.contractType ?? null, title: data.title.trim(), contractNumber: await generateContractNumber(), status: 'draft', content: data.content ?? '', currency: data.currency ?? 'KES', totalAmount: data.totalAmount ?? null, token: uuidv4(), expiresAt: dateValue(data.expiresAt), effectiveAt: dateValue(data.effectiveAt), termStartAt: dateValue(data.termStartAt), termEndAt: dateValue(data.termEndAt), renewalAt: dateValue(data.renewalAt), noticeDeadline: dateValue(data.noticeDeadline), signatories: data.signatories ?? [], createdAt: new Date(), updatedAt: new Date() }).returning();
  await event(id, 'created', creatorId, { templateVersion }); return created;
}

export async function updateContract(id: string, data: ContractInput) {
  const creatorId = await userId(); const existing = await fetchContract(id);
  if (existing.status === 'signed' && (data.content !== undefined || data.templateId !== undefined)) throw new Error('Signed contracts cannot be overwritten; create an amendment instead');
  if (data.status && !WORKFLOW_STATUSES.includes(data.status as typeof WORKFLOW_STATUSES[number])) throw new Error('Invalid contract status');
  const patch = { ...data, expiresAt: dateValue(data.expiresAt), effectiveAt: dateValue(data.effectiveAt), termStartAt: dateValue(data.termStartAt), termEndAt: dateValue(data.termEndAt), renewalAt: dateValue(data.renewalAt), noticeDeadline: dateValue(data.noticeDeadline), updatedAt: new Date() };
  const [updated] = await db.update(contracts).set(patch).where(and(eq(contracts.id, id), eq(contracts.creatorId, creatorId))).returning();
  if (!updated) throw new Error('Contract not found'); await event(id, 'updated', creatorId, { fields: Object.keys(data) }); return updated;
}

export async function deleteContract(id: string) { const creatorId = await userId(); const [deleted] = await db.delete(contracts).where(and(eq(contracts.id, id), eq(contracts.creatorId, creatorId), eq(contracts.status, 'draft'))).returning(); if (!deleted) throw new Error('Only existing drafts can be deleted'); return deleted; }
export async function sendContract(id: string) { const creatorId = await userId(); const contract = await fetchContract(id); if (!contract.content?.trim()) throw new Error('A completed document is required before sending'); if (!contract.client?.email) throw new Error('A client email is required before sending'); const signatories = Array.isArray(contract.signatories) ? contract.signatories as Array<{ email?: string }> : [];
 if (signatories.some((signer) => !signer.email)) throw new Error('All signatories need an email address'); if (contract.status !== 'draft') throw new Error('Only drafts can be sent'); const [updated] = await db.update(contracts).set({ status: 'sent', sentAt: new Date(), updatedAt: new Date() }).where(and(eq(contracts.id, id), eq(contracts.creatorId, creatorId), eq(contracts.status, 'draft'))).returning(); if (!updated) throw new Error('Contract could not be sent'); await event(id, 'sent', creatorId, {}, 'attempted'); return updated; }
export async function duplicateContract(id: string) { const creatorId = await userId(); const contract = await fetchContract(id); return createContract({ clientId: contract.clientId, projectId: contract.projectId, quoteId: contract.quoteId, templateId: contract.templateId, title: `${contract.title} (Copy)`, content: contract.templateSnapshot ?? contract.content ?? '', currency: contract.currency ?? 'KES', totalAmount: contract.totalAmount, contractType: contract.contractType }); }
export async function saveContractAsTemplate(id: string, data: ContractTemplateInput) { const creatorId = await userId(); const contract = await fetchContract(id); const [template] = await db.insert(contractTemplates).values({ creatorId, name: data.name ?? contract.title, description: data.description ?? '', category: data.category ?? 'General Business', documentType: data.documentType ?? 'services', content: contract.templateSnapshot ?? contract.content ?? '', variables: data.variables ?? [], isSystemTemplate: false, isActive: true, version: 1, createdAt: new Date(), updatedAt: new Date() }).returning(); await event(id, 'saved_as_template', creatorId, { templateId: template.id }); return template; }

export async function fetchContractStats() { const creatorId = await userId(); const [row] = await db.select({ total: sql<number>`count(*)`, active: sql<number>`count(*) filter (where ${or(eq(contracts.status, 'sent'), eq(contracts.status, 'viewed'), eq(contracts.status, 'awaiting_signature'), eq(contracts.status, 'signed'))})`, awaiting_signature: sql<number>`count(*) filter (where ${or(eq(contracts.status, 'sent'), eq(contracts.status, 'viewed'), eq(contracts.status, 'awaiting_signature'))})`, expiring_soon: sql<number>`count(*) filter (where ${contracts.termEndAt} is not null and ${contracts.termEndAt} between now() and now() + interval '30 days')`, signed_this_month: sql<number>`count(*) filter (where ${contracts.signedAt} >= date_trunc('month', now()))`, draft: sql<number>`count(*) filter (where ${eq(contracts.status, 'draft')})`, signed: sql<number>`count(*) filter (where ${eq(contracts.status, 'signed')})`, declined: sql<number>`count(*) filter (where ${eq(contracts.status, 'declined')})`, expired: sql<number>`count(*) filter (where ${eq(contracts.status, 'expired')})`, cancelled: sql<number>`count(*) filter (where ${eq(contracts.status, 'cancelled')})` }).from(contracts).where(eq(contracts.creatorId, creatorId)); return row; }

export async function fetchContractTemplate(id: string) {
  const creatorId = await userId();
  const [template] = await db.select().from(contractTemplates).where(and(eq(contractTemplates.id, id), or(eq(contractTemplates.isSystemTemplate, true), eq(contractTemplates.creatorId, creatorId)), eq(contractTemplates.isActive, true)));
  if (!template) throw new Error('Template not found');
  return template;
}

export async function fetchContractTemplates({ search, category, limit = 50, offset = 0 }: { search?: string; category?: string; limit?: number; offset?: number }) {
  const creatorId = await userId();
  let where = and(or(eq(contractTemplates.isSystemTemplate, true), eq(contractTemplates.creatorId, creatorId)), eq(contractTemplates.isActive, true));
  if (search) where = and(where, or(ilike(contractTemplates.name, `%${search}%`), ilike(contractTemplates.description, `%${search}%`)));
  if (category && category !== 'all') where = and(where, eq(contractTemplates.category, category));
  const [templates, count] = await Promise.all([
    db.select().from(contractTemplates).where(where).limit(Math.min(limit, 100)).offset(Math.max(offset, 0)).orderBy(desc(contractTemplates.updatedAt)),
    db.select({ count: sql<number>`count(*)` }).from(contractTemplates).where(where),
  ]);
  return { templates, total: Number(count[0]?.count ?? 0) };
}
export async function createContractTemplate(data: ContractTemplateInput & { name: string; category: string; documentType: string; content: string }) {
  const creatorId = await userId();
  const [template] = await db.insert(contractTemplates).values({ ...data, creatorId, version: 1, createdAt: new Date(), updatedAt: new Date() }).returning();
  return template;
}
export async function updateContractTemplate(id: string, data: ContractTemplateInput) {
  const creatorId = await userId();
  const [current] = await db.select().from(contractTemplates).where(and(eq(contractTemplates.id, id), eq(contractTemplates.creatorId, creatorId), eq(contractTemplates.isSystemTemplate, false)));
  if (!current) throw new Error('Template not found or not editable');
  const [template] = await db.insert(contractTemplates).values({ ...current, id: uuidv4(), version: current.version + 1, ...data, creatorId, isSystemTemplate: false, createdAt: new Date(), updatedAt: new Date() }).returning();
  await db.update(contractTemplates).set({ isActive: false }).where(eq(contractTemplates.id, id));
  return template;
}
export async function deleteContractTemplate(id: string) {
  const creatorId = await userId();
  const [deleted] = await db.update(contractTemplates).set({ isActive: false }).where(and(eq(contractTemplates.id, id), eq(contractTemplates.creatorId, creatorId), eq(contractTemplates.isSystemTemplate, false))).returning();
  if (!deleted) throw new Error('Template not found or not editable');
  return deleted;
}
export async function duplicateContractTemplate(id: string) {
  const creatorId = await userId();
  const [source] = await db.select().from(contractTemplates).where(and(eq(contractTemplates.id, id), or(eq(contractTemplates.isSystemTemplate, true), eq(contractTemplates.creatorId, creatorId)), eq(contractTemplates.isActive, true)));
  if (!source) throw new Error('Template not found');
  const [duplicate] = await db.insert(contractTemplates).values({ creatorId, name: `${source.name} (Copy)`, description: source.description, category: source.category, documentType: source.documentType, content: source.content, variables: source.variables, isSystemTemplate: false, isActive: true, version: 1, reviewStatus: 'unreviewed', createdAt: new Date(), updatedAt: new Date() }).returning();
  return duplicate;
}

export async function getPublicContract(token: string) { const [contract] = await db.select().from(contracts).where(eq(contracts.token, token)); if (!contract) throw new Error('Contract not found'); if (contract.status === 'sent') { const viewedAt = new Date(); const [viewed] = await db.update(contracts).set({ status: 'viewed', viewedAt, updatedAt: viewedAt }).where(and(eq(contracts.id, contract.id), eq(contracts.status, 'sent'))).returning(); if (viewed) { await event(contract.id, 'viewed', null); return viewed; } } return contract; }
export async function signPublicContract(token: string, signatureData: unknown) { const [existing] = await db.select().from(contracts).where(eq(contracts.token, token)); if (!existing) throw new Error('Contract not found'); if (!['sent', 'viewed', 'awaiting_signature'].includes(existing.status)) throw new Error(`Contract cannot be signed while ${existing.status}`); const signature = typeof signatureData === 'object' && signatureData ? signatureData as { signerName?: string; signerEmail?: string; ipAddress?: string; userAgent?: string } : {}; const signedAt = new Date(); const [signed] = await db.update(contracts).set({ status: 'signed', signedAt, signerName: signature.signerName, signerEmail: signature.signerEmail, signedIp: signature.ipAddress, signedUserAgent: signature.userAgent, updatedAt: signedAt }).where(and(eq(contracts.token, token), eq(contracts.status, existing.status))).returning(); if (!signed) throw new Error('Contract signing state changed'); await event(signed.id, 'signed', null, { signerEmail: signature.signerEmail }); return signed; }
export async function declinePublicContract(token: string, signatureData: unknown) { const [existing] = await db.select().from(contracts).where(eq(contracts.token, token)); if (!existing) throw new Error('Contract not found'); if (!['sent', 'viewed', 'awaiting_signature'].includes(existing.status)) throw new Error(`Contract cannot be declined while ${existing.status}`); const signature = typeof signatureData === 'object' && signatureData ? signatureData as { signerName?: string; signerEmail?: string; ipAddress?: string; userAgent?: string } : {}; const declinedAt = new Date(); const [declined] = await db.update(contracts).set({ status: 'declined', declinedAt, signerName: signature.signerName, signerEmail: signature.signerEmail, updatedAt: declinedAt }).where(and(eq(contracts.token, token), eq(contracts.status, existing.status))).returning(); if (!declined) throw new Error('Contract state changed'); await event(declined.id, 'declined', null, { signerEmail: signature.signerEmail }); return declined; }
export const fetchContractByToken = getPublicContract;
export async function fetchContractEvents(id: string) { const creatorId = await userId(); await fetchContract(id); return db.select().from(contractEvents).where(eq(contractEvents.contractId, id)).orderBy(desc(contractEvents.createdAt)); }
export const saveAsTemplate = (id: string, name: string, description: string) => saveContractAsTemplate(id, { name, description });
