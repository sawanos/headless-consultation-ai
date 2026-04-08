import type {
  ConcernCategory,
  InterviewAnswer,
  VitalSigns,
  FreeTextInput,
  TriageDecision,
  FrontlineGuidanceV6,
  PrimaryHandoffPackage,
  SyndromeCluster,
  Priority,
} from "@/types/consult";
import { assessRisk } from "./risk-engine";
import { checkRedFlags } from "./red-flags";
import { buildPrimaryHandoffDraft } from "./handoff";
import { determineBucket } from "./routing";

export function determineSyndromeCluster(
  category: ConcernCategory,
  answers: InterviewAnswer[],
  vitals?: VitalSigns | null
): SyndromeCluster {
  const cardioCategories: ConcernCategory[] = ["dyspnea", "edema", "palpitation"];
  if (cardioCategories.includes(category)) return "cardio_fluid";

  const hasFever = answers.some(
    (a) => a.answer && (a.answer.includes("熱がある") || a.answer.includes("熱がありそう") || a.answer.includes("体温が高い"))
  );
  const hasHighTemp = vitals?.temperature?.value
    ? parseFloat(vitals.temperature.value) >= 38.0
    : false;
  const feverPresent = hasFever || hasHighTemp;

  if (category === "poor_intake" && feverPresent) return "infection_systemic";
  if (category === "low_energy" && feverPresent) return "infection_systemic";

  if (category === "confusion") {
    const isAcute = answers.some(
      (a) => a.answer && (a.answer.includes("急に変わった") || a.answer.includes("今さっき") || a.answer.includes("今日"))
    );
    if (isAcute) return "neuro_flag";
  }

  if (category === "fall") return "gastro_other";

  if (category === "low_energy" && !feverPresent) {
    const hasEdemaOrDyspnea = answers.some(
      (a) => a.answer && (a.answer.includes("むくみ") || a.answer.includes("息苦しい") || a.answer.includes("息切れ"))
    );
    if (hasEdemaOrDyspnea) return "cardio_fluid";
  }

  if (category === "medication") {
    const cardioMeds = answers.some(
      (a) => a.answer && (a.answer.includes("心臓") || a.answer.includes("血圧") || a.answer.includes("利尿") || a.answer.includes("抗凝固"))
    );
    if (cardioMeds) return "cardio_fluid";
  }

  return "unknown";
}

function mapTargetToSpecialty(
  target: "primary" | "internal" | "cardiology",
  syndrome: SyndromeCluster
): TriageDecision["candidateSpecialty"] {
  if (target === "cardiology" || syndrome === "cardio_fluid") return "cardiology_first";
  if (syndrome === "infection_systemic") return "infection";
  if (syndrome === "neuro_flag") return "neurology";
  if (target === "internal") return "general_internal";
  return "other";
}

function detectMissingFields(
  answers: InterviewAnswer[],
  vitals?: VitalSigns | null
): string[] {
  const missing: string[] = [];

  const unanswered = answers.filter((a) => !a.answer || a.answer === "わからない");
  for (const a of unanswered) {
    missing.push(`問診: ${a.question}`);
  }

  if (!vitals) {
    missing.push("バイタルサイン全般");
  } else {
    const vitalLabels: Record<string, string> = {
      temperature: "体温",
      spo2: "SpO2",
      pulse: "脈拍",
      bloodPressure: "血圧",
      respiratoryRate: "呼吸数",
    };
    for (const [key, reading] of Object.entries(vitals)) {
      if (reading.inputMode === "not_measured") {
        missing.push(`バイタル: ${vitalLabels[key] || key}`);
      }
    }
  }

  return missing;
}

function determineNeedsClinicianReview(
  priority: Priority,
  syndrome: SyndromeCluster,
  category: ConcernCategory,
  answers: InterviewAnswer[],
  missingFields: string[]
): boolean {
  const isHighPriority = priority === "RED" || priority === "ORANGE";
  const isYellowOrAbove = isHighPriority || priority === "YELLOW";

  if (isHighPriority) return true;
  if (syndrome === "cardio_fluid" && isYellowOrAbove) return true;
  if (category === "medication") {
    const medRisk = answers.some(
      (a) => a.answer && (a.answer.includes("副作用") || a.answer.includes("多く飲んだ") || a.answer.includes("大量に飲んだ"))
    );
    if (medRisk) return true;
  }
  if (missingFields.length >= 3 && isYellowOrAbove) return true;

  return false;
}

