/**
 * Security event logger for the KIPSMTHN Creative Platform.
 *
 * Provides structured logging for security-relevant events to support
 * SOC 2 compliance and incident response. All security logs are emitted
 * as structured JSON objects for easy parsing by SIEM and monitoring tools.
 *
 * @module lib/security-logger
 * @see docs/soc2/LOGGING_MONITORING_PLAN.md
 */

import { auth } from "@/lib/auth";

/** Severity levels for security events. */
export type SecuritySeverity = "critical" | "high" | "medium" | "low" | "info" | "debug";

/** Security event types for the KIPSMTHN Creative Platform. */
export type SecurityEventType =
  // Authentication events
  | "auth_login_success"
  | "auth_login_failure"
  | "auth_session_expired"
  | "auth_token_refresh"
  | "auth_mfa_challenge"
  | "auth_mfa_success"
  | "auth_mfa_failure"

  // Authorization events
  | "authz_access_denied"
  | "authz_privilege_escalation_attempt"
  | "authz_role_change"
  | "authz_permission_update"

  // Access events
  | "access_gallery_login_success"
  | "access_gallery_login_failure"
  | "access_gallery_pin_success"
  | "access_gallery_pin_failure"
  | "access_gallery_rate_limited"
  | "access_gallery_lockout"
  | "access_admin_access_denied"

  // Modification events
  | "modify_create_client"
  | "modify_delete_client"
  | "modify_update_client"
  | "modify_create_gallery"
  | "modify_delete_gallery"
  | "modify_publish_gallery"
  | "modify_upload_media"
  | "modify_download_media"
  | "modify_create_contract"
  | "modify_update_contract"
  | "modify_send_contract"
  | "modify_sign_contract"
  | "modify_decline_contract"
  | "modify_create_quote"
  | "modify_update_quote"
  | "modify_create_invoice"
  | "modify_update_invoice"

  // System events
  | "system_config_change"
  | "system_db_migration"
  | "system_api_key_rotate"
  | "system_secret_access"
  | "system_onboarding_complete"

  // Anomaly events
  | "anomaly_repeated_login_failure"
  | "anomaly_unusual_location"
  | "anomaly_off_hours_access"
  | "anomaly_large_export";

