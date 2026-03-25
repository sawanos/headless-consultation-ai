"use client";

import { useRouter } from "next/navigation";
import { useConsultStore } from "@/lib/store";
import { getQuestions } from "@/lib/questions";
import QuestionCard from "@/components/QuestionCard";
import StickyFooter from "@/components/StickyFooter";
import { useState, useEffect } from "react";
import { InterviewAnswer } from "@/types/consult";

export default function InterviewPage() {
  const router = useRouter();
  const category = useConsultStore((s) => s.category);
  const setAnswers = useConsultStore((s) => s.setAnswers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});

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
      // 全問完了
      const interviewAnswers: InterviewAnswer[] = questions.map((q) => ({
        questionId: q.id,
        question: q.text,
        answer: localAnswers[q.id] || null,
        answerLabel: localAnswers[q.id] || "未回答",
      }));
      setAnswers(interviewAnswers);
      router.push("/consult/assessment");
    }
  };

  const handleSkip = () => {
    handleNext();
  };

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
            {currentIndex < questions.length - 1 ? "次へ" : "結果を見る"}
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
