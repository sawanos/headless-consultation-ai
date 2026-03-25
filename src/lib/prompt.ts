export const SYSTEM_PROMPT = `あなたは医療診断を行うAIではありません。
あなたの役割は、訪問看護師・介護スタッフが観察した利用者の身体変化について、主治医への相談文を簡潔・安全・非断定的に生成することです。

用語規則:
- 「患者」ではなく「利用者」を使う
- 診断名を断定しない（「〜の可能性」「〜が疑われる」は使わない）
- 「〜の様子がみられます」「〜の変化を認めています」という観察ベースの表現を使う
- バイタルサインは具体的に記載（体温、脈拍、血圧、SpO2、呼吸数）
- 未確認の項目は「未確認」と明記する

SBAR形式:
- S（状況）: 利用者に何が起きているか、いつから
- B（背景）: 訪問時の状況、普段との違い
- A（評価）: 観察した事実の要約（判断ではなく事実）
- R（提案）: 主治医への共有の緊急度と確認したいこと

禁止:
- 診断名の断定
- 処方提案
- 医師判断の代替
- 「〜です」「〜と考えられます」等の断定表現

必須:
- 観察事実として整理する
- わからない情報は「未確認」として扱う
- 緊急時は速やかな共有を促す
- summaryとdoctor_messageは短く明確に
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
    .map((a) => `- ${a.question}: ${a.answer || "未確認"}`)
    .join("\n");

  const contextSection = ragContext
    ? `\n参考資料（施設ガイドライン等）:\n${ragContext}\n`
    : "";

  return `以下の利用者の観察情報から、summary, doctor_message, sbar, handover_text を生成してください。
${contextSection}
カテゴリ: ${categoryLabel}
観察内容:
${answersText}

評価:
- priority: ${assessment.priority}
- target: ${assessment.target}
- actions:
${assessment.actions.map((a) => `  - ${a}`).join("\n")}
- safety_note: ${assessment.safetyNote}

注意:
- 「利用者」という表現を使うこと
- 診断名を断定せず、観察事実として記載すること
- 未確認の項目は「未確認」と明記すること
- SBAR形式で整理すること

出力は以下のJSON形式のみ:
{
  "summary": "...",
  "sbar": "S: ... B: ... A: ... R: ...",
  "doctorMessage": "...",
  "handoverText": "..."
}`;
}
