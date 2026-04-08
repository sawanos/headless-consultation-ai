import { NextResponse } from "next/server";
import { caseStore } from "@/lib/case-store";

export async function GET() {
  // v6: primary portal は Feature Flag 下。handoff_ready / handoff_shared のケースを表示
  const cases = [
    ...caseStore.getByStatus("handoff_ready"),
    ...caseStore.getByStatus("handoff_shared"),
  ];

  cases.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return NextResponse.json({ cases });
}
