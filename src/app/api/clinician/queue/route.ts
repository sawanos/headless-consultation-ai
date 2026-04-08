import { NextResponse } from "next/server";
import { caseStore } from "@/lib/case-store";

export async function GET() {
  try {
    const awaitingReview = caseStore.getByStatus("awaiting_clinician_review");
    const reviewing = caseStore.getByStatus("clinician_reviewing");
    const cases = [...awaitingReview, ...reviewing];
    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Clinician queue error:", error);
    return NextResponse.json({ error: "キューの取得に失敗しました" }, { status: 500 });
  }
}
