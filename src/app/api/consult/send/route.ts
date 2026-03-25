import { NextRequest, NextResponse } from "next/server";
import { saveEncounterLog } from "@/lib/storage";
import { EncounterLog } from "@/types/consult";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { caseId, startedAt, edited } = body as {
    caseId: string;
    startedAt: string;
    edited: boolean;
  };

  if (!caseId || !startedAt) {
    return NextResponse.json(
      { error: "caseId and startedAt are required" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const start = new Date(startedAt).getTime();
  const end = new Date(now).getTime();
  const durationSec = Math.round((end - start) / 1000);

  const log: EncounterLog = {
    id: uuidv4(),
    caseId,
    startedAt,
    completedAt: now,
    durationSec,
    edited: edited || false,
    sent: true,
  };

  saveEncounterLog(log);

  return NextResponse.json({ success: true, log });
}
