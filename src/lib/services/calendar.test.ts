import { describe, expect, it } from "vitest";

import {
  buildContractEvent,
  buildGalleryEvent,
  buildInvoiceEvent,
  buildProjectEvent,
  buildQuoteEvent,
  normalizeCalendarCategory,
  parseCalendarRange,
  sortCalendarEvents,
} from "@/lib/services/calendar";

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

describe("calendar service", () => {
  it("accepts an ordered date range and rejects invalid ranges", () => {
    expect(parseCalendarRange("2026-01-01T00:00:00Z", "2026-01-31T23:59:59Z")).toEqual({
      start: date("2026-01-01"),
      end: new Date("2026-01-31T23:59:59Z"),
    });
    expect(parseCalendarRange("not-a-date", "2026-01-31T23:59:59Z")).toBeNull();
    expect(parseCalendarRange("2026-02-01T00:00:00Z", "2026-01-31T23:59:59Z")).toBeNull();
  });

  it("normalizes quotation and rejects unknown categories", () => {
    expect(normalizeCalendarCategory("quotation")).toBe("quote");
    expect(normalizeCalendarCategory("PROJECT")).toBe("project");
    expect(normalizeCalendarCategory("booking")).toBeUndefined();
  });

  it("maps source relationships without fabricating unrelated IDs", () => {
    const quote = buildQuoteEvent({
      id: "quote-1",
      title: "Brand campaign",
      notes: "Awaiting approval",
      validUntil: date("2026-02-10"),
      clientId: "client-1",
      invoiceId: "invoice-1",
      status: "sent",
    });

    expect(quote).toMatchObject({
      id: "quote:quote-1",
      sourceType: "quote",
      sourceId: "quote-1",
      relatedClientId: "client-1",
      relatedQuoteId: "quote-1",
      relatedInvoiceId: "invoice-1",
      relatedProjectId: null,
      relatedGalleryId: null,
    });
  });

  it("excludes records without an authoritative milestone date", () => {
    expect(buildProjectEvent({
      id: "project-1",
      name: "Undated project",
      description: null,
      startDate: null,
      endDate: null,
      clientId: "client-1",
      status: "draft",
    })).toBeNull();
    expect(buildInvoiceEvent({
      id: "invoice-1",
      invoiceNumber: "INV-1",
      notes: null,
      dueDate: null,
      clientId: "client-1",
      quoteId: null,
      status: "draft",
    })).toBeNull();
  });

  it("maps all supported source types to their own source IDs", () => {
    const events = [
      buildProjectEvent({ id: "project-1", name: "Shoot", description: null, startDate: date("2026-02-03"), endDate: date("2026-02-04"), clientId: "client-1", status: "active" }),
      buildInvoiceEvent({ id: "invoice-1", invoiceNumber: "INV-1", notes: null, dueDate: date("2026-02-02"), clientId: "client-1", quoteId: "quote-1", status: "sent" }),
      buildGalleryEvent({ id: "gallery-1", title: "Delivery", description: null, publishedAt: date("2026-02-05"), clientId: "client-1", projectId: "project-1", status: "published" }),
      buildContractEvent({ id: "contract-1", contractNumber: "CON-1", title: "Agreement", expiresAt: date("2026-02-01"), clientId: "client-1", projectId: "project-1", quoteId: "quote-1", status: "sent" }),
    ];

    expect(events.every(Boolean)).toBe(true);
    expect(events.map(event => event?.id)).toEqual([
      "project:project-1",
      "invoice:invoice-1",
      "gallery:gallery-1",
      "contract:contract-1",
    ]);
  });

  it("sorts events by milestone date", () => {
    const later = buildQuoteEvent({ id: "quote-2", title: "Later", notes: null, validUntil: date("2026-03-01"), clientId: null, invoiceId: null, status: "draft" });
    const earlier = buildQuoteEvent({ id: "quote-1", title: "Earlier", notes: null, validUntil: date("2026-02-01"), clientId: null, invoiceId: null, status: "draft" });

    expect(sortCalendarEvents([later!, earlier!]).map(event => event.sourceId)).toEqual(["quote-1", "quote-2"]);
  });
});
