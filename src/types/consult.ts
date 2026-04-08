// ===== Data Models =====

export type Facility = {
  id: string;
  name: string;
};

export type UserRole = "nurse" | "care_staff" | "rehab_staff" | "other";

export type User = {
  id: string;
  name: string;
  role: UserRole;
  facilityId: string;
};

export type CaseStatus = "draft" | "completed" | "sent" | "held";

export type ConcernCategory =
  | "usual_diff"
  | "dyspnea"
  | "edema"
  | "palpitation"
  | "low_energy"
  | "poor_intake"
  | "confusion"
  | "fall"
  | "medication"
  | "unknown_worry";

export type CaseRecord = {
  id: string;
  userId: string;
  facilityId: string;
  createdAt: string;
  status: CaseStatus;
  chiefConcernCategory: ConcernCategory;
};

export type QuickGuideSnapshot = {
  checks: string[];
  redFlags: string[];
  reassurance: string;
};

export type QuestionType = "single" | "multi" | "text";

export type Question = {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
};

export type InterviewAnswer = {
  questionId: string;
  question: string;
  answer: string | null;
  answerLabel: string;
};

export type Priority = "RED" | "ORANGE" | "YELLOW" | "BLUE";

export type Target = "primary" | "internal" | "cardiology";

export type Assessment = {
  priority: Priority;
  reason: string;
  actions: string[];
  oneQuestion: string;
  bridge: boolean;
  target: Target;
  safetyNote: string;
};

export type ConsultationOutput = {
  summary: string;
  sbar: string;
  doctorMessage: string;
  handoverText: string;
};

export type EncounterLog = {
  id: string;
  caseId: string;
  startedAt: string;
  completedAt?: string;
  durationSec?: number;
  edited: boolean;
  sent: boolean;
};

// ===== Category Definition =====

export type CategoryDefinition = {
  id: ConcernCategory;
  label: string;
  description: string;
  quickGuide: QuickGuideSnapshot;
};

// ===== Analytics =====

export type AnalyticsEvent =
  | { type: "consult_started"; at: string }
  | { type: "category_selected"; at: string; category: string }
  | { type: "quickguide_viewed"; at: string; category: string }
  | { type: "interview_completed"; at: string }
  | { type: "assessment_viewed"; at: string; priority: string }
  | { type: "output_generated"; at: string }
  | { type: "message_edited"; at: string }
  | { type: "message_sent"; at: string };

// ===== Vital Signs =====
export type VitalReading = {
  value: string | null;
  inputMode: "tab" | "freetext" | "not_measured";
  status: "normal" | "caution" | "abnormal" | "unknown";
};

export type VitalSigns = {
  temperature: VitalReading;
  spo2: VitalReading;
  pulse: VitalReading;
  bloodPressure: VitalReading;
  respiratoryRate: VitalReading;
};

// ===== Free Text & Structured Additional Info =====
export type StructuredObservation = {
  type: "symptom" | "behavior" | "vital" | "history" | "medication" | "environment" | "unknown";
  content: string;
  urgencyContribution: "high" | "medium" | "low" | "neutral";
  sourceText: string;
};

export type FreeTextInput = {
  rawText: string;
  isStructured: boolean;
  structured: StructuredObservation[];
  processing: boolean;
};

// ===== Consultation State (Zustand) =====

export type ConsultState = {
  caseId: string | null;
  category: ConcernCategory | null;
  quickGuide: QuickGuideSnapshot | null;
  questions: Question[];
  answers: InterviewAnswer[];
  assessment: Assessment | null;
  output: ConsultationOutput | null;
  startedAt: string | null;
  vitalSigns: VitalSigns | null;
  freeTextInput: FreeTextInput | null;
  // v6 フィールド
  triageDecision: TriageDecision | null;
  frontlineGuidance: FrontlineGuidanceV6 | null;
  draftPrimaryHandoff: PrimaryHandoffPackage | null;
  caseStatus: CaseStatusV6;
  emergencyBypassed: boolean;
  handoffDelivery: HandoffDeliveryRecord | null;
  managerClinicalReview: ManagerClinicalReview | null;

  setCategory: (category: ConcernCategory) => void;
  setQuickGuide: (guide: QuickGuideSnapshot) => void;
  setQuestions: (questions: Question[]) => void;
  setAnswers: (answers: InterviewAnswer[]) => void;
  setAssessment: (assessment: Assessment) => void;
  setOutput: (output: ConsultationOutput) => void;
  setVitalSigns: (vitals: VitalSigns) => void;
  setFreeTextInput: (input: FreeTextInput) => void;
  updateFreeTextStructured: (structured: StructuredObservation[]) => void;
  startConsult: () => void;
  reset: () => void;
  // v6 アクション
  setTriageDecision: (triage: TriageDecision) => void;
  setFrontlineGuidance: (guidance: FrontlineGuidanceV6) => void;
  setDraftPrimaryHandoff: (handoff: PrimaryHandoffPackage) => void;
  setCaseStatus: (status: CaseStatusV6) => void;
  setEmergencyBypassed: (bypassed: boolean) => void;
  setHandoffDelivery: (record: HandoffDeliveryRecord | null) => void;
  setManagerClinicalReview: (review: ManagerClinicalReview | null) => void;
};

