# P1 Recovery — Comprehensive Audit

**Last Updated**: 2024-09-15  
**Status**: ⚠️ RECOVERY NEEDED — 5 items pending

---

## Overview

P1 recovery focuses on five critical product capabilities that were planned but are either missing, disconnected, or only partially implemented:

1. **Receipt Intelligence** — OCR + merchant/KRA PIN extraction
2. **Google Drive Import** — Historical scanner recovery
3. **Public Portfolio** — Historical implementation vs. current public-facing functionality
4. **Kenyan Tax/eTIMS** — Planned workflows vs. current implementation
5. **Workflow Connections** — Full Project → Client → Quote → Invoice → Gallery circuit

---

## Item 7: Receipt Intelligence 🔴 **NOT IMPLEMENTED**

### Planned Capability
- Capture business receipts (photo/upload)
- Extract structured data via OCR
- Identify merchant details
- Extract/validate KRA PIN
- Store receipt metadata
- Link receipts to expenses or invoices

### Current Status
**MISSING**  
No receipt scanning, OCR, or merchant extraction code found in codebase.

### Database Schema
❌ No `receipts` table exists  
❌ No `merchants` table for KRA PIN lookups  
❌ No `expenses` table for receipt/expense tracking

### API Endpoints
❌ No `/api/receipts/upload` endpoint  
❌ No `/api/receipts/ocr` or `/api/receipts/process` endpoint  
❌ No `/api/merchants/validate-kra-pin` endpoint  

### Frontend Components
❌ No receipt scanner UI component  
❌ No OCR result display/review component  
❌ No merchant search/validation component  

### Public Homepage Claim
**Item 07 in capabilities list**: "Receipt Intelligence — Capture business receipts and extract useful merchant information such as KRA PIN details for your records."

**Status**: ⚠️ **Promised but not built**

### Recovery Actions Required
1. **Schema**: Add `receipts`, `merchants`, and optionally `expenses` tables
2. **OCR Integration**: Integrate Tesseract.js or cloud OCR API (Google Vision, AWS Textract)
3. **Merchant/KRA PIN Extraction**: Implement regex/NLP-based extraction
4. **API Routes**: Create receipt upload, processing, and merchant validation endpoints
5. **UI Components**: Build receipt capture, review, and metadata editing workflows
6. **Validation**: Store KRA PIN with merchant validation and audit trail

---

## Item 8: Google Drive Import 🟡 **STUB ONLY**

### Planned Capability
- Scan Google Drive folders for images
- Import portfolio/gallery content from Drive
- Bulk add images to galleries or portfolio
- Auto-organize by folder structure

### Current Status
**PARTIAL IMPLEMENTATION**  
A stub exists at `/src/app/api/drive/scan/route.ts` but is non-functional:

```typescript
// Current state:
const DRIVE_FOLDER_IDS = [
  'FOLDER_ID_1_PHOTOGRAPHY',
  'FOLDER_ID_2_CAMPAIGNS',
  'FOLDER_ID_3_VISUAL_IDENTITY',
];
// ❌ Hard-coded placeholder IDs — no UI to configure
// ❌ Google Drive API key required but not documented
// ❌ Returns images but no import/save logic
// ❌ No connection to gallery/project workflow
```

### Database Schema
❌ No `drive_imports` table to track import history  
❌ No connection between Drive imports and galleries  

### API Endpoints
⚠️ `/api/drive/scan` exists but:
- Returns raw Drive file list
- No storage to database
- No UI integration
- No error handling for auth failures

### Frontend Components
❌ No Drive import UI in admin dashboard  
❌ No import history or status tracking  
❌ No bulk import preview or confirmation  

### Environment Configuration
❌ `GOOGLE_DRIVE_API_KEY` required but:
- Not documented in `.env.example`
- No instructions for user to set up Drive API credentials
- No service account flow documented

### Recovery Actions Required
1. **Setup Documentation**: Write Drive API credential setup guide
2. **Database**: Create `drive_imports` table + audit trail
3. **API Enhancement**: Implement import-to-gallery workflow, storage, error handling
4. **Frontend**: Build Drive folder browser UI with import preview and confirmation
5. **Auth Flow**: Support user's own Drive credentials (OAuth 2.0) instead of static API key
6. **Testing**: Verify imports work with real Drive folders and images

---

## Item 9: Public Portfolio — Implementation Audit 🟡 **PARTIAL**

### Planned Workflow
```
Public Home → Work Portfolio → Single Work View → Creator Contact
```

### Current Implementation

#### ✅ **Public Home** (`/src/app/page.tsx`)
- Hero section with KIPSMTHN branding
- 8 capabilities highlighted (including Receipt Intelligence & Kenyan Tax Tools)
- Workflow visualization (Attract → Convert → Create → Deliver → Get Paid)
- 3 pricing tiers (Starter/Studio/Pro)
- FAQ section
- CTA buttons linking to `/sign-up`, `/sign-in`, `/admin/onboarding`

