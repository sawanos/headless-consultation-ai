import { ConsultationOutput, InterviewAnswer, Assessment, VitalSigns, FreeTextInput } from "@/types/consult";
import { getCategoryById } from "./categories";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";

// ダミー出力生成（Phase 1-2: LLM未接続時のフォールバック）
export function generateDummyOutput(
  categoryId: string,
  answers: InterviewAnswer[],
  assessment: Assessment
): ConsultationOutput {
  const category = getCategoryById(categoryId);
  const label = category?.label || "不明な症状";

  const answersText = answers
    .filter((a) => a.answer && a.answer !== "わからない")
    .map((a) => `${a.answerLabel}`)
    .join("、");

  const targetLabel =
    assessment.target === "cardiology"
      ? "循環器科"
      : assessment.target === "internal"
      ? "内科"
      : "主治医";

  return {
    summary: `本日、利用者に${label}の変化を認めています。${answersText ? `観察内容: ${answersText}。` : ""}`,
    sbar: `S: 本日${label}の様子があります。B: 訪問時に気づきました。A: ${assessment.reason} R: ${targetLabel}への${assessment.bridge ? "当日" : ""}共有をご確認ください。`,
    doctorMessage: `本日訪問時、${label}の様子を認めました。${answersText ? `${answersText}の状況です。` : "詳細は確認中です。"}${assessment.bridge ? "当日中のご確認をご相談したいです。" : "次回の診察時にご相談させてください。"}`,
    handoverText: `${label}あり。${assessment.priority}判定。${assessment.bridge ? "当日共有推奨。" : "経過観察中。"}`,
  };
}

// LLM接続版（ragContext はサーバーサイドの API route から渡される）
export async function generateWithLLM(
  categoryId: string,
  answers: InterviewAnswer[],
  assessment: Assessment,
  ragContext?: string,
  vitals?: VitalSigns,
  freeText?: FreeTextInput
): Promise<ConsultationOutput> {
  const category = getCategoryById(categoryId);
  if (!category) {
    return generateDummyOutput(categoryId, answers, assessment);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("[LLM] No API key found, using dummy output");
    return generateDummyOutput(categoryId, answers, assessment);
  }

  try {
    if (ragContext) {
      console.log(`[RAG] Context injected: ${ragContext.length} chars`);
    }

    const userPrompt = buildUserPrompt(
      category.label,
      answers.map((a) => ({ question: a.question, answer: a.answer })),
      {
        priority: assessment.priority,
        target: assessment.target,
        actions: assessment.actions,
        safetyNote: assessment.safetyNote,
      },
      ragContext,
      vitals,
      freeText
    );

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      console.error("[LLM] API error:", response.status);
      return generateDummyOutput(categoryId, answers, assessment);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return generateDummyOutput(categoryId, answers, assessment);
    }

    const parsed = JSON.parse(content);
    return {
      summary: parsed.summary || "",
      sbar: parsed.sbar || "",
      doctorMessage: parsed.doctorMessage || parsed.doctor_message || "",
      handoverText: parsed.handoverText || parsed.handover_text || "",
    };
  } catch (error) {
    console.error("[LLM] Generation error:", error);
    return generateDummyOutput(categoryId, answers, assessment);
  }
}
