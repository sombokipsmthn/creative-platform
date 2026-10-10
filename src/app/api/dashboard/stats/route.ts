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
    const [statuses, recent] = await Promise.all([
      db.select({
        status: galleries.status,
        count: count(),
        periodCount: sql<number>`count(*) filter (where ${gte(galleries.createdAt, periodStart)} and ${lt(galleries.createdAt, periodEnd)})`.mapWith(Number),
      }).from(galleries).where(eq(galleries.creatorId, creator)).groupBy(galleries.status),
      db.select({ id: galleries.id, title: galleries.title, status: galleries.status, createdAt: galleries.createdAt }).from(galleries).where(eq(galleries.creatorId, creator)).orderBy(desc(galleries.updatedAt)).limit(5),
    ]);
    const lifetime = [{ value: statuses.reduce((total, row) => total + Number(row.count), 0) }];
    const period = [{ value: statuses.reduce((total, row) => total + row.periodCount, 0) }];
    return { lifetime, period, statuses, recent };
  } catch (error) {
    console.warn("Dashboard gallery metrics unavailable; returning empty gallery data.", error);
    return { lifetime: [{ value: 0 }], period: [{ value: 0 }], statuses: [] as Array<{ status: string; count: number; periodCount: number }>, recent: [] as Array<{ id: string; title: string; status: string; createdAt: Date }> };
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

    const [
      galleryStats,
      clientStats,
      recentClients,
      projectStats,
      recentProjects,
      quoteStats,
      recentQuotes,
      invoiceStats,
      recentInvoices,
    ] = await Promise.all([
      safeGalleryStats(creator, periodStart, periodEnd),
      db.select({
        status: clients.status,
        count: count(),
        periodCount: sql<number>`count(*) filter (where ${gte(clients.createdAt, periodStart)} and ${lt(clients.createdAt, periodEnd)})`.mapWith(Number),
      }).from(clients).where(eq(clients.creatorId, creator)).groupBy(clients.status),
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

    const clientStatuses = Object.fromEntries(clientStats.map((row) => [row.status, Number(row.count)]));
    const projectStatuses = Object.fromEntries(projectStats.map((row) => [row.status, Number(row.count)]));
    const quoteStatuses = Object.fromEntries(quoteStats.map((row) => [row.status, Number(row.count)]));
    const invoiceStatuses = Object.fromEntries(invoiceStats.map((row) => [row.status, Number(row.count)]));
    const galleryStatuses = Object.fromEntries(galleryStats.statuses.map((row) => [row.status, Number(row.count)]));
    const clientLifetime = clientStats.reduce((total, row) => total + Number(row.count), 0);
    const clientPeriod = clientStats.reduce((total, row) => total + row.periodCount, 0);
    const projectLifetime = projectStats.reduce((total, row) => total + Number(row.count), 0);
    const projectPeriod = projectStats.reduce((total, row) => total + row.periodCount, 0);
    const quoteLifetime = quoteStats.reduce((total, row) => total + Number(row.count), 0);
    const quotePeriod = quoteStats.reduce((total, row) => total + row.periodCount, 0);
    const invoiceLifetime = invoiceStats.reduce((total, row) => total + Number(row.count), 0);
    const invoicePeriod = invoiceStats.reduce((total, row) => total + row.periodCount, 0);
    const quotePeriodValue = quoteStats.reduce((total, row) => total + row.periodValue, 0);
    const acceptedQuoteValue = quoteStats.find((row) => row.status === "accepted")?.statusValue ?? 0;
    const invoicePeriodValue = invoiceStats.reduce((total, row) => total + row.periodValue, 0);
    const paidInvoicePeriodValue = invoiceStats.reduce((total, row) => total + row.paidPeriodValue, 0);
    const overdueInvoices = invoiceStats.reduce((total, row) => total + row.overdueCount, 0);
    const activeClients = clientStatuses.active ?? 0;
    const activeProjects = projectStatuses.active ?? 0;
    const completedProjects = projectStatuses.completed ?? 0;

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
        clients: clientLifetime,
        newClients: clientPeriod,
        activeClients,
        projects: projectLifetime,
        newProjects: projectPeriod,
        activeProjects,
        completedProjects,
        quotes: quoteLifetime,
        newQuotes: quotePeriod,
        invoices: invoiceLifetime,
        newInvoices: invoicePeriod,
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
