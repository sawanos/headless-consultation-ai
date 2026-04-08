import type { Priority, TriageBucket } from "@/types/consult";

export function determineBucket(input: {
  priority: Priority;
  hasRedFlag: boolean;
  needsClinicianReview: boolean;
  emergencyBypass?: boolean;
}): TriageBucket {
  if (input.emergencyBypass || input.hasRedFlag) return "emergency_bypass";
  if (input.needsClinicianReview) return "clinician_review";
  return "ai_only";
}
