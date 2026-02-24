/**
 * Audit Log Utility (PCI DSS Req 10)
 * 
 * Tracks sensitive administrative actions.
 * In a production environment, these should be saved to a 
 * separate, tamper-proof database or external logging service.
 */

export interface AuditLogEntry {
  userId: string;
  action: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ip: string;
  userAgent: string;
}

export async function logAuditAction(entry: AuditLogEntry) {
  const timestamp = new Date().toISOString();
  
  // Redact potentially sensitive details
  const sanitizedDetails = entry.details ? JSON.parse(JSON.stringify(entry.details, (key, value) => {
    const sensitiveKeys = ["password", "token", "secret", "cvv", "pan"];
    return sensitiveKeys.includes(key.toLowerCase()) ? "[REDACTED]" : value;
  })) : {};

  const logLine = {
    timestamp,
    ...entry,
    details: sanitizedDetails,
  };

  // For MVP: Log to terminal with a specific prefix for easy parsing
  console.log(`[AUDIT_LOG] ${JSON.stringify(logLine)}`);

  // TODO: Save to MongoDB 'AuditLogs' collection if requested later
}
