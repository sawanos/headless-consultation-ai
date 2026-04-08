import type { PrimaryHandoffPackage } from "@/types/consult";
import { toCopyText } from "./handoff";

const ESCALATION_PREFIX: Record<
  PrimaryHandoffPackage["recommendedEscalationLevel"],
  string
> = {
  emergency: "[緊急]",
  same_day: "[当日]",
  within_24h: "[24h以内]",
  observe: "[観察]",
};

const ESCALATION_LABEL: Record<
  PrimaryHandoffPackage["recommendedEscalationLevel"],
  string
> = {
  emergency: "緊急",
  same_day: "当日中",
  within_24h: "24時間以内",
  observe: "経過観察",
};

const ESCALATION_COLOR: Record<
  PrimaryHandoffPackage["recommendedEscalationLevel"],
  string
> = {
  emergency: "#dc2626",
  same_day: "#ea580c",
  within_24h: "#ca8a04",
  observe: "#16a34a",
};

export function buildHandoffEmailSubject(
  handoff: PrimaryHandoffPackage,
  caseId: string
): string {
  const prefix = ESCALATION_PREFIX[handoff.recommendedEscalationLevel] || "";
  const shortId = caseId.slice(0, 8);
  return `${prefix} ${handoff.headline} (Case #${shortId})`.trim();
}

export function buildHandoffEmailBody(
  handoff: PrimaryHandoffPackage,
  caseId: string,
  sentAt: string = new Date().toISOString()
): string {
  const lines: string[] = [];
  lines.push("先生");
  lines.push("");
  lines.push("訪問時の観察事項を共有いたします。下記をご確認ください。");
  lines.push("");
  lines.push("──────────────────────────");
  lines.push(toCopyText(handoff));
  lines.push("──────────────────────────");
  lines.push("");
  lines.push(`Case ID : ${caseId}`);
  lines.push(`送信時刻 : ${formatJST(sentAt)}`);
  lines.push("");
  lines.push(
    "本メールは Headless Consultation AI から自動送信されています。"
  );
  lines.push("内容は医療診断ではなく、現場からの相談・参考情報です。");
  return lines.join("\n");
}

/**
 * HTML 版本文。<meta charset="utf-8"> を明示し、メールクライアント側で
 * 文字コード判定が間違えないようにする。
 */
export function buildHandoffEmailHtml(
  handoff: PrimaryHandoffPackage,
  caseId: string,
  sentAt: string = new Date().toISOString()
): string {
  const escLabel =
    ESCALATION_LABEL[handoff.recommendedEscalationLevel] ||
    handoff.recommendedEscalationLevel;
  const escColor = ESCALATION_COLOR[handoff.recommendedEscalationLevel] || "#555";

  const list = (items: string[]) =>
    items.length === 0
      ? "<li><em>（記載なし）</em></li>"
      : items.map((s) => `<li>${escapeHtml(s)}</li>`).join("");

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>${escapeHtml(handoff.headline)}</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,'Hiragino Sans','Yu Gothic UI','Meiryo',sans-serif;line-height:1.7;color:#222;background:#f7f7f8;margin:0;padding:24px;">
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;">
    <p style="margin:0 0 16px 0;">先生</p>
    <p style="margin:0 0 16px 0;">訪問時の観察事項を共有いたします。下記をご確認ください。</p>

    <div style="display:inline-block;padding:4px 10px;border-radius:999px;background:${escColor};color:#fff;font-size:12px;font-weight:bold;margin-bottom:8px;">
      連絡優先度: ${escapeHtml(escLabel)}
    </div>
    <h1 style="font-size:18px;margin:8px 0 16px 0;color:#111;">${escapeHtml(handoff.headline)}</h1>

    <h2 style="font-size:14px;margin:16px 0 6px 0;color:#374151;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">観察情報</h2>
    <ul style="margin:0 0 12px 0;padding-left:20px;">${list(handoff.observationSummary)}</ul>

    <h2 style="font-size:14px;margin:16px 0 6px 0;color:#374151;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">バイタル</h2>
    <ul style="margin:0 0 12px 0;padding-left:20px;">${list(handoff.vitalSummary)}</ul>

    <h2 style="font-size:14px;margin:16px 0 6px 0;color:#374151;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">懸念点</h2>
    <ul style="margin:0 0 12px 0;padding-left:20px;">${list(handoff.concernPoints)}</ul>

    <h2 style="font-size:14px;margin:16px 0 6px 0;color:#374151;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">一般的医学情報</h2>
    <ul style="margin:0 0 12px 0;padding-left:20px;">${list(handoff.generalMedicalInfo)}</ul>

    <p style="margin:16px 0 4px 0;font-size:12px;color:#6b7280;">
      ${handoff.authoredBy === "AI" ? "AI による整理" : "遠隔医師確認済み"}
    </p>

    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">

    <table style="font-size:12px;color:#6b7280;border-collapse:collapse;">
      <tr><td style="padding:2px 8px 2px 0;">Case ID</td><td style="padding:2px 0;">${escapeHtml(caseId)}</td></tr>
      <tr><td style="padding:2px 8px 2px 0;">送信時刻</td><td style="padding:2px 0;">${escapeHtml(formatJST(sentAt))}</td></tr>
    </table>

    <p style="margin:16px 0 0 0;font-size:11px;color:#9ca3af;">
      本メールは Headless Consultation AI から自動送信されています。<br>
      内容は医療診断ではなく、現場からの相談・参考情報です。
    </p>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatJST(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
