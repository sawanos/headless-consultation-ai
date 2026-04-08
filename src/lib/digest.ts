import type { ConsultationCaseV6 } from "@/types/consult";

export type DailyDigestItem = {
  caseId: string;
  headline: string;
  escalationLevel: "observe";
  authoredBy: "AI" | "remote_physician";
  createdAt: string;
};

export type DailyDigestPayload = {
  recipientGroupId: string;
  date: string;
  items: DailyDigestItem[];
};

export function collectDailyDigestCandidates(
  cases: ConsultationCaseV6[]
): ConsultationCaseV6[] {
  return cases.filter((c) => {
    // ai_completed 以上であること
    const validStatuses = [
      "ai_completed", "handoff_ready", "handoff_shared",
      "response_recorded", "closed",
    ];
    if (!validStatuses.includes(c.status)) return false;

    // handoff が存在し、digest 対象であること
    if (!c.primaryHandoff) return false;
    if (!c.primaryHandoff.notificationPolicy.includeInDailyDigest) return false;

    // 既に handled のものは除外してよい
    if (c.managerClinicalReview?.status === "handled") return false;

    return true;
  });
}

export function buildDailyDigestPayload(input: {
  date: string;
  recipientGroupId: string;
  cases: ConsultationCaseV6[];
}): DailyDigestPayload {
  const items: DailyDigestItem[] = input.cases.map((c) => ({
    caseId: c.id,
    headline: c.primaryHandoff?.headline || "（要約なし）",
    escalationLevel: "observe" as const,
    authoredBy: c.primaryHandoff?.authoredBy || "AI",
    createdAt: c.createdAt,
  }));

  return {
    recipientGroupId: input.recipientGroupId,
    date: input.date,
    items,
  };
}

export function formatDigestAsText(payload: DailyDigestPayload): string {
  const lines: string[] = [];
  lines.push(`【日次ダイジェスト】${payload.date}`);
  lines.push(`対象件数: ${payload.items.length}件`);
  lines.push("");

  for (const item of payload.items) {
    lines.push(`・${item.headline}（${item.authoredBy === "AI" ? "AI整理" : "医師確認済"}）`);
  }

  lines.push("");
  lines.push("※ 詳細は管理画面のケース一覧よりご確認ください。");

  return lines.join("\n");
}
