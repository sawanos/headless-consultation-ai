import { CategoryDefinition } from "@/types/consult";

export const concernCategories: CategoryDefinition[] = [
  {
    id: "usual_diff",
    label: "いつもと違う",
    description: "普段と様子が違うと感じた",
    quickGuide: {
      checks: ["どこがいつもと違うか", "いつから変わったか", "食事・水分はとれているか"],
      redFlags: ["急に変わった", "反応が鈍い", "ぐったりしている"],
      reassurance: "はっきりしなくても大丈夫。そのまま進めます",
    },
  },
  {
    id: "dyspnea",
    label: "苦しそう",
    description: "息が苦しそう、呼吸が気になる",
    quickGuide: {
      checks: ["息苦しさがあるか", "話できるか", "SpO2や体温が測れれば確認"],
      redFlags: ["呼吸が苦しそう", "反応が鈍い", "胸の痛み"],
      reassurance: "不明のままで進めてOK",
    },
  },
  {
    id: "edema",
    label: "むくんでいる",
    description: "顔や手足がむくんでいる",
    quickGuide: {
      checks: ["どこがむくんでいるか", "いつから気づいたか", "息苦しさはあるか"],
      redFlags: ["急にむくんだ", "息苦しさもある", "尿が出ていない"],
      reassurance: "わからない項目は不明でOK",
    },
  },
  {
    id: "palpitation",
    label: "動悸がする",
    description: "胸がドキドキする、脈が気になる",
    quickGuide: {
      checks: ["いつから気になるか", "胸の痛みはあるか", "脈が測れれば確認"],
      redFlags: ["胸の痛みがある", "息苦しさもある", "意識がぼんやり"],
      reassurance: "脈が測れなくても大丈夫",
    },
  },
  {
    id: "low_energy",
    label: "元気がない",
    description: "ぐったりしている、活気がない",
    quickGuide: {
      checks: ["いつから元気がないか", "食事はとれているか", "熱はあるか"],
      redFlags: ["ぐったりして反応が鈍い", "水分もとれない", "急に変わった"],
      reassurance: "全部わからなくても進めます",
    },
  },
  {
    id: "poor_intake",
    label: "食べられない",
    description: "食事量が減った、食べられない",
    quickGuide: {
      checks: ["いつから食べにくいか", "水分がとれているか", "熱やだるさがあるか"],
      redFlags: ["水分もほとんどとれない", "ぐったりしている", "急にくなった"],
      reassurance: "わからない項目は不明でOK",
    },
  },
  {
    id: "confusion",
    label: "ぼんやりしている",
    description: "意識がはっきりしない、反応が変",
    quickGuide: {
      checks: ["いつも通り会話できるか", "急に変わったか", "熱や転倒がないか"],
      redFlags: ["反応が鈍い", "急な変化", "呼びかけに乏しい"],
      reassurance: "全部わからなくても進めます",
    },
  },
  {
    id: "fall",
    label: "転んだ",
    description: "転倒した、転落した",
    quickGuide: {
      checks: ["どこをぶつけたか", "普段どおり動けるか", "頭を打ったかわかるか"],
      redFlags: ["頭を打った可能性", "動けない", "その後ぼんやりしている"],
      reassurance: "不明でも相談文は作れます",
    },
  },
  {
    id: "medication",
    label: "薬が気になる",
    description: "薬の飲み忘れや副作用が心配",
    quickGuide: {
      checks: ["どの薬が気になるか", "飲み忘れかどうか", "体調の変化はあるか"],
      redFlags: ["大量に飲んだ可能性", "急な体調変化", "意識の変化"],
      reassurance: "薬の名前がわからなくてもOK",
    },
  },
  {
    id: "unknown_worry",
    label: "よくわからないが心配",
    description: "言葉にしにくいが何か気になる",
    quickGuide: {
      checks: ["何が気になるか", "いつから気になるか", "普段と違うところはあるか"],
      redFlags: ["急な変化がある", "反応が鈍い", "食事も水分もとれない"],
      reassurance: "うまく言えなくても大丈夫。そのまま進めます",
    },
  },
];

export function getCategoryById(id: string): CategoryDefinition | undefined {
  return concernCategories.find((c) => c.id === id);
}
