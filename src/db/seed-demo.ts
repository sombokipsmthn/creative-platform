import { and, eq } from "drizzle-orm";
import {
  users,
  clients,
  projects,
  quotes,
  quoteItems,
  invoices,
  invoiceItems,
  galleries,
  contracts,
  contractEvents,
} from "@/db/schema";
import { randomUUID } from "node:crypto";

const demoDatabaseUrl = process.env.DEMO_DATABASE_URL;
if (!demoDatabaseUrl || !demoDatabaseUrl.startsWith("postgres")) {
  throw new Error("Set DEMO_DATABASE_URL to the dedicated demo PostgreSQL database. The seed will not use DATABASE_URL as a fallback.");
}

// Force the database module to use the explicitly named demo target, even if
// DATABASE_URL or .env.local points to another environment.
process.env.DATABASE_URL = demoDatabaseUrl;
const [{ auth }, { db }] = await Promise.all([
  import("@/lib/auth/auth"),
  import("@/db"),
]);

const demoEmail = (process.env.DEMO_CREATOR_EMAIL || "demo.creator@kipsmthn.test").trim().toLowerCase();
const demoPasswordEnv = process.env.DEMO_CREATOR_PASSWORD;
const demoPassword = demoPasswordEnv ?? "";
const demoName = process.env.DEMO_CREATOR_NAME || "KIPSMTHN Demo Creator";

// The default .test address is intentionally non-deliverable; do not require an email provider for local demo setup.
if (demoEmail.endsWith(".test")) process.env.SKIP_EMAIL_SENDING = "true";

if (!demoPasswordEnv || demoPasswordEnv.length < 8) {
  throw new Error("Set DEMO_CREATOR_PASSWORD to a password of at least 8 characters before running the demo seed.");
}

async function ensureDemoCreator() {
  const [existing] = await db.select().from(users).where(eq(users.email, demoEmail)).limit(1);
  if (existing) {
    if (existing.email !== demoEmail) throw new Error("Demo creator email mismatch.");
    return existing;
  }

  const result = await auth.api.signUpEmail({
    body: {
      name: demoName,
      email: demoEmail,
      password: demoPassword,
    },
  });

  const createdUser = result?.user;
  if (!createdUser?.id) {
    throw new Error("Better Auth did not return a user. Check the auth configuration and email delivery settings.");
  }

  // This is a dedicated non-deliverable .test address, so the local demo account
  // is verified for testing after Better Auth has created its normal account row.
  const [creator] = await db.update(users)
    .set({ emailVerified: true, onboardingStatus: "complete", updatedAt: new Date() })
    .where(eq(users.id, createdUser.id))
    .returning();

  if (!creator) throw new Error("Demo creator was created but could not be loaded.");
  return creator;
}

