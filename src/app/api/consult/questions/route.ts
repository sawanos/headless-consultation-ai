import { NextRequest, NextResponse } from "next/server";
import { getQuestions } from "@/lib/questions";
import { ConcernCategory } from "@/types/consult";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { category } = body as { category: ConcernCategory };

  if (!category) {
    return NextResponse.json({ error: "category is required" }, { status: 400 });
  }

  const questions = getQuestions(category);
  return NextResponse.json({ questions });
}
