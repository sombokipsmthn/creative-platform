import { NextResponse } from "next/server";
import { and, eq, gte, lte, or } from "drizzle-orm";
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

      // Fetch events from various sources
      const events: Array<any> = [];

      // 1. Quotes - for proposed shoot dates, expiry dates, etc.
      const quoteEvents = await db
        .select({
          id: quotes.id,
          title: quotes.title,
          description: quotes.notes,
          startDate: quotes.validUntil, // Using validUntil as a date reference
          endDate: quotes.validUntil,
          allDay: true,
          category: "Quotation",
          status: quotes.status,
          relatedClientId: quotes.clientId,
          relatedProjectId: null, // Would need to join with projects if available
          relatedQuoteId: quotes.id,
          relatedInvoiceId: null,
          relatedGalleryId: null,
          sourceType: "quote",
          sourceId: quotes.id,
          isTentative: quotes.status === "draft" || quotes.status === "sent",
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
      const invoiceEvents = await db
        .select({
          id: invoices.id,
          title: `Invoice ${invoices.invoiceNumber}`,
          description: invoices.notes,
          startDate: invoices.dueDate,
          endDate: invoices.dueDate,
          allDay: true,
          category: "Invoice",
          status: invoices.status,
          relatedClientId: invoices.clientId,
          relatedProjectId: null,
          relatedQuoteId: invoices.quoteId,
          relatedInvoiceId: invoices.id,
          relatedGalleryId: null,
          sourceType: "invoice",
          sourceId: invoices.id,
          isTentative: invoices.status === "draft" || invoices.status === "pending",
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
      const projectEvents = await db
        .select({
          id: projects.id,
          title: projects.name,
          description: projects.description,
          startDate: projects.startDate,
          endDate: projects.endDate,
          allDay: true,
          category: "Project",
          status: projects.status,
          relatedClientId: projects.clientId,
          relatedProjectId: projects.id,
          relatedQuoteId: null,
          relatedInvoiceId: null,
          relatedGalleryId: null,
          sourceType: "project",
          sourceId: projects.id,
          isTentative: projects.status === "draft" || projects.status === "in_progress",
        })
        .from(projects)
        .where(
          and(
            eq(projects.creatorId, user.id),
            or(
              and(
                gte(projects.startDate, startDate),
                lte(projects.startDate, endDate)
              ),
              and(
                gte(projects.endDate, startDate),
                lte(projects.endDate, endDate)
              )
            )
          )
        );

      // 4. Galleries - for publication/delivery dates
      const galleryEvents = await db
        .select({
          id: galleries.id,
          title: galleries.title,
          description: galleries.description,
          startDate: galleries.expiresAt,
          endDate: galleries.expiresAt,
          allDay: true,
          category: "Gallery",
          status: galleries.status,
          relatedClientId: galleries.clientId,
          relatedProjectId: galleries.projectId,
          relatedQuoteId: null,
          relatedInvoiceId: null,
          relatedGalleryId: galleries.id,
          sourceType: "gallery",
          sourceId: galleries.id,
          isTentative: galleries.status === "draft",
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
      const contractEvents = await db
        .select({
          id: contracts.id,
          title: `Contract ${contracts.contractNumber}`,
          description: null,
          startDate: contracts.expiresAt,
          endDate: contracts.expiresAt,
          allDay: true,
          category: "Contract",
          status: contracts.status,
          relatedClientId: contracts.clientId,
          relatedProjectId: contracts.projectId,
          relatedQuoteId: contracts.quoteId,
          relatedInvoiceId: null,
          relatedGalleryId: null,
          sourceType: "contract",
          sourceId: contracts.id,
          isTentative: contracts.status === "draft" || contracts.status === "sent",
        })
        .from(contracts)
        .where(
          and(
            eq(contracts.creatorId, user.id),
            gte(contracts.expiresAt, startDate),
            lte(contracts.expiresAt, endDate)
          )
        );

      // Combine all events
      events.push(...quoteEvents, ...invoiceEvents, ...projectEvents, ...galleryEvents, ...contractEvents);

      return NextResponse.json(events);
    } catch (error) {
      console.error("GET /api/calendar error:", error);
      return NextResponse.json({ error: "Failed to fetch calendar data" }, { status: 500 });
    }
  });
}