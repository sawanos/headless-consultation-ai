import { NextResponse } from "next/server";
import { PrimaryRespondRequestSchema } from "@/lib/validators";
import { caseStore } from "@/lib/case-store";
import { createAuditLog, appendAuditLog } from "@/lib/audit";
import type { OptionalPrimaryResponse } from "@/types/consult";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = PrimaryRespondRequestSchema.parse(body);

    const c = caseStore.get(parsed.caseId);
    if (!c) {
      return NextResponse.json({ error: "ケースが見つかりません" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const response: OptionalPrimaryResponse = {
      status: parsed.status,
      comment: parsed.comment,
      recordedAt: now,
      recordedBy: "primary_physician",
    };

    caseStore.setPrimaryResponse(parsed.caseId, response);
    caseStore.updateStatus(parsed.caseId, "response_recorded");

    const log = createAuditLog(
      "primary_physician",
      "primary_response_recorded",
      `主治医反応: ${parsed.status}`,
      undefined,
      { status: parsed.status, comment: parsed.comment }
    );
    appendAuditLog(parsed.caseId, log);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Primary respond error:", error);
    return NextResponse.json(
      { error: "反応の記録に失敗しました" },
      { status: 400 }
    );
  }
}