#### ✅ **About Page** (`/src/app/about`)
- Creator profile bio section
- Links to services and work

#### ✅ **Services Page** (`/src/app/services`)
- Creator services listing

#### ✅ **Work/Portfolio** (`/src/app/work`)
- Project showcase gallery
- Status: **NOT CHECKED** — needs inspection

#### ✅ **Contact** (`/src/app/contact`)
- Enquiry form
- Status: **NOT CHECKED** — needs inspection

#### ⚠️ **Portfolio Data Source**
**CRITICAL ISSUE**: Portfolio likely uses **hardcoded demo data** or incomplete API integration.
- No clear connection from database `projects` → public portfolio display
- Public API endpoints missing: `/api/public/portfolio`, `/api/public/projects/[slug]`
- No slug system for project URLs (public-friendly URLs)

### Database Schema
- `projects` table exists with `creatorId`, `clientId`, `name`, `description`, `status`
- ❌ No `slug` field for SEO-friendly URLs
- ❌ No `isPublished` or `visibility` flag for public/private control
- ❌ No `portfolioOrder` for custom ordering
- ❌ No `coverImage` or `heroImageUrl` for portfolio display

### API Endpoints
❌ `/api/public/portfolio` — missing
❌ `/api/public/projects/[slug]` — missing
❌ `/api/public/projects/[id]/gallery` — missing
❌ `/api/portfolios/publish-settings` — missing

### Frontend Components
⚠️ Work portfolio page exists but:
- Likely using demo/seeded data
- No dynamic loading from API
- No proper SEO metadata per project
- No breadcrumb or back navigation

### Public Portfolio Visibility Logic
❌ No concept of "portfolio projects" vs. "private projects"
❌ No publish/draft status for portfolio items
❌ No creator-controlled portfolio visibility settings

### Recovery Actions Required
1. **Schema Updates**: Add `slug`, `isPublished`, `portfolioOrder`, `coverImageUrl` to `projects`
2. **Database Migration**: Add fields and backfill existing projects
3. **Public API**: Create `/api/public/portfolio` and `/api/public/projects/[slug]` endpoints
4. **Frontend**: Refactor `/src/app/work` to dynamically load from API
5. **Settings UI**: Add portfolio visibility/ordering controls to creator dashboard
6. **SEO**: Implement proper metadata, structured data, and canonical URLs per project
7. **Testing**: Verify demo portfolio loads correctly with multiple projects

---

## Item 10: Kenyan Tax/eTIMS Audit 🟡 **PARTIAL**

### Planned Scope
- VAT calculations (Kenyan VAT rate: 16%)
- KRA PIN storage and validation
- eTIMS (Electronic Tax Invoice Management System) invoice workflow
- Withholding Tax (WHT) tracking
- Tax compliance fields and audit trails
- KRA-aware invoice templates

### Current Implementation

#### ✅ **Business Profile Schema**
```typescript
export const creatorBusinessProfiles = pgTable("creator_business_profiles", {
  kraPin: text("kra_pin"),
  vatRegistered: boolean("vat_registered"),
  vatNumber: text("vat_number"),
  whtRate: integer("wht_rate"),
  // ...
});
```
**Status**: Fields exist but **no UI to edit them**.

#### ✅ **Quote/Invoice Tax Fields**
```typescript
export const quotes = pgTable("quotes", {
  tax: integer("tax"),
  discountType: text("discount_type"),
  discountValue: integer("discount_value"),
  // ...
});

export const invoices = pgTable("invoices", {
  tax: integer("tax"),
  status: text("status"), // Could track eTIMS submission
  // ...
});
```
**Status**: Fields exist but **eTIMS integration missing**.

#### ❌ **eTIMS Integration**
- No API endpoint to submit invoices to eTIMS
- No webhook to receive eTIMS validation responses
- No eTIMS submission status tracking
- No unique invoice numbering per KRA rules

#### ⚠️ **Client Entity Schema**
```typescript
export const clients = pgTable("clients", {
  etimsInvoiceStatus: text("etims_invoice_status"),
  taxCertificateStatus: text("tax_certificate_status"),
  // ...
});
```
**Status**: Fields exist but **no UI or workflow** to manage them.

#### ❌ **VAT Calculations**
- No documented business logic for VAT calculation
- No exemption handling
- No reverse charge rules
- No VAT reconciliation reports

#### ❌ **WHT (Withholding Tax)**
- Field exists: `whtRate` in `creatorBusinessProfiles`
- No calculation logic
- No invoice deduction workflow
- No WHT cert generation

