import { NextResponse } from "next/server";
import { count, desc, eq, gte, lt, ne, sql } from "drizzle-orm";

import { db } from "@/db";
import { clients, galleries, invoices, projects, quotes } from "@/db/schema";
import { withCreatorApi } from "@/lib/api/route-boundaries";

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function startOfPeriod(date: Date, range: string) {
  const value = startOfDay(date);

  switch (range) {
    case "7d":
      return addDays(value, -6);
    case "90d":
      return addDays(value, -89);
    case "12m":
      value.setMonth(value.getMonth() - 11);
      value.setDate(1);
      return value;
    case "all":
      return new Date(0);
    case "30d":
    default:
      return addDays(value, -29);
  }
}

function money(value: unknown) {
  return Number(value ?? 0) || 0;
}

async function safeGalleryStats(creator: string, periodStart: Date, periodEnd: Date) {
  try {
    const lifetime = await db.select({ value: count() }).from(galleries).where(eq(galleries.creatorId, creator));
    const period = await db.select({ value: count() }).from(galleries).where(and(eq(galleries.creatorId, creator), gte(galleries.createdAt, periodStart), lt(galleries.createdAt, periodEnd)));
    const statuses = await db.select({ status: galleries.status, count: count() }).from(galleries).where(eq(galleries.creatorId, creator)).groupBy(galleries.status);
    const recent = await db.select({ id: galleries.id, title: galleries.title, status: galleries.status, createdAt: galleries.createdAt }).from(galleries).where(eq(galleries.creatorId, creator)).orderBy(desc(galleries.updatedAt)).limit(5);
    return { lifetime, period, statuses, recent };
  } catch (error) {
    console.warn("Dashboard gallery metrics unavailable; returning empty gallery data.", error);
    return { lifetime: [{ value: 0 }], period: [{ value: 0 }], statuses: [] as Array<{ status: string; count: number }>, recent: [] as Array<{ id: string; title: string; status: string; createdAt: Date }> };
  }
}

