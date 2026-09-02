export interface Contract {
  id: string;
  creatorId: string;
  clientId: string;
  projectId?: string | null;
  quoteId?: string | null;
  templateId?: string | null;
  title: string;
  contractNumber: string;
  status: string;
  content?: string | null;
  currency?: string | null;
  totalAmount?: number | null;
  token: string;
  expiresAt?: Date | null;
  sentAt?: Date | null;
  viewedAt?: Date | null;
  signedAt?: Date | null;
  declinedAt?: Date | null;
  cancelledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  client?: { name?: string | null; email?: string | null; company?: string | null } | null;
  project?: { name?: string | null } | null;
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
}

export interface UpdateContractInput extends Partial<NewContract> {}

export interface ContractTemplate {
  id: string;
  creatorId?: string | null;
  name: string;
  description?: string | null;
  category: string;
  documentType: string;
  content: string;
  variables?: string | null;
  isSystemTemplate: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractEvent {
  id: string;
  contractId: string;
  eventType: string;
  metadata?: string | null;
  createdAt: Date;
}

export interface ContractStats {
  totalContracts?: number;
  drafts?: number;
  sent?: number;
  viewed?: number;
  awaitingSignature?: number;
  signed?: number;
  expired?: number;
}

export interface Client {
  id: string;
  name?: string | null;
  email?: string | null;
  company?: string | null;
  phone?: string | null;
}

export interface Project {
  id: string;
  name?: string | null;
  description?: string | null;
}
