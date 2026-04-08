"use client";

import { useState } from "react";
import { Question } from "@/types/consult";
import VoiceInputButton from "@/components/VoiceInputButton";

type Props = {
  question: Question;
  currentAnswer: string | null;
  onAnswer: (questionId: string, answer: string) => void;
  questionNumber: number;
  totalQuestions: number;
};

function matchOption(transcript: string, options: string[]): string | null {
  const normalized = transcript.replace(/\s|。|、/g, "");
  // 1) 完全一致を優先
  const exact = options.find((o) => normalized === o.replace(/\s/g, ""));
  if (exact) return exact;
  // 2) transcript に option が含まれる
  const contained = options.find((o) => normalized.includes(o.replace(/\s/g, "")));
  if (contained) return contained;
  // 3) option に transcript が含まれる（短い回答ケース）
  const reverse = options.find((o) =>
    o.replace(/\s/g, "").includes(normalized)
  );
  return reverse || null;
}

export default function QuestionCard({
  question,
  currentAnswer,
  onAnswer,
  questionNumber,
  totalQuestions,
}: Props) {
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [matchFailed, setMatchFailed] = useState(false);

  const handleVoiceTranscript = (transcript: string) => {
    setLastTranscript(transcript);
    const matched = matchOption(transcript, question.options);
    if (matched) {
      setMatchFailed(false);
      onAnswer(question.id, matched);
    } else {
      setMatchFailed(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 text-sm text-gray-400">
        <span>
          質問 {questionNumber} / {totalQuestions}
        </span>
        <VoiceInputButton
          onTranscript={handleVoiceTranscript}
          size="sm"
          label="音声で回答"
        />
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
      {lastTranscript && (
        <div
          className={`text-sm rounded-lg p-3 border ${
            matchFailed
              ? "bg-orange-50 border-orange-200 text-orange-700"
              : "bg-blue-50 border-blue-200 text-blue-700"
          }`}
        >
          <span className="font-medium">音声入力：</span>
          {lastTranscript}
          {matchFailed && (
            <div className="text-xs mt-1 text-orange-600">
              選択肢に一致しませんでした。手動で選んでください。
            </div>
          )}
        </div>
      )}
    </div>
  );
}
