import { VitalSigns } from "@/types/consult";

export const VITAL_KEYS_BY_CATEGORY: Record<string, (keyof VitalSigns)[]> = {
  dyspnea: ["spo2", "respiratoryRate", "pulse", "bloodPressure", "temperature"],
  edema: ["bloodPressure", "pulse", "spo2", "temperature", "respiratoryRate"],
  palpitation: ["pulse", "bloodPressure", "spo2", "temperature", "respiratoryRate"],
  poor_intake: ["temperature", "pulse", "bloodPressure", "spo2", "respiratoryRate"],
  confusion: ["temperature", "spo2", "pulse", "bloodPressure", "respiratoryRate"],
  fall: ["pulse", "bloodPressure", "spo2", "temperature", "respiratoryRate"],
  low_energy: ["temperature", "spo2", "pulse", "bloodPressure", "respiratoryRate"],
  medication: ["pulse", "bloodPressure", "temperature", "spo2", "respiratoryRate"],
  usual_diff: ["temperature", "pulse", "bloodPressure", "spo2", "respiratoryRate"],
  unknown_worry: ["temperature", "pulse", "bloodPressure", "spo2", "respiratoryRate"],
};