async function main() {
  const creator = await ensureDemoCreator();

  const existingDemo = await db.select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.creatorId, creator.id), eq(projects.slug, "demo-first-production")))
    .limit(1);

  if (existingDemo.length) {
    console.log(`Demo workspace already exists for ${demoEmail}; no records were changed.`);
    return;
  }

  const now = new Date();
  const calendarStart = new Date(now);
  calendarStart.setDate(calendarStart.getDate() + 3);
  calendarStart.setHours(9, 0, 0, 0);
  const calendarEnd = new Date(calendarStart);
  calendarEnd.setHours(17, 0, 0, 0);
  const quoteValidUntil = new Date(now);
  quoteValidUntil.setDate(quoteValidUntil.getDate() + 14);
  const invoiceDueDate = new Date(now);
  invoiceDueDate.setDate(invoiceDueDate.getDate() + 21);
  const galleryExpiresAt = new Date(now);
  galleryExpiresAt.setDate(galleryExpiresAt.getDate() + 30);
  const contractExpiresAt = new Date(now);
  contractExpiresAt.setDate(contractExpiresAt.getDate() + 14);

  const clientId = randomUUID();
  const projectId = randomUUID();
  const quoteId = randomUUID();
  const invoiceId = randomUUID();
  const galleryId = randomUUID();
  const contractId = randomUUID();
  const contractToken = randomUUID();
  const projectName = "Demo Project — First Production";

  await db.insert(clients).values({
    id: clientId,
    creatorId: creator.id,
    name: "Jamie Njoroge (Demo Client)",
    company: "Acacia Stories — Demo",
    email: "jamie.client@example.test",
    phone: "+254700000000",
    location: "Nairobi, Kenya",
    notes: "SAMPLE DATA ONLY. Safe to delete with the demo creator.",
    status: "active",
  });

  await db.insert(projects).values({
    id: projectId,
    creatorId: creator.id,
    clientId,
    name: projectName,
    slug: "demo-first-production",
    description: "A clearly labelled demo project showing how a creator can organise a first production.",
    shortDescription: "Demo workspace sample — not a real client engagement.",
    category: "Brand Storytelling",
    year: String(now.getFullYear()),
    location: "Nairobi, Kenya",
    services: ["Photography", "Short-form video"],
    disciplines: ["Production"],
    status: "draft",
    visibility: "private",
    startDate: calendarStart,
    endDate: calendarEnd,
  });

  await db.insert(quotes).values({
    id: quoteId,
    creatorId: creator.id,
    clientId,
    projectName,
    title: "DEMO — Brand Story Production Quote",
    status: "draft",
    subtotal: 120000,
    discountType: "none",
    discountValue: 0,
    discountAmount: 0,
    tax: 19200,
    total: 139200,
    currency: "KES",
    paymentTerms: "Demo terms: 50% deposit, balance on delivery.",
    validUntil: quoteValidUntil,
    quoteNumber: "DEMO-Q-001",
    productionDays: 1,
    location: "Nairobi, Kenya",
    clientContact: "jamie.client@example.test",
    depositPercentage: 50,
    notes: "DEMO ONLY — not a payable offer.",
  });

  await db.insert(quoteItems).values({
    quoteId,
    category: "Production",
    description: "Brand story production package (demo)",
    quantity: 1,
    unit: "package",
    rate: 120000,
    amount: 120000,
    notes: "Sample line item; not a real service order.",
  });

  await db.insert(invoices).values({
    id: invoiceId,
    creatorId: creator.id,
    clientId,
    quoteId,
    invoiceNumber: "DEMO-INV-001",
    title: "DEMO — Brand Story Production Invoice",
    status: "draft",
    issueDate: now,
    dueDate: invoiceDueDate,
    notes: "DEMO ONLY — not a payment request. Do not pay.",
    subtotal: 120000,
    tax: 19200,
    total: 139200,
    currency: "KES",
  });

  await db.insert(invoiceItems).values({
    invoiceId,
    description: "Brand story production package (demo)",
    quantity: 1,
    unitPrice: 120000,
    amount: 120000,
  });

  await db.insert(galleries).values({
    id: galleryId,
    creatorId: creator.id,
    clientId,
    projectId,
    title: "DEMO — Acacia Brand Story Gallery",
    description: "Sample gallery for testing the client delivery workflow. No real client images included.",
    category: "Brand Storytelling",
    slug: `demo-acacia-brand-story-${creator.id.slice(0, 8)}`,
    status: "draft",
    allowDownloads: true,
    allowFavorites: true,
    allowSelections: true,
    expiresAt: galleryExpiresAt,
  });

  await db.insert(contracts).values({
    id: contractId,
    creatorId: creator.id,
    clientId,
    projectId,
    quoteId,
    title: "DEMO — Creative Production Agreement",
    contractNumber: "DEMO-CON-001",
    status: "draft",
    content: "DEMO AGREEMENT — SAMPLE ONLY. This document is illustrative and is not a legal agreement. No services are commissioned and no payment is due.",
    currency: "KES",
    totalAmount: 139200,
    token: contractToken,
    expiresAt: contractExpiresAt,
  });

  await db.insert(contractEvents).values({
    contractId,
    eventType: "created",
    metadata: { demo: true, note: "Sample event generated by the demo seed script." },
  });

  console.log("Demo workspace seeded successfully.");
  console.log(`Creator: ${demoEmail}`);
  console.log("Created: client, project/calendar item, quote + line item, invoice + line item, gallery, contract.");
  console.log("All records are owned by the demo creator. No real gallery files were uploaded.");
}

main().catch((error) => {
  console.error("Demo seed failed:", error);
  process.exitCode = 1;
});
