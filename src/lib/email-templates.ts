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
