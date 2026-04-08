import type {
  ConcernCategory,
  Assessment,
  StructuredObservation,
  VitalSigns,
  PrimaryHandoffPackage,
  NotificationPolicy,
  ShareChannel,
  TriageBucket,
} from "@/types/consult";

const CATEGORY_LABELS: Record<string, string> = {
  usual_diff: "いつもと違う様子",
  dyspnea: "呼吸苦",
  edema: "浮腫",
  palpitation: "動悸",
  low_energy: "活気低下",
  poor_intake: "食事摂取低下",
  confusion: "意識変容",
  fall: "転倒",
  medication: "薬剤関連",
  unknown_worry: "不明な心配",
};

const VITAL_LABELS: Record<string, { label: string; unit: string }> = {
  temperature: { label: "体温", unit: "℃" },
  spo2: { label: "SpO2", unit: "%" },
  pulse: { label: "脈拍", unit: "回/分" },
  bloodPressure: { label: "血圧", unit: "mmHg" },
  respiratoryRate: { label: "呼吸数", unit: "回/分" },
};

function buildNotificationPolicy(
  escalationLevel: PrimaryHandoffPackage["recommendedEscalationLevel"],
  bucket: TriageBucket
): NotificationPolicy {
  const isImmediate = escalationLevel === "same_day" || escalationLevel === "emergency";
  const isDigest = escalationLevel === "observe" && bucket === "ai_only";

  return {
    immediateEmailEligible: isImmediate,
    includeInDailyDigest: isDigest,
    manualShareRecommended: !isImmediate && !isDigest,
  };
}

function determineChannel(
  escalationLevel: PrimaryHandoffPackage["recommendedEscalationLevel"]
): ShareChannel {
  if (escalationLevel === "emergency") return "copy_text";
  return "copy_text";
}

function buildVitalSummary(vitals?: VitalSigns | null): string[] {
  if (!vitals) return ["バイタルサイン: 未測定"];
  const result: string[] = [];
  for (const [key, reading] of Object.entries(vitals)) {
    const info = VITAL_LABELS[key];
    if (!info) continue;
    if (reading.inputMode === "not_measured" || reading.value === null) {
      result.push(`${info.label}: 未測定`);
    } else {
      result.push(`${info.label}: ${reading.value}${info.unit}（${reading.status}）`);
    }
  }
  return result;
}

function buildShareText(handoff: Omit<PrimaryHandoffPackage, "shareText" | "notificationPolicy" | "recommendedChannel">): string {
  const lines: string[] = [];
  lines.push(`【${handoff.headline}】`);
  lines.push("");

  if (handoff.observationSummary.length > 0) {
    lines.push("■ 観察情報");
    for (const obs of handoff.observationSummary) {
      lines.push(`  ・${obs}`);
    }
    lines.push("");
  }

  if (handoff.vitalSummary.length > 0) {
    lines.push("■ バイタル");
    for (const v of handoff.vitalSummary) {
      lines.push(`  ・${v}`);
    }
    lines.push("");
  }

  if (handoff.concernPoints.length > 0) {
    lines.push("■ 懸念点");
    for (const c of handoff.concernPoints) {
      lines.push(`  ・${c}`);
    }
    lines.push("");
  }

  if (handoff.generalMedicalInfo.length > 0) {
    lines.push("■ 一般的医学情報");
    for (const g of handoff.generalMedicalInfo) {
      lines.push(`  ・${g}`);
    }
    lines.push("");
  }

  const levelLabels: Record<string, string> = {
    emergency: "緊急",
    same_day: "当日中の確認推奨",
    within_24h: "24時間以内の確認推奨",
    observe: "経過観察",
  };
  lines.push(`■ 連絡優先度: ${levelLabels[handoff.recommendedEscalationLevel] || handoff.recommendedEscalationLevel}`);
  lines.push("");
  lines.push(`※ ${handoff.authoredBy === "AI" ? "AI による整理" : "遠隔医師確認済み"}`);
  lines.push("※ これは医療診断ではなく、一般的医学情報に基づく参考情報です。");

  return lines.join("\n");
}

export function buildPrimaryHandoffDraft(input: {
  category: ConcernCategory;
  assessment: Assessment;
  structuredObservation?: StructuredObservation[];
  vitals?: VitalSigns | null;
  answers?: { question: string; answerLabel: string; answer: string | null }[];
  authoredBy: "AI" | "remote_physician";
  bucket: TriageBucket;
}): PrimaryHandoffPackage {
  const { category, assessment, vitals, answers, authoredBy, bucket } = input;

  const observationSummary = answers
    ? answers
        .filter((a) => a.answer && a.answer !== "わからない")
        .map((a) => `${a.question}: ${a.answerLabel}`)
    : [];

  const vitalSummary = buildVitalSummary(vitals);

  const escalationLevel = mapPriorityToEscalation(assessment.priority, assessment.bridge);

  const base = {
    headline: `${CATEGORY_LABELS[category] || category}に関する相談（${assessment.priority}）`,
    observationSummary,
    vitalSummary,
    concernPoints: [assessment.reason],
    generalMedicalInfo: [
      `一般的には、このような所見がみられる場合、${assessment.actions[0] || "経過観察"}が考慮されます。`,
    ],
    recommendedEscalationLevel: escalationLevel,
    authoredBy,
  };

  const shareText = buildShareText(base);
  const recommendedChannel = determineChannel(escalationLevel);
  const notificationPolicy = buildNotificationPolicy(escalationLevel, bucket);

  return {
    ...base,
    recommendedChannel,
    shareText,
    notificationPolicy,
  };
}

function mapPriorityToEscalation(
  priority: string,
  bridge: boolean
): PrimaryHandoffPackage["recommendedEscalationLevel"] {
  if (priority === "RED") return "emergency";
  if (priority === "ORANGE") return "same_day";
  if (bridge || priority === "YELLOW") return "within_24h";
  return "observe";
}

export function toCopyText(handoff: PrimaryHandoffPackage): string {
  return handoff.shareText;
}

export function toPrintablePayload(handoff: PrimaryHandoffPackage): {
  title: string;
  sections: { heading: string; lines: string[] }[];
} {
  return {
    title: handoff.headline,
    sections: [
      { heading: "観察情報", lines: handoff.observationSummary },
      { heading: "バイタル", lines: handoff.vitalSummary },
      { heading: "懸念点", lines: handoff.concernPoints },
      { heading: "一般的医学情報", lines: handoff.generalMedicalInfo },
      {
        heading: "連絡優先度",
        lines: [handoff.recommendedEscalationLevel],
      },
      {
        heading: "作成者",
        lines: [handoff.authoredBy === "AI" ? "AI による整理" : "遠隔医師確認済み"],
      },
    ],
  };
}
