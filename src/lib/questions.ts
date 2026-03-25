import { ConcernCategory, Question } from "@/types/consult";

const questionTemplates: Record<ConcernCategory, Question[]> = {
  usual_diff: [
    {
      id: "q1",
      text: "どんなところがいつもと違いますか？",
      type: "single",
      options: ["表情が違う", "動きが違う", "声が違う", "食事が違う", "うまく言えない"],
    },
    {
      id: "q2",
      text: "いつから気になりますか？",
      type: "single",
      options: ["今さっき", "今日", "昨日から", "数日前から", "わからない"],
    },
    {
      id: "q3",
      text: "熱や痛みはありそうですか？",
      type: "single",
      options: ["熱がありそう", "痛そう", "両方ありそう", "なさそう", "わからない"],
    },
  ],
  dyspnea: [
    {
      id: "q1",
      text: "いつから苦しそうですか？",
      type: "single",
      options: ["今さっき", "今日", "数日前から", "わからない"],
    },
    {
      id: "q2",
      text: "会話はできますか？",
      type: "single",
      options: ["普通に話せる", "少しつらそう", "話せない", "わからない"],
    },
    {
      id: "q3",
      text: "SpO2または体温は確認できましたか？",
      type: "single",
      options: ["SpO2が低い(94以下)", "体温が高い(37.5以上)", "両方異常", "正常範囲", "測れていない"],
    },
  ],
  edema: [
    {
      id: "q1",
      text: "どこがむくんでいますか？",
      type: "single",
      options: ["足", "顔", "手", "全体的に", "わからない"],
    },
    {
      id: "q2",
      text: "いつから気づきましたか？",
      type: "single",
      options: ["今日", "昨日から", "数日前から", "わからない"],
    },
    {
      id: "q3",
      text: "息苦しさや尿の量の変化はありますか？",
      type: "single",
      options: ["息苦しそう", "尿が少ない", "両方ある", "なさそう", "わからない"],
    },
  ],
  palpitation: [
    {
      id: "q1",
      text: "いつから動悸がありますか？",
      type: "single",
      options: ["今さっき", "今日", "数日前から", "わからない"],
    },
    {
      id: "q2",
      text: "胸の痛みはありますか？",
      type: "single",
      options: ["痛みがある", "痛みはない", "わからない"],
    },
    {
      id: "q3",
      text: "脈は確認できましたか？",
      type: "single",
      options: ["速い", "不規則", "正常", "測れていない"],
    },
  ],
  low_energy: [
    {
      id: "q1",
      text: "いつから元気がないですか？",
      type: "single",
      options: ["今日", "昨日から", "数日前から", "わからない"],
    },
    {
      id: "q2",
      text: "食事や水分はとれていますか？",
      type: "single",
      options: ["普通にとれている", "少し減っている", "ほとんどとれない", "わからない"],
    },
    {
      id: "q3",
      text: "熱はありますか？",
      type: "single",
      options: ["熱がある(37.5以上)", "熱はない", "測れていない"],
    },
  ],
  poor_intake: [
    {
      id: "q1",
      text: "いつから食べにくくなりましたか？",
      type: "single",
      options: ["今日", "昨日から", "数日前から", "1週間以上前から", "わからない"],
    },
    {
      id: "q2",
      text: "水分はとれていますか？",
      type: "single",
      options: ["とれている", "少しだけ", "ほとんどとれない", "わからない"],
    },
    {
      id: "q3",
      text: "熱やだるさはありますか？",
      type: "single",
      options: ["熱がある", "だるそう", "両方ある", "なさそう", "わからない"],
    },
  ],
  confusion: [
    {
      id: "q1",
      text: "いつも通り会話できますか？",
      type: "single",
      options: ["普通に話せる", "つじつまが合わない", "ほとんど話せない", "わからない"],
    },
    {
      id: "q2",
      text: "急に変わりましたか？",
      type: "single",
      options: ["急に変わった", "徐々に変わった", "前からこんな感じ", "わからない"],
    },
    {
      id: "q3",
      text: "熱や転倒はありませんか？",
      type: "single",
      options: ["熱がある", "転倒があった", "両方ある", "なさそう", "わからない"],
    },
  ],
  fall: [
    {
      id: "q1",
      text: "いつ転びましたか？",
      type: "single",
      options: ["今さっき", "今日", "昨日", "わからない"],
    },
    {
      id: "q2",
      text: "頭を打ちましたか？",
      type: "single",
      options: ["頭を打った", "打っていない", "不明"],
    },
    {
      id: "q3",
      text: "その後いつもと違う様子がありますか？",
      type: "single",
      options: ["ぼんやりしている", "痛がっている", "動けない", "いつも通り", "わからない"],
    },
  ],
  medication: [
    {
      id: "q1",
      text: "どんなことが気になりますか？",
      type: "single",
      options: ["飲み忘れた", "多く飲んだかも", "副作用っぽい", "薬が変わった", "わからない"],
    },
    {
      id: "q2",
      text: "体調の変化はありますか？",
      type: "single",
      options: ["ある", "ない", "わからない"],
    },
    {
      id: "q3",
      text: "いつのことですか？",
      type: "single",
      options: ["今日", "昨日", "数日前", "わからない"],
    },
  ],
  unknown_worry: [
    {
      id: "q1",
      text: "一番気になるのはどんなことですか？",
      type: "single",
      options: ["体の様子", "表情や反応", "食事や水分", "動き方", "うまく言えない"],
    },
    {
      id: "q2",
      text: "いつから気になりますか？",
      type: "single",
      options: ["今さっき", "今日", "昨日から", "わからない"],
    },
    {
      id: "q3",
      text: "緊急な感じはしますか？",
      type: "single",
      options: ["すぐ対応が必要そう", "今日中に相談したい", "急がなくて大丈夫そう", "わからない"],
    },
  ],
};

export function getQuestions(category: ConcernCategory): Question[] {
  return questionTemplates[category] || questionTemplates.unknown_worry;
}
