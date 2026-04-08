import { NextResponse } from "next/server";
import { RecordManagerClinicalReviewRequestSchema } from "@/lib/validators";
import { caseStore } from "@/lib/case-store";
import { createAuditLog, appendAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RecordManagerClinicalReviewRequestSchema.parse(body);
    const c = caseStore.get(parsed.caseId);
    if (!c) return NextResponse.json({ error: "ケースが見つかりません" }, { status: 404 });

    const now = new Date().toISOString();
    caseStore.setManagerClinicalReview(parsed.caseId, {
      status: parsed.status,
      reviewerRole: parsed.reviewerRole,
      note: parsed.note,
      reviewedAt: now,
      reviewedBy: parsed.reviewedBy,
    });

    const log = createAuditLog("manager", "manager_clinical_review_recorded", `事後レビュー: ${parsed.status}`, parsed.reviewedBy);
    appendAuditLog(parsed.caseId, log);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clinical review error:", error);
    return NextResponse.json({ error: "事後レビュー記録に失敗しました" }, { status: 400 });
  }
}
