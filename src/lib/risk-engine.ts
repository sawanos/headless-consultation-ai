import { Assessment, ConcernCategory, InterviewAnswer } from "@/types/consult";

function findAnswer(answers: InterviewAnswer[], questionId: string): string | null {
  const a = answers.find((ans) => ans.questionId === questionId);
  return a?.answer ?? null;
}

function hasRedFlag(answers: InterviewAnswer[]): boolean {
  const redKeywords = [
    "反応が鈍い", "ぼんやりしている", "話せない", "動けない",
    "ほとんどとれない", "頭を打った", "急に変わった", "SpO2が低い",
    "痛みがある", "大量に飲んだ", "すぐ対応が必要そう", "両方異常",
    "呼びかけに乏しい", "ぐったり",
  ];
  return answers.some(
    (a) => a.answer && redKeywords.some((kw) => a.answer!.includes(kw))
  );
}

function hasOrangeFlag(answers: InterviewAnswer[]): boolean {
  const orangeKeywords = [
    "少しつらそう", "今さっき", "熱がある", "だるそう", "両方ある",
    "尿が少ない", "息苦しそう", "不規則", "速い", "少しだけ",
    "つじつまが合わない", "痛がっている", "副作用っぽい", "多く飲んだかも",
    "不明", "今日中に相談したい",
  ];
  return answers.some(
    (a) => a.answer && orangeKeywords.some((kw) => a.answer!.includes(kw))
  );
}

function determineTarget(category: ConcernCategory, answers: InterviewAnswer[]): Assessment["target"] {
  const cardioCategories: ConcernCategory[] = ["dyspnea", "edema", "palpitation"];
  if (cardioCategories.includes(category)) return "cardiology";

  const internalCategories: ConcernCategory[] = ["poor_intake", "confusion", "low_energy"];
  if (internalCategories.includes(category)) return "internal";

  return "primary";
}

function getOneQuestion(category: ConcernCategory): string {
  const questions: Record<string, string> = {
    dyspnea: "胸の痛みはありますか？",
    edema: "息苦しさはありますか？",
    palpitation: "めまいや失神はありましたか？",
    poor_intake: "最後に水分をとれたのはいつですか？",
    confusion: "最後にいつも通りだったのはいつですか？",
    fall: "頭を打った可能性はありますか？",
    low_energy: "尿はいつも通り出ていますか？",
    medication: "いつもと違う体調の変化はありますか？",
    usual_diff: "痛みや息苦しさはありそうですか？",
    unknown_worry: "いつもと一番違うところはどこですか？",
  };
  return questions[category] || "他に気になることはありますか？";
}

function getActions(priority: Assessment["priority"], category: ConcernCategory): string[] {
  if (priority === "RED") {
    return ["安全を確保する", "すぐに医師・上司に共有する", "状態を見守る"];
  }
  if (priority === "ORANGE") {
    const base = ["安静を保つ", "バイタルが測れれば確認"];
    if (["dyspnea", "edema", "palpitation"].includes(category)) {
      base.push("主治医または循環器に当日中に共有");
    } else {
      base.push("当日中に医師に共有");
    }
    return base;
  }
  if (priority === "YELLOW") {
    return ["様子を見守る", "変化があれば再評価", "次の機会に医師に相談"];
  }
  return ["経過を記録しておく", "気になれば再度相談"];
}

export function assessRisk(
  category: ConcernCategory,
  answers: InterviewAnswer[]
): Assessment {
  let priority: Assessment["priority"];

  // 1. RED conditions
  if (hasRedFlag(answers)) {
    priority = "RED";
  }
  // 2. ORANGE conditions
  else if (hasOrangeFlag(answers)) {
    priority = "ORANGE";
  }
  // 3. YELLOW - some concern but not urgent
  else if (answers.some((a) => a.answer && a.answer !== "わからない" && a.answer !== "なさそう" && a.answer !== "いつも通り")) {
    priority = "YELLOW";
  }
  // 4. BLUE - low concern
  else {
    priority = "BLUE";
  }

  const target = determineTarget(category, answers);
  const actions = getActions(priority, category);
  const oneQuestion = getOneQuestion(category);

  const reasonMap: Record<Assessment["priority"], string> = {
    RED: "緊急性の高い兆候が確認されています。すぐに医師への共有が必要です。",
    ORANGE: "注意が必要な状態です。当日中の医師共有が望まれます。",
    YELLOW: "現時点で大きな懸念はありませんが、経過観察と相談が推奨されます。",
    BLUE: "緊急性は低いと考えられますが、記録を残して次の機会に相談できます。",
  };

  return {
    priority,
    reason: reasonMap[priority],
    actions,
    oneQuestion,
    bridge: priority === "RED" || priority === "ORANGE",
    target,
    safetyNote: "これは診断ではありません。状態が悪化した場合はすぐに医師へ共有してください。",
  };
}
