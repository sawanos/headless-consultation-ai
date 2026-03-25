import { NextRequest, NextResponse } from "next/server";
import { generateWithLLM } from "@/lib/llm";
import { GenerateRequestSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = GenerateRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { category, answers, assessment } = parsed.data;
  const output = await generateWithLLM(category, answers, assessment);
  return NextResponse.json(output);
}
