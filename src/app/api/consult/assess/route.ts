import { NextRequest, NextResponse } from "next/server";
import { assessRisk } from "@/lib/risk-engine";
import { ConcernCategory, InterviewAnswer } from "@/types/consult";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { category, answers } = body as {
    category: ConcernCategory;
    answers: InterviewAnswer[];
  };

  if (!category || !answers) {
    return NextResponse.json(
      { error: "category and answers are required" },
      { status: 400 }
    );
  }

  const assessment = assessRisk(category, answers);
  return NextResponse.json(assessment);
}
