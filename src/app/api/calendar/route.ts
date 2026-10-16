import { NextResponse } from "next/server";
import { and, or, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { withCreatorApi } from "@/lib/api/route-boundaries";
import {
  quotes,
  invoices,
  projects,
  galleries,
  contracts,
  clients
} from "@/db/schema";

export async function GET(req: Request) {
  return withCreatorApi(req, async (_request, user) => {
    try {
      const { searchParams } = new URL(req.url);
      const startParam = searchParams.get("start");
      const endParam = searchParams.get("end");
      const view = searchParams.get("view") as "month" | "week" | "agenda" || "month";

      if (!startParam || !endParam) {
        return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 });
      }

      const startDate = new Date(startParam);
      const endDate = new Date(endParam);

      // 1. Quotes - for proposed shoot dates, expiry dates, etc.
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
        .where(
          and(
            eq(quotes.creatorId, user.id),
            gte(quotes.validUntil, startDate),
            lte(quotes.validUntil, endDate)
          )
        );

      // 2. Invoices - for due dates, payment deadlines
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
        .where(
          and(
            eq(invoices.creatorId, user.id),
            gte(invoices.dueDate, startDate),
            lte(invoices.dueDate, endDate)
          )
        );

      // 3. Projects - for start/end dates, production schedules
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
        .where(
          and(
            eq(projects.creatorId, user.id),
            or(
              gte(projects.startDate, startDate),
              gte(projects.endDate, startDate)
            )
          )
        );

      // 4. Galleries - for publication/delivery dates
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
        .where(
          and(
            eq(galleries.creatorId, user.id),
            gte(galleries.expiresAt, startDate),
            lte(galleries.expiresAt, endDate)
          )
        );

      // 5. Contracts - for signature deadlines, expiry dates
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
        .where(
          and(
            eq(contracts.creatorId, user.id),
            gte(contracts.expiresAt, startDate),
            lte(contracts.expiresAt, endDate)
          )
        );

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

      return NextResponse.json(usableEvents);
    } catch (error) {
      console.error("GET /api/calendar error:", error);
      return NextResponse.json({ error: "Failed to fetch calendar data" }, { status: 500 });
    }
  });
}