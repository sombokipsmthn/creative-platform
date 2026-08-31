# P1 Recovery — Action Plan & Execution Guide

**Status**: Ready for implementation  
**Last Updated**: 2024-09-15  
**Scope**: Items 7–11 (Receipt Intelligence, Google Drive, Portfolio, Tax, Workflow)

---

## Priority Sequencing

### 🔴 CRITICAL (Do First)
**Item 11: Workflow Connections** — 1-2 weeks  
*Why first*: Broken foreign keys block all other features. Fixing schema unblocks subsequent work.

### 🟠 HIGH (Do Next)  
**Item 9: Public Portfolio** — 1-2 weeks  
**Item 10: Kenyan Tax/eTIMS** — 2-3 weeks  
*Why*: Both are public-facing/required for launch credibility.

### 🟡 MEDIUM (Parallel)
**Item 8: Google Drive Import** — 2-3 weeks  
**Item 7: Receipt Intelligence** — 3-4 weeks  
*Why*: Nice-to-have for MVP but deliver value for Pro users.

---

## PHASE 1: FIX WORKFLOW CONNECTIONS (1-2 weeks)

### Step 1.1: Database Schema Migration

**File**: Create `drizzle/0019_fix_workflow_connections.sql`

```sql
-- Step 1: Add projectId to quotes (nullable initially for backfill)
ALTER TABLE quotes ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE CASCADE;

-- Step 2: Convert quotes.invoiceId to proper foreign key
-- First, drop the existing text column
ALTER TABLE quotes DROP COLUMN invoice_id;

-- Add as UUID FK
ALTER TABLE quotes ADD COLUMN invoice_id uuid UNIQUE REFERENCES invoices(id) ON DELETE SET NULL;

-- Step 3: Add projectId to invoices
ALTER TABLE invoices ADD COLUMN project_id uuid REFERENCES projects(id) ON DELETE CASCADE;

-- Step 4: Backfill projectId in quotes from quoteId → invoices
UPDATE quotes
SET project_id = invoices.project_id
FROM invoices
WHERE quotes.invoice_id = invoices.id
  AND invoices.project_id IS NOT NULL;

-- Step 5: Create indexes for query performance
CREATE INDEX idx_quotes_project_id ON quotes(project_id);
CREATE INDEX idx_invoices_project_id ON invoices(project_id);
CREATE INDEX idx_quotes_client_project ON quotes(client_id, project_id);
```

**Update TypeScript Schema**: `src/db/schema.ts`

```typescript
export const quotes = pgTable("quotes", {
  // ... existing fields ...
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  // ... keep invoiceId but make it FK ...
  invoiceId: uuid("invoice_id").unique().references(() => invoices.id, { onDelete: "set null" }),
});

export const invoices = pgTable("invoices", {
  // ... existing fields ...
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  // ...
});
```

**Execute**:
```bash
npm run db:migrate
```

### Step 1.2: Create API Endpoints

**File**: `src/app/api/projects/[id]/quotes/route.ts`

```typescript
import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, invoices } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;

  const projectQuotes = await db
    .select()
    .from(quotes)
    .where(eq(quotes.projectId, projectId));

  return NextResponse.json({ quotes: projectQuotes });
}
```

**File**: `src/app/api/projects/[id]/invoices/route.ts`

```typescript
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;

  const projectInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.projectId, projectId));

  return NextResponse.json({ invoices: projectInvoices });
}
```

**File**: `src/app/api/projects/[id]/galleries/route.ts`

```typescript
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;

  const projectGalleries = await db
    .select()
    .from(galleries)
    .where(eq(galleries.projectId, projectId));

  return NextResponse.json({ galleries: projectGalleries });
}
```

**File**: `src/app/api/clients/[id]/workflow/route.ts`

