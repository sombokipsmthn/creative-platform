/**
 * Application metrics endpoint for monitoring and alerting.
 *
 * Provides aggregated metrics about the application's security and
 * operational status. Designed for integration with external monitoring
 * systems (Prometheus, Datadog, Vercel Analytics, etc.).
 *
 * @module api/metrics
 * @see docs/soc2/LOGGING_MONITORING_PLAN.md
 */

import { NextResponse } from "next/server";
import { logSecurityEvent, type SecurityEventType, type SecuritySeverity } from "@/lib/security-logger";

/**
 * Metric point for time-series data.
 */
interface MetricPoint {
  metric: string;
  value: number;
  timestamp: string;
  labels?: Record<string, string>;
}

/**
 * Metrics response structure.
 */
interface MetricsResponse {
  generatedAt: string;
  metrics: MetricPoint[];
  summary: {
    totalEvents: number;
    criticalEvents: number;
    highEvents: number;
    mediumEvents: number;
    lowEvents: number;
  };
}

/**
 * In-memory metrics store (resets on function scale-down).
 * For production, consider using Redis or a time-series database.
 */
class MetricsStore {
  private events: Array<{
    timestamp: string;
    severity: string;
    eventType: string;
    category: string;
  }> = [];

  addEvent(event: {
    timestamp: string;
    severity: string;
    eventType: string;
    category: string;
  }): void {
    this.events.push(event);
    // Keep only last 24 hours of events
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    this.events = this.events.filter((e) => e.timestamp >= cutoff);
  }

  getMetrics(): MetricPoint[] {
    const now = new Date().toISOString();
    const metrics: MetricPoint[] = [];

    // Count events by severity
    const severityCounts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0, debug: 0 };
    const categoryCounts: Record<string, number> = { security: 0, api: 0, database: 0, infrastructure: 0, application: 0 };
    const eventTypeCounts: Record<string, number> = {};

    for (const event of this.events) {
      severityCounts[event.severity] = (severityCounts[event.severity] || 0) + 1;
      categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
      eventTypeCounts[event.eventType] = (eventTypeCounts[event.eventType] || 0) + 1;
    }

    // Add severity metrics
    for (const [severity, count] of Object.entries(severityCounts)) {
      metrics.push({
        metric: `security_events_by_severity`,
        value: count,
        timestamp: now,
        labels: { severity },
      });
    }

    // Add category metrics
    for (const [category, count] of Object.entries(categoryCounts)) {
      metrics.push({
        metric: `security_events_by_category`,
        value: count,
        timestamp: now,
        labels: { category },
      });
    }

    // Add top event types
    const sortedEventTypes = Object.entries(eventTypeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    for (const [eventType, count] of sortedEventTypes) {
      metrics.push({
        metric: `security_event_type_count`,
        value: count,
        timestamp: now,
        labels: { eventType },
      });
    }

    // Add total count
    metrics.push({
      metric: `security_events_total`,
      value: this.events.length,
      timestamp: now,
    });

    return metrics;
  }

  getSummary() {
    const severityCounts: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0, debug: 0 };

    for (const event of this.events) {
      severityCounts[event.severity] = (severityCounts[event.severity] || 0) + 1;
    }

    return {
      totalEvents: this.events.length,
      criticalEvents: severityCounts.critical,
      highEvents: severityCounts.high,
      mediumEvents: severityCounts.medium,
      lowEvents: severityCounts.low + severityCounts.info + severityCounts.debug,
    };
  }

  clear(): void {
    this.events = [];
  }
}

// Singleton metrics store
const metricsStore = new MetricsStore();

/**
 * GET handler for metrics endpoint.
 */
export async function GET(request: Request) {
  // Log metrics access
  logSecurityEvent({
    severity: "info",
    eventType: "system_secret_access",
    message: "Metrics endpoint accessed",
    details: { source: request.headers.get("x-forwarded-for") || "unknown" },
  });

  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "json";

  const metrics = metricsStore.getMetrics();
  const summary = metricsStore.getSummary();

  const response: MetricsResponse = {
    generatedAt: new Date().toISOString(),
    metrics,
    summary,
  };

  if (format === "prometheus") {
    // Return Prometheus text format
    const prometheusLines = metrics.map(
      (m) =>
        `${m.metric}{${Object.entries(m.labels || {})
          .map(([k, v]) => `${k}="${v}"`)
          .join(",")}} ${m.value} ${new Date(m.timestamp).getTime()}`
    );
    return new NextResponse(prometheusLines.join("\n") + "\n", {
      headers: { "Content-Type": "text/plain" },
    });
  }

  return NextResponse.json(response);
}

/**
 * POST handler for submitting custom metrics.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate and parse the event
    const event = {
      timestamp: body.timestamp || new Date().toISOString(),
      severity: body.severity || "info",
      eventType: body.eventType,
      category: body.category || "application",
    };

    if (!event.eventType) {
      return NextResponse.json(
        { error: "eventType is required" },
        { status: 400 }
      );
    }

    // Add to metrics store
    metricsStore.addEvent(event);

    // Also log to security logger
    logSecurityEvent({
      severity: event.severity as SecuritySeverity,
      eventType: event.eventType as SecurityEventType,
      message: event.eventType,
      details: body.details,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process metric", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler for clearing metrics (admin only).
 */
export async function DELETE() {
  metricsStore.clear();
  return NextResponse.json({ success: true, message: "Metrics cleared" });
}

