/**
 * Application monitoring utilities for the KIPSMTHN Creative Platform.
 *
 * Provides comprehensive monitoring for API errors, performance metrics,
 * infrastructure health, and anomaly detection to support SOC 2 compliance.
 *
 * @module lib/monitoring
 * @see docs/soc2/LOGGING_MONITORING_PLAN.md
 */

import { logSecurityEvent, SecurityEventType } from "./security-logger";

/** Severity levels for monitoring events. */
export type MonitorSeverity = "critical" | "high" | "medium" | "low" | "info";

/**
 * Common API error categories for structured monitoring.
 */
export type ApiErrorCategory =
  | "authentication_error"
  | "authorization_error"
  | "validation_error"
  | "not_found_error"
  | "rate_limit_error"
  | "internal_server_error"
  | "timeout_error"
  | "database_error"
  | "upload_error"
  | "download_error";

/**
 * Application event types for operational monitoring.
 */
export type AppEventType =
  // API errors
  | "api_error"
  | "api_timeout"
  | "api_rate_limited"

  // Database issues
  | "db_connection_failed"
  | "db_query_error"
  | "db_migration_error"

  // Upload/download
  | "upload_failed"
  | "upload_size_exceeded"
  | "download_anomaly"
  | "download_large_export"

  // Infrastructure
  | "infra_deployment_failed"
  | "infra_health_check_failed"
  | "infra_disk_space_low"
  | "infra_memory_high"

  // Application errors
  | "app_unhandled_exception"
  | "app_render_error"
  | "app_configuration_error";

