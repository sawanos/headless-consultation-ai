"use client";

import { useRouter } from "next/navigation";
import { useConsultStore } from "@/lib/store";
import { getQuestions } from "@/lib/questions";
import QuestionCard from "@/components/QuestionCard";
import StickyFooter from "@/components/StickyFooter";
import VitalSignsPanel from "@/components/vitals/VitalSignsPanel";
import { createEmptyVitals } from "@/components/vitals/VitalSignsPanel";
import AdditionalInfoInput from "@/components/AdditionalInfoInput";
import { useState, useEffect } from "react";
import { InterviewAnswer, VitalSigns, FreeTextInput } from "@/types/consult";

export default function InterviewPage() {
  const router = useRouter();
  const category = useConsultStore((s) => s.category);
  const setAnswers = useConsultStore((s) => s.setAnswers);
  const setVitalSigns = useConsultStore((s) => s.setVitalSigns);
  const setFreeTextInput = useConsultStore((s) => s.setFreeTextInput);
  const setAssessment = useConsultStore((s) => s.setAssessment);
  const setTriageDecision = useConsultStore((s) => s.setTriageDecision);
  const setFrontlineGuidance = useConsultStore((s) => s.setFrontlineGuidance);
  const setDraftPrimaryHandoff = useConsultStore((s) => s.setDraftPrimaryHandoff);
  const setCaseStatus = useConsultStore((s) => s.setCaseStatus);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});
  const [showOptionalInputs, setShowOptionalInputs] = useState(false);
  const [vitals, setVitals] = useState<VitalSigns>(createEmptyVitals());
  const [freeText, setFreeText] = useState<FreeTextInput>({
    rawText: "",
    isStructured: false,
    structured: [],
    processing: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const questions = category ? getQuestions(category) : [];

  useEffect(() => {
    if (!category) {
      router.replace("/consult/start");
    }
  }, [category, router]);

  if (!category || questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (questionId: string, answer: string) => {
    setLocalAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowOptionalInputs(true);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleGoToAssessment = async () => {
    const interviewAnswers: InterviewAnswer[] = questions.map((q) => ({
      questionId: q.id,
      question: q.text,
      answer: localAnswers[q.id] || null,
      answerLabel: localAnswers[q.id] || "未回答",
    }));
    setAnswers(interviewAnswers);

    const hasVitalInput = Object.values(vitals).some((r) => r.value !== null);
    if (hasVitalInput) {
      setVitalSigns(vitals);
    }
    if (freeText.rawText.trim()) {
      setFreeTextInput(freeText);
    }

    // Triage API 呼び出し
    setSubmitting(true);
    try {
      const res = await fetch("/api/consult/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          answers: interviewAnswers,
          ...(hasVitalInput ? { vitals } : {}),
          ...(freeText.rawText.trim() ? { freeText } : {}),
        }),
      });
      const data = await res.json();
      setTriageDecision(data.triage);
      setFrontlineGuidance(data.frontlineGuidance);
      if (data.draftPrimaryHandoff) {
        setDraftPrimaryHandoff(data.draftPrimaryHandoff);
      }
      setCaseStatus("ai_triaged");

      // 既存互換: assessment も生成（risk-engine ベース）
      const { assessRisk } = await import("@/lib/risk-engine");
      const assessment = assessRisk(
        category,
        interviewAnswers,
        hasVitalInput ? vitals : undefined,
        freeText.rawText.trim() ? freeText : undefined
      );
      setAssessment(assessment);
    } catch {
      // フォールバック: triage API失敗時は既存risk-engineで直接判定
      const { assessRisk } = await import("@/lib/risk-engine");
      const assessment = assessRisk(
        category,
        interviewAnswers,
        hasVitalInput ? vitals : undefined,
        freeText.rawText.trim() ? freeText : undefined
      );
      setAssessment(assessment);
    } finally {
      setSubmitting(false);
      router.push("/consult/assessment");
    }
  };

  if (showOptionalInputs) {
    return (
      <div className="px-4 py-8 pb-32 space-y-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">追加情報（任意）</h2>
        <p className="text-sm text-gray-500 mb-4">
          どちらも入力しなくても大丈夫です。わかる範囲でお願いします。
        </p>

        <VitalSignsPanel
          vitals={vitals}
          onChange={setVitals}
          categoryId={category}
        />

        <AdditionalInfoInput
          freeText={freeText}
          onChange={setFreeText}
        />

        <StickyFooter>
          <button
            onClick={handleGoToAssessment}
            disabled={submitting}
            className="w-full py-4 bg-blue-500 text-white text-xl font-bold rounded-2xl hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {submitting ? "判定中..." : "結果を見る"}
          </button>
        </StickyFooter>
      </div>
    );
  }

  const hasAnswer = !!localAnswers[currentQuestion.id];

  return (
    <div className="px-4 py-8 pb-32">
      <QuestionCard
        question={currentQuestion}
        currentAnswer={localAnswers[currentQuestion.id] || null}
        onAnswer={handleAnswer}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
      />

      <StickyFooter>
        <div className="space-y-3">
          <button
            onClick={handleNext}
            disabled={!hasAnswer}
            className={`w-full py-4 text-xl font-bold rounded-2xl transition-all ${
              hasAnswer
                ? "bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98]"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {currentIndex < questions.length - 1 ? "次へ" : "次へ進む"}
          </button>
          <button
            onClick={handleSkip}
            className="w-full py-3 text-base text-gray-400 hover:text-gray-600 transition-colors"
          >
            わからない・スキップ
          </button>
        </div>
      </StickyFooter>
    </div>
  );
}