```typescript
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const clientId = params.id;

  // Fetch all connected data
  const clientProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.clientId, clientId));

  const clientQuotes = await db
    .select()
    .from(quotes)
    .where(eq(quotes.clientId, clientId));

  const clientInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.clientId, clientId));

  const clientGalleries = await db
    .select()
    .from(galleries)
    .where(eq(galleries.clientId, clientId));

  return NextResponse.json({
    projects: clientProjects,
    quotes: clientQuotes,
    invoices: clientInvoices,
    galleries: clientGalleries,
  });
}
```

### Step 1.3: Update Quote → Invoice Conversion

**File**: `src/app/api/quotes/[id]/convert-to-invoice/route.ts` (update existing or create)

```typescript
import { NextResponse } from "next/server";
import { db } from "@/db";
import { quotes, invoices, invoiceItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const quoteId = params.id;

  // Fetch quote with full data
  const quote = await db
    .select()
    .from(quotes)
    .where(eq(quotes.id, quoteId))
    .then(r => r[0]);

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  // Generate invoice number (KRA-compliant)
  const invoiceNumber = await generateKRAInvoiceNumber(quote.creatorId);

  // Create invoice WITH projectId
  const newInvoice = await db
    .insert(invoices)
    .values({
      creatorId: quote.creatorId,
      clientId: quote.clientId!,
      projectId: quote.projectId, // ✅ Link to project
      quoteId: quote.id,
      invoiceNumber,
      title: `Invoice - ${quote.projectName || quote.title}`,
      status: "draft",
      issueDate: new Date(),
      subtotal: quote.subtotal,
      tax: quote.tax,
      total: quote.total,
      currency: quote.currency,
    })
    .returning();

  // Update quote with invoice link
  await db
    .update(quotes)
    .set({ invoiceId: newInvoice[0].id, status: "approved" })
    .where(eq(quotes.id, quoteId));

  return NextResponse.json({
    success: true,
    invoice: newInvoice[0],
  });
}
```

### Step 1.4: Testing Workflow

**Test File**: `src/__tests__/workflow.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/db";
import { users, clients, projects, quotes, invoices, galleries } from "@/db/schema";

describe("Complete Workflow: Client → Project → Quote → Invoice → Gallery", () => {
  let userId: string;
  let clientId: string;
  let projectId: string;
  let quoteId: string;
  let invoiceId: string;
  let galleryId: string;

  beforeAll(async () => {
    // Create test user
    const user = await db.insert(users).values({...}).returning();
    userId = user[0].id;

    // Create test client
    const client = await db.insert(clients).values({
      creatorId: userId,
      name: "Test Client Inc.",
    }).returning();
    clientId = client[0].id;

    // Create test project
    const project = await db.insert(projects).values({
      creatorId: userId,
      clientId,
      name: "Test Project: Brand Photography",
    }).returning();
    projectId = project[0].id;

    // Create test quote
    const quote = await db.insert(quotes).values({
      creatorId: userId,
      clientId,
      projectId, // ✅ Linked to project
      title: "Quote: Brand Photography",
      subtotal: 50000,
      tax: 8000,
      total: 58000,
    }).returning();
    quoteId = quote[0].id;
  });

  it("Quote should be linked to Project", async () => {
    const quote = await db.query.quotes.findFirst({
      where: (q) => eq(q.id, quoteId),
    });
    expect(quote?.projectId).toBe(projectId);
  });

  it("Should convert Quote to Invoice preserving Project link", async () => {
    // Call conversion endpoint
    const response = await fetch(`/api/quotes/${quoteId}/convert-to-invoice`, {
      method: "POST",
    });
    const { invoice } = await response.json();
    invoiceId = invoice.id;

    const inv = await db.query.invoices.findFirst({
      where: (i) => eq(i.id, invoiceId),
    });
    expect(inv?.projectId).toBe(projectId);
    expect(inv?.quoteId).toBe(quoteId);
  });

  it("Should fetch all project quotes via API", async () => {
    const response = await fetch(`/api/projects/${projectId}/quotes`);
    const { quotes: pQuotes } = await response.json();
    expect(pQuotes.length).toBeGreaterThan(0);
    expect(pQuotes[0].projectId).toBe(projectId);
  });

  it("Should fetch all project invoices via API", async () => {
    const response = await fetch(`/api/projects/${projectId}/invoices`);
    const { invoices: pInvoices } = await response.json();
    expect(pInvoices.length).toBeGreaterThan(0);
    expect(pInvoices[0].projectId).toBe(projectId);
  });

  it("Client workflow should show complete chain", async () => {
    const response = await fetch(`/api/clients/${clientId}/workflow`);
    const workflow = await response.json();
    
    expect(workflow.projects.length).toBe(1);
    expect(workflow.quotes.length).toBe(1);
    expect(workflow.invoices.length).toBe(1);
    
    // Verify connections
    expect(workflow.projects[0].id).toBe(projectId);
    expect(workflow.quotes[0].projectId).toBe(projectId);
    expect(workflow.invoices[0].projectId).toBe(projectId);
  });

  afterAll(async () => {
    // Cleanup
  });
});
```

