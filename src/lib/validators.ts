import { z } from "zod";

export const ConcernCategorySchema = z.enum([
  "usual_diff",
  "dyspnea",
  "edema",
  "palpitation",
  "low_energy",
  "poor_intake",
  "confusion",
  "fall",
  "medication",
  "unknown_worry",
]);

export const QuickGuideRequestSchema = z.object({
  category: ConcernCategorySchema,
});

export const QuestionsRequestSchema = z.object({
  category: ConcernCategorySchema,
});

export const InterviewAnswerSchema = z.object({
  questionId: z.string(),
  question: z.string(),
  answer: z.string().nullable(),
  answerLabel: z.string(),
});

export const VitalReadingSchema = z.object({
  value: z.string().nullable(),
  inputMode: z.enum(["tab", "freetext", "not_measured"]),
  status: z.enum(["normal", "caution", "abnormal", "unknown"]),
});

export const VitalSignsSchema = z.object({
  temperature: VitalReadingSchema,
  spo2: VitalReadingSchema,
  pulse: VitalReadingSchema,
  bloodPressure: VitalReadingSchema,
  respiratoryRate: VitalReadingSchema,
});

export const StructuredObservationSchema = z.object({
  type: z.enum(["symptom", "behavior", "vital", "history", "medication", "environment", "unknown"]),
  content: z.string(),
  urgencyContribution: z.enum(["high", "medium", "low", "neutral"]),
  sourceText: z.string(),
});

export const FreeTextInputSchema = z.object({
  rawText: z.string(),
  isStructured: z.boolean(),
  structured: z.array(StructuredObservationSchema),
  processing: z.boolean(),
});

export const AssessRequestSchema = z.object({
  category: ConcernCategorySchema,
  answers: z.array(InterviewAnswerSchema),
  vitals: VitalSignsSchema.optional(),
  freeText: FreeTextInputSchema.optional(),
});

export const AssessmentSchema = z.object({
  priority: z.enum(["RED", "ORANGE", "YELLOW", "BLUE"]),
  reason: z.string(),
  actions: z.array(z.string()).max(5),
  oneQuestion: z.string(),
  bridge: z.boolean(),
  target: z.enum(["primary", "internal", "cardiology"]),
  safetyNote: z.string(),
});

export const GenerateRequestSchema = z.object({
  category: z.string(),
  answers: z.array(InterviewAnswerSchema),
  assessment: AssessmentSchema,
  vitals: VitalSignsSchema.optional(),
  freeText: FreeTextInputSchema.optional(),
});

export const SendRequestSchema = z.object({
  caseId: z.string(),
  startedAt: z.string(),
  edited: z.boolean().optional().default(false),
});

export const ConsultationOutputSchema = z.object({
  summary: z.string(),
  sbar: z.string(),
  doctorMessage: z.string(),
  handoverText: z.string(),
});

// ===== v5 追加スキーマ =====

export const CaseStatusV5Schema = z.enum([
  "draft", "submitted", "ai_structuring", "ai_triaged", "ai_completed",
  "emergency_bypass", "awaiting_clinician_review", "clinician_reviewing",
  "awaiting_primary_notification", "primary_notified", "primary_responded", "closed",
]);

export const TriageBucketSchema = z.enum(["ai_only", "clinician_review", "emergency_bypass"]);

export const SyndromeClusterSchema = z.enum([
  "cardio_fluid", "infection_systemic", "neuro_flag", "gastro_other", "unknown",
]);

export const TriageDecisionSchema = z.object({
  bucket: TriageBucketSchema,
  priority: z.enum(["RED", "ORANGE", "YELLOW", "BLUE"]),
  syndrome: SyndromeClusterSchema,
  reasonCodes: z.array(z.string()),
  missingFields: z.array(z.string()),
  needsClinicianReview: z.boolean(),
  candidateSpecialty: z.enum([
    "cardiology_first", "general_internal", "neurology", "infection", "other",
  ]),
});

export const FrontlineGuidanceSchema = z.object({
  urgencyLabel: z.string(),
  nextChecks: z.array(z.string()),
  actionMessage: z.string(),
  safetyNotes: z.array(z.string()),
});

export const PrimaryPhysicianSummarySchema = z.object({
  headline: z.string(),
  observationSummary: z.array(z.string()),
  vitalSummary: z.array(z.string()),
  concernPoints: z.array(z.string()),
  generalMedicalInfo: z.array(z.string()),
  recommendedEscalationLevel: z.enum(["same_day", "within_24h", "observe", "emergency"]),
  authoredBy: z.enum(["AI", "remote_physician"]),
});

