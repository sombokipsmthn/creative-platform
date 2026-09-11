'use client';

/**
 * Field type definitions for contract templates
 * Maps variable names to UI controls and metadata
 */

export type FieldType = 
  | 'text'
  | 'textarea'
  | 'date'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'email'
  | 'phone'
  | 'client'
  | 'project'
  | 'select'
  | 'multiline';

export interface FieldMetadata {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  hint?: string;
  source?: 'client' | 'project' | 'creator' | 'user';
}

/**
 * Map variable names to field metadata
 * This drives the entire editing experience
 */
export const fieldMetadataMap: Record<string, FieldMetadata> = {
  // Client-related fields
  client_name: {
    key: 'client_name',
    label: 'Client',
    type: 'client',
    required: true,
    source: 'client',
  },
  client_company: {
    key: 'client_company',
    label: 'Client Company',
    type: 'text',
    required: false,
    source: 'client',
  },
  client_email: {
    key: 'client_email',
    label: 'Client Email',
    type: 'email',
    required: false,
    source: 'client',
  },
  client_phone: {
    key: 'client_phone',
    label: 'Client Phone',
    type: 'phone',
    required: false,
    source: 'client',
  },
  client_location: {
    key: 'client_location',
    label: 'Client Location',
    type: 'text',
    required: false,
    source: 'client',
  },

  // Creator/Provider fields
  creator_name: {
    key: 'creator_name',
    label: 'Creator Name',
    type: 'text',
    required: true,
  },
  creator_business_name: {
    key: 'creator_business_name',
    label: 'Business Name',
    type: 'text',
    required: false,
  },
  creator_email: {
    key: 'creator_email',
    label: 'Creator Email',
    type: 'email',
    required: false,
  },
  creator_phone: {
    key: 'creator_phone',
    label: 'Creator Phone',
    type: 'phone',
    required: false,
  },

  photographer_name: {
    key: 'photographer_name',
    label: 'Photographer Name',
    type: 'text',
    required: true,
  },
  videographer_name: {
    key: 'videographer_name',
    label: 'Videographer Name',
    type: 'text',
    required: true,
  },
  designer_name: {
    key: 'designer_name',
    label: 'Designer Name',
    type: 'text',
    required: true,
  },
  provider_name: {
    key: 'provider_name',
    label: 'Provider Name',
    type: 'text',
    required: true,
  },
  producer_name: {
    key: 'producer_name',
    label: 'Producer Name',
    type: 'text',
    required: true,
  },
  editor_name: {
    key: 'editor_name',
    label: 'Editor Name',
    type: 'text',
    required: true,
  },

  business_name: {
    key: 'business_name',
    label: 'Business Name',
    type: 'text',
    required: false,
  },
  email: {
    key: 'email',
    label: 'Email',
    type: 'email',
    required: false,
  },
  phone: {
    key: 'phone',
    label: 'Phone',
    type: 'phone',
    required: false,
  },

  // Project-related fields
  project_name: {
    key: 'project_name',
    label: 'Project',
    type: 'project',
    required: true,
    source: 'project',
  },
  project_title: {
    key: 'project_title',
    label: 'Project Title',
    type: 'text',
    required: true,
  },
  project_description: {
    key: 'project_description',
    label: 'Project Description',
    type: 'textarea',
    required: false,
    source: 'project',
  },

  // Date fields
  effective_date: {
    key: 'effective_date',
    label: 'Effective Date',
    type: 'date',
    required: true,
  },
  event_date: {
    key: 'event_date',
    label: 'Event Date',
    type: 'date',
    required: true,
  },
  start_date: {
    key: 'start_date',
    label: 'Start Date',
    type: 'date',
    required: false,
    source: 'project',
  },
  end_date: {
    key: 'end_date',
    label: 'End Date',
    type: 'date',
    required: false,
    source: 'project',
  },
  delivery_date: {
    key: 'delivery_date',
    label: 'Delivery Date',
    type: 'date',
    required: false,
  },
  completion_date: {
    key: 'completion_date',
    label: 'Completion Date',
    type: 'date',
    required: false,
  },
  project_end_date: {
    key: 'project_end_date',
    label: 'Project End Date',
    type: 'date',
    required: false,
  },
  payment_due_date: {
    key: 'payment_due_date',
    label: 'Payment Due Date',
    type: 'date',
    required: false,
  },
  payment_date: {
    key: 'payment_date',
    label: 'Payment Date',
    type: 'date',
    required: false,
  },

  // Specific date ranges
  pre_production_dates: {
    key: 'pre_production_dates',
    label: 'Pre-production Dates',
    type: 'text',
    required: false,
  },
  production_dates: {
    key: 'production_dates',
    label: 'Production Dates',
    type: 'text',
    required: false,
  },
  post_production_dates: {
    key: 'post_production_dates',
    label: 'Post-production Dates',
    type: 'text',
    required: false,
  },

  milestone_1_date: {
    key: 'milestone_1_date',
    label: 'Milestone 1 Date',
    type: 'date',
    required: false,
  },
  milestone_2_date: {
    key: 'milestone_2_date',
    label: 'Milestone 2 Date',
    type: 'date',
    required: false,
  },

  due_date: {
    key: 'due_date',
    label: 'Due Date',
    type: 'text',
    required: false,
  },

  // Financial fields
  total_fee: {
    key: 'total_fee',
    label: 'Total Fee',
    type: 'currency',
    required: true,
    source: 'project',
  },
  fee: {
    key: 'fee',
    label: 'Fee',
    type: 'currency',
    required: true,
  },
  monthly_fee: {
    key: 'monthly_fee',
    label: 'Monthly Fee',
    type: 'currency',
    required: true,
  },
  deposit_amount: {
    key: 'deposit_amount',
    label: 'Deposit Amount',
    type: 'currency',
    required: false,
  },
  balance: {
    key: 'balance',
    label: 'Balance',
    type: 'currency',
    required: false,
  },
  milestone_1_amount: {
    key: 'milestone_1_amount',
    label: 'Milestone 1 Amount',
    type: 'currency',
    required: false,
  },
  milestone_2_amount: {
    key: 'milestone_2_amount',
    label: 'Milestone 2 Amount',
    type: 'currency',
    required: false,
  },

  // Currency
  currency: {
    key: 'currency',
    label: 'Currency',
    type: 'select',
    required: true,
  },

  // Percentage
  deposit_percentage: {
    key: 'deposit_percentage',
    label: 'Deposit %',
    type: 'percentage',
    required: false,
  },

  // Content/Description fields
  scope_of_work: {
    key: 'scope_of_work',
    label: 'Scope of Work',
    type: 'textarea',
    required: true,
    source: 'project',
  },
  services_description: {
    key: 'services_description',
    label: 'Services Description',
    type: 'textarea',
    required: true,
  },
  deliverables: {
    key: 'deliverables',
    label: 'Deliverables',
    type: 'textarea',
    required: true,
    source: 'project',
  },
  usage_rights: {
    key: 'usage_rights',
    label: 'Usage Rights',
    type: 'textarea',
    required: true,
  },
  licensing_terms: {
    key: 'licensing_terms',
    label: 'Licensing Terms',
    type: 'textarea',
    required: false,
    source: 'project',
  },
  payment_terms: {
    key: 'payment_terms',
    label: 'Payment Terms',
    type: 'textarea',
    required: true,
    source: 'project',
  },
  payment_schedule: {
    key: 'payment_schedule',
    label: 'Payment Schedule',
    type: 'textarea',
    required: false,
  },
  revisions_policy: {
    key: 'revisions_policy',
    label: 'Revisions Policy',
    type: 'textarea',
    required: false,
    source: 'project',
  },
  notice_period: {
    key: 'notice_period',
    label: 'Notice Period',
    type: 'text',
    required: false,
  },
  ip_clause: {
    key: 'ip_clause',
    label: 'IP Clause',
    type: 'textarea',
    required: false,
  },

  // Photography/Video specific
  location: {
    key: 'location',
    label: 'Location',
    type: 'text',
    required: false,
  },
  duration: {
    key: 'duration',
    label: 'Duration',
    type: 'text',
    required: false,
  },
  num_images: {
    key: 'num_images',
    label: 'Number of Images',
    type: 'number',
    required: false,
  },
  num_videos: {
    key: 'num_videos',
    label: 'Number of Videos',
    type: 'number',
    required: false,
  },
  delivery_timeframe: {
    key: 'delivery_timeframe',
    label: 'Delivery Timeframe',
    type: 'text',
    required: false,
  },
  reschedule_notice: {
    key: 'reschedule_notice',
    label: 'Reschedule Notice Period',
    type: 'text',
    required: false,
  },
  video_type: {
    key: 'video_type',
    label: 'Video Type',
    type: 'text',
    required: false,
  },
  video_length: {
    key: 'video_length',
    label: 'Video Length',
    type: 'text',
    required: false,
  },
  format: {
    key: 'format',
    label: 'Format',
    type: 'text',
    required: false,
  },
  file_formats: {
    key: 'file_formats',
    label: 'File Formats',
    type: 'text',
    required: false,
  },
  delivery_method: {
    key: 'delivery_method',
    label: 'Delivery Method',
    type: 'text',
    required: false,
  },

  // Retainer/ongoing
  term_duration: {
    key: 'term_duration',
    label: 'Term Duration',
    type: 'text',
    required: false,
  },
  payment_method: {
    key: 'payment_method',
    label: 'Payment Method',
    type: 'text',
    required: false,
  },

  // NDA specific
  disclosing_party_name: {
    key: 'disclosing_party_name',
    label: 'Disclosing Party Name',
    type: 'text',
    required: true,
  },
  disclosing_party_business: {
    key: 'disclosing_party_business',
    label: 'Disclosing Party Business',
    type: 'text',
    required: false,
  },
  disclosing_party_email: {
    key: 'disclosing_party_email',
    label: 'Disclosing Party Email',
    type: 'email',
    required: false,
  },
  receiving_party_name: {
    key: 'receiving_party_name',
    label: 'Receiving Party Name',
    type: 'text',
    required: true,
  },
  receiving_party_business: {
    key: 'receiving_party_business',
    label: 'Receiving Party Business',
    type: 'text',
    required: false,
  },
  receiving_party_email: {
    key: 'receiving_party_email',
    label: 'Receiving Party Email',
    type: 'email',
    required: false,
  },

  // Contractor specific
  company_name: {
    key: 'company_name',
    label: 'Company Name',
    type: 'text',
    required: true,
  },
  company_address: {
    key: 'company_address',
    label: 'Company Address',
    type: 'text',
    required: false,
  },
  company_email: {
    key: 'company_email',
    label: 'Company Email',
    type: 'email',
    required: false,
  },
  contractor_name: {
    key: 'contractor_name',
    label: 'Contractor Name',
    type: 'text',
    required: true,
  },
  contractor_address: {
    key: 'contractor_address',
    label: 'Contractor Address',
    type: 'text',
    required: false,
  },
  contractor_email: {
    key: 'contractor_email',
    label: 'Contractor Email',
    type: 'email',
    required: false,
  },
  contractor_phone: {
    key: 'contractor_phone',
    label: 'Contractor Phone',
    type: 'phone',
    required: false,
  },

  // Retainer/ongoing content
  delivery_schedule: {
    key: 'delivery_schedule',
    label: 'Delivery Schedule',
    type: 'text',
    required: false,
  },
  acceptance_period: {
    key: 'acceptance_period',
    label: 'Acceptance Period',
    type: 'text',
    required: false,
  },

  // Generic fields
  production_company: {
    key: 'production_company',
    label: 'Production Company',
    type: 'text',
    required: false,
  },
};

/**
 * Get field metadata by key
 */
export function getFieldMetadata(key: string): FieldMetadata {
  return (
    fieldMetadataMap[key] || {
      key,
      label: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      type: 'text',
      required: false,
    }
  );
}

/**
 * Get all field metadata for a template
 */
export function getTemplateFieldMetadata(variables: string[]): FieldMetadata[] {
  return variables.map((v) => getFieldMetadata(v));
}

/**
 * Filter to get only required fields
 */
export function getRequiredFields(variables: string[]): FieldMetadata[] {
  return getTemplateFieldMetadata(variables).filter((f) => f.required);
}

/**
 * Get fields that should auto-populate from client
 */
export function getClientFields(): string[] {
  return Object.values(fieldMetadataMap)
    .filter((f) => f.source === 'client')
    .map((f) => f.key);
}

/**
 * Get fields that should auto-populate from project
 */
export function getProjectFields(): string[] {
  return Object.values(fieldMetadataMap)
    .filter((f) => f.source === 'project')
    .map((f) => f.key);
}