---

## PHASE 2: PUBLIC PORTFOLIO (1-2 weeks)

### Step 2.1: Update Schema

**File**: `drizzle/0020_portfolio_fields.sql`

```sql
ALTER TABLE projects ADD COLUMN slug text UNIQUE;
ALTER TABLE projects ADD COLUMN is_published boolean DEFAULT false;
ALTER TABLE projects ADD COLUMN portfolio_order integer DEFAULT 0;
ALTER TABLE projects ADD COLUMN cover_image_url text;

-- Backfill slugs
UPDATE projects
SET slug = lower(regexp_replace(name, '[^a-z0-9]+', '-', 'g')) || '-' || id
WHERE slug IS NULL;

CREATE INDEX idx_projects_slug ON projects(slug) WHERE is_published = true;
CREATE INDEX idx_projects_portfolio_order ON projects(portfolio_order) WHERE is_published = true;
```

**Update Schema File**: `src/db/schema.ts`

```typescript
export const projects = pgTable("projects", {
  // ... existing ...
  slug: text("slug").unique(),
  isPublished: boolean("is_published").default(false).notNull(),
  portfolioOrder: integer("portfolio_order").default(0).notNull(),
  coverImageUrl: text("cover_image_url"),
});
```

### Step 2.2: Create Public API Endpoints

**File**: `src/app/api/public/portfolio/route.ts`

```typescript
import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const portfolioProjects = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      slug: projects.slug,
      coverImageUrl: projects.coverImageUrl,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .where(eq(projects.isPublished, true))
    .orderBy(projects.portfolioOrder);

  return NextResponse.json({ projects: portfolioProjects });
}
```

**File**: `src/app/api/public/projects/[slug]/route.ts`

```typescript
export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const project = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.slug, params.slug),
        eq(projects.isPublished, true)
      )
    )
    .then(r => r[0]);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch related gallery if exists
  const gallery = await db
    .select()
    .from(galleries)
    .where(eq(galleries.projectId, project.id))
    .then(r => r[0]);

  return NextResponse.json({ project, gallery });
}
```

### Step 2.3: Refactor Frontend

**File**: `src/app/work/page.tsx` (replace with dynamic load)