/** A structured monitoring log entry. */
export interface MonitorLogEntry {
  timestamp: string;
  severity: MonitorSeverity;
  category: "api" | "database" | "upload" | "infrastructure" | "application" | "security";
  eventType: AppEventType | SecurityEventType;
  metric?: string;
  value?: number;
  threshold?: number;
  message: string;
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Log an API error with categorization for monitoring.
 */
export function logApiError(
  category: ApiErrorCategory,
  message: string,
  statusCode: number,
  metadata: Record<string, unknown> = {}
): void {
  const severity: MonitorSeverity =
    statusCode >= 500 ? "critical" : statusCode >= 400 ? "high" : "medium";

  const entry: MonitorLogEntry = {
    timestamp: new Date().toISOString(),
    severity,
    category: "api",
    eventType: "api_error",
    message,
    details: { category, statusCode, ...metadata },
  };

  console.log(JSON.stringify(entry));
  console[severity === "critical" ? "error" : severity === "high" ? "warn" : "log"](
    `[${entry.timestamp}] [${severity.toUpperCase()}] [API] ${message} (${category}: ${statusCode})`
  );
}

/**
 * Log a database operation failure for monitoring.
 */
export function logDatabaseError(
  query: string,
  error: Error,
  durationMs: number
): void {
  const entry: MonitorLogEntry = {
    timestamp: new Date().toISOString(),
    severity: "critical",
    category: "database",
    eventType: "db_query_error",
    message: `Database query failed: ${error.message}`,
    details: { query: truncateQuery(query), durationMs, stack: sanitizeStack(error.stack) },
  };

  console.log(JSON.stringify(entry));
  console.error(`[CRITICAL] [DB] ${error.message} (${durationMs}ms)`);
}

/**
 * Log a failed upload attempt.
 */
export function logUploadFailure(
  fileSize?: number,
  fileType?: string,
  reason?: string,
  userId?: string
): void {
  const entry: MonitorLogEntry = {
    timestamp: new Date().toISOString(),
    severity: "high",
    category: "upload",
    eventType: "upload_failed",
    message: reason || "Upload failed",
    details: { fileSize, fileType, userId },
  };

  console.log(JSON.stringify(entry));
  console.error(`[HIGH] [UPLOAD] Upload failed: ${reason}`);
}

/**
 * Log a large download/export anomaly.
 */
export function logDownloadAnomaly(
  userId: string,
  recordCount: number,
  totalSize: number,
  expectedMaxRecords?: number
): void {
  const isAnomaly = expectedMaxRecords ? recordCount > expectedMaxRecords : recordCount > 10000;
  const eventType: AppEventType = isAnomaly ? "download_anomaly" : "download_large_export";

  const entry: MonitorLogEntry = {
    timestamp: new Date().toISOString(),
    severity: isAnomaly ? "high" : "medium",
    category: "upload",
    eventType,
    message: `${recordCount} records exported (${formatFileSize(totalSize)})`,
    details: { userId, recordCount, totalSize, expectedMaxRecords },
  };

  console.log(JSON.stringify(entry));
  console.warn(`[MEDIUM] [DOWNLOAD] ${recordCount} records exported by user ${userId}`);
}

/**
 * Log infrastructure health check failures.
 */
export function logInfrastructureFailure(
  component: string,
  message: string,
  details?: Record<string, unknown>
): void {
  const entry: MonitorLogEntry = {
    timestamp: new Date().toISOString(),
    severity: "critical",
    category: "infrastructure",
    eventType: "infra_health_check_failed",
    message: `${component} health check failed: ${message}`,
    details,
  };

  console.log(JSON.stringify(entry));
  console.error(`[CRITICAL] [INFRA] ${component}: ${message}`);
}

/**
 * Log application deployment status.
 */
export function logDeploymentStatus(
  status: "success" | "failed" | "rollback",
  version: string,
  deployTime: number,
  error?: string
): void {
  const entry: MonitorLogEntry = {
    timestamp: new Date().toISOString(),
    severity: status === "failed" ? "critical" : "info",
    category: "infrastructure",
    eventType: "infra_deployment_failed",
    message: `Deployment ${status}: v${version} in ${deployTime}ms`,
    details: { status, version, deployTime, error },
  };

  console.log(JSON.stringify(entry));
  if (status === "failed") {
    console.error(`[CRITICAL] [DEPLOY] Deployment failed: v${version} - ${error}`);
  } else {
    console.info(`[INFO] [DEPLOY] Deployment ${status}: v${version}`);
  }
}

/**
 * Log unhandled application exceptions.
 */
export function logAppException(error: Error, context: Record<string, unknown> = {}): void {
  const entry: MonitorLogEntry = {
    timestamp: new Date().toISOString(),
    severity: "critical",
    category: "application",
    eventType: "app_unhandled_exception",
    message: error.message,
    details: { name: error.name, stack: sanitizeStack(error.stack), context },
  };

  console.log(JSON.stringify(entry));
  console.error(`[CRITICAL] [APP] ${error.name}: ${error.message}`);
}

/**
 * Log API request performance metrics.
 */
export function logApiPerformance(
  endpoint: string,
  method: string,
  durationMs: number,
  statusCode: number,
  userId?: string
): void {
  const severity: MonitorSeverity =
    durationMs > 5000 ? "high" : durationMs > 2000 ? "medium" : "info";

  const entry: MonitorLogEntry = {
    timestamp: new Date().toISOString(),
    severity,
    category: "api",
    eventType: "api_error",
    metric: "api_response_time_ms",
    value: durationMs,
    threshold: 2000,
    message: `${method} ${endpoint} completed in ${durationMs}ms (status: ${statusCode})`,
    details: { endpoint, method, durationMs, statusCode, userId },
  };

  console.log(JSON.stringify(entry));
  if (severity !== "info") {
    console.warn(`[MEDIUM] [API] Slow request: ${method} ${endpoint} - ${durationMs}ms`);
  }
}

/**
 * Log rate limiting events.
 */
export function logRateLimitEvent(
  key: string,
  limit: number,
  current: number,
  retryAfterSeconds: number,
  endpoint?: string
): void {
  const entry: MonitorLogEntry = {
    timestamp: new Date().toISOString(),
    severity: "medium",
    category: "api",
    eventType: "api_rate_limited",
    message: `Rate limit exceeded: ${current}/${limit} requests for key ${key}`,
    details: { key, limit, current, retryAfterSeconds, endpoint },
  };

  console.log(JSON.stringify(entry));
  console.warn(`[MEDIUM] [RATE] Rate limit hit: ${key} (${current}/${limit})`);
}

/**
 * Helper to truncate SQL queries for safe logging.
 */
function truncateQuery(query: string, maxLen = 200): string {
  return query.length > maxLen ? query.slice(0, maxLen) + "..." : query;
}

/**
 * Helper to sanitize error stack traces (remove paths that might leak info).
 */
function sanitizeStack(stack?: string): string {
  if (!stack) return "";
  // Remove file paths that might expose internal structure
  return stack
    .replace(/\/Users\/[^\/]+\/\./g, "/Users/[REDACTED]/")
    .replace(/C:\\[^\\]+/g, "[REDACTED_PATH]");
}

/**
 * Helper to format file sizes for human readability.
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Export all monitoring functions for use in API routes.
 */
export const monitoring = {
  logApiError,
  logDatabaseError,
  logUploadFailure,
  logDownloadAnomaly,
  logInfrastructureFailure,
  logDeploymentStatus,
  logAppException,
  logApiPerformance,
  logRateLimitEvent,
};

// Re-export for convenience
export { logSecurityEvent, type SecurityEventType } from "./security-logger";