#### ❌ **Tax Reports**
- No tax summary endpoints
- No VAT quarterly reports
- No income tax reports
- No audit trail for tax compliance

### API Endpoints
❌ `/api/invoices/submit-to-etims` — missing
❌ `/api/tax/vat-summary` — missing
❌ `/api/tax/compliance-report` — missing
❌ `/api/business/update-tax-settings` — missing

### Frontend
❌ No tax settings UI in creator onboarding
❌ No VAT/KRA PIN configuration dashboard
❌ No eTIMS invoice submission workflow
❌ No tax compliance dashboard

### Public Homepage Claim
**Item 06 in capabilities**: "Kenyan Tax Tools — Designed around Kenyan creators with KRA-aware workflows, VAT calculations and an eTIMS-oriented invoicing workflow."

**Status**: ⚠️ **Partially built (schema only) — UI and integrations missing**

### Recovery Actions Required
1. **UI Implementation**: Add tax settings to business profile editor
2. **VAT Logic**: Implement VAT calculation with exemption rules
3. **eTIMS Integration**: Connect to KRA's eTIMS API (requires KRA credentials)
4. **Invoice Numbering**: Implement KRA-compliant invoice number sequencing
5. **Tax Reports**: Build VAT, income, and compliance reports
6. **WHT Handling**: Implement withholding tax deduction and tracking
7. **Documentation**: Write KRA integration and tax compliance guide
8. **Testing**: Test with sample invoices and validate eTIMS submission

---

## Item 11: Workflow Connections — Full Circuit Audit 🟡 **PARTIAL**

### Intended Workflow
```
Client (CRM)
   ↓
Project (Assigned to Client)
   ↓
Quote (Linked to Project + Client)
   ↓
Invoice (Converted from Quote)
   ↓
Gallery (Linked to Project + Client)
   ↓
Proofing/Delivery (Client Portal)
```

### Current Database Relationships

#### ✅ **Client ↔ Project**
```typescript
projects: {
  clientId: FK → clients.id ✅
}
```
**Status**: Connected ✅

#### ✅ **Client ↔ Quote**
```typescript
quotes: {
  clientId: FK → clients.id ✅
}
```
**Status**: Connected ✅

#### ✅ **Project ↔ Gallery**
```typescript
galleries: {
  projectId: FK → projects.id ✅
}
```
**Status**: Connected ✅

#### ✅ **Client ↔ Gallery**
```typescript
galleries: {
  clientId: FK → clients.id ✅
}
```
**Status**: Connected ✅

#### ⚠️ **Quote ↔ Invoice**
```typescript
quotes: {
  invoiceId: UUID (NOT A FK!) ❌
}

invoices: {
  quoteId: FK → quotes.id ✅
}
```
**Status**: **PARTIALLY BROKEN**
- Quotes have optional `invoiceId` field (UUID) but NOT a foreign key reference
- Invoices have foreign key to quotes
- This is asymmetrical and error-prone
- **Fix Needed**: Make quotes.invoiceId a proper foreign key

#### ❌ **Project ↔ Quote**
```typescript
quotes: {
  // NO projectId field ❌
  projectName: text ("project_name") // Denormalized, error-prone
}
```
**Status**: **NOT CONNECTED**
- Quotes only have `projectName` (string) not `projectId` (FK)
- Cannot reliably link quotes back to projects
- Cannot prevent deletion of project with active quotes
- **Fix Needed**: Add `projectId` foreign key to quotes table

#### ❌ **Invoice ↔ Project**
```typescript
invoices: {
  // NO projectId field ❌
}
```
**Status**: **NOT CONNECTED**
- Invoices have clientId but not projectId
- Cannot trace invoice back to original project work
- **Fix Needed**: Add `projectId` foreign key to invoices table

#### ⚠️ **Quote ↔ Gallery**
- No direct link exists
- Could be inferred through: Quote → Project → Gallery
- But no explicit workflow to "create gallery from quote"

### API Endpoints
❌ `/api/projects/[id]/quotes` — missing
❌ `/api/projects/[id]/invoices` — missing
❌ `/api/projects/[id]/galleries` — missing
❌ `/api/quotes/[id]/convert-to-invoice` — partially implemented?
❌ `/api/clients/[id]/full-workflow` — missing (returns all projects, quotes, invoices, galleries)

### Frontend Workflow UI
❌ No visual connection between Client → Project → Quote → Invoice → Gallery
❌ No "create project from quote" workflow
❌ No "create gallery from project" quick action
❌ No invoice creation workflow triggered from quote approval
❌ No client dashboard showing complete project lifecycle

### Data Integrity Issues
1. **Quote ↔ Project**: Only `projectName` string — no FK reference
   - Risk: Cannot enforce referential integrity
   - Risk: Orphaned quotes if project deleted
   - Risk: Quotes with same name could be ambiguous

