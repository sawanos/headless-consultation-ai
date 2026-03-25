import { Assessment, ConcernCategory, InterviewAnswer } from "@/types/consult";

function findAnswer(answers: InterviewAnswer[], questionId: string): string | null {
  const a = answers.find((ans) => ans.questionId === questionId);
  return a?.answer ?? null;
}

/**
 * RED（緊急）判定 — 茨城県看護協会マニュアル準拠 救急連絡基準
 * 意識障がい、呼吸停止/呼吸困難、胸痛、けいれん、大量出血、
 * 頭部打撲後の嘔吐/意識変容
 */
function hasRedFlag(answers: InterviewAnswer[]): boolean {
  const redKeywords = [
    // 意識障がい
    "反応が鈍い", "呼びかけに乏しい", "ぐったり", "ぼんやりしている",
    // 呼吸停止・呼吸困難
    "話せない", "動けない",
    // バイタル重度異常
    "両方異常",
    // 頭部打撲後の意識変容
    "頭を打った", "急に変わった",
    // 食事・水分の完全停止（脱水重度）
    "ほとんどとれない",
    // SpO2 重度低下
    "SpO2が低い",
    // 緊急感の主観的判断
    "すぐ対応が必要そう",
    // 過量服薬の疑い
    "大量に飲んだ",
  ];
  return answers.some(
    (a) => a.answer && redKeywords.some((kw) => a.answer!.includes(kw))
  );
}

/**
 * ORANGE（準緊急）判定 — 当日中の医師共有が必要な状態
 * SpO2低下(94以下)、体温38度以上、脈の著しい不整、会話困難、
 * 脱水兆候あり+食事水分不可、転倒後の疼痛/腫脹
 */
function hasOrangeFlag(answers: InterviewAnswer[]): boolean {
  const orangeKeywords = [
    // 会話困難
    "少しつらそう",
    // 発熱
    "熱がある", "熱がありそう", "体温が高い",
    // 全身倦怠
    "だるそう",
    // 脱水兆候
    "尿が少ない", "少しだけ",
    // 呼吸器症状
    "息苦しそう",
    // 脈の不整・頻脈
    "不規則", "速い",
    // 意識変容（軽度）
    "つじつまが合わない",
    // 転倒後の疼痛
    "痛がっている",
    // 薬関連リスク
    "副作用っぽい", "多く飲んだかも",
    // 複合症状
    "両方ある",
    // 発症直後
    "今さっき",
    // 本人の緊急度判断
    "今日中に相談したい",
    // 不明（確認不能はリスクとみなす）
    "不明",
  ];
  return answers.some(
    (a) => a.answer && orangeKeywords.some((kw) => a.answer!.includes(kw))
  );
}

/**
 * 相談先（target）の決定基準
 * - cardiology: 胸痛、動悸＋脈不整、呼吸苦＋浮腫の組み合わせ
 * - internal: 発熱、脱水、食事低下、意識変化（感染症・代謝異常の可能性）
 * - primary: 転倒、皮膚トラブル、その他一般的な身体異常
 */
function determineTarget(category: ConcernCategory, answers: InterviewAnswer[]): Assessment["target"] {
  const cardioCategories: ConcernCategory[] = ["dyspnea", "edema", "palpitation"];
  if (cardioCategories.includes(category)) return "cardiology";

  const internalCategories: ConcernCategory[] = ["poor_intake", "confusion", "low_energy"];
  if (internalCategories.includes(category)) return "internal";

  return "primary";
}

/**
 * 追加確認質問 — ガイドライン準拠
 * 観察の抜け漏れを防ぐための追加質問
 */
