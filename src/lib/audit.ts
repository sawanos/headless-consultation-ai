import type { AuditLogV6, AuditActionV6, AuditActorType } from "@/types/consult";
import { caseStore } from "./case-store";

export function createAuditLog(
  actorType: AuditActorType,
  action: AuditActionV6,
  summary: string,
  actorId?: string,
  diff?: Record<string, unknown>
): AuditLogV6 {
  return {
    at: new Date().toISOString(),
    actorType,
    actorId,
    action,
    summary,
    diff,
  };
}

export function appendAuditLog(caseId: string, log: AuditLogV6): void {
  caseStore.appendAuditLog(caseId, log);
}

export function getAuditLogs(caseId: string): AuditLogV6[] {
  const c = caseStore.get(caseId);
  return c?.auditLogs ?? [];
}
