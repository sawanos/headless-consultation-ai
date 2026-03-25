import { NextRequest, NextResponse } from "next/server";
import { saveEncounterLog } from "@/lib/storage";
import { SendRequestSchema } from "@/lib/validators";
import { EncounterLog } from "@/types/consult";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = SendRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { caseId, startedAt, edited } = parsed.data;
  const now = new Date().toISOString();
  const durationSec = Math.round(
    (new Date(now).getTime() - new Date(startedAt).getTime()) / 1000
  );

  const log: EncounterLog = {
    id: uuidv4(),
    caseId,
    startedAt,
    completedAt: now,
    durationSec,
    edited,
    sent: true,
  };

  saveEncounterLog(log);
  return NextResponse.json({ success: true, log });
}
