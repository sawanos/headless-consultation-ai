import { NextRequest, NextResponse } from "next/server";
import { getQuestions } from "@/lib/questions";
import { QuestionsRequestSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = QuestionsRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const questions = getQuestions(parsed.data.category);
  return NextResponse.json({ questions });
}
