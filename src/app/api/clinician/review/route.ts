import { NextResponse } from "next/server";
import { ClinicianReviewV6RequestSchema } from "@/lib/validators";
import { caseStore } from "@/lib/case-store";
import { createAuditLog, appendAuditLog } from "@/lib/audit";
import type { RemoteReviewV6 } from "@/types/consult";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ClinicianReviewV6RequestSchema.parse(body);

    const c = caseStore.get(parsed.caseId);
    if (!c) return NextResponse.json({ error: "ケースが見つかりません" }, { status: 404 });

    const now = new Date().toISOString();

    const handoffToUse = parsed.primaryHandoffOverride || c.primaryHandoff;
    if (!handoffToUse) {
      return NextResponse.json({ error: "Handoff が見つかりません" }, { status: 400 });
    }

    const finalHandoff = {
      ...handoffToUse,
      authoredBy: "remote_physician" as const,
    };

    const review: RemoteReviewV6 = {
      reviewerId: parsed.reviewerId,
      reviewerRole: parsed.reviewerRole,
      disposition: parsed.disposition,
      clinicianComment: parsed.clinicianComment,
      primaryHandoff: finalHandoff,
      createdAt: now,
    };

    caseStore.setRemoteReview(parsed.caseId, review);
    caseStore.updateStatus(parsed.caseId, "handoff_ready");

    const log = createAuditLog("remote_physician", "clinician_review_saved", `遠隔医師レビュー完了: ${parsed.disposition}`, parsed.reviewerId);
    appendAuditLog(parsed.caseId, log);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clinician review error:", error);
    return NextResponse.json({ error: "レビューの保存に失敗しました" }, { status: 400 });
  }
}