```typescript
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Project {
  id: string;
  name: string;
  description: string;
  slug: string;
  coverImageUrl: string;
}

export default function WorkPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/public/portfolio")
      .then(r => r.json())
      .then(data => {
        setProjects(data.projects);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading portfolio...</div>;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <h1 className="text-4xl font-light">Work</h1>
        
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/work/${project.slug}`}
              className="group"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                {project.coverImageUrl && (
                  <Image
                    src={project.coverImageUrl}
                    alt={project.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <h2 className="mt-4 font-medium">{project.name}</h2>
              <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                {project.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
```

**File**: `src/app/work/[slug]/page.tsx` (new detail view)

```typescript
import { notFound } from "next/navigation";
import Image from "next/image";

interface ProjectDetail {
  project: {
    id: string;
    name: string;
    description: string;
    slug: string;
    coverImageUrl: string;
  };
  gallery?: {
    id: string;
    title: string;
  };
}

async function getProject(slug: string): Promise<ProjectDetail | null> {
  const res = await fetch(`/api/public/projects/${slug}`);
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getProject(params.slug);
  if (!data) return { title: "Project not found" };

  return {
    title: data.project.name,
    description: data.project.description,
    openGraph: {
      title: data.project.name,
      description: data.project.description,
      images: data.project.coverImageUrl ? [data.project.coverImageUrl] : [],
    },
  };
}

export default async function ProjectDetail({ params }: { params: { slug: string } }) {
  const data = await getProject(params.slug);
  if (!data) notFound();

  const { project, gallery } = data;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-5 py-16 lg:px-8">
        <h1 className="text-5xl font-light">{project.name}</h1>
        
        {project.coverImageUrl && (
          <div className="mt-10 aspect-16/9 overflow-hidden">
            <Image
              src={project.coverImageUrl}
              alt={project.name}
              width={1200}
              height={675}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div className="mt-10 prose prose-slate max-w-none">
          <p>{project.description}</p>
        </div>

        {gallery && (
          <div className="mt-10 border-t pt-10">
            <h2 className="text-2xl font-light">Gallery</h2>
            <p className="mt-3 text-slate-600">
              <a href={`/portal/${gallery.id}`} className="underline hover:no-underline">
                View the full gallery →
              </a>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
```

### Step 2.4: Add Portfolio Settings UI

**File**: `src/components/PortfolioSettings.tsx` (new)

```typescript
"use client";
import { useState } from "react";

export function PortfolioSettings({ projectId }: { projectId: string }) {
  const [isPublished, setIsPublished] = useState(false);
  const [order, setOrder] = useState(0);

  const handlePublish = async () => {
    await fetch(`/api/projects/${projectId}/publish`, {
      method: "PATCH",
      body: JSON.stringify({ isPublished: !isPublished, portfolioOrder: order }),
    });
    setIsPublished(!isPublished);
  };

  return (
    <div className="border rounded-lg p-6">
      <h3 className="font-medium">Portfolio Settings</h3>
      
      <label className="mt-4 flex items-center gap-2">
        <input
          type="checkbox"
          checked={isPublished}
          onChange={() => setIsPublished(!isPublished)}
        />
        Show on public portfolio
      </label>

      <label className="mt-4 flex items-center gap-2">
        <span>Portfolio order:</span>
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(parseInt(e.target.value))}
          className="w-20 px-2 py-1 border rounded"
        />
      </label>

      <button
        onClick={handlePublish}
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded"
      >
        {isPublished ? "Unpublish" : "Publish"}
      </button>
    </div>
  );
}
```

---

## PHASE 3: KENYAN TAX/eTIMS (2-3 weeks)

### Step 3.1: Create Tax Settings UI

**File**: `src/components/TaxSettings.tsx` (new)

```typescript
"use client";
import { useState, useEffect } from "react";

export function TaxSettings() {
  const [settings, setSettings] = useState({
    kraPin: "",
    vatRegistered: false,
    vatNumber: "",
    whtRate: 0,
  });

  const handleSave = async () => {
    await fetch("/api/business/update-tax-settings", {
      method: "PATCH",
      body: JSON.stringify(settings),
    });
  };

  return (
    <div className="space-y-6 border rounded-lg p-6">
      <div>
        <label className="block text-sm font-medium">KRA PIN</label>
        <input
          type="text"
          value={settings.kraPin}
          onChange={(e) => setSettings({...settings, kraPin: e.target.value})}
          placeholder="A000000000"
          className="mt-2 w-full px-3 py-2 border rounded"
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.vatRegistered}
          onChange={(e) => setSettings({...settings, vatRegistered: e.target.checked})}
        />
        <span>VAT Registered</span>
      </label>

      {settings.vatRegistered && (
        <div>
          <label className="block text-sm font-medium">VAT Number</label>
          <input
            type="text"
            value={settings.vatNumber}
            onChange={(e) => setSettings({...settings, vatNumber: e.target.value})}
            className="mt-2 w-full px-3 py-2 border rounded"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">WHT Rate (%)</label>
        <input
          type="number"
          value={settings.whtRate}
          onChange={(e) => setSettings({...settings, whtRate: parseInt(e.target.value)})}
          min="0"
          max="100"
          className="mt-2 w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-purple-600 text-white rounded"
      >
        Save Tax Settings
      </button>
    </div>
  );
}
```

### Step 3.2: VAT Calculation Logic

**File**: `src/lib/tax/vat.ts` (new)

```typescript
const KENYA_VAT_RATE = 0.16; // 16%

export function calculateVAT(subtotal: number, vatRegistered: boolean): number {
  if (!vatRegistered) return 0;
  return Math.round(subtotal * KENYA_VAT_RATE);
}

export function calculateTotal(subtotal: number, tax: number, discount: number = 0): number {
  return subtotal - discount + tax;
}

export function calculateWHT(invoiceAmount: number, whtRate: number): number {
  return Math.round(invoiceAmount * (whtRate / 100));
}
```

### Step 3.3: Tax Reports Endpoint

**File**: `src/app/api/tax/summary/route.ts` (new)

```typescript
import { NextResponse } from "next/server";
import { db } from "@/db";
import { invoices } from "@/db/schema";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "month"; // month, quarter, year
  const startDate = new Date();
  
  // Calculate date range
  if (period === "month") startDate.setMonth(startDate.getMonth() - 1);
  else if (period === "quarter") startDate.setMonth(startDate.getMonth() - 3);
  else if (period === "year") startDate.setFullYear(startDate.getFullYear() - 1);

  const summary = await db
    .select({
      totalInvoiced: db.sql`SUM(total)`,
      totalTax: db.sql`SUM(tax)`,
      totalNett: db.sql`SUM(total - tax)`,
      invoiceCount: db.sql`COUNT(*)`,
    })
    .from(invoices)
    .where(db.sql`issue_date >= ${startDate}`)
    .then(r => r[0]);

  return NextResponse.json({ summary, period });
}
```

---

## PHASE 4: RECEIPT INTELLIGENCE (3-4 weeks)

### Step 4.1: Schema & Upload

**File**: `drizzle/0021_receipts_table.sql`

```sql
CREATE TABLE receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  storage_path text NOT NULL,
  mime_type text,
  file_size bigint,
  upload_date timestamp DEFAULT now(),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE receipt_extractions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id uuid NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  merchant_name text,
  merchant_kra_pin text,
  transaction_date timestamp,
  amount integer,
  currency text DEFAULT 'KES',
  raw_ocr_text text,
  confidence_score integer, -- 0-100
  extraction_status text DEFAULT 'pending', -- pending, extracted, verified, failed
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

CREATE TABLE merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kra_pin text UNIQUE,
  name text NOT NULL,
  category text,
  verified_at timestamp,
  last_seen timestamp DEFAULT now(),
  created_at timestamp DEFAULT now()
);

CREATE INDEX idx_receipts_creator ON receipts(creator_id);
CREATE INDEX idx_extractions_receipt ON receipt_extractions(receipt_id);
CREATE INDEX idx_merchants_kra_pin ON merchants(kra_pin);
```

### Step 4.2: OCR Integration

**File**: `src/lib/ocr/tesseract.ts` (new)

```typescript
import Tesseract from "tesseract.js";

export async function extractTextFromImage(imagePath: string): Promise<string> {
  const { data: { text } } = await Tesseract.recognize(
    imagePath,
    "eng",
    {
      logger: (m) => console.log("OCR Progress:", m),
    }
  );
  return text;
}

export async function extractMerchantInfo(ocrText: string): Promise<{
  merchantName: string | null;
  kraPin: string | null;
  amount: number | null;
  date: Date | null;
}> {
  // Pattern matching for KRA PIN (format: A000000000)
  const kraPinMatch = ocrText.match(/[A-Z]\d{9}/);
  const kraPin = kraPinMatch ? kraPinMatch[0] : null;

  // Extract merchant name (usually in first/second line or after "issued by")
  const merchantMatch = ocrText.match(/(?:issued by|from|merchant)[\s:]*([^\n]+)/i);
  const merchantName = merchantMatch ? merchantMatch[1].trim() : null;

  // Extract amount (common patterns: KES 5000, Sh. 5000, 5,000.00)
  const amountMatch = ocrText.match(/(?:KES|Sh\.|Total)[\s:]*([0-9,]+(?:\.\d{2})?)/i);
  const amount = amountMatch ? parseInt(amountMatch[1].replace(/,/g, "")) : null;

  // Extract date
  const dateMatch = ocrText.match(/\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/);
  const date = dateMatch ? new Date(dateMatch[0]) : null;

  return { merchantName, kraPin, amount, date };
}
```

### Step 4.3: Receipt Upload & Processing API

**File**: `src/app/api/receipts/upload/route.ts` (new)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { receipts, receiptExtractions } from "@/db/schema";
import { extractTextFromImage, extractMerchantInfo } from "@/lib/ocr/tesseract";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const creatorId = formData.get("creatorId") as string;

  if (!file || !creatorId) {
    return NextResponse.json(
      { error: "Missing file or creatorId" },
      { status: 400 }
    );
  }

  // Upload to blob storage
  const buffer = await file.arrayBuffer();
  const storagePath = `receipts/${creatorId}/${Date.now()}-${file.name}`;
  // TODO: Upload to Vercel Blob or similar

  // Create receipt record
  const receipt = await db.insert(receipts).values({
    creatorId,
    filename: file.name,
    storagePath,
    mimeType: file.type,
    fileSize: file.size,
  }).returning();

  // Queue OCR processing
  const textContent = await extractTextFromImage(storagePath);
  const extracted = await extractMerchantInfo(textContent);

  // Store extraction
  const extraction = await db.insert(receiptExtractions).values({
    receiptId: receipt[0].id,
    merchantName: extracted.merchantName,
    merchantKraPin: extracted.kraPin,
    transactionDate: extracted.date,
    amount: extracted.amount,
    rawOcrText: textContent,
    extractionStatus: extracted.kraPin ? "extracted" : "pending",
  }).returning();

  return NextResponse.json({
    receipt: receipt[0],
    extraction: extraction[0],
  });
}
```

---

## PHASE 5: GOOGLE DRIVE IMPORT (2-3 weeks)

### Step 5.1: OAuth Setup

**File**: `src/lib/google/oauth.ts` (new)

```typescript
import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  process.env.NEXTAUTH_URL + "/api/auth/google/callback"
);

export function getGoogleAuthUrl(state: string) {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive.readonly"],
    state,
  });
}

export async function getGoogleDriveService(accessToken: string) {
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth: oauth2Client });
}
```

### Step 5.2: Drive Scan & Import

**File**: `src/app/api/drive/import/route.ts` (new)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getGoogleDriveService } from "@/lib/google/oauth";
import { db } from "@/db";
import { galleries, galleryPhotos } from "@/db/schema";

export async function POST(req: NextRequest) {
  const { galleryId, folderId, accessToken } = await req.json();

  const drive = await getGoogleDriveService(accessToken);

  // List all images in folder
  const files = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
    spaces: "drive",
    fields: "files(id, name, mimeType, size, createdTime)",
  });

  const importedPhotos = [];

  for (const file of files.data.files || []) {
    // Create download URL
    const fileUrl = `https://drive.google.com/uc?export=view&id=${file.id}`;

    // Add to gallery
    const photo = await db.insert(galleryPhotos).values({
      galleryId,
      filename: file.name!,
      originalUrl: fileUrl,
      displayUrl: fileUrl,
      thumbnailUrl: fileUrl,
      mimeType: file.mimeType,
      fileSize: file.size ? BigInt(file.size) : null,
    }).returning();

    importedPhotos.push(photo[0]);
  }

  return NextResponse.json({
    success: true,
    imported: importedPhotos.length,
    photos: importedPhotos,
  });
}
```

---

## Testing Checklist

### Phase 1: Workflow
- [ ] Run migrations successfully
- [ ] Create client, project, quote, invoice in sequence
- [ ] Verify quote has projectId
- [ ] Verify invoice has projectId and quoteId
- [ ] Test API endpoints return correct data
- [ ] Test quote→invoice conversion
- [ ] Test cascade delete (delete project → all related deleted)

### Phase 2: Portfolio
- [ ] New projects have slug field
- [ ] Portfolio publish toggle works
- [ ] Portfolio order affects API sort
- [ ] Public portfolio endpoint returns published projects only
- [ ] Project detail page loads with SEO metadata
- [ ] Cover image displays on portfolio listing and detail
- [ ] Mobile responsiveness verified

### Phase 3: Tax
- [ ] Tax settings save to database
- [ ] VAT calculation includes 16% when registered
- [ ] Invoice shows tax breakdown
- [ ] Tax summary API returns correct period data
- [ ] KRA PIN validates format

### Phase 4: Receipt
- [ ] Receipt upload accepted
- [ ] OCR extracts text from receipt
- [ ] Merchant name extracted
- [ ] KRA PIN extracted or marked for verification
- [ ] Receipt data searchable and accessible

### Phase 5: Google Drive
- [ ] OAuth flow authenticates user
- [ ] Folder browser shows available folders
- [ ] Import preview shows images to import
- [ ] Images added to gallery after import
- [ ] Import history tracked

---

## Deployment Steps

```bash
# Phase 1
npm run db:migrate  # Run schema fixes
npm run test        # Run workflow tests

# Phase 2
npm run build       # Ensure no TS errors
npm run dev        # Test portfolio locally

# Phase 3
# Add to .env: No new vars needed (existing schema)
npm run build

# Phase 4
npm install tesseract.js
# Add to .env: OCR service credentials if using cloud

# Phase 5
# Add to .env:
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
npm run build
```

---

## Files Created/Modified Summary

| File | Action | Purpose |
|------|--------|---------|
| `drizzle/0019_fix_workflow_connections.sql` | Create | Schema fixes for foreign keys |
| `src/app/api/projects/[id]/quotes/route.ts` | Create | Fetch project quotes |
| `src/app/api/projects/[id]/invoices/route.ts` | Create | Fetch project invoices |
| `src/app/api/projects/[id]/galleries/route.ts` | Create | Fetch project galleries |
| `src/app/api/clients/[id]/workflow/route.ts` | Create | Full client lifecycle |
| `src/app/api/quotes/[id]/convert-to-invoice/route.ts` | Update | Add projectId handling |
| `drizzle/0020_portfolio_fields.sql` | Create | Portfolio schema |
| `src/app/api/public/portfolio/route.ts` | Create | Public portfolio listing |
| `src/app/api/public/projects/[slug]/route.ts` | Create | Public project detail |
| `src/app/work/page.tsx` | Update | Dynamic portfolio loading |
| `src/app/work/[slug]/page.tsx` | Create | Project detail page |
| `src/components/PortfolioSettings.tsx` | Create | Portfolio publish UI |
| `src/components/TaxSettings.tsx` | Create | Tax configuration UI |
| `src/lib/tax/vat.ts` | Create | Tax calculation logic |
| `src/app/api/tax/summary/route.ts` | Create | Tax reporting |
| `drizzle/0021_receipts_table.sql` | Create | Receipt schema |
| `src/lib/ocr/tesseract.ts` | Create | OCR integration |
| `src/app/api/receipts/upload/route.ts` | Create | Receipt upload API |
| `src/lib/google/oauth.ts` | Create | Google OAuth setup |
| `src/app/api/drive/import/route.ts` | Create | Drive import API |
| `src/__tests__/workflow.test.ts` | Create | Workflow tests |

---

**Next Action**: Start with Phase 1 (Workflow Fixes). This unblocks all other phases.

