import { NextResponse } from "next/server";
import { SaveCaseV6RequestSchema } from "@/lib/validators";
import { caseStore } from "@/lib/case-store";
import { createAuditLog, appendAuditLog } from "@/lib/audit";
import type { ConsultationCaseV6 } from "@/types/consult";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SaveCaseV6RequestSchema.parse(body);

    const existing = caseStore.get(parsed.caseId);
    const now = new Date().toISOString();

    if (existing) {
      existing.status = parsed.status;
      existing.triage = parsed.triage ?? existing.triage;
      existing.frontlineGuidance = parsed.frontlineGuidance ?? existing.frontlineGuidance;
      existing.primaryHandoff = parsed.primaryHandoff ?? existing.primaryHandoff;
      if (parsed.primaryPhysicianEmail !== undefined) {
        existing.primaryPhysicianEmail = parsed.primaryPhysicianEmail;
      }
      existing.updatedAt = now;
      caseStore.save(existing);
    } else {
      const newCase: ConsultationCaseV6 = {
        id: parsed.caseId,
        category: parsed.category,
        answers: parsed.answers,
        vitals: parsed.vitals ?? null,
        freeText: parsed.freeText ?? null,
        triage: parsed.triage ?? null,
        frontlineGuidance: parsed.frontlineGuidance ?? null,
        primaryHandoff: parsed.primaryHandoff ?? null,
        remoteReview: null,
        handoffDelivery: null,
        managerClinicalReview: null,
        primaryResponse: null,
        managerActions: [],
        status: parsed.status,
        auditLogs: [],
        createdAt: now,
        updatedAt: now,
        primaryPhysicianEmail: parsed.primaryPhysicianEmail ?? null,
      };
      caseStore.save(newCase);

      const log = createAuditLog("frontline", "case_created", "ケースが作成されました");
      appendAuditLog(parsed.caseId, log);
    }

    return NextResponse.json({ success: true, caseId: parsed.caseId });
  } catch (error) {
    console.error("Save case error:", error);
    return NextResponse.json(
      { error: "ケースの保存に失敗しました" },
      { status: 400 }
    );
  }
}
