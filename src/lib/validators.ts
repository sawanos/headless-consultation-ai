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
