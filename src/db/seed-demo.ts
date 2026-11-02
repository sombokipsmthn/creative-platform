
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
  throw new Error(
    "Set DEMO_DATABASE_URL to the intended PostgreSQL database. The seed will not use DATABASE_URL as a fallback.",
  );
}

process.env.DATABASE_URL = demoDatabaseUrl;

const [{ auth }, { db }] = await Promise.all([
  import("@/lib/auth/auth"),
  import("@/db"),
]);

const demoEmail = (
  process.env.DEMO_CREATOR_EMAIL || "demo.creator@kipsmthn.test"
)
  .trim()
  .toLowerCase();

const demoPassword = process.env.DEMO_CREATOR_PASSWORD ?? "";
const demoName = process.env.DEMO_CREATOR_NAME || "KIPSMTHN Demo Creator";

if (demoEmail.endsWith(".test")) {
  process.env.SKIP_EMAIL_SENDING = "true";
}

if (demoPassword.length < 8) {
  throw new Error(
    "Set DEMO_CREATOR_PASSWORD to a password of at least 8 characters before running the demo seed.",
  );
}

const DEMO_PROJECT_SLUG = "demo-first-production";
const DEMO_CLIENT_EMAIL = "jamie.client@example.test";
const DEMO_QUOTE_NUMBER = "DEMO-Q-001";
const DEMO_INVOICE_NUMBER = "DEMO-INV-001";
const DEMO_CONTRACT_NUMBER = "DEMO-CON-001";

async function ensureDemoCreator() {
  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, demoEmail))
    .limit(1);

  if (existing) {
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
    throw new Error(
      "Better Auth did not return a user. Check the authentication configuration.",
    );
  }

  const [creator] = await db
    .update(users)
    .set({
      emailVerified: true,
      onboardingStatus: "complete",
      updatedAt: new Date(),
    })
    .where(eq(users.id, createdUser.id))
    .returning();

  if (!creator) {
    throw new Error("Demo creator was created but could not be loaded.");
  }

  return creator;
}

