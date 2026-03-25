import { NextRequest, NextResponse } from "next/server";
import { assessRisk } from "@/lib/risk-engine";
import { AssessRequestSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = AssessRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const assessment = assessRisk(parsed.data.category, parsed.data.answers);
  return NextResponse.json(assessment);
}
