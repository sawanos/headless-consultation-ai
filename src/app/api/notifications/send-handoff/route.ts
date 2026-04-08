import { NextResponse } from "next/server";
import { z } from "zod";
import { sendHandoffEmail, isEmailEnabled } from "@/lib/email-sender";
import { PrimaryHandoffPackageSchema } from "@/lib/validators";
import { caseStore } from "@/lib/case-store";
import { createAuditLog, appendAuditLog } from "@/lib/audit";

export const runtime = "nodejs";

const RequestSchema = z.object({
  caseId: z.string(),
  handoff: PrimaryHandoffPackageSchema,
  to: z.string().email().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RequestSchema.parse(body);

    if (!isEmailEnabled()) {
      return NextResponse.json(
        { success: false, error: "RESEND_API_KEY が設定されていません" },
        { status: 503 }
      );
    }

    const result = await sendHandoffEmail({
      caseId: parsed.caseId,
      handoff: parsed.handoff,
      to: parsed.to ?? null,
    });

    // case-store に該当ケースがあれば監査ログを追加（serverless で無くても続行）
    const c = caseStore.get(parsed.caseId);
    if (c) {
      const log = createAuditLog(
        "frontline",
        result.success ? "email_sent" : "email_send_failed",
        result.success
          ? `主治医メール送信成功: ${result.to.join(", ")}`
          : `主治医メール送信失敗: ${result.error}`,
        undefined,
        result.success
          ? { messageId: result.messageId, recipients: result.to }
          : { error: result.error }
      );
      appendAuditLog(parsed.caseId, log);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        to: result.to,
        sentAt: result.sentAt,
      });
    }

    return NextResponse.json(
      { success: false, error: result.error, to: result.to },
      { status: 502 }
    );
  } catch (error) {
    console.error("[send-handoff] error:", error);
    const message =
      error instanceof Error ? error.message : "送信に失敗しました";
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
