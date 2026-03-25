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

export const AssessRequestSchema = z.object({
  category: ConcernCategorySchema,
  answers: z.array(InterviewAnswerSchema),
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
