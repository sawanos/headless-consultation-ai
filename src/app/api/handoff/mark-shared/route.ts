import { NextResponse } from "next/server";
import { MarkHandoffSharedRequestSchema } from "@/lib/validators";
import { caseStore } from "@/lib/case-store";
import { createAuditLog, appendAuditLog } from "@/lib/audit";
import { sendHandoffEmail, isEmailEnabled } from "@/lib/email-sender";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = MarkHandoffSharedRequestSchema.parse(body);
    const c = caseStore.get(parsed.caseId);
    if (!c) return NextResponse.json({ error: "ケースが見つかりません" }, { status: 404 });

    const now = new Date().toISOString();

    // email_placeholder チャネルが指定されたら実送信を試みる
    let emailResult: { success: boolean; error?: string; to: string[] } | null =
      null;
    if (parsed.channel === "email_placeholder") {
      if (!c.primaryHandoff) {
        return NextResponse.json(
          { error: "Handoff が未生成のためメール送信できません" },
          { status: 400 }
        );
      }
      if (!isEmailEnabled()) {
        return NextResponse.json(
          { error: "メール送信が無効です（RESEND_API_KEY 未設定）" },
          { status: 503 }
        );
      }
      const sendResult = await sendHandoffEmail({
        caseId: c.id,
        handoff: c.primaryHandoff,
        to: c.primaryPhysicianEmail,
      });
      emailResult = sendResult.success
        ? { success: true, to: sendResult.to }
        : { success: false, error: sendResult.error, to: sendResult.to };

      if (sendResult.success) {
        const sentLog = createAuditLog(
          "manager",
          "email_sent",
          `主治医メール送信成功: ${sendResult.to.join(", ")}`,
          parsed.actorId,
          { messageId: sendResult.messageId, recipients: sendResult.to }
        );
        appendAuditLog(parsed.caseId, sentLog);
      } else {
        const failLog = createAuditLog(
          "manager",
          "email_send_failed",
          `主治医メール送信失敗: ${sendResult.error}`,
          parsed.actorId,
          { error: sendResult.error }
        );
        appendAuditLog(parsed.caseId, failLog);
      }
    }

    caseStore.setHandoffDelivery(parsed.caseId, {
      shared: true,
      sharedAt: now,
      sharedBy: parsed.actorId,
      channel: parsed.channel,
      note: parsed.note,
    });
    caseStore.updateStatus(parsed.caseId, "handoff_shared");
    caseStore.appendManagerAction(parsed.caseId, {
      action: "marked_shared",
      actorId: parsed.actorId,
      createdAt: now,
      note: parsed.note,
    });

    const log = createAuditLog(
      "manager",
      "handoff_shared",
      `Handoff を ${parsed.channel} で共有しました`,
      parsed.actorId
    );
    appendAuditLog(parsed.caseId, log);

    return NextResponse.json({ success: true, email: emailResult });
  } catch (error) {
    console.error("Mark shared error:", error);
    return NextResponse.json({ error: "共有記録に失敗しました" }, { status: 400 });
  }
}
