"use client";

import { Question } from "@/types/consult";

type Props = {
  question: Question;
  currentAnswer: string | null;
  onAnswer: (questionId: string, answer: string) => void;
  questionNumber: number;
  totalQuestions: number;
};

export default function QuestionCard({
  question,
  currentAnswer,
  onAnswer,
  questionNumber,
  totalQuestions,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span>
          質問 {questionNumber} / {totalQuestions}
        </span>
      </div>
      <h2 className="text-2xl font-bold text-gray-800">{question.text}</h2>
      <div className="space-y-3 mt-6">
        {question.options.map((option) => (
          <button
            key={option}
            onClick={() => onAnswer(question.id, option)}
            className={`w-full p-5 rounded-2xl text-left text-xl transition-all border-2 ${
              currentAnswer === option
                ? "bg-blue-50 border-blue-400 text-blue-800 font-medium"
                : "bg-white border-gray-100 text-gray-700 hover:border-blue-200"
            } active:scale-[0.98]`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
