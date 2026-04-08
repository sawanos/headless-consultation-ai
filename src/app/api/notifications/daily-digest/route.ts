import { NextResponse } from "next/server";
import { BuildDailyDigestRequestSchema } from "@/lib/validators";
import { caseStore } from "@/lib/case-store";
import { collectDailyDigestCandidates, buildDailyDigestPayload, formatDigestAsText } from "@/lib/digest";
import { createAuditLog, appendAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = BuildDailyDigestRequestSchema.parse(body);

    const allCases = caseStore.getAll();
    const candidates = collectDailyDigestCandidates(allCases);

    if (candidates.length === 0) {
      return NextResponse.json({ sent: false, reason: "ダイジェスト対象のケースがありません", itemCount: 0 });
    }

    const date = parsed.date || new Date().toISOString().split("T")[0];
    const recipientGroupId = parsed.recipientGroupId || "default";

    const payload = buildDailyDigestPayload({ date, recipientGroupId, cases: candidates });
    const digestText = formatDigestAsText(payload);

    for (const c of candidates) {
      const log = createAuditLog("system", "daily_digest_sent", `日次ダイジェストに収載されました (${date})`);
      appendAuditLog(c.id, log);
    }

    return NextResponse.json({
      sent: true,
      itemCount: payload.items.length,
      digestText,
      payload,
    });
  } catch (error) {
    console.error("Daily digest error:", error);
    return NextResponse.json({ error: "日次ダイジェスト生成に失敗しました" }, { status: 400 });
  }
}