// ===== v5 追加型 =====

export type CaseStatusV5 =
  | "draft"
  | "submitted"
  | "ai_structuring"
  | "ai_triaged"
  | "ai_completed"
  | "emergency_bypass"
  | "awaiting_clinician_review"
  | "clinician_reviewing"
  | "awaiting_primary_notification"
  | "primary_notified"
  | "primary_responded"
  | "closed";

export type TriageBucket = "ai_only" | "clinician_review" | "emergency_bypass";

export type SyndromeCluster =
  | "cardio_fluid"
  | "infection_systemic"
  | "neuro_flag"
  | "gastro_other"
  | "unknown";

export type TriageDecision = {
  bucket: TriageBucket;
  priority: Priority;
  syndrome: SyndromeCluster;
  reasonCodes: string[];
  missingFields: string[];
  needsClinicianReview: boolean;
  candidateSpecialty: "cardiology_first" | "general_internal" | "neurology" | "infection" | "other";
};

export type FrontlineGuidance = {
  urgencyLabel: string;
  nextChecks: string[];
  actionMessage: string;
  safetyNotes: string[];
};

export type PrimaryPhysicianSummary = {
  headline: string;
  observationSummary: string[];
  vitalSummary: string[];
  concernPoints: string[];
  generalMedicalInfo: string[];
  recommendedEscalationLevel: "same_day" | "within_24h" | "observe" | "emergency";
  authoredBy: "AI" | "remote_physician";
};

export type ClinicianDisposition =
  | "send_to_primary"
  | "ask_frontline_more"
  | "reroute_specialty"
  | "emergency_bypass";

export type RemoteReview = {
  reviewerId: string;
  reviewerRole: "cardiology_first" | "specialist_second";
  disposition: ClinicianDisposition;
  clinicianComment: string;
  primarySummary: PrimaryPhysicianSummary;
  createdAt: string;
};

export type PrimaryResponseStatus = "accepted" | "held" | "declined" | "already_handled";

export type PrimaryResponse = {
  status: PrimaryResponseStatus;
  comment?: string;
  respondedAt: string;
};

export type AuditActorType = "frontline" | "ai" | "remote_physician" | "primary_physician" | "manager" | "system";

export type AuditAction =
  | "case_created"
  | "text_structured"
  | "triage_completed"
  | "emergency_bypassed"
  | "ai_completed"
  | "sent_to_clinician_queue"
  | "clinician_review_saved"
  | "primary_notified"
  | "primary_responded"
  | "case_closed";

export type AuditLog = {
  at: string;
  actorType: AuditActorType;
  actorId?: string;
  action: AuditAction;
  summary: string;
  diff?: Record<string, unknown>;
};

export type ConsultationCase = {
  id: string;
  category: ConcernCategory;
  answers: InterviewAnswer[];
  vitals: VitalSigns | null;
  freeText: FreeTextInput | null;
  triage: TriageDecision | null;
  frontlineGuidance: FrontlineGuidance | null;
  primarySummary: PrimaryPhysicianSummary | null;
  remoteReview: RemoteReview | null;
  primaryResponse: PrimaryResponse | null;
  status: CaseStatusV5;
  auditLogs: AuditLog[];
  createdAt: string;
  updatedAt: string;
  // 既存互換フィールド
  legacyAssessment?: Assessment | null;
  legacyOutput?: ConsultationOutput | null;
};