/** A structured security log entry. */
export interface SecurityLogEntry {
  timestamp: string;
  severity: SecuritySeverity;
  eventType: SecurityEventType;
  userId?: string;
  ipHash?: string;
  userAgent?: string | null;
  sessionId?: string | null;
  actorType?: "creator" | "client" | "admin" | "system";
  message: string;
  details?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Extract IP hash from request headers for privacy-preserving tracking.
 */
export async function getIpHash(request: Request): Promise<string | undefined> {
  try {
    const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const ip = forwarded || request.headers.get("x-real-ip") || "unknown";

    // Hash the IP to avoid storing raw PII in logs
    const encoder = new TextEncoder();
    const data = encoder.encode(ip);
    // Use Web Crypto API for hashing (available in Node.js 18+)
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Buffer.from(hash).toString("hex").slice(0, 16);
  } catch {
    return undefined;
  }
}

/**
 * Get current user context from Clerk session.
 */
export async function getUserContext(): Promise<{
  userId?: string;
  sessionId?: string;
  actorType?: "creator" | "client" | "admin" | "system";
}> {
  const { userId, sessionClaims } = await auth();
  const metadata = (sessionClaims as any)?.metadata as { role?: "admin" | "client" } | undefined;
  return {
    userId: userId || undefined,
    sessionId: undefined,
    actorType: metadata?.role === "client" ? "client" : metadata?.role === "admin" ? "admin" : "creator",
  };
}

/**
 * Log a security event to stdout in structured JSON format.
 *
 * This is designed to be compatible with Vercel's structured logging
 * and can be ingested by any SIEM that supports JSON parsing.
 */
export function logSecurityEvent(
  event: Omit<SecurityLogEntry, "timestamp">
): void {
  const entry: SecurityLogEntry = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  // Emit structured JSON for automated parsing
  console.log(JSON.stringify(entry));

  // Also emit human-readable log for debugging
  const humanReadable = `[${entry.timestamp}] [${entry.severity.toUpperCase()}] ${entry.eventType}: ${entry.message}${entry.userId ? ` (user: ${entry.userId})` : ""}${entry.ipHash ? ` (ip_hash: ${entry.ipHash})` : ""}`;

  switch (entry.severity) {
    case "critical":
    case "high":
      console.error(humanReadable);
      break;
    case "medium":
    case "low":
      console.warn(humanReadable);
      break;
    case "info":
      console.info(humanReadable);
      break;
    case "debug":
      console.debug(humanReadable);
      break;
    default:
      console.log(humanReadable);
  }
}

/**
 * Convenience function for authentication success events.
 */
export async function logAuthSuccess(
  eventType: "auth_login_success" | "auth_session_expired" | "auth_token_refresh",
  request: Request,
  additionalDetails?: Record<string, unknown>
): Promise<void> {
  const { userId, sessionId, actorType } = await getUserContext();
  const ipHash = await getIpHash(request);
  const userAgent = request.headers.get("user-agent");

  logSecurityEvent({
    severity: "info",
    eventType,
    userId,
    ipHash,
    userAgent,
    sessionId,
    actorType,
    message: `${eventType.replace("_", " ").replace("auth", "authentication").replace("token", "session token")}`,
    details: additionalDetails,
  });
}

/**
 * Convenience function for authentication failure events.
 */
export async function logAuthFailure(
  eventType: "auth_login_failure" | "auth_mfa_failure",
  request: Request,
  reason: string,
  additionalDetails?: Record<string, unknown>
): Promise<void> {
  const { userId, sessionId, actorType } = await getUserContext();
  const ipHash = await getIpHash(request);
  const userAgent = request.headers.get("user-agent");

  logSecurityEvent({
    severity: "medium",
    eventType,
    userId,
    ipHash,
    userAgent,
    sessionId,
    actorType,
    message: `Authentication failed: ${reason}`,
    details: additionalDetails,
  });
}

/**
 * Convenience function for access denial events.
 */
export async function logAccessDenied(
  request: Request,
  resource: string,
  reason: string,
  additionalDetails?: Record<string, unknown>
): Promise<void> {
  const { userId, sessionId, actorType } = await getUserContext();
  const ipHash = await getIpHash(request);
  const userAgent = request.headers.get("user-agent");

  logSecurityEvent({
    severity: "high",
    eventType: "authz_access_denied",
    userId,
    ipHash,
    userAgent,
    sessionId,
    actorType,
    message: `Access denied to ${resource}: ${reason}`,
    details: additionalDetails,
  });
}

/**
 * Convenience function for gallery access events.
 */
export async function logGalleryAccess(
  request: Request,
  eventType: "access_gallery_login_success" | "access_gallery_login_failure" | "access_gallery_pin_success" | "access_gallery_pin_failure" | "access_gallery_rate_limited" | "access_gallery_lockout",
  galleryId: string,
  details?: Record<string, unknown>
): Promise<void> {
  const { userId, sessionId, actorType } = await getUserContext();
  const ipHash = await getIpHash(request);
  const userAgent = request.headers.get("user-agent");

  logSecurityEvent({
    severity: eventType.includes("failure") || eventType.includes("rate_limited") || eventType.includes("lockout") ? "medium" : "info",
    eventType,
    userId,
    ipHash,
    userAgent,
    sessionId,
    actorType,
    message: `Gallery ${eventType.includes("success") ? "access granted" : "access denied"} for gallery ${galleryId}`,
    details: { ...details, galleryId },
  });
}

/**
 * Convenience function for modification events.
 */
export async function logModification(
  request: Request,
  eventType: Exclude<SecurityEventType, Exclude<SecurityEventType, "modify_create_client" | "modify_delete_client" | "modify_update_client" | "modify_create_gallery" | "modify_delete_gallery" | "modify_publish_gallery" | "modify_upload_media" | "modify_download_media" | "modify_create_contract" | "modify_update_contract" | "modify_send_contract" | "modify_sign_contract" | "modify_decline_contract" | "modify_create_quote" | "modify_update_quote" | "modify_create_invoice" | "modify_update_invoice" | "system_config_change" | "system_db_migration" | "system_api_key_rotate" | "system_secret_access" | "system_onboarding_complete">>,
  resource: string,
  resourceId: string,
  details?: Record<string, unknown>
): Promise<void> {
  const { userId, sessionId, actorType } = await getUserContext();
  const ipHash = await getIpHash(request);
  const userAgent = request.headers.get("user-agent");

  logSecurityEvent({
    severity: eventType.includes("delete") || eventType.includes("lockout") ? "high" : "info",
    eventType,
    userId,
    ipHash,
    userAgent,
    sessionId,
    actorType,
    message: `${eventType.replace("modify_", "").replace("_", " ")} on ${resource} (${resourceId})`,
    details: { ...details, resource, resourceId },
  });
}