export const RemoteReviewSchema = z.object({
  reviewerId: z.string(),
  reviewerRole: z.enum(["cardiology_first", "specialist_second"]),
  disposition: z.enum(["send_to_primary", "ask_frontline_more", "reroute_specialty", "emergency_bypass"]),
  clinicianComment: z.string(),
  primarySummary: PrimaryPhysicianSummarySchema,
  createdAt: z.string(),
});

export const PrimaryResponseSchema = z.object({
  status: z.enum(["accepted", "held", "declined", "already_handled"]),
  comment: z.string().optional(),
  respondedAt: z.string(),
});

export const AuditLogSchema = z.object({
  at: z.string(),
  actorType: z.enum(["frontline", "ai", "remote_physician", "primary_physician", "system"]),
  actorId: z.string().optional(),
  action: z.enum([
    "case_created", "text_structured", "triage_completed", "emergency_bypassed",
    "ai_completed", "sent_to_clinician_queue", "clinician_review_saved",
    "primary_notified", "primary_responded", "case_closed",
  ]),
  summary: z.string(),
  diff: z.record(z.string(), z.unknown()).optional(),
});

export const TriageRequestSchema = z.object({
  category: ConcernCategorySchema,
  answers: z.array(InterviewAnswerSchema),
  vitals: VitalSignsSchema.optional(),
  freeText: FreeTextInputSchema.optional(),
  emergencyBypass: z.boolean().optional().default(false),
});

export const SaveCaseRequestSchema = z.object({
  caseId: z.string(),
  category: ConcernCategorySchema,
  answers: z.array(InterviewAnswerSchema),
  vitals: VitalSignsSchema.optional().nullable(),
  freeText: FreeTextInputSchema.optional().nullable(),
  triage: TriageDecisionSchema.optional().nullable(),
  frontlineGuidance: FrontlineGuidanceSchema.optional().nullable(),
  primarySummary: PrimaryPhysicianSummarySchema.optional().nullable(),
  status: CaseStatusV5Schema,
});

export const ClinicianReviewRequestSchema = z.object({
  caseId: z.string(),
  reviewerId: z.string(),
  reviewerRole: z.enum(["cardiology_first", "specialist_second"]),
  disposition: z.enum(["send_to_primary", "ask_frontline_more", "reroute_specialty", "emergency_bypass"]),
  clinicianComment: z.string(),
  primarySummaryOverride: PrimaryPhysicianSummarySchema.optional(),
});

export const PrimaryNotifyRequestSchema = z.object({
  caseId: z.string(),
});

export const PrimaryRespondRequestSchema = z.object({
  caseId: z.string(),
  status: z.enum(["accepted", "held", "declined", "already_handled"]),
  comment: z.string().optional(),
});

// ===== v6 追加スキーマ =====

export const CaseStatusV6Schema = z.enum([
  "draft", "submitted", "ai_structuring", "ai_triaged", "ai_completed",
  "emergency_bypass", "awaiting_clinician_review", "clinician_reviewing",
  "handoff_ready", "handoff_shared", "response_recorded", "closed",
]);

export const ShareChannelSchema = z.enum([
  "copy_text", "printable_pdf", "secure_link",
  "email_placeholder", "fax_placeholder", "manual_other",
]);

export const NotificationPolicySchema = z.object({
  immediateEmailEligible: z.boolean(),
  includeInDailyDigest: z.boolean(),
  manualShareRecommended: z.boolean(),
});

export const FrontlineGuidanceV6Schema = z.object({
  urgencyLabel: z.string(),
  nextChecks: z.array(z.string()),
  actionMessage: z.string(),
  safetyNotes: z.array(z.string()),
  reviewStatus: z.enum(["ai_only", "awaiting_clinician_review", "emergency_bypass"]),
});

export const PrimaryHandoffPackageSchema = z.object({
  headline: z.string(),
  observationSummary: z.array(z.string()),
  vitalSummary: z.array(z.string()),
  concernPoints: z.array(z.string()),
  generalMedicalInfo: z.array(z.string()),
  recommendedEscalationLevel: z.enum(["same_day", "within_24h", "observe", "emergency"]),
  authoredBy: z.enum(["AI", "remote_physician"]),
  recommendedChannel: ShareChannelSchema,
  shareText: z.string(),
  notificationPolicy: NotificationPolicySchema,
});

