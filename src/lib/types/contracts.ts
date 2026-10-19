export interface Contract {
  id: string;
  creatorId: string;
  clientId: string;
  projectId?: string | null;
  quoteId?: string | null;
  templateId?: string | null;
  templateVersion?: number | null;
  templateSnapshot?: string | null;
  contractType?: string | null;
  title: string;
  contractNumber: string;
  status: string;
  content?: string | null;
  currency?: string | null;
  totalAmount?: number | null;
  token: string;
  expiresAt?: Date | null;
  effectiveAt?: Date | null;
  termStartAt?: Date | null;
  termEndAt?: Date | null;
  renewalAt?: Date | null;
  noticeDeadline?: Date | null;
  terminationAt?: Date | null;
  signatories?: Array<{ name?: string; email?: string; role?: string }>;
  sentAt?: Date | null;
  viewedAt?: Date | null;
  signedAt?: Date | null;
  signerName?: string | null;
  signerEmail?: string | null;
  signedIp?: string | null;
  signedUserAgent?: string | null;
  declinedAt?: Date | null;
  cancelledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  client?: { id?: string; name?: string | null; email?: string | null; company?: string | null; phone?: string | null } | null;
  project?: { id?: string; name?: string | null } | null;
}

export interface NewContract {
  clientId: string;
  projectId?: string | null;
  quoteId?: string | null;
  templateId?: string | null;
  title: string;
  content?: string;
  currency?: string;
  totalAmount?: number;
  contractType?: string | null;
  effectiveAt?: string | Date | null;
  termStartAt?: string | Date | null;
  termEndAt?: string | Date | null;
  renewalAt?: string | Date | null;
  noticeDeadline?: string | Date | null;
  signatories?: Array<{ name?: string; email?: string; role?: string }>;
}

export type UpdateContractInput = Partial<NewContract> & { status?: string; expiresAt?: string | Date | null };

export interface ContractTemplate {
  id: string;
  creatorId?: string | null;
  name: string;
  description?: string | null;
  category: string;
  documentType: string;
  content: string;
  variables?: string[] | null;
  isSystemTemplate: boolean;
  isActive: boolean;
  version?: number;
  reviewStatus?: string | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractEvent {
  id: string;
  contractId: string;
  eventType: string;
  metadata?: Record<string, unknown> | null;
  actorId?: string | null;
  outcome?: string | null;
  createdAt: Date;
}

export interface ContractStats {
  total?: number;
  active?: number;
  awaiting_signature?: number;
  expiring_soon?: number;
  signed_this_month?: number;
  draft?: number;
  sent?: number;
  viewed?: number;
  awaitingSignature?: number;
  signed?: number;
  declined?: number;
  expired?: number;
  cancelled?: number;
}

export interface Client {
  id: string;
  name?: string | null;
  email?: string | null;
  company?: string | null;
  phone?: string | null;
  location?: string | null;
}

export interface Project {
  clientId: string;
  id: string;
  name?: string | null;
  description?: string | null;
  scopeOfWork?: string | null;
  deliverables?: string | null;
  totalAmount?: number | null;
  currency?: string | null;
  paymentTerms?: string | null;
  revisionsPolicy?: string | null;
  licensingTerms?: string | null;
  noticePeriod?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
