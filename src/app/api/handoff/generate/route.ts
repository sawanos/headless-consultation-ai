import { NextResponse } from "next/server";
import { caseStore } from "@/lib/case-store";
import { toCopyText, toPrintablePayload } from "@/lib/handoff";

export async function POST(request: Request) {
  try {
    const { caseId } = await request.json();
    const c = caseStore.get(caseId);
    if (!c) return NextResponse.json({ error: "ケースが見つかりません" }, { status: 404 });
    if (!c.primaryHandoff) return NextResponse.json({ error: "Handoff が未生成です" }, { status: 400 });

    return NextResponse.json({
      handoff: c.primaryHandoff,
      copyText: toCopyText(c.primaryHandoff),
      printable: toPrintablePayload(c.primaryHandoff),
    });
  } catch (error) {
    console.error("Handoff generate error:", error);
    return NextResponse.json({ error: "Handoff 生成に失敗しました" }, { status: 400 });
  }
}
