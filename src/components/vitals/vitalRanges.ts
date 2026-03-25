export type VitalRange = {
  label: string;
  unit: string;
  normal: [number, number];
  caution: [number, number];
  placeholder: string;
};

export const VITAL_RANGES: Record<string, VitalRange> = {
  temperature: {
    label: "体温",
    unit: "℃",
    normal: [35.5, 37.4],
    caution: [37.5, 38.4],
    placeholder: "例: 36.5",
  },
  spo2: {
    label: "SpO2",
    unit: "%",
    normal: [96, 100],
    caution: [91, 95],
    placeholder: "例: 98",
  },
  pulse: {
    label: "脈拍",
    unit: "回/分",
    normal: [60, 100],
    caution: [50, 59],
    placeholder: "例: 72",
  },
  bloodPressure: {
    label: "血圧（収縮期）",
    unit: "mmHg",
    normal: [90, 139],
    caution: [140, 179],
    placeholder: "例: 120",
  },
  respiratoryRate: {
    label: "呼吸数",
    unit: "回/分",
    normal: [12, 20],
    caution: [21, 25],
    placeholder: "例: 16",
  },
};

export function evaluateStatus(
  key: string,
  value: string | null
): "normal" | "caution" | "abnormal" | "unknown" {
  if (!value) return "unknown";
  const num = parseFloat(value);
  if (isNaN(num)) return "unknown";
  const range = VITAL_RANGES[key];
  if (!range) return "unknown";
  if (num >= range.normal[0] && num <= range.normal[1]) return "normal";
  if (num >= range.caution[0] && num <= range.caution[1]) return "caution";
  return "abnormal";
}
