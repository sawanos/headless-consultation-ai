import { NextRequest, NextResponse } from "next/server";
import { generateWithLLM } from "@/lib/llm";
import { getCategoryById } from "@/lib/categories";
import { retrieveForConsult } from "@/lib/rag";
import { GenerateRequestSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = GenerateRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { category, answers, assessment } = parsed.data;

  // RAG コンテキスト取得（サーバーサイドのみ）
  let ragContext = "";
  try {
    const cat = getCategoryById(category);
    if (cat) {
      ragContext = await retrieveForConsult(
        cat.label,
        answers.map((a) => ({ question: a.question, answer: a.answer }))
      );
    }
  } catch (err) {
    console.warn("[RAG] retrieval failed, skipping:", err);
  }

  const output = await generateWithLLM(category, answers, assessment, ragContext);
  return NextResponse.json(output);
}
