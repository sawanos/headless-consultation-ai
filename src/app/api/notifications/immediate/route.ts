import { NextResponse } from "next/server";
import { SendImmediateNotificationRequestSchema } from "@/lib/validators";
import { caseStore } from "@/lib/case-store";
import { sendImmediateNotification } from "@/lib/notification-channels";
import { createAuditLog, appendAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SendImmediateNotificationRequestSchema.parse(body);
    const c = caseStore.get(parsed.caseId);
    if (!c) return NextResponse.json({ error: "ケースが見つかりません" }, { status: 404 });
    if (!c.primaryHandoff) return NextResponse.json({ error: "Handoff が未生成です" }, { status: 400 });

    if (!c.primaryHandoff.notificationPolicy.immediateEmailEligible) {
      return NextResponse.json({ attempted: false, reason: "即時通知対象外のケースです" });
    }

    const result = await sendImmediateNotification(
      c.primaryHandoff,
      c.id,
      c.primaryPhysicianEmail
    );

    const log = createAuditLog(
      "system",
      "immediate_notification_attempted",
      result.delivered ? "即時通知メールを送信しました" : `即時通知失敗: ${result.errorMessage || "不明"}`,
      undefined,
      { delivered: result.delivered, recipients: result.recipients }
    );
    appendAuditLog(parsed.caseId, log);

    if (result.delivered) {
      const sentLog = createAuditLog(
        "system",
        "email_sent",
        `メール送信成功: ${result.recipients.join(", ")}`,
        undefined,
        { channel: "email", recipients: result.recipients }
      );
      appendAuditLog(parsed.caseId, sentLog);
    } else if (result.attempted) {
      const failLog = createAuditLog(
        "system",
        "email_send_failed",
        `メール送信失敗: ${result.errorMessage || "不明"}`,
        undefined,
        { error: result.errorMessage }
      );
      appendAuditLog(parsed.caseId, failLog);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Immediate notification error:", error);
    return NextResponse.json({ error: "即時通知に失敗しました" }, { status: 400 });
  }
}
