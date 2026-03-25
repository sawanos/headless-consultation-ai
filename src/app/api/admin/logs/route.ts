import { NextResponse } from "next/server";
import { getEncounterLogs } from "@/lib/storage";

export async function GET() {
  const logs = getEncounterLogs();
  return NextResponse.json({ logs });
}
