import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { contracts, galleries, invoices, projects, quotes, studioEvents } from "@/db/schema";

export const calendarCategories = [
  "project",
  "quote",
  "invoice",
  "gallery",
  "contract",
  "studio_event",
] as const;

export type CalendarCategory = (typeof calendarCategories)[number];
export type CalendarEventCategory = "Project" | "Quotation" | "Invoice" | "Gallery" | "Contract" | "Studio event";

export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  allDay: true;
  category: CalendarEventCategory;
  status: string;
  relatedClientId: string | null;
  relatedProjectId: string | null;
  relatedQuoteId: string | null;
  relatedInvoiceId: string | null;
  relatedGalleryId: string | null;
  sourceType: CalendarCategory;
  sourceId: string;
  isTentative: boolean;
};

export type CalendarRange = {
  start: Date;
  end: Date;
};

export type CalendarFilters = {
  range: CalendarRange;
  clientId?: string;
  projectId?: string;
  category?: CalendarCategory;
};

export function parseCalendarRange(startParam: string | null, endParam: string | null): CalendarRange | null {
  if (!startParam || !endParam) return null;

  const start = new Date(startParam);
  const end = new Date(endParam);

  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end) {
    return null;
  }

  return { start, end };
}

export function normalizeCalendarCategory(value: string | null): CalendarCategory | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase() === "quotation" ? "quote" : value.toLowerCase();
  return (calendarCategories as readonly string[]).includes(normalized)
    ? normalized as CalendarCategory
    : undefined;
}

function isWithinRange(column: Parameters<typeof gte>[0], range: CalendarRange) {
  return and(gte(column, range.start), lte(column, range.end));
}

function projectOverlapsRange(range: CalendarRange) {
  return and(
    sql`${projects.startDate} is not null`,
    sql`${projects.endDate} is not null`,
    lte(projects.startDate, range.end),
    gte(projects.endDate, range.start),
  );
}

type CalendarEventInput = Omit<CalendarEvent, "id" | "allDay" | "endDate" | "relatedClientId" | "relatedProjectId" | "relatedQuoteId" | "relatedInvoiceId" | "relatedGalleryId"> & {
  endDate?: Date | null;
  relatedClientId?: string | null;
  relatedProjectId?: string | null;
  relatedQuoteId?: string | null;
  relatedInvoiceId?: string | null;
  relatedGalleryId?: string | null;
};

function sourceEvent({
  sourceType,
  sourceId,
  title,
  description,
  startDate,
  endDate = null,
  category,
  status,
  relatedClientId = null,
  relatedProjectId = null,
  relatedQuoteId = null,
  relatedInvoiceId = null,
  relatedGalleryId = null,
  isTentative = false,
}: CalendarEventInput): CalendarEvent {
  return {
    id: `${sourceType}:${sourceId}`,
    title,
    description,
    startDate,
    endDate,
    allDay: true,
    category,
    status,
    relatedClientId,
    relatedProjectId,
    relatedQuoteId,
    relatedInvoiceId,
    relatedGalleryId,
    sourceType,
    sourceId,
    isTentative,
  };
}

export function buildProjectEvent(row: {
  id: string;
  name: string;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;
  clientId: string | null;
  status: string;
}): CalendarEvent | null {
  if (!row.startDate) return null;
  return sourceEvent({
    sourceType: "project",
    sourceId: row.id,
    title: row.name,
    description: row.description,
    startDate: row.startDate,
    endDate: row.endDate,
    category: "Project",
    status: row.status,
    relatedClientId: row.clientId,
    relatedProjectId: row.id,
    isTentative: ["draft", "in_progress"].includes(row.status.toLowerCase()),
  });
}

export function buildQuoteEvent(row: {
  id: string;
  title: string;
  notes: string | null;
  validUntil: Date | null;
  clientId: string | null;
  invoiceId: string | null;
  status: string;
}): CalendarEvent | null {
  if (!row.validUntil) return null;
  return sourceEvent({
    sourceType: "quote",
    sourceId: row.id,
    title: row.title,
    description: row.notes,
    startDate: row.validUntil,
    category: "Quotation",
    status: row.status,
    relatedClientId: row.clientId,
    relatedQuoteId: row.id,
    relatedInvoiceId: row.invoiceId,
    isTentative: ["draft", "sent"].includes(row.status.toLowerCase()),
  });
}

export function buildInvoiceEvent(row: {
  id: string;
  invoiceNumber: string;
  notes: string | null;
  dueDate: Date | null;
  clientId: string;
  quoteId: string | null;
  status: string;
}): CalendarEvent | null {
  if (!row.dueDate) return null;
  return sourceEvent({
    sourceType: "invoice",
    sourceId: row.id,
    title: `Invoice ${row.invoiceNumber}`,
    description: row.notes,
    startDate: row.dueDate,
    category: "Invoice",
    status: row.status,
    relatedClientId: row.clientId,
    relatedQuoteId: row.quoteId,
    relatedInvoiceId: row.id,
    isTentative: ["draft", "pending"].includes(row.status.toLowerCase()),
  });
}

export function buildGalleryEvent(row: {
  id: string;
  title: string;
  description: string | null;
  publishedAt: Date | null;
  clientId: string | null;
  projectId: string | null;
  status: string;
}): CalendarEvent | null {
  if (!row.publishedAt) return null;
  return sourceEvent({
    sourceType: "gallery",
    sourceId: row.id,
    title: row.title,
    description: row.description,
    startDate: row.publishedAt,
    category: "Gallery",
    status: row.status,
    relatedClientId: row.clientId,
    relatedProjectId: row.projectId,
    relatedGalleryId: row.id,
    isTentative: row.status.toLowerCase() === "draft",
  });
}

