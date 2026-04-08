import type { InterviewAnswer, VitalSigns, FreeTextInput } from "@/types/consult";

export type RedFlagResult = {
  triggered: boolean;
  flags: string[];
  immediateAction: string;
};

type RedFlagRule = {
  id: string;
  label: string;
  check: (
    answers: InterviewAnswer[],
    vitals?: VitalSigns | null,
    freeText?: FreeTextInput | null
  ) => boolean;
};

function answersContain(answers: InterviewAnswer[], keywords: string[]): boolean {
  return answers.some(
    (a) => a.answer && keywords.some((kw) => a.answer!.includes(kw))
  );
}

function parseSystolic(bp: string | null): number | null {
  if (!bp) return null;
  const m = bp.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

function parsePulse(pulse: string | null): number | null {
  if (!pulse) return null;
  const m = pulse.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

function parseTemperature(temp: string | null): number | null {
  if (!temp) return null;
  const m = temp.match(/([\d.]+)/);
  return m ? parseFloat(m[1]) : null;
}

function parseSpO2(spo2: string | null): number | null {
  if (!spo2) return null;
  const m = spo2.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

const RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: "RF001",
    label: "意識障害（反応なし・急性変化）",
    check: (answers) =>
      answersContain(answers, ["反応が鈍い", "呼びかけに乏しい", "反応しない", "意識がない"]),
  },
  {
    id: "RF002",
    label: "高度呼吸苦（会話不能）",
    check: (answers) =>
      answersContain(answers, ["話せない", "会話できない", "動けない"]),
  },
  {
    id: "RF003",
    label: "SpO2 < 90%",
    check: (_answers, vitals) => {
      if (!vitals || vitals.spo2.inputMode === "not_measured") return false;
      const val = parseSpO2(vitals.spo2.value);
      return val !== null && val < 90;
    },
  },
  {
    id: "RF004",
    label: "強い胸痛（締め付け）",
    check: (answers) =>
      answersContain(answers, ["締め付け", "胸が痛い", "圧迫感", "強い胸痛"]),
  },
  {
    id: "RF005",
    label: "けいれん",
    check: (answers) =>
      answersContain(answers, ["けいれん", "痙攣", "ひきつけ"]),
  },
  {
    id: "RF006",
    label: "大量出血",
    check: (answers) =>
      answersContain(answers, ["大量出血", "出血が止まらない", "大量に飲んだ"]),
  },
  {
    id: "RF007",
    label: "収縮期血圧 < 80mmHg",
    check: (_answers, vitals) => {
      if (!vitals || vitals.bloodPressure.inputMode === "not_measured") return false;
      const val = parseSystolic(vitals.bloodPressure.value);
      return val !== null && val < 80;
    },
  },
  {
    id: "RF008",
    label: "脈拍 < 40 または > 150",
    check: (_answers, vitals) => {
      if (!vitals || vitals.pulse.inputMode === "not_measured") return false;
      const val = parsePulse(vitals.pulse.value);
      return val !== null && (val < 40 || val > 150);
    },
  },
  {
    id: "RF009",
    label: "高熱 + ぐったり",
    check: (answers, vitals) => {
      if (!vitals || vitals.temperature.inputMode === "not_measured") return false;
      const temp = parseTemperature(vitals.temperature.value);
      if (temp === null || temp < 39.5) return false;
      return answersContain(answers, ["ぐったり", "反応が鈍い", "元気がない"]);
    },
  },
  {
    id: "RF010",
    label: "フリーテキスト内の緊急キーワード",
    check: (_answers, _vitals, freeText) => {
      if (!freeText) return false;
      const emergencyKeywords = ["意識なし", "呼吸停止", "心停止", "呼吸していない"];
      const rawCheck = emergencyKeywords.some((kw) => freeText.rawText.includes(kw));
      if (rawCheck) return true;
      if (freeText.isStructured && freeText.structured.length > 0) {
        return freeText.structured.some(
          (s) =>
            s.urgencyContribution === "high" &&
            emergencyKeywords.some((kw) => s.content.includes(kw))
        );
      }
      return false;
    },
  },
];

export function checkRedFlags(
  answers: InterviewAnswer[],
  vitals?: VitalSigns | null,
  freeText?: FreeTextInput | null
): RedFlagResult {
  const triggeredFlags: string[] = [];

  for (const rule of RED_FLAG_RULES) {
    if (rule.check(answers, vitals, freeText)) {
      triggeredFlags.push(`${rule.id}: ${rule.label}`);
    }
  }

  return {
    triggered: triggeredFlags.length > 0,
    flags: triggeredFlags,
    immediateAction:
      triggeredFlags.length > 0
        ? "すぐに通常救急導線（119番・主治医直接連絡）を検討してください"
        : "",
  };
}
