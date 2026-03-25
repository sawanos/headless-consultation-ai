import { create } from "zustand";
import { ConsultState } from "@/types/consult";
import { v4 as uuidv4 } from "uuid";

export const useConsultStore = create<ConsultState>((set) => ({
  caseId: null,
  category: null,
  quickGuide: null,
  questions: [],
  answers: [],
  assessment: null,
  output: null,
  startedAt: null,

  startConsult: () =>
    set({
      caseId: uuidv4(),
      startedAt: new Date().toISOString(),
      category: null,
      quickGuide: null,
      questions: [],
      answers: [],
      assessment: null,
      output: null,
    }),

  setCategory: (category) => set({ category }),
  setQuickGuide: (guide) => set({ quickGuide: guide }),
  setQuestions: (questions) => set({ questions }),
  setAnswers: (answers) => set({ answers }),
  setAssessment: (assessment) => set({ assessment }),
  setOutput: (output) => set({ output }),

  reset: () =>
    set({
      caseId: null,
      category: null,
      quickGuide: null,
      questions: [],
      answers: [],
      assessment: null,
      output: null,
      startedAt: null,
    }),
}));
