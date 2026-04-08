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
  vitalSigns: null,
  freeTextInput: null,
  // v6 フィールド
  triageDecision: null,
  frontlineGuidance: null,
  draftPrimaryHandoff: null,
  caseStatus: "draft",
  emergencyBypassed: false,
  handoffDelivery: null,
  managerClinicalReview: null,

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
      vitalSigns: null,
      freeTextInput: null,
      // v6 初期化
      triageDecision: null,
      frontlineGuidance: null,
      draftPrimaryHandoff: null,
      caseStatus: "draft",
      emergencyBypassed: false,
      handoffDelivery: null,
      managerClinicalReview: null,
    }),

  setCategory: (category) => set({ category }),
  setQuickGuide: (guide) => set({ quickGuide: guide }),
  setQuestions: (questions) => set({ questions }),
  setAnswers: (answers) => set({ answers }),
  setAssessment: (assessment) => set({ assessment }),
  setOutput: (output) => set({ output }),
  setVitalSigns: (vitals) => set({ vitalSigns: vitals }),
  setFreeTextInput: (input) => set({ freeTextInput: input }),
  updateFreeTextStructured: (structured) =>
    set((state) => ({
      freeTextInput: state.freeTextInput
        ? { ...state.freeTextInput, structured, isStructured: true, processing: false }
        : null,
    })),

  // v6 アクション
  setTriageDecision: (triage) => set({ triageDecision: triage }),
  setFrontlineGuidance: (guidance) => set({ frontlineGuidance: guidance }),
  setDraftPrimaryHandoff: (handoff) => set({ draftPrimaryHandoff: handoff }),
  setCaseStatus: (status) => set({ caseStatus: status }),
  setEmergencyBypassed: (bypassed) => set({ emergencyBypassed: bypassed }),
  setHandoffDelivery: (record) => set({ handoffDelivery: record }),
  setManagerClinicalReview: (review) => set({ managerClinicalReview: review }),

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
      vitalSigns: null,
      freeTextInput: null,
      // v6 リセット
      triageDecision: null,
      frontlineGuidance: null,
      draftPrimaryHandoff: null,
      caseStatus: "draft",
      emergencyBypassed: false,
      handoffDelivery: null,
      managerClinicalReview: null,
    }),
}));
