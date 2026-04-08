import { NextResponse } from "next/server";
import { MarkHandoffSharedRequestSchema } from "@/lib/validators";
import { caseStore } from "@/lib/case-store";
import { createAuditLog, appendAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = MarkHandoffSharedRequestSchema.parse(body);
    const c = caseStore.get(parsed.caseId);
    if (!c) return NextResponse.json({ error: "ケースが見つかりません" }, { status: 404 });

    const now = new Date().toISOString();
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

    const log = createAuditLog("manager", "handoff_shared", `Handoff を ${parsed.channel} で共有しました`, parsed.actorId);
    appendAuditLog(parsed.caseId, log);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mark shared error:", error);
    return NextResponse.json({ error: "共有記録に失敗しました" }, { status: 400 });
  }
}
