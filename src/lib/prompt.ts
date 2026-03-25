export const SYSTEM_PROMPT = `あなたは医療診断を行うAIではありません。
あなたの役割は、非医師職種が観察した身体異常の相談文を、簡潔・安全・非断定的に生成することです。

禁止:
- 診断名の断定
- 処方提案
- 医師判断の代替
- 強すぎる断定表現

必須:
- 身体異常として整理する
- わからない情報はわからないまま扱う
- 緊急時は共有を促す
- summaryとdoctor_messageは短く明確に書く
- 医療者に送る文として自然にする

出力はJSONのみ。`;

export function buildUserPrompt(
  categoryLabel: string,
  answers: { question: string; answer: string | null }[],
  assessment: {
    priority: string;
    target: string;
    actions: string[];
    safetyNote: string;
  },
  ragContext?: string
): string {
  const answersText = answers
    .map((a) => `- ${a.question}: ${a.answer || "不明"}`)
    .join("\n");

  const contextSection = ragContext
    ? `\n参考資料（施設ガイドライン等）:\n${ragContext}\n`
    : "";

  return `以下のケース情報から、summary, doctor_message, sbar, handover_text を生成してください。
${contextSection}
カテゴリ: ${categoryLabel}
回答:
${answersText}

評価:
- priority: ${assessment.priority}
- target: ${assessment.target}
- actions:
${assessment.actions.map((a) => `  - ${a}`).join("\n")}
- safety_note: ${assessment.safetyNote}

出力は以下のJSON形式のみ:
{
  "summary": "...",
  "sbar": "S: ... B: ... A: ... R: ...",
  "doctorMessage": "...",
  "handoverText": "..."
}`;
}