export function buildContractEvent(row: {
  id: string;
  contractNumber: string;
  title: string;
  expiresAt: Date | null;
  clientId: string;
  projectId: string | null;
  quoteId: string | null;
  status: string;
}): CalendarEvent | null {
  if (!row.expiresAt) return null;
  return sourceEvent({
    sourceType: "contract",
    sourceId: row.id,
    title: `Contract ${row.contractNumber}`,
    description: row.title,
    startDate: row.expiresAt,
    category: "Contract",
    status: row.status,
    relatedClientId: row.clientId,
    relatedProjectId: row.projectId,
    relatedQuoteId: row.quoteId,
    isTentative: ["draft", "sent"].includes(row.status.toLowerCase()),
  });
}

export function buildStudioEvent(row: {
  id: string;
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date | null;
  clientId: string | null;
  projectId: string | null;
  status: string;
}): CalendarEvent {
  return sourceEvent({
    sourceType: "studio_event",
    sourceId: row.id,
    title: row.title,
    description: row.description,
    startDate: row.startsAt,
    endDate: row.endsAt,
    category: "Studio event",
    status: row.status,
    relatedClientId: row.clientId,
    relatedProjectId: row.projectId,
    isTentative: row.status.toLowerCase() === "planned",
  });
}

export function sortCalendarEvents(events: CalendarEvent[]) {
  return [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

export async function listCalendarEventsForCreator(userId: string, filters: CalendarFilters): Promise<CalendarEvent[]> {
  const { range, clientId, projectId, category } = filters;
  const include = (name: CalendarCategory) => !category || category === name;
  const project = (column: Parameters<typeof eq>[0]) => projectId ? eq(column, projectId) : undefined;
  const client = (column: Parameters<typeof eq>[0]) => clientId ? eq(column, clientId) : undefined;

  const [projectRows, quoteRows, invoiceRows, galleryRows, contractRows, studioEventRows] = await Promise.all([
    include("project")
      ? db.select({ id: projects.id, name: projects.name, description: projects.description, startDate: projects.startDate, endDate: projects.endDate, clientId: projects.clientId, status: projects.status }).from(projects).where(and(eq(projects.creatorId, userId), projectOverlapsRange(range), client(projects.clientId), project(projects.id))).orderBy(desc(projects.startDate))
      : Promise.resolve([]),
    include("quote")
      ? db.select({ id: quotes.id, title: quotes.title, notes: quotes.notes, validUntil: quotes.validUntil, clientId: quotes.clientId, invoiceId: quotes.invoiceId, status: quotes.status }).from(quotes).where(and(eq(quotes.creatorId, userId), isWithinRange(quotes.validUntil, range), client(quotes.clientId))).orderBy(desc(quotes.validUntil))
      : Promise.resolve([]),
    include("invoice")
      ? db.select({ id: invoices.id, invoiceNumber: invoices.invoiceNumber, notes: invoices.notes, dueDate: invoices.dueDate, clientId: invoices.clientId, quoteId: invoices.quoteId, status: invoices.status }).from(invoices).where(and(eq(invoices.creatorId, userId), isWithinRange(invoices.dueDate, range), client(invoices.clientId))).orderBy(desc(invoices.dueDate))
      : Promise.resolve([]),
    include("gallery")
      ? db.select({ id: galleries.id, title: galleries.title, description: galleries.description, publishedAt: galleries.publishedAt, clientId: galleries.clientId, projectId: galleries.projectId, status: galleries.status }).from(galleries).where(and(eq(galleries.creatorId, userId), isWithinRange(galleries.publishedAt, range), client(galleries.clientId), project(galleries.projectId))).orderBy(desc(galleries.publishedAt))
      : Promise.resolve([]),
    include("contract")
      ? db.select({ id: contracts.id, contractNumber: contracts.contractNumber, title: contracts.title, expiresAt: contracts.expiresAt, clientId: contracts.clientId, projectId: contracts.projectId, quoteId: contracts.quoteId, status: contracts.status }).from(contracts).where(and(eq(contracts.creatorId, userId), isWithinRange(contracts.expiresAt, range), client(contracts.clientId), project(contracts.projectId))).orderBy(desc(contracts.expiresAt))
      : Promise.resolve([]),
    include("studio_event")
      ? db.select({ id: studioEvents.id, title: studioEvents.title, description: studioEvents.description, startsAt: studioEvents.startsAt, endsAt: studioEvents.endsAt, clientId: studioEvents.clientId, projectId: studioEvents.projectId, status: studioEvents.status }).from(studioEvents).where(and(eq(studioEvents.creatorId, userId), isWithinRange(studioEvents.startsAt, range), client(studioEvents.clientId), project(studioEvents.projectId))).orderBy(desc(studioEvents.startsAt))
      : Promise.resolve([]),
  ]);

  return sortCalendarEvents([
    ...projectRows.map(buildProjectEvent),
    ...quoteRows.map(buildQuoteEvent),
    ...invoiceRows.map(buildInvoiceEvent),
    ...galleryRows.map(buildGalleryEvent),
    ...contractRows.map(buildContractEvent),
    ...studioEventRows.map(buildStudioEvent),
  ].filter((event): event is CalendarEvent => event !== null));
}
