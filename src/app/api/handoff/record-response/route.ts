import { NextResponse } from "next/server";
import { RecordPrimaryResponseRequestSchema } from "@/lib/validators";
import { caseStore } from "@/lib/case-store";
import { createAuditLog, appendAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RecordPrimaryResponseRequestSchema.parse(body);
    const c = caseStore.get(parsed.caseId);
    if (!c) return NextResponse.json({ error: "ケースが見つかりません" }, { status: 404 });

    const now = new Date().toISOString();
    caseStore.setPrimaryResponse(parsed.caseId, {
      status: parsed.status,
      comment: parsed.comment,
      recordedAt: now,
      recordedBy: parsed.recordedBy,
    });
    caseStore.updateStatus(parsed.caseId, "response_recorded");
    caseStore.appendManagerAction(parsed.caseId, {
      action: "recorded_response",
      actorId: parsed.actorId,
      createdAt: now,
    });

    const log = createAuditLog(parsed.recordedBy === "primary_physician" ? "primary_physician" : "manager", "primary_response_recorded", `主治医反応を記録: ${parsed.status}`, parsed.actorId);
    appendAuditLog(parsed.caseId, log);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Record response error:", error);
    return NextResponse.json({ error: "反応記録に失敗しました" }, { status: 400 });
  }
}