// ===== v6 追加型 =====

export type CaseStatusV6 =
  | "draft"
  | "submitted"
  | "ai_structuring"
  | "ai_triaged"
  | "ai_completed"
  | "emergency_bypass"
  | "awaiting_clinician_review"
  | "clinician_reviewing"
  | "handoff_ready"
  | "handoff_shared"
  | "response_recorded"
  | "closed";

export type ShareChannel =
  | "copy_text"
  | "printable_pdf"
  | "secure_link"
  | "email_placeholder"
  | "fax_placeholder"
  | "manual_other";

export type NotificationPolicy = {
  immediateEmailEligible: boolean;
  includeInDailyDigest: boolean;
  manualShareRecommended: boolean;
};

export type FrontlineGuidanceV6 = {
  urgencyLabel: string;
  nextChecks: string[];
  actionMessage: string;
  safetyNotes: string[];
  reviewStatus: "ai_only" | "awaiting_clinician_review" | "emergency_bypass";
};

export type PrimaryHandoffPackage = {
  headline: string;
  observationSummary: string[];
  vitalSummary: string[];
  concernPoints: string[];
  generalMedicalInfo: string[];
  recommendedEscalationLevel: "same_day" | "within_24h" | "observe" | "emergency";
  authoredBy: "AI" | "remote_physician";
  recommendedChannel: ShareChannel;
  shareText: string;
  notificationPolicy: NotificationPolicy;
};

export type HandoffDeliveryRecord = {
  shared: boolean;
  sharedAt?: string;
  sharedBy?: string;
  channel?: ShareChannel;
  note?: string;
};

export type ManagerActionRecord = {
  action: "marked_shared" | "marked_closed" | "recorded_response" | "manual_escalation";
  actorId: string;
  createdAt: string;
  note?: string;
};

export type ManagerClinicalReviewStatus = "no_issue" | "follow_up_needed" | "handled";

export type ManagerClinicalReview = {
  status: ManagerClinicalReviewStatus;
  reviewerRole: "manager" | "primary_physician" | "supervisory_doctor";
  note?: string;
  reviewedAt: string;
  reviewedBy: string;
};

export type ClinicianDispositionV6 =
  | "send_to_primary_handoff"
  | "ask_frontline_more"
  | "reroute_specialty"
  | "emergency_bypass";

export type RemoteReviewV6 = {
  reviewerId: string;
  reviewerRole: "cardiology_first" | "specialist_second";
  disposition: ClinicianDispositionV6;
  clinicianComment: string;
  primaryHandoff: PrimaryHandoffPackage;
  createdAt: string;
};

export type OptionalPrimaryResponse = {
  status: "accepted" | "held" | "declined" | "already_handled";
  comment?: string;
  recordedAt: string;
  recordedBy: "manager" | "frontline" | "primary_physician";
};

export type AuditActionV6 =
  | "case_created"
  | "text_structured"
  | "triage_completed"
  | "emergency_bypassed"
  | "ai_completed"
  | "sent_to_clinician_queue"
  | "clinician_review_saved"
  | "handoff_generated"
  | "handoff_shared"
  | "primary_response_recorded"
  | "manager_clinical_review_recorded"
  | "immediate_notification_attempted"
  | "daily_digest_sent"
  | "manager_closed_case";

export type AuditLogV6 = {
  at: string;
  actorType: AuditActorType;
  actorId?: string;
  action: AuditActionV6;
  summary: string;
  diff?: Record<string, unknown>;
};

export type ConsultationCaseV6 = {
  id: string;
  category: ConcernCategory;
  answers: InterviewAnswer[];
  vitals: VitalSigns | null;
  freeText: FreeTextInput | null;
  triage: TriageDecision | null;
  frontlineGuidance: FrontlineGuidanceV6 | null;
  primaryHandoff: PrimaryHandoffPackage | null;
  remoteReview: RemoteReviewV6 | null;
  handoffDelivery: HandoffDeliveryRecord | null;
  managerClinicalReview: ManagerClinicalReview | null;
  primaryResponse: OptionalPrimaryResponse | null;
  managerActions: ManagerActionRecord[];
  status: CaseStatusV6;
  auditLogs: AuditLogV6[];
  createdAt: string;
  updatedAt: string;
  legacyAssessment?: Assessment | null;
  legacyOutput?: ConsultationOutput | null;
};