function buildFrontlineGuidance(
  assessment: ReturnType<typeof assessRisk>,
  redFlagResult: ReturnType<typeof checkRedFlags>,
  reviewStatus: FrontlineGuidanceV6["reviewStatus"]
): FrontlineGuidanceV6 {
  const safetyNotes = [assessment.safetyNote];
  if (redFlagResult.triggered) {
    safetyNotes.unshift(redFlagResult.immediateAction);
  }

  return {
    urgencyLabel: {
      RED: "緊急",
      ORANGE: "準緊急（当日対応）",
      YELLOW: "要経過観察",
      BLUE: "経過観察継続",
    }[assessment.priority],
    nextChecks: [assessment.oneQuestion],
    actionMessage: assessment.actions.join("。"),
    safetyNotes,
    reviewStatus,
  };
}

export function runTriage(input: {
  category: ConcernCategory;
  answers: InterviewAnswer[];
  vitals?: VitalSigns | null;
  freeText?: FreeTextInput | null;
  emergencyBypass?: boolean;
}): {
  triage: TriageDecision;
  frontlineGuidance: FrontlineGuidanceV6;
  draftPrimaryHandoff: PrimaryHandoffPackage;
} {
  const { category, answers, vitals, freeText, emergencyBypass } = input;

  // 1. Emergency bypass check
  if (emergencyBypass) {
    const assessment = assessRisk(category, answers, vitals ?? undefined, freeText ?? undefined);
    const syndrome = determineSyndromeCluster(category, answers, vitals);
    return {
      triage: {
        bucket: "emergency_bypass",
        priority: "RED",
        syndrome,
        reasonCodes: ["EMERGENCY_BYPASS_MANUAL"],
        missingFields: [],
        needsClinicianReview: false,
        candidateSpecialty: mapTargetToSpecialty(assessment.target, syndrome),
      },
      frontlineGuidance: {
        urgencyLabel: "緊急",
        nextChecks: [],
        actionMessage: "すぐに通常救急導線（119番・主治医直接連絡）を検討してください",
        safetyNotes: ["これは医療診断ではありません。直ちに救急対応を優先してください。"],
        reviewStatus: "emergency_bypass",
      },
      draftPrimaryHandoff: buildPrimaryHandoffDraft({
        category,
        assessment,
        vitals,
        answers,
        authoredBy: "AI",
        bucket: "emergency_bypass",
      }),
    };
  }

  // 2. Red flag check
  const redFlagResult = checkRedFlags(answers, vitals, freeText);
  if (redFlagResult.triggered) {
    const assessment = assessRisk(category, answers, vitals ?? undefined, freeText ?? undefined);
    const syndrome = determineSyndromeCluster(category, answers, vitals);
    return {
      triage: {
        bucket: "emergency_bypass",
        priority: "RED",
        syndrome,
        reasonCodes: redFlagResult.flags,
        missingFields: [],
        needsClinicianReview: false,
        candidateSpecialty: mapTargetToSpecialty(assessment.target, syndrome),
      },
      frontlineGuidance: {
        urgencyLabel: "緊急",
        nextChecks: [],
        actionMessage: redFlagResult.immediateAction,
        safetyNotes: [
          redFlagResult.immediateAction,
          "これは医療診断ではありません。直ちに救急対応を優先してください。",
        ],
        reviewStatus: "emergency_bypass",
      },
      draftPrimaryHandoff: buildPrimaryHandoffDraft({
        category,
        assessment,
        vitals,
        answers,
        authoredBy: "AI",
        bucket: "emergency_bypass",
      }),
    };
  }

  // 3. Risk assessment (existing engine)
  const assessment = assessRisk(category, answers, vitals ?? undefined, freeText ?? undefined);

  // 4. Syndrome cluster
  const syndrome = determineSyndromeCluster(category, answers, vitals);

  // 5. Missing fields
  const missingFields = detectMissingFields(answers, vitals);

  // 6. Clinician review requirement
  const needsClinicianReview = determineNeedsClinicianReview(
    assessment.priority,
    syndrome,
    category,
    answers,
    missingFields
  );

  const bucket = determineBucket({
    priority: assessment.priority,
    hasRedFlag: false,
    needsClinicianReview,
    emergencyBypass: false,
  });

  const triage: TriageDecision = {
    bucket,
    priority: assessment.priority,
    syndrome,
    reasonCodes: [`PRIORITY_${assessment.priority}`, `SYNDROME_${syndrome}`],
    missingFields,
    needsClinicianReview,
    candidateSpecialty: mapTargetToSpecialty(assessment.target, syndrome),
  };

  const reviewStatus: FrontlineGuidanceV6["reviewStatus"] =
    bucket === "clinician_review" ? "awaiting_clinician_review" : "ai_only";

  const frontlineGuidance = buildFrontlineGuidance(assessment, redFlagResult, reviewStatus);

  // 全ケースで handoff を必須生成
  const draftPrimaryHandoff = buildPrimaryHandoffDraft({
    category,
    assessment,
    vitals,
    answers,
    authoredBy: "AI",
    bucket,
  });

  return { triage, frontlineGuidance, draftPrimaryHandoff };
}
