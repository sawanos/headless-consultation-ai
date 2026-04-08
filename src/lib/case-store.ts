import type {
  ConsultationCaseV6,
  CaseStatusV6,
  AuditLogV6,
  RemoteReviewV6,
  OptionalPrimaryResponse,
  HandoffDeliveryRecord,
  ManagerActionRecord,
  ManagerClinicalReview,
} from "@/types/consult";

class CaseStore {
  private cases: Map<string, ConsultationCaseV6> = new Map();

  save(c: ConsultationCaseV6): void {
    this.cases.set(c.id, { ...c, updatedAt: new Date().toISOString() });
  }

  get(id: string): ConsultationCaseV6 | undefined {
    return this.cases.get(id);
  }

  getByStatus(status: CaseStatusV6): ConsultationCaseV6[] {
    return Array.from(this.cases.values())
      .filter((c) => c.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAll(): ConsultationCaseV6[] {
    return Array.from(this.cases.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  updateStatus(id: string, status: CaseStatusV6): void {
    const c = this.cases.get(id);
    if (c) {
      c.status = status;
      c.updatedAt = new Date().toISOString();
    }
  }

  appendAuditLog(id: string, log: AuditLogV6): void {
    const c = this.cases.get(id);
    if (c) {
      c.auditLogs.push(log);
      c.updatedAt = new Date().toISOString();
    }
  }

  setRemoteReview(id: string, review: RemoteReviewV6): void {
    const c = this.cases.get(id);
    if (c) {
      c.remoteReview = review;
      c.primaryHandoff = review.primaryHandoff;
      c.updatedAt = new Date().toISOString();
    }
  }

  setHandoffDelivery(id: string, record: HandoffDeliveryRecord): void {
    const c = this.cases.get(id);
    if (c) {
      c.handoffDelivery = record;
      c.updatedAt = new Date().toISOString();
    }
  }

  setManagerClinicalReview(id: string, review: ManagerClinicalReview): void {
    const c = this.cases.get(id);
    if (c) {
      c.managerClinicalReview = review;
      c.updatedAt = new Date().toISOString();
    }
  }

  setPrimaryResponse(id: string, response: OptionalPrimaryResponse): void {
    const c = this.cases.get(id);
    if (c) {
      c.primaryResponse = response;
      c.updatedAt = new Date().toISOString();
    }
  }

  appendManagerAction(id: string, action: ManagerActionRecord): void {
    const c = this.cases.get(id);
    if (c) {
      c.managerActions.push(action);
      c.updatedAt = new Date().toISOString();
    }
  }
}

// グローバルシングルトン（Next.js hot reload 対策）
const globalForCaseStore = globalThis as unknown as {
  caseStoreV6: CaseStore | undefined;
};

export const caseStore =
  globalForCaseStore.caseStoreV6 ?? new CaseStore();

globalForCaseStore.caseStoreV6 = caseStore;
