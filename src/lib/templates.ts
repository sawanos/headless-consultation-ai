export type ClinicianTemplate = {
  id: string;
  label: string;
  commentPrefix: string;
  generalMedicalInfoPrefix: string;
};

export const CLINICIAN_TEMPLATES: Record<string, ClinicianTemplate> = {
  cardio_fluid_standard: {
    id: "cardio_fluid_standard",
    label: "循環器・体液管理（標準）",
    commentPrefix: "循環器的観点から以下の所見について確認いたしました。",
    generalMedicalInfoPrefix: "一般的には、このような所見では",
  },
  cardio_fluid_acute: {
    id: "cardio_fluid_acute",
    label: "循環器・急性変化",
    commentPrefix: "急性の循環器変化について確認いたしました。",
    generalMedicalInfoPrefix: "一般的には、急性の循環器変化がみられる場合",
  },
  medication_concern: {
    id: "medication_concern",
    label: "薬剤関連",
    commentPrefix: "薬剤関連の変化について確認いたしました。",
    generalMedicalInfoPrefix: "一般的に、この薬剤に関連して",
  },
  infection_systemic: {
    id: "infection_systemic",
    label: "感染症・全身症状",
    commentPrefix: "全身症状について確認いたしました。",
    generalMedicalInfoPrefix: "一般的には、このような全身症状がみられる場合",
  },
  neuro_flag: {
    id: "neuro_flag",
    label: "神経症状",
    commentPrefix: "神経学的所見について確認いたしました。",
    generalMedicalInfoPrefix: "一般的には、このような神経学的所見がみられる場合",
  },
  general_observation: {
    id: "general_observation",
    label: "一般的観察所見",
    commentPrefix: "以下の観察所見について確認いたしました。",
    generalMedicalInfoPrefix: "一般的には、このような所見がみられる場合",
  },
};

export function getTemplatesByCluster(syndrome: string): ClinicianTemplate[] {
  const syndromeMap: Record<string, string[]> = {
    cardio_fluid: ["cardio_fluid_standard", "cardio_fluid_acute", "medication_concern"],
    infection_systemic: ["infection_systemic", "general_observation"],
    neuro_flag: ["neuro_flag", "general_observation"],
    gastro_other: ["general_observation"],
    unknown: ["general_observation"],
  };

  const ids = syndromeMap[syndrome] || ["general_observation"];
  return ids
    .map((id) => CLINICIAN_TEMPLATES[id])
    .filter((t): t is ClinicianTemplate => !!t);
}
