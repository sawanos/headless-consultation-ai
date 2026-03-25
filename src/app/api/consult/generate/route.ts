import { NextRequest, NextResponse } from "next/server";
import { generateWithLLM } from "@/lib/llm";
import { Assessment, InterviewAnswer } from "@/types/consult";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { category, answers, assessment } = body as {
    category: string;
    answers: InterviewAnswer[];
    assessment: Assessment;
  };

  if (!category || !answers || !assessment) {
    return NextResponse.json(
      { error: "category, answers, and assessment are required" },
      { status: 400 }
    );
  }

  const output = await generateWithLLM(category, answers, assessment);
  return NextResponse.json(output);
}