export const HandoffDeliveryRecordSchema = z.object({
  shared: z.boolean(),
  sharedAt: z.string().optional(),
  sharedBy: z.string().optional(),
  channel: ShareChannelSchema.optional(),
  note: z.string().optional(),
});

export const ManagerActionRecordSchema = z.object({
  action: z.enum(["marked_shared", "marked_closed", "recorded_response", "manual_escalation"]),
  actorId: z.string(),
  createdAt: z.string(),
  note: z.string().optional(),
});

export const ManagerClinicalReviewSchema = z.object({
  status: z.enum(["no_issue", "follow_up_needed", "handled"]),
  reviewerRole: z.enum(["manager", "primary_physician", "supervisory_doctor"]),
  note: z.string().optional(),
  reviewedAt: z.string(),
  reviewedBy: z.string(),
});

export const RemoteReviewV6Schema = z.object({
  reviewerId: z.string(),
  reviewerRole: z.enum(["cardiology_first", "specialist_second"]),
  disposition: z.enum(["send_to_primary_handoff", "ask_frontline_more", "reroute_specialty", "emergency_bypass"]),
  clinicianComment: z.string(),
  primaryHandoff: PrimaryHandoffPackageSchema,
  createdAt: z.string(),
});

export const OptionalPrimaryResponseSchema = z.object({
  status: z.enum(["accepted", "held", "declined", "already_handled"]),
  comment: z.string().optional(),
  recordedAt: z.string(),
  recordedBy: z.enum(["manager", "frontline", "primary_physician"]),
});

export const AuditLogV6Schema = z.object({
  at: z.string(),
  actorType: z.enum(["frontline", "ai", "remote_physician", "primary_physician", "system"]),
  actorId: z.string().optional(),
  action: z.enum([
    "case_created", "text_structured", "triage_completed", "emergency_bypassed",
    "ai_completed", "sent_to_clinician_queue", "clinician_review_saved",
    "handoff_generated", "handoff_shared", "primary_response_recorded",
    "manager_clinical_review_recorded", "immediate_notification_attempted",
    "daily_digest_sent", "manager_closed_case",
  ]),
  summary: z.string(),
  diff: z.record(z.string(), z.unknown()).optional(),
});

// v6 API request schemas

export const TriageRequestV6Schema = z.object({
  category: ConcernCategorySchema,
  answers: z.array(InterviewAnswerSchema),
  vitals: VitalSignsSchema.optional(),
  freeText: FreeTextInputSchema.optional(),
  emergencyBypass: z.boolean().optional().default(false),
});

export const SaveCaseV6RequestSchema = z.object({
  caseId: z.string(),
  category: ConcernCategorySchema,
  answers: z.array(InterviewAnswerSchema),
  vitals: VitalSignsSchema.optional().nullable(),
  freeText: FreeTextInputSchema.optional().nullable(),
  triage: TriageDecisionSchema.optional().nullable(),
  frontlineGuidance: FrontlineGuidanceV6Schema.optional().nullable(),
  primaryHandoff: PrimaryHandoffPackageSchema.optional().nullable(),
  status: CaseStatusV6Schema,
});

export const ClinicianReviewV6RequestSchema = z.object({
  caseId: z.string(),
  reviewerId: z.string(),
  reviewerRole: z.enum(["cardiology_first", "specialist_second"]),
  disposition: z.enum(["send_to_primary_handoff", "ask_frontline_more", "reroute_specialty", "emergency_bypass"]),
  clinicianComment: z.string(),
  primaryHandoffOverride: PrimaryHandoffPackageSchema.optional(),
});

export const MarkHandoffSharedRequestSchema = z.object({
  caseId: z.string(),
  actorId: z.string(),
  channel: ShareChannelSchema,
  note: z.string().optional(),
});

export const RecordPrimaryResponseRequestSchema = z.object({
  caseId: z.string(),
  actorId: z.string(),
  status: z.enum(["accepted", "held", "declined", "already_handled"]),
  comment: z.string().optional(),
  recordedBy: z.enum(["manager", "frontline", "primary_physician"]),
});

export const RecordManagerClinicalReviewRequestSchema = z.object({
  caseId: z.string(),
  status: z.enum(["no_issue", "follow_up_needed", "handled"]),
  reviewerRole: z.enum(["manager", "primary_physician", "supervisory_doctor"]),
  reviewedBy: z.string(),
  note: z.string().optional(),
});

export const SendImmediateNotificationRequestSchema = z.object({
  caseId: z.string(),
});

export const BuildDailyDigestRequestSchema = z.object({
  date: z.string().optional(),
  recipientGroupId: z.string().optional(),
});