export async function GET(request: Request) {
  return withCreatorApi(request, async (_request, user) => {
    const creator = user.id;

    const { searchParams } = new URL(request.url);
    const requestedRange = searchParams.get("range") ?? "30d";
    const range = ["7d", "30d", "90d", "12m", "all"].includes(requestedRange)
      ? requestedRange
      : "30d";

    const now = new Date();
    const periodStart = startOfPeriod(now, range);
    const periodEnd = addDays(startOfDay(now), 1);
    const galleryStats = await safeGalleryStats(creator, periodStart, periodEnd);

    const [
      clientLifetime,
      clientPeriod,
      activeClients,
      projectLifetime,
      projectPeriod,
      activeProjects,
      completedProjects,
      quoteLifetime,
      quotePeriod,
      quoteStatusRows,
      quotePeriodValue,
      acceptedQuoteValue,
      invoiceLifetime,
      invoicePeriod,
      invoiceStatusRows,
      invoicePeriodValue,
      paidInvoicePeriodValue,
      overdueInvoices,
      recentClients,
      projectStats,
      recentProjects,
      quoteStats,
      recentQuotes,
      invoiceStats,
      recentInvoices,
    ] = await Promise.all([
      db.select({ value: count() }).from(clients).where(eq(clients.creatorId, creator)),
      db.select({ value: count() }).from(clients).where(and(eq(clients.creatorId, creator), gte(clients.createdAt, periodStart), lt(clients.createdAt, periodEnd))),
      db.select({ value: count() }).from(clients).where(and(eq(clients.creatorId, creator), eq(clients.status, "active"))),
      db.select({ value: count() }).from(projects).where(eq(projects.creatorId, creator)),
      db.select({ value: count() }).from(projects).where(and(eq(projects.creatorId, creator), gte(projects.createdAt, periodStart), lt(projects.createdAt, periodEnd))),
      db.select({ value: count() }).from(projects).where(and(eq(projects.creatorId, creator), eq(projects.status, "active"))),
      db.select({ value: count() }).from(projects).where(and(eq(projects.creatorId, creator), eq(projects.status, "completed"))),
      db.select({ value: count() }).from(quotes).where(eq(quotes.creatorId, creator)),
      db.select({ value: count() }).from(quotes).where(and(eq(quotes.creatorId, creator), gte(quotes.createdAt, periodStart), lt(quotes.createdAt, periodEnd))),
      db.select({ status: quotes.status, count: count() }).from(quotes).where(eq(quotes.creatorId, creator)).groupBy(quotes.status),
      db.select({ value: sum(quotes.total) }).from(quotes).where(and(eq(quotes.creatorId, creator), gte(quotes.createdAt, periodStart), lt(quotes.createdAt, periodEnd))),
      db.select({ value: sum(quotes.total) }).from(quotes).where(and(eq(quotes.creatorId, creator), eq(quotes.status, "accepted"))),
      db.select({ value: count() }).from(invoices).where(eq(invoices.creatorId, creator)),
      db.select({ value: count() }).from(invoices).where(and(eq(invoices.creatorId, creator), gte(invoices.createdAt, periodStart), lt(invoices.createdAt, periodEnd))),
      db.select({ status: invoices.status, count: count() }).from(invoices).where(eq(invoices.creatorId, creator)).groupBy(invoices.status),
      db.select({ value: sum(invoices.total) }).from(invoices).where(and(eq(invoices.creatorId, creator), gte(invoices.createdAt, periodStart), lt(invoices.createdAt, periodEnd))),
      db.select({ value: sum(invoices.total) }).from(invoices).where(and(eq(invoices.creatorId, creator), eq(invoices.status, "paid"), gte(invoices.updatedAt, periodStart), lt(invoices.updatedAt, periodEnd))),
      db.select({ value: count() }).from(invoices).where(and(eq(invoices.creatorId, creator), lt(invoices.dueDate, now), ne(invoices.status, "paid"), ne(invoices.status, "cancelled"))),
      db.select({ id: clients.id, name: clients.name, createdAt: clients.createdAt }).from(clients).where(eq(clients.creatorId, creator)).orderBy(desc(clients.createdAt)).limit(5),
      db.select({
        status: projects.status,
        count: count(),
        periodCount: sql<number>`count(*) filter (where ${gte(projects.createdAt, periodStart)} and ${lt(projects.createdAt, periodEnd)})`.mapWith(Number),
      }).from(projects).where(eq(projects.creatorId, creator)).groupBy(projects.status),
      db.select({ id: projects.id, name: projects.name, status: projects.status, createdAt: projects.createdAt }).from(projects).where(eq(projects.creatorId, creator)).orderBy(desc(projects.updatedAt)).limit(5),
      db.select({
        status: quotes.status,
        count: count(),
        periodCount: sql<number>`count(*) filter (where ${gte(quotes.createdAt, periodStart)} and ${lt(quotes.createdAt, periodEnd)})`.mapWith(Number),
        periodValue: sql<number>`coalesce(sum(${quotes.total}) filter (where ${gte(quotes.createdAt, periodStart)} and ${lt(quotes.createdAt, periodEnd)}), 0)`.mapWith(Number),
        statusValue: sql<number>`coalesce(sum(${quotes.total}), 0)`.mapWith(Number),
      }).from(quotes).where(eq(quotes.creatorId, creator)).groupBy(quotes.status),
      db.select({ id: quotes.id, title: quotes.title, status: quotes.status, total: quotes.total, currency: quotes.currency, createdAt: quotes.createdAt }).from(quotes).where(eq(quotes.creatorId, creator)).orderBy(desc(quotes.updatedAt)).limit(5),
      db.select({
        status: invoices.status,
        count: count(),
        periodCount: sql<number>`count(*) filter (where ${gte(invoices.createdAt, periodStart)} and ${lt(invoices.createdAt, periodEnd)})`.mapWith(Number),
        periodValue: sql<number>`coalesce(sum(${invoices.total}) filter (where ${gte(invoices.createdAt, periodStart)} and ${lt(invoices.createdAt, periodEnd)}), 0)`.mapWith(Number),
        paidPeriodValue: sql<number>`coalesce(sum(${invoices.total}) filter (where ${invoices.status} = 'paid' and ${gte(invoices.updatedAt, periodStart)} and ${lt(invoices.updatedAt, periodEnd)}), 0)`.mapWith(Number),
        overdueCount: sql<number>`count(*) filter (where ${lt(invoices.dueDate, now)} and ${ne(invoices.status, "paid")} and ${ne(invoices.status, "cancelled")})`.mapWith(Number),
      }).from(invoices).where(eq(invoices.creatorId, creator)).groupBy(invoices.status),
      db.select({ id: invoices.id, invoiceNumber: invoices.invoiceNumber, title: invoices.title, status: invoices.status, total: invoices.total, currency: invoices.currency, createdAt: invoices.createdAt }).from(invoices).where(eq(invoices.creatorId, creator)).orderBy(desc(invoices.updatedAt)).limit(5),
    ]);

    const quoteStatuses = Object.fromEntries(quoteStatusRows.map((row) => [row.status, Number(row.count)]));
    const invoiceStatuses = Object.fromEntries(invoiceStatusRows.map((row) => [row.status, Number(row.count)]));
    const galleryStatuses = Object.fromEntries(galleryStats.statuses.map((row) => [row.status, Number(row.count)]));

    const acceptedQuotes = quoteStatuses.accepted ?? 0;
    const decisionQuotes = (quoteStatuses.sent ?? 0) + (quoteStatuses.accepted ?? 0) + (quoteStatuses.rejected ?? 0) + (quoteStatuses.invoiced ?? 0);
    const quoteConversionRate = decisionQuotes > 0 ? Math.round((acceptedQuotes / decisionQuotes) * 100) : 0;

    const activity = [
      ...recentClients.map((item) => ({ id: `client-${item.id}`, type: "client" as const, title: "New client", description: item.name, date: item.createdAt })),
      ...recentProjects.map((item) => ({ id: `project-${item.id}`, type: "project" as const, title: `Project ${item.status}`, description: item.name, date: item.createdAt })),
      ...recentQuotes.map((item) => ({ id: `quote-${item.id}`, type: "quote" as const, title: `Quote ${item.status}`, description: item.title, date: item.createdAt })),
      ...recentInvoices.map((item) => ({ id: `invoice-${item.id}`, type: "invoice" as const, title: `Invoice ${item.invoiceNumber || item.title}`, date: item.createdAt })),
      ...galleryStats.recent.map((item) => ({ id: `gallery-${item.id}`, type: "gallery" as const, title: `Gallery ${item.status}`, description: item.title, date: item.createdAt })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8).map((item) => ({ ...item, date: item.date.toISOString() }));

    return NextResponse.json({
      range,
      period: { start: periodStart.toISOString(), end: periodEnd.toISOString() },
      overview: {
        clients: Number(clientLifetime[0]?.value ?? 0),
        newClients: Number(clientPeriod[0]?.value ?? 0),
        activeClients: Number(activeClients[0]?.value ?? 0),
        projects: Number(projectLifetime[0]?.value ?? 0),
        newProjects: Number(projectPeriod[0]?.value ?? 0),
        activeProjects: Number(activeProjects[0]?.value ?? 0),
        completedProjects: Number(completedProjects[0]?.value ?? 0),
        quotes: Number(quoteLifetime[0]?.value ?? 0),
        newQuotes: Number(quotePeriod[0]?.value ?? 0),
        invoices: Number(invoiceLifetime[0]?.value ?? 0),
        newInvoices: Number(invoicePeriod[0]?.value ?? 0),
        galleries: Number(galleryStats.lifetime[0]?.value ?? 0),
        newGalleries: Number(galleryStats.period[0]?.value ?? 0),
      },
      finance: {
        periodQuotedValue: money(quotePeriodValue),
        acceptedQuoteValue: money(acceptedQuoteValue),
        periodInvoicedValue: money(invoicePeriodValue),
        periodPaidValue: money(paidInvoicePeriodValue),
        overdueInvoices,
      },
      quotes: { statuses: quoteStatuses, conversionRate: quoteConversionRate },
      invoices: { statuses: invoiceStatuses },
      galleries: { statuses: galleryStatuses },
      attention: {
        overdueInvoices,
        pendingQuotes: (quoteStatuses.sent ?? 0) + (quoteStatuses.draft ?? 0),
        activeProjects,
        activeGalleries: (galleryStatuses.active ?? 0) + (galleryStatuses.published ?? 0),
      },
      activity,
    });
  });
}
