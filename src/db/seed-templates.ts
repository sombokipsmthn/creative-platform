import { db } from '@/db';
import { contractTemplates } from '@/db/schema';
import { eq } from 'drizzle-orm';

const templates = [
  {
    name: 'Freelance Services Agreement',
    description: 'For general freelance work across all creative disciplines.',
    category: 'General Business',
    documentType: 'freelance_agreement',
    content: `# Freelance Services Agreement

This Freelance Services Agreement (the "Agreement") is made and entered into as of {{effective_date}} (the "Effective Date"), by and between:

**Creator:**
{{creator_name}}
{{creator_business_name}}
{{creator_email}}
{{creator_phone}}

**Client:**
{{client_name}}
{{client_company}}
{{client_email}}

Collectively referred to as the "Parties."

## 1. Services

The Creator agrees to provide the following services:
{{scope_of_work}}

## 2. Compensation

The Client agrees to pay the Creator the sum of {{total_fee}} {{currency}} for the services described above.

## 3. Payment Terms

Payment shall be made as follows:
{{payment_terms}}

## 4. Timeline

The services shall be completed by {{project_end_date}}.

## 5. Revisions

{{revisions_policy}}

## 6. Intellectual Property

Upon full payment, the Creator grants the Client {{licensing_terms}}.

## 7. Confidentiality

Both Parties agree to maintain the confidentiality of proprietary information exchanged during this engagement.

## 8. Termination

Either Party may terminate this Agreement with {{notice_period}} written notice.

---

*Template for general business use. Review and adapt this agreement for your specific circumstances and obtain professional legal advice where appropriate.*
`,
    variables: ['effective_date', 'creator_name', 'creator_business_name', 'creator_email', 'creator_phone', 'client_name', 'client_company', 'client_email', 'scope_of_work', 'total_fee', 'currency', 'payment_terms', 'project_end_date', 'revisions_policy', 'licensing_terms', 'notice_period'],
    isSystemTemplate: true,
  },
  {
    name: 'Photography Services Agreement',
    description: 'For professional photography projects including commercial, editorial, portrait and event work.',
    category: 'Photography',
    documentType: 'photography_agreement',
    content: `# Photography Services Agreement

This Photography Services Agreement (the "Agreement") is made and entered into as of {{effective_date}} (the "Effective Date"), by and between:

**Photographer:**
{{photographer_name}}
{{business_name}}
{{email}}
{{phone}}

**Client:**
{{client_name}}
{{client_company}}
{{client_email}}
{{client_phone}}

## 1. Services

The Photographer agrees to provide the following photography services:
- Event coverage: {{event_date}}
- Location: {{location}}
- Duration: {{duration}}
- Number of final images: {{num_images}}

## 2. Deliverables

The Photographer will deliver:
- {{num_images}} high-resolution edited images
- Online gallery for viewing and selection
- Delivery within {{delivery_timeframe}}

## 3. Fees & Payment

**Total Fee:** {{total_fee}} {{currency}}

**Deposit:** {{deposit_percentage}}% ({deposit_amount}) due upon signing.
**Balance:** {{balance}} due {{payment_due_date}}.

## 4. Usage Rights

Client receives {{usage_rights}}. Creator retains all copyright and ownership of raw files.

## 5. Cancellation

If Client cancels, the deposit is non-refundable. Rescheduling requires {{reschedule_notice}} notice.

## 6. Liability

Photographer is not liable for lost or damaged files beyond the fee paid.

---

*Template for general business use. Review and adapt this agreement for your specific circumstances and obtain professional legal advice where appropriate.*
`,
    variables: ['effective_date', 'photographer_name', 'business_name', 'email', 'phone', 'client_name', 'client_company', 'client_email', 'client_phone', 'event_date', 'location', 'duration', 'num_images', 'delivery_timeframe', 'total_fee', 'currency', 'deposit_percentage', 'deposit_amount', 'balance', 'payment_due_date', 'usage_rights', 'reschedule_notice'],
    isSystemTemplate: true,
  },
  {
    name: 'Videography Services Agreement',
    description: 'For video production projects including commercial, documentary, and event videography.',
    category: 'Video',
    documentType: 'videography_agreement',
    content: `# Videography Services Agreement

This Videography Services Agreement (the "Agreement") is made and entered into as of {{effective_date}} (the "Effective Date"), by and between:

**Videographer:**
{{videographer_name}}
{{business_name}}
{{email}}
{{phone}}

**Client:**
{{client_name}}
{{client_company}}
{{client_email}}

## 1. Services

The Videographer agrees to provide the following videography services:
- Event coverage: {{event_date}}
- Location: {{location}}
- Duration: {{duration}}
- Number of final videos: {{num_videos}}
- Final video length: {{video_length}}

## 2. Deliverables

The Videographer will deliver:
- {{num_videos}} professionally edited videos
- Online gallery for viewing
- Delivery within {{delivery_timeframe}}

## 3. Fees & Payment

**Total Fee:** {{total_fee}} {{currency}}

**Deposit:** {{deposit_percentage}}% ({deposit_amount}) due upon signing.
**Balance:** {{balance}} due {{payment_due_date}}.

## 4. Usage Rights

Client receives {{usage_rights}} for the final videos.

## 5. Cancellation

If Client cancels, the deposit is non-refundable. Rescheduling requires {{reschedule_notice}} notice.

---

*Template for general business use. Review and adapt this agreement for your specific circumstances and obtain professional legal advice where appropriate.*
`,
    variables: ['effective_date', 'videographer_name', 'business_name', 'email', 'phone', 'client_name', 'client_company', 'client_email', 'event_date', 'location', 'duration', 'num_videos', 'video_length', 'delivery_timeframe', 'total_fee', 'currency', 'deposit_percentage', 'deposit_amount', 'balance', 'payment_due_date', 'usage_rights', 'reschedule_notice'],
    isSystemTemplate: true,
  },
  {
    name: 'Video Production Agreement',
    description: 'For comprehensive video production projects including pre-production, production, and post-production.',
    category: 'Video',
    documentType: 'video_production_agreement',
    content: `# Video Production Agreement

This Video Production Agreement (the "Agreement") is made and entered into as of {{effective_date}} (the "Effective Date"), by and between:

**Producer:**
{{producer_name}}
{{production_company}}
{{email}}
{{phone}}

**Client:**
{{client_name}}
{{client_company}}
{{client_email}}

## 1. Project Overview

The Producer agrees to produce a video titled "{{project_title}}" with the following specifications:
- Type: {{video_type}}
- Length: {{video_length}}
- Format: {{format}}
- Delivery: {{delivery_method}}

## 2. Production Schedule

- Pre-production: {{pre_production_dates}}
- Production: {{production_dates}}
- Post-production: {{post_production_dates}}

## 3. Fees & Payment

**Total Fee:** {{total_fee}} {{currency}}

**Payment Schedule:**
- Deposit: {{deposit_percentage}}% ({deposit_amount})
- First milestone: {{milestone_1_amount}} due {{milestone_1_date}}
- Final delivery: {{milestone_2_amount}} due {{milestone_2_date}}

## 4. Revisions

{{revisions_policy}}

## 5. Usage Rights

Client receives {{usage_rights}} for the final video.

## 6. Cancellation

If Client cancels, the deposit is non-refundable. Rescheduling requires {{reschedule_notice}} notice.

---

*Template for general business use. Review and adapt this agreement for your specific circumstances and obtain professional legal advice where appropriate.*
`,
    variables: ['effective_date', 'producer_name', 'production_company', 'email', 'phone', 'client_name', 'client_company', 'client_email', 'project_title', 'video_type', 'video_length', 'format', 'delivery_method', 'pre_production_dates', 'production_dates', 'post_production_dates', 'total_fee', 'currency', 'deposit_percentage', 'deposit_amount', 'milestone_1_amount', 'milestone_1_date', 'milestone_2_amount', 'milestone_2_date', 'revisions_policy', 'usage_rights', 'reschedule_notice'],
    isSystemTemplate: true,
  },
  {
    name: 'Video Editing Agreement',
    description: 'For video editing and post-production services.',
    category: 'Video',
    documentType: 'video_editing_agreement',
    content: `# Video Editing Agreement

This Video Editing Agreement (the "Agreement") is made and entered into as of {{effective_date}} (the "Effective Date"), by and between:

**Editor:**
{{editor_name}}
{{business_name}}
{{email}}
{{phone}}

**Client:**
{{client_name}}
{{client_company}}
{{client_email}}

## 1. Services

The Editor agrees to provide video editing services for:
- Raw footage provided by Client
- Project title: "{{project_title}}"
- Number of videos: {{num_videos}}
- Final video length: {{video_length}} each

## 2. Deliverables

The Editor will deliver:
- {{num_videos}} professionally edited videos
- Format: {{format}}
- Delivery within {{delivery_timeframe}}

## 3. Fees & Payment

**Total Fee:** {{total_fee}} {{currency}}

**Deposit:** {{deposit_percentage}}% ({deposit_amount}) due upon signing.
**Balance:** {{balance}} due {{payment_due_date}}.

## 4. Revisions

{{revisions_policy}}

## 5. Usage Rights

Client receives {{usage_rights}} for the final videos.

## 6. Cancellation

If Client cancels, the deposit is non-refundable.

---

*Template for general business use. Review and adapt this agreement for your specific circumstances and obtain professional legal advice where appropriate.*
`,
    variables: ['effective_date', 'editor_name', 'business_name', 'email', 'phone', 'client_name', 'client_company', 'client_email', 'project_title', 'num_videos', 'video_length', 'format', 'delivery_timeframe', 'total_fee', 'currency', 'deposit_percentage', 'deposit_amount', 'balance', 'payment_due_date', 'revisions_policy', 'usage_rights'],
    isSystemTemplate: true,
  },
  {
    name: 'Creative Services Agreement',
    description: 'For creative services including branding, design, and multimedia production.',
    category: 'Creative Services',
    documentType: 'creative_services_agreement',
    content: `# Creative Services Agreement

This Creative Services Agreement (the "Agreement") is made and entered into as of {{effective_date}} (the "Effective Date"), by and between:

**Creative Professional:**
{{creator_name}}
{{business_name}}
{{email}}
{{phone}}

**Client:**
{{client_name}}
{{client_company}}
{{client_email}}

## 1. Services

The Creative Professional agrees to provide the following services:
{{services_description}}

## 2. Deliverables

The Creative Professional will deliver:
- {{deliverables}}

## 3. Fees & Payment

**Total Fee:** {{total_fee}} {{currency}}

**Payment Schedule:**
{{payment_schedule}}

## 4. Timeline

**Start Date:** {{start_date}}
**Delivery Date:** {{delivery_date}}

## 5. Revisions

{{revisions_policy}}

## 6. Intellectual Property

{{ip_clause}}

## 7. Confidentiality

Both Parties agree to maintain the confidentiality of proprietary information exchanged during this engagement.

## 8. Termination

Either Party may terminate this Agreement with {{notice_period}} written notice.

---

*Template for general business use. Review and adapt this agreement for your specific circumstances and obtain professional legal advice where appropriate.*
`,
    variables: ['effective_date', 'creator_name', 'business_name', 'email', 'phone', 'client_name', 'client_company', 'client_email', 'services_description', 'deliverables', 'total_fee', 'currency', 'payment_schedule', 'start_date', 'delivery_date', 'revisions_policy', 'ip_clause', 'notice_period'],
    isSystemTemplate: true,
  },
  {
    name: 'Creative Retainer Agreement',
    description: 'For ongoing creative services under a retainer arrangement.',
    category: 'Creative Services',
    documentType: 'creative_retainer_agreement',
    content: `# Creative Retainer Agreement

This Creative Retainer Agreement (the "Agreement") is made and entered into as of {{effective_date}} (the "Effective Date"), by and between:

**Service Provider:**
{{provider_name}}
{{business_name}}
{{email}}
{{phone}}

**Client:**
{{client_name}}
{{client_company}}
{{client_email}}

## 1. Services

The Service Provider agrees to provide ongoing creative services as described in Exhibit A attached hereto.

## 2. Term

This Agreement shall commence on {{start_date}} and continue for {{term_duration}} unless terminated as provided herein.

## 3. Fees & Payment

**Monthly Retainer:** {{monthly_fee}} {{currency}}
**Due Date:** {{due_date}} of each month
**Payment Method:** {{payment_method}}

## 4. Scope

Services included:
{{scope_of_work}}

## 5. Termination

Either Party may terminate this Agreement with {{notice_period}} written notice.

---

*Template for general business use. Review and adapt this agreement for your specific circumstances and obtain professional legal advice where appropriate.*
`,
    variables: ['effective_date', 'provider_name', 'business_name', 'email', 'phone', 'client_name', 'client_company', 'client_email', 'start_date', 'term_duration', 'monthly_fee', 'currency', 'due_date', 'payment_method', 'scope_of_work', 'notice_period'],
    isSystemTemplate: true,
  },
  {
    name: 'Graphic Design Agreement',
    description: 'For graphic design services including branding, print, and digital design.',
    category: 'Design',
    documentType: 'graphic_design_agreement',
    content: `# Graphic Design Agreement

This Graphic Design Agreement (the "Agreement") is made and entered into as of {{effective_date}} (the "Effective Date"), by and between:

**Designer:**
{{designer_name}}
{{business_name}}
{{email}}
{{phone}}

**Client:**
{{client_name}}
{{client_company}}
{{client_email}}

## 1. Services

The Designer agrees to provide the following graphic design services:
{{services_description}}

## 2. Deliverables

The Designer will deliver:
- {{deliverables}}
- File formats: {{file_formats}}

## 3. Fees & Payment

**Total Fee:** {{total_fee}} {{currency}}

**Payment Schedule:**
{{payment_schedule}}

## 4. Revisions

{{revisions_policy}}

## 5. Intellectual Property

Upon full payment, the Designer grants the Client {{licensing_terms}}.

## 6. Timeline

**Start Date:** {{start_date}}
**Delivery Date:** {{delivery_date}}

---

*Template for general business use. Review and adapt this agreement for your specific circumstances and obtain professional legal advice where appropriate.*
`,
    variables: ['effective_date', 'designer_name', 'business_name', 'email', 'phone', 'client_name', 'client_company', 'client_email', 'services_description', 'deliverables', 'file_formats', 'total_fee', 'currency', 'payment_schedule', 'revisions_policy', 'licensing_terms', 'start_date', 'delivery_date'],
    isSystemTemplate: true,
  },
  {
    name: 'Content Creation Agreement',
    description: 'For content creation services including social media, blogs, and digital content.',
    category: 'Creative Services',
    documentType: 'content_creation_agreement',
    content: `# Content Creation Agreement

This Content Creation Agreement (the "Agreement") is made and entered into as of {{effective_date}} (the "Effective Date"), by and between:

**Content Creator:**
{{creator_name}}
{{business_name}}
{{email}}
{{phone}}

**Client:**
{{client_name}}
{{client_company}}
{{client_email}}

## 1. Services

The Content Creator agrees to provide the following content creation services:
{{services_description}}

## 2. Deliverables

The Content Creator will deliver:
- {{deliverables}}
- Delivery schedule: {{delivery_schedule}}

## 3. Fees & Payment

**Total Fee:** {{total_fee}} {{currency}}

**Payment Schedule:**
{{payment_schedule}}

## 4. Usage Rights

Client receives {{usage_rights}} for all content created.

## 5. Revisions

{{revisions_policy}}

## 6. Timeline

**Start Date:** {{start_date}}
**Completion Date:** {{completion_date}}

---

*Template for general business use. Review and adapt this agreement for your specific circumstances and obtain professional legal advice where appropriate.*
`,
    variables: ['effective_date', 'creator_name', 'business_name', 'email', 'phone', 'client_name', 'client_company', 'client_email', 'services_description', 'deliverables', 'delivery_schedule', 'total_fee', 'currency', 'payment_schedule', 'usage_rights', 'revisions_policy', 'start_date', 'completion_date'],
    isSystemTemplate: true,
  },
  {
    name: 'NDA / Confidentiality Agreement',
    description: 'For protecting confidential information shared between parties.',
    category: 'General Business',
    documentType: 'nda_agreement',
    content: `# Non-Disclosure Agreement

This Non-Disclosure Agreement (the "Agreement") is made and entered into as of {{effective_date}} (the "Effective Date"), by and between:

**Disclosing Party:**
{{disclosing_party_name}}
{{disclosing_party_business}}
{{disclosing_party_email}}

**Receiving Party:**
{{receiving_party_name}}
{{receiving_party_business}}
{{receiving_party_email}}

## 1. Definition of Confidential Information

"Confidential Information" means all non-public information disclosed by the Disclosing Party to the Receiving Party, including but not limited to business plans, customer lists, technical data, and trade secrets.

## 2. Obligations

The Receiving Party agrees to:
- Hold Confidential Information in strict confidence
- Use Confidential Information only for the Purpose
- Not disclose Confidential Information to third parties

## 3. Exclusions

Confidential Information does not include information that:
- Is or becomes publicly available
- Was known prior to disclosure
- Is independently developed

## 4. Term

This Agreement shall remain in effect for {{term_duration}} from the Effective Date.

## 5. Remedies

The Receiving Party acknowledges that monetary damages may be insufficient remedy for breach of this Agreement.

---

*Template for general business use. Review and adapt this agreement for your specific circumstances and obtain professional legal advice where appropriate.*
`,
    variables: ['effective_date', 'disclosing_party_name', 'disclosing_party_business', 'disclosing_party_email', 'receiving_party_name', 'receiving_party_business', 'receiving_party_email', 'term_duration'],
    isSystemTemplate: true,
  },
  {
    name: 'Project Services Agreement',
    description: 'For project-based work with defined deliverables and timelines.',
    category: 'General Business',
    documentType: 'project_services_agreement',
    content: `# Project Services Agreement

This Project Services Agreement (the "Agreement") is made and entered into as of {{effective_date}} (the "Effective Date"), by and between:

**Service Provider:**
{{provider_name}}
{{business_name}}
{{email}}
{{phone}}

**Client:**
{{client_name}}
{{client_company}}
{{client_email}}

## 1. Project Scope

The Service Provider agrees to complete the following project:
**Project Title:** {{project_title}}
**Description:** {{project_description}}

## 2. Deliverables

The Service Provider will deliver:
{{deliverables}}

## 3. Fees & Payment

**Total Fee:** {{total_fee}} {{currency}}

**Payment Schedule:**
{{payment_schedule}}

## 4. Timeline

**Start Date:** {{start_date}}
**End Date:** {{end_date}}

## 5. Revisions

{{revisions_policy}}

## 6. Acceptance

Client shall review and accept deliverables within {{acceptance_period}} of delivery.

## 7. Intellectual Property

{{ip_clause}}

---

*Template for general business use. Review and adapt this agreement for your specific circumstances and obtain professional legal advice where appropriate.*
`,
    variables: ['effective_date', 'provider_name', 'business_name', 'email', 'phone', 'client_name', 'client_company', 'client_email', 'project_title', 'project_description', 'deliverables', 'total_fee', 'currency', 'payment_schedule', 'start_date', 'end_date', 'revisions_policy', 'acceptance_period', 'ip_clause'],
    isSystemTemplate: true,
  },
  {
    name: 'Independent Contractor Agreement',
    description: 'For engaging independent contractors for specific services.',
    category: 'General Business',
    documentType: 'independent_contractor_agreement',
    content: `# Independent Contractor Agreement

This Independent Contractor Agreement (the "Agreement") is made and entered into as of {{effective_date}} (the "Effective Date"), by and between:

**Company:**
{{company_name}}
{{company_address}}
{{company_email}}

**Contractor:**
{{contractor_name}}
{{contractor_address}}
{{contractor_email}}
{{contractor_phone}}

## 1. Services

The Contractor agrees to provide the following services:
{{services_description}}

## 2. Independent Contractor Relationship

The Contractor is an independent contractor, not an employee of the Company. The Contractor is responsible for all taxes, insurance, and benefits.

## 3. Compensation

**Fee:** {{fee}} {{currency}}
**Payment Terms:** {{payment_terms}}

## 4. Term

This Agreement shall commence on {{start_date}} and continue until {{end_date}} unless terminated earlier.

## 5. Confidentiality

The Contractor agrees to maintain confidentiality of all proprietary information.

## 6. Intellectual Property

All work product created by the Contractor under this Agreement shall be owned by the Company.

## 7. Termination

Either Party may terminate this Agreement with {{notice_period}} written notice.

---

*Template for general business use. Review and adapt this agreement for your specific circumstances and obtain professional legal advice where appropriate.*
`,
    variables: ['effective_date', 'company_name', 'company_address', 'company_email', 'contractor_name', 'contractor_address', 'contractor_email', 'contractor_phone', 'services_description', 'fee', 'currency', 'payment_terms', 'start_date', 'end_date', 'notice_period'],
    isSystemTemplate: true,
  },
];

async function seed() {
  console.log('Seeding contract templates...');
  // Clear existing system templates
  await db.delete(contractTemplates).where(eq(contractTemplates.isSystemTemplate, true));
  
  // Insert system templates
  for (const template of templates) {
    await db.insert(contractTemplates).values({
      name: template.name,
      description: template.description,
      category: template.category,
      documentType: template.documentType,
      content: template.content,
      variables: template.variables,
      isSystemTemplate: template.isSystemTemplate,
      creatorId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  console.log(`Seeded ${templates.length} system templates`);
}

seed().catch(console.error);
