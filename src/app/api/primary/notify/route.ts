import { NextResponse } from "next/server";
import { PrimaryNotifyRequestSchema } from "@/lib/validators";
import { caseStore } from "@/lib/case-store";
import { createAuditLog, appendAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = PrimaryNotifyRequestSchema.parse(body);

    const c = caseStore.get(parsed.caseId);
    if (!c) {
      return NextResponse.json({ error: "ケースが見つかりません" }, { status: 404 });
    }

    // v6: handoff_ready に更新（primary_notified は使わない）
    caseStore.updateStatus(parsed.caseId, "handoff_ready");

    const log = createAuditLog(
      "system",
      "handoff_generated",
      "主治医向け Handoff が準備されました"
    );
    appendAuditLog(parsed.caseId, log);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Primary notify error:", error);
    return NextResponse.json(
      { error: "通知に失敗しました" },
      { status: 400 }
    );
  }
}