function getOneQuestion(category: ConcernCategory): string {
  const questions: Record<string, string> = {
    dyspnea: "呼吸数と胸痛の有無を確認できますか？",
    edema: "体重の増加や息苦しさの変化はみられますか？",
    palpitation: "脈拍数と不整の有無を確認できますか？",
    poor_intake: "最後に水分をとれたのはいつですか？尿の量や色に変化はありますか？",
    confusion: "発症時刻は特定できますか？体温は確認されましたか？",
    fall: "頭部打撲の有無と、打撲部位の腫脹・疼痛を確認できますか？",
    low_energy: "バイタルサイン（体温・脈拍・血圧・SpO2）は確認できましたか？",
    medication: "服用した薬剤名と量、服用時刻を確認できますか？",
    usual_diff: "バイタルサイン（体温・脈拍・血圧・SpO2）は確認できましたか？",
    unknown_worry: "いつもと一番違うところはどこですか？バイタルサインは確認できましたか？",
  };
  return questions[category] || "バイタルサイン（体温・脈拍・血圧・SpO2）は確認できましたか？";
}

/**
 * 推奨アクション — ガイドライン準拠
 * RED: 安全確保・救急車要請検討・主治医即連絡
 * ORANGE: 安静・バイタル確認・当日中に主治医共有
 * YELLOW: 再評価・次回訪問時報告・記録
 * BLUE: 経過記録・定期訪問で経過観察
 */
function getActions(priority: Assessment["priority"], category: ConcernCategory): string[] {
  if (priority === "RED") {
    return [
      "安全確保（転倒・転落防止、気道確保）",
      "救急車要請を検討する",
      "主治医へ即連絡する",
    ];
  }
  if (priority === "ORANGE") {
    const base = [
      "安静を保つ",
      "バイタルサイン確認（体温・脈拍・血圧・SpO2）",
    ];
    if (["dyspnea", "edema", "palpitation"].includes(category)) {
      base.push("当日中に主治医または循環器担当医へ共有する");
    } else {
      base.push("当日中に主治医へ共有する");
    }
    return base;
  }
  if (priority === "YELLOW") {
    return [
      "変化があれば再評価する",
      "次回訪問時に主治医へ報告する",
      "観察内容を記録に残す",
    ];
  }
  return [
    "経過を記録する",
    "定期訪問で経過観察を継続する",
  ];
}

export function assessRisk(
  category: ConcernCategory,
  answers: InterviewAnswer[]
): Assessment {
  let priority: Assessment["priority"];

  // 1. RED — 救急連絡基準に該当する緊急兆候
  if (hasRedFlag(answers)) {
    priority = "RED";
  }
  // 2. ORANGE — 当日中の医師共有が必要な準緊急兆候
  else if (hasOrangeFlag(answers)) {
    priority = "ORANGE";
  }
  // 3. YELLOW — 軽度の変化あるが全身状態は保たれている
  else if (answers.some((a) => a.answer && a.answer !== "わからない" && a.answer !== "なさそう" && a.answer !== "いつも通り")) {
    priority = "YELLOW";
  }
  // 4. BLUE — 全身状態良好、経過観察で十分
  else {
    priority = "BLUE";
  }

  const target = determineTarget(category, answers);
  const actions = getActions(priority, category);
  const oneQuestion = getOneQuestion(category);

  const reasonMap: Record<Assessment["priority"], string> = {
    RED: "救急連絡基準に該当する兆候が確認されています。直ちに主治医への連絡・救急要請の検討が必要です。",
    ORANGE: "注意を要する変化の兆候が確認されています。当日中の主治医への共有が必要です。",
    YELLOW: "軽度の変化がみられますが、全身状態は保たれています。経過観察と次回訪問時の報告が推奨されます。",
    BLUE: "現時点で緊急性を示す兆候は確認されていません。経過を記録し、定期訪問で観察を継続してください。",
  };

  return {
    priority,
    reason: reasonMap[priority],
    actions,
    oneQuestion,
    bridge: priority === "RED" || priority === "ORANGE",
    target,
    safetyNote: "これは医療診断ではありません。観察内容を医師に共有するための参考情報です。状態が悪化した場合はすぐに主治医または救急に連絡してください。",
  };
}