async function main() {
  const creator = await ensureDemoCreator();
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

  const demoClientValues = {
    id: randomUUID(),
    creatorId: creator.id,
    name: "Jamie Njoroge (Demo Client)",
    company: "Acacia Stories — Demo",
    email: DEMO_CLIENT_EMAIL,
    phone: "+254700000000",
    location: "Nairobi, Kenya",
    notes: "SAMPLE DATA ONLY. Safe to delete with the demo creator.",
    status: "active" as const,
  };

  const [existingProject] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.creatorId, creator.id),
        eq(projects.slug, DEMO_PROJECT_SLUG),
      ),
    )
    .limit(1);

  let [demoClient] = await db
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.creatorId, creator.id),
        eq(clients.email, DEMO_CLIENT_EMAIL),
      ),
    )
    .limit(1);

  if (!demoClient && existingProject?.clientId) {
    [demoClient] = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.id, existingProject.clientId),
          eq(clients.creatorId, creator.id),
        ),
      )
      .limit(1);
  }

  if (!demoClient) {
    const [createdClient] = await db
      .insert(clients)
      .values(demoClientValues)
      .returning();

    if (!createdClient) {
      throw new Error("Could not create the demo client.");
    }

    demoClient = createdClient;
    console.log("Created missing demo client.");
  } else {
    console.log("Reusing existing demo client.");
  }

  let project = existingProject;

  if (!project) {
    const [createdProject] = await db
      .insert(projects)
      .values({
        id: randomUUID(),
        creatorId: creator.id,
        clientId: demoClient.id,
        name: "Demo Project — First Production",
        slug: DEMO_PROJECT_SLUG,
        description:
          "A clearly labelled demo project showing how a creator can organise a first production.",
        shortDescription:
          "Demo workspace sample — not a real client engagement.",
        category: "Brand Storytelling",
        year: String(now.getFullYear()),
        location: "Nairobi, Kenya",
        services: ["Photography", "Short-form video"],
        disciplines: ["Production"],
        status: "draft",
        visibility: "private",
        startDate: calendarStart,
        endDate: calendarEnd,
      })
      .returning();

    if (!createdProject) {
      throw new Error("Could not create the demo project.");
    }

    project = createdProject;
    console.log("Created missing demo project.");
  } else {
    console.log("Reusing existing demo project.");
  }

  const clientId = project.clientId ?? demoClient.id;
  const projectId = project.id;
  const projectName = project.name;

  if (!project.clientId) {
    await db
      .update(projects)
      .set({ clientId })
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.creatorId, creator.id),
        ),
      );
  }

  let [quote] = await db
    .select()
    .from(quotes)
    .where(
      and(
        eq(quotes.creatorId, creator.id),
        eq(quotes.quoteNumber, DEMO_QUOTE_NUMBER),
      ),
    )
    .limit(1);

  if (!quote) {
    const [createdQuote] = await db
      .insert(quotes)
      .values({
        id: randomUUID(),
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
        quoteNumber: DEMO_QUOTE_NUMBER,
        productionDays: 1,
        location: "Nairobi, Kenya",
        clientContact: DEMO_CLIENT_EMAIL,
        depositPercentage: 50,
        notes: "DEMO ONLY — not a payable offer.",
      })
      .returning();

    if (!createdQuote) {
      throw new Error("Could not create the demo quote.");
    }

    quote = createdQuote;
    console.log("Created missing demo quote.");
  } else {
    console.log("Reusing existing demo quote.");
  }

  const [existingQuoteItem] = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, quote.id))
    .limit(1);

  if (!existingQuoteItem) {
    await db.insert(quoteItems).values({
      quoteId: quote.id,
      category: "Production",
      description: "Brand story production package (demo)",
      quantity: 1,
      unit: "package",
      rate: 120000,
      amount: 120000,
      notes: "Sample line item; not a real service order.",
    });

    console.log("Created missing demo quote line item.");
  }

  let [invoice] = await db
    .select()
    .from(invoices)
    .where(
      and(
        eq(invoices.creatorId, creator.id),
        eq(invoices.invoiceNumber, DEMO_INVOICE_NUMBER),
      ),
    )
    .limit(1);

  if (!invoice) {
    const [createdInvoice] = await db
      .insert(invoices)
      .values({
        id: randomUUID(),
        creatorId: creator.id,
        clientId,
        quoteId: quote.id,
        invoiceNumber: DEMO_INVOICE_NUMBER,
        title: "DEMO — Brand Story Production Invoice",
        status: "draft",
        issueDate: now,
        dueDate: invoiceDueDate,
        notes: "DEMO ONLY — not a payment request. Do not pay.",
        subtotal: 120000,
        tax: 19200,
        total: 139200,
        currency: "KES",
      })
      .returning();

    if (!createdInvoice) {
      throw new Error("Could not create the demo invoice.");
    }

    invoice = createdInvoice;
    console.log("Created missing demo invoice.");
  } else {
    console.log("Reusing existing demo invoice.");
  }

  const [existingInvoiceItem] = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, invoice.id))
    .limit(1);

  if (!existingInvoiceItem) {
    await db.insert(invoiceItems).values({
      invoiceId: invoice.id,
      description: "Brand story production package (demo)",
      quantity: 1,
      unitPrice: 120000,
      amount: 120000,
    });

    console.log("Created missing demo invoice line item.");
  }

  const gallerySlug = `demo-acacia-brand-story-${creator.id.slice(0, 8)}`;

  const [existingGallery] = await db
    .select()
    .from(galleries)
    .where(
      and(
        eq(galleries.creatorId, creator.id),
        eq(galleries.slug, gallerySlug),
      ),
    )
    .limit(1);

  if (!existingGallery) {
    await db.insert(galleries).values({
      id: randomUUID(),
      creatorId: creator.id,
      clientId,
      projectId,
      title: "DEMO — Acacia Brand Story Gallery",
      description:
        "Sample gallery for testing the client delivery workflow. No real client images included.",
      category: "Brand Storytelling",
      slug: gallerySlug,
      status: "draft",
      allowDownloads: true,
      allowFavorites: true,
      allowSelections: true,
      expiresAt: galleryExpiresAt,
    });

    console.log("Created missing demo gallery.");
  } else {
    console.log("Reusing existing demo gallery.");
  }

  let [contract] = await db
    .select()
    .from(contracts)
    .where(
      and(
        eq(contracts.creatorId, creator.id),
        eq(contracts.contractNumber, DEMO_CONTRACT_NUMBER),
      ),
    )
    .limit(1);

  if (!contract) {
    const [createdContract] = await db
      .insert(contracts)
      .values({
        id: randomUUID(),
        creatorId: creator.id,
        clientId,
        projectId,
        quoteId: quote.id,
        title: "DEMO — Creative Production Agreement",
        contractNumber: DEMO_CONTRACT_NUMBER,
        status: "draft",
        content:
          "DEMO AGREEMENT — SAMPLE ONLY. This document is illustrative and is not a legal agreement. No services are commissioned and no payment is due.",
        currency: "KES",
        totalAmount: 139200,
        token: randomUUID(),
        expiresAt: contractExpiresAt,
      })
      .returning();

    if (!createdContract) {
      throw new Error("Could not create the demo contract.");
    }

    contract = createdContract;
    console.log("Created missing demo contract.");
  } else {
    console.log("Reusing existing demo contract.");
  }

  const [existingContractEvent] = await db
    .select()
    .from(contractEvents)
    .where(
      and(
        eq(contractEvents.contractId, contract.id),
        eq(contractEvents.eventType, "created"),
      ),
    )
    .limit(1);

  if (!existingContractEvent) {
    await db.insert(contractEvents).values({
      contractId: contract.id,
      eventType: "created",
      metadata: {
        demo: true,
        note: "Sample event generated by the demo seed script.",
      },
    });

    console.log("Created missing demo contract event.");
  }

  console.log("\nDemo workspace seed completed.");
  console.log(`Creator: ${demoEmail}`);
  console.log(`Project: ${projectName}`);
  console.log("Existing demo records were reused wherever possible.");
  console.log("No real gallery files were uploaded.");
}

main().catch((error) => {
  console.error("Demo seed failed:", error);
  process.exitCode = 1;
});
