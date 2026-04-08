import { NextResponse } from "next/server";
import { TriageRequestV6Schema } from "@/lib/validators";
import { runTriage } from "@/lib/triage-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = TriageRequestV6Schema.parse(body);

    const result = runTriage({
      category: parsed.category,
      answers: parsed.answers,
      vitals: parsed.vitals ?? null,
      freeText: parsed.freeText ?? null,
      emergencyBypass: parsed.emergencyBypass,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Triage error:", error);
    return NextResponse.json(
      { error: "トリアージ処理に失敗しました" },
      { status: 400 }
    );
  }
}