2. **Quote ↔ Invoice**: Asymmetrical foreign keys
   - quotes.invoiceId is UUID (not FK)
   - invoices.quoteId is proper FK
   - Risk: Orphaned quotes.invoiceId values
   - Risk: Cannot cascade delete properly

3. **Invoice ↔ Project**: No connection
   - Cannot know what project an invoice relates to
   - Cannot build project profitability reports
   - Cannot archive completed projects with all their invoices

### Recovery Actions Required

#### Phase 1: Schema Fix
1. Add `projectId` FK to `quotes` table (migration)
2. Make `quotes.invoiceId` a proper FK (migration)
3. Add `projectId` FK to `invoices` table (migration)
4. Backfill existing quotes/invoices with project data where possible
5. Run migrations: `npm run db:migrate`

#### Phase 2: API Implementation
1. Create `/api/projects/[id]/quotes` → GET all quotes for project
2. Create `/api/projects/[id]/invoices` → GET all invoices for project
3. Create `/api/projects/[id]/galleries` → GET all galleries for project
4. Create `/api/clients/[id]/full-workflow` → GET complete client lifecycle
5. Implement quote → invoice conversion with automatic project linking
6. Implement workflow validation (e.g., cannot create invoice without quote)

#### Phase 3: Frontend UI
1. Add "Workflow" tab to project detail view showing Quote → Invoice → Gallery chain
2. Add quick actions: "Create Quote from Project", "Create Invoice from Quote", "Create Gallery for Project"
3. Add Client Dashboard with card-based workflow visualization
4. Add Project Timeline showing quote → approval → invoicing → delivery
5. Add Invoice view with link back to source quote and project

#### Phase 4: Testing
1. Create test client
2. Create test project for client
3. Create quote for project
4. Verify quote is linked to project and client
5. Convert quote to invoice
6. Verify invoice shows project and quote context
7. Create gallery linked to project and client
8. Verify client can see all connected items
9. Test workflow validation (prevent orphaned records)
10. Test cascade deletion (delete project → quotes/invoices/galleries all deleted)

---

## Summary Table

| Item | Feature | Status | Priority | Est. Effort |
|------|---------|--------|----------|-------------|
| 7 | Receipt Intelligence | 🔴 Missing | HIGH | 3-4 weeks |
| 8 | Google Drive Import | 🟡 Stub | MEDIUM | 2-3 weeks |
| 9 | Public Portfolio | 🟡 Partial | HIGH | 1-2 weeks |
| 10 | Kenyan Tax/eTIMS | 🟡 Schema only | HIGH | 2-3 weeks |
| 11 | Workflow Connections | 🟡 Broken links | CRITICAL | 1-2 weeks |

---

## Recommendations

### Immediate (This Week)
1. **Fix workflow schema** (Item 11) — Add missing FKs to quotes and invoices
2. **Run migrations** — Backfill project/invoice relationships
3. **Update API** — Link endpoints for projects → quotes/invoices/galleries

### Short-term (2-3 Weeks)
4. **Public Portfolio** (Item 9) — Make portfolio dynamic, add slug system
5. **Kenyan Tax UI** (Item 10) — Add business settings and tax configuration

### Medium-term (1-2 Months)
6. **Receipt Intelligence** (Item 7) — Implement OCR and merchant extraction
7. **Google Drive** (Item 8) — Complete Drive import workflow with UI

---

## Files to Review/Modify

### Database
- `src/db/schema.ts` — Add missing foreign keys
- `drizzle/` — Create migration files for schema fixes

### API
- `src/app/api/projects/` — Add workflow-related endpoints
- `src/app/api/invoices/` — Add tax and eTIMS endpoints
- `src/app/api/public/` — Add public portfolio endpoints

### Frontend
- `src/app/admin/projects/` — Add workflow UI
- `src/app/admin/dashboard/` — Add client lifecycle visualization
- `src/app/work/` — Convert to dynamic portfolio loading
- `src/components/` — Add receipt scanner, Drive importer, tax config components

---

## Questions for Product Owner

1. **Receipt Intelligence**: Should receipts be linked to expenses? Should KRA PIN lookup be automated or manual?
2. **Google Drive**: Should import use creator's own Google account (OAuth) or shared service account?
3. **Public Portfolio**: Should portfolio be tied to pricing tier (e.g., only Pro gets public portfolio)?
4. **Tax/eTIMS**: Should eTIMS submission be manual or automatic? Requires KRA test/prod credentials?
5. **Workflow**: Should gallery creation from project be automatic or manual user action?

---

Generated: 2024-09-15  
Audit Scope: P1 Recovery Items 7–11
