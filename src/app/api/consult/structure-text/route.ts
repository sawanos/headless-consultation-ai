import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { StructuredObservation } from "@/types/consult";

const RequestSchema = z.object({
  text: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { text } = parsed.data;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // フォールバック: 構造化なしでそのまま返す
    const fallback: StructuredObservation[] = [
      {
        type: "unknown",
        content: text,
        urgencyContribution: "neutral",
        sourceText: text,
      },
    ];
    return NextResponse.json({ structured: fallback });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `あなたは訪問看護の観察メモを構造化するアシスタントです。
入力されたテキストから観察項目を抽出し、以下のJSON配列形式で返してください。

各項目:
- type: "symptom" | "behavior" | "vital" | "history" | "medication" | "environment" | "unknown"
- content: 内容の要約（短く）
- urgencyContribution: "high" | "medium" | "low" | "neutral"
- sourceText: 元のテキストの該当部分

出力はJSON配列のみ。`,
          },
          { role: "user", content: text },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const fallback: StructuredObservation[] = [
        { type: "unknown", content: text, urgencyContribution: "neutral", sourceText: text },
      ];
      return NextResponse.json({ structured: fallback });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({
        structured: [{ type: "unknown", content: text, urgencyContribution: "neutral", sourceText: text }],
      });
    }

    const parsed2 = JSON.parse(content);
    const structured: StructuredObservation[] = Array.isArray(parsed2)
      ? parsed2
      : Array.isArray(parsed2.structured)
      ? parsed2.structured
      : Array.isArray(parsed2.observations)
      ? parsed2.observations
      : [{ type: "unknown", content: text, urgencyContribution: "neutral", sourceText: text }];

    return NextResponse.json({ structured });
  } catch (error) {
    console.error("[structure-text] Error:", error);
    return NextResponse.json({
      structured: [{ type: "unknown", content: text, urgencyContribution: "neutral", sourceText: text }],
    });
  }
}
