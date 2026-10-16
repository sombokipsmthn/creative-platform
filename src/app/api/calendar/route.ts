import { NextResponse } from "next/server";
import { and, or, eq, gte, lte, sql, desc } from "drizzle-orm";

import { db } from "@/db";
import { getCurrentSession } from "@/lib/auth";
import { quotes, invoices, projects, galleries, contracts, clients } from "@/db/schema";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    const { searchParams } = new URL(req.url);

    const startParam = searchParams.get("start");
    const endParam = searchParams.get("end");
    const clientId = searchParams.get("clientId") || undefined;
    const category = searchParams.get("category") as
      | "quote"
      | "invoice"
      | "project"
      | "gallery"
      | "contract"
      | undefined;

    if (!startParam || !endParam) {
      return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 });
    }

    const startDate = new Date(startParam);
    const endDate = new Date(endParam);

    // 1. Quotes - for proposed shoot dates, expiry dates, etc.
    const quoteConditions = [
      eq(quotes.creatorId, userId),
      gte(quotes.validUntil, startDate),
      lte(quotes.validUntil, endDate),
    ];

    if (clientId) {
      quoteConditions.push(eq(quotes.clientId, clientId));
    }

    if (category === "quote") {
      quoteConditions.push(eq(quotes.status, "accepted")); // or some category filter
    }

    const quoteRows = await db
      .select({
        id: quotes.id,
        title: quotes.title,
        notes: quotes.notes,
        validUntil: quotes.validUntil,
        clientId: quotes.clientId,
        projectName: quotes.projectName,
        invoiceId: quotes.invoiceId,
        status: quotes.status,
      })
      .from(quotes)
      .where(and(...quoteConditions))
      .orderBy(desc(quotes.validUntil));

    // 2. Invoices - for due dates, payment deadlines
    const invoiceConditions = [
      eq(invoices.creatorId, userId),
      gte(invoices.dueDate, startDate),
      lte(invoices.dueDate, endDate),
    ];

    if (clientId) {
      invoiceConditions.push(eq(invoices.clientId, clientId));
    }

    if (category === "invoice") {
      // Could filter by status etc.
    }

    const invoiceRows = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        notes: invoices.notes,
        dueDate: invoices.dueDate,
        clientId: invoices.clientId,
        quoteId: invoices.quoteId,
        status: invoices.status,
      })
      .from(invoices)
      .where(and(...invoiceConditions))
      .orderBy(desc(invoices.dueDate));

    // 3. Projects - for start/end dates, production schedules
    const projectConditions = [
      eq(projects.creatorId, userId),
      sql`${projects.startDate} <= ${endDate} AND ${projects.endDate} >= ${startDate}`,
    ];

    if (clientId) {
      projectConditions.push(eq(projects.clientId, clientId));
    }

    if (category === "project") {
      // Could filter by status
    }

    const projectRows = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        startDate: projects.startDate,
        endDate: projects.endDate,
        clientId: projects.clientId,
        status: projects.status,
      })
      .from(projects)
      .where(and(...projectConditions))
      .orderBy(desc(projects.startDate));

    // 4. Galleries - for publication/delivery dates
    const galleryConditions = [
      eq(galleries.creatorId, userId),
      gte(galleries.expiresAt, startDate),
      lte(galleries.expiresAt, endDate),
    ];

    if (clientId) {
      galleryConditions.push(eq(galleries.clientId, clientId));
    }

    if (category === "gallery") {
      // Gallery-specific filter
    }

    const galleryRows = await db
      .select({
        id: galleries.id,
        title: galleries.title,
        description: galleries.description,
        expiresAt: galleries.expiresAt,
        clientId: galleries.clientId,
        projectId: galleries.projectId,
        status: galleries.status,
      })
      .from(galleries)
      .where(and(...galleryConditions))
      .orderBy(desc(galleries.expiresAt));

    // 5. Contracts - for signature deadlines, expiry dates
    const contractConditions = [
      eq(contracts.creatorId, userId),
      gte(contracts.expiresAt, startDate),
      lte(contracts.expiresAt, endDate),
    ];

    if (clientId) {
      contractConditions.push(eq(contracts.clientId, clientId));
    }

    if (category === "contract") {
      // Contract-specific filter
    }

    const contractRows = await db
      .select({
        id: contracts.id,
        contractNumber: contracts.contractNumber,
        expiresAt: contracts.expiresAt,
        clientId: contracts.clientId,
        projectId: contracts.projectId,
        quoteId: contracts.quoteId,
        status: contracts.status,
      })
      .from(contracts)
      .where(and(...contractConditions))
      .orderBy(desc(contracts.expiresAt));

    // Transform all rows into calendar event objects
    const events: Array<any> = [];

    // Quotes
    for (const row of quoteRows) {
      events.push({
        id: row.id,
        title: row.title,
        description: row.notes,
        startDate: row.validUntil,
        endDate: row.validUntil,
        allDay: true,
        category: "Quotation",
        status: row.status,
        relatedClientId: row.clientId,
        relatedProjectId: row.projectName,
        relatedQuoteId: row.id,
        relatedInvoiceId: row.invoiceId,
        relatedGalleryId: row.id,
        sourceType: "quote",
        sourceId: row.id,
        isTentative: row.status === "draft" || row.status === "sent" ? true : false,
      });
    }

    // Invoices
    for (const row of invoiceRows) {
      events.push({
        id: row.id,
        title: `Invoice ${row.invoiceNumber}`,
        description: row.notes,
        startDate: row.dueDate,
        endDate: row.dueDate,
        allDay: true,
        category: "Invoice",
        status: row.status,
        relatedClientId: row.clientId,
        relatedProjectId: row.id,
        relatedQuoteId: row.quoteId,
        relatedInvoiceId: row.id,
        relatedGalleryId: row.id,
        sourceType: "invoice",
        sourceId: row.id,
        isTentative: row.status === "draft" || row.status === "pending" ? true : false,
      });
    }

    // Projects
    for (const row of projectRows) {
      events.push({
        id: row.id,
        title: row.name,
        description: row.description,
        startDate: row.startDate,
        endDate: row.endDate,
        allDay: true,
        category: "Project",
        status: row.status,
        relatedClientId: row.clientId,
        relatedProjectId: row.id,
        relatedQuoteId: null,
        relatedInvoiceId: null,
        relatedGalleryId: null,
        sourceType: "project",
        sourceId: row.id,
        isTentative: row.status === "draft" || row.status === "in_progress" ? true : false,
      });
    }

    // Galleries
    for (const row of galleryRows) {
      events.push({
        id: row.id,
        title: row.title,
        description: row.description,
        startDate: row.expiresAt,
        endDate: row.expiresAt,
        allDay: true,
        category: "Gallery",
        status: row.status,
        relatedClientId: row.clientId,
        relatedProjectId: row.projectId,
        relatedQuoteId: null,
        relatedInvoiceId: null,
        relatedGalleryId: row.id,
        sourceType: "gallery",
        sourceId: row.id,
        isTentative: row.status === "draft" ? true : false,
      });
    }

    // Contracts
    for (const row of contractRows) {
      events.push({
        id: row.id,
        title: `Contract ${row.contractNumber}`,
        description: null,
        startDate: row.expiresAt,
        endDate: row.expiresAt,
        allDay: true,
        category: "Contract",
        status: row.status,
        relatedClientId: row.clientId,
        relatedProjectId: row.projectId,
        relatedQuoteId: row.quoteId,
        relatedInvoiceId: null,
        relatedGalleryId: null,
        sourceType: "contract",
        sourceId: row.id,
        isTentative: row.status === "draft" || row.status === "sent" ? true : false,
      });
    }

    // Filter events that have a valid start date
    const usableEvents: Array<any> = [];
    for (const event of events) {
      if (event.startDate && event.startDate instanceof Date && !isNaN(event.startDate.getTime())) {
        usableEvents.push(event);
      } else if (event.startDate && typeof event.startDate === "string" && !isNaN(new Date(event.startDate).getTime())) {
        usableEvents.push(event);
      }
      // Skip events with null or invalid start dates
    }

    // Sort by start date
    usableEvents.sort((a, b) => {
      const aDate = a.startDate instanceof Date ? a.startDate.getTime() : new Date(a.startDate).getTime();
      const bDate = b.startDate instanceof Date ? b.startDate.getTime() : new Date(b.startDate).getTime();
      return aDate - bDate;
    });

    return NextResponse.json(usableEvents);
  } catch (error) {
    console.error("GET /api/calendar error:", error);
    return NextResponse.json({ error: "Failed to fetch calendar data" }, { status: 500 });
  }
}
