import { NextResponse } from "next/server";
import { ClinicianReviewV6RequestSchema } from "@/lib/validators";
import { caseStore } from "@/lib/case-store";
import { createAuditLog, appendAuditLog } from "@/lib/audit";
import type { RemoteReviewV6 } from "@/types/consult";
import { sendHandoffEmail, isEmailEnabled } from "@/lib/email-sender";

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

    const log = createAuditLog(
      "remote_physician",
      "clinician_review_saved",
      `遠隔医師レビュー完了: ${parsed.disposition}`,
      parsed.reviewerId
    );
    appendAuditLog(parsed.caseId, log);

    // emergency_bypass の場合は即時に主治医メールを送信
    let emailResult: { success: boolean; error?: string; to: string[] } | null =
      null;
    if (parsed.disposition === "emergency_bypass" && isEmailEnabled()) {
      const sendResult = await sendHandoffEmail({
        caseId: c.id,
        handoff: finalHandoff,
        to: c.primaryPhysicianEmail,
      });
      emailResult = sendResult.success
        ? { success: true, to: sendResult.to }
        : { success: false, error: sendResult.error, to: sendResult.to };

      if (sendResult.success) {
        const sentLog = createAuditLog(
          "system",
          "email_sent",
          `緊急バイパス: 主治医メール送信成功: ${sendResult.to.join(", ")}`,
          parsed.reviewerId,
          { messageId: sendResult.messageId, recipients: sendResult.to }
        );
        appendAuditLog(parsed.caseId, sentLog);
      } else {
        const failLog = createAuditLog(
          "system",
          "email_send_failed",
          `緊急バイパス: メール送信失敗: ${sendResult.error}`,
          parsed.reviewerId,
          { error: sendResult.error }
        );
        appendAuditLog(parsed.caseId, failLog);
      }
    }

    return NextResponse.json({ success: true, email: emailResult });
  } catch (error) {
    console.error("Clinician review error:", error);
    return NextResponse.json({ error: "レビューの保存に失敗しました" }, { status: 400 });
  }
}
