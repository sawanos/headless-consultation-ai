import { NextResponse } from "next/server";
import { caseStore } from "@/lib/case-store";

export async function GET() {
  try {
    const cases = caseStore.getAll();
    return NextResponse.json({ cases });
  } catch (error) {
    console.error("Admin cases error:", error);
    return NextResponse.json({ error: "ケース一覧の取得に失敗しました" }, { status: 500 });
  }
}
