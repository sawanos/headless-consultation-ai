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

  setCategory: (category: ConcernCategory) => void;
  setQuickGuide: (guide: QuickGuideSnapshot) => void;
  setQuestions: (questions: Question[]) => void;
  setAnswers: (answers: InterviewAnswer[]) => void;
  setAssessment: (assessment: Assessment) => void;
  setOutput: (output: ConsultationOutput) => void;
  startConsult: () => void;
  reset: () => void;
};
