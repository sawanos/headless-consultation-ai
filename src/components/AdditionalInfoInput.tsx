"use client";

import { useState } from "react";
import { FreeTextInput, StructuredObservation } from "@/types/consult";
import VoiceInputButton from "@/components/VoiceInputButton";

type ObservationTagProps = {
  obs: StructuredObservation;
};

const urgencyColors: Record<string, string> = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-orange-100 text-orange-700 border-orange-200",
  low: "bg-yellow-100 text-yellow-700 border-yellow-200",
  neutral: "bg-gray-100 text-gray-600 border-gray-200",
};

const typeLabels: Record<string, string> = {
  symptom: "症状",
  behavior: "行動",
  vital: "バイタル",
  history: "既往",
  medication: "薬",
  environment: "環境",
  unknown: "その他",
};

function ObservationTag({ obs }: ObservationTagProps) {
  const colorClass = urgencyColors[obs.urgencyContribution] || urgencyColors.neutral;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${colorClass}`}>
      <span className="font-bold">{typeLabels[obs.type] || obs.type}</span>
      <span>{obs.content}</span>
    </span>
  );
}

type Props = {
  freeText: FreeTextInput;
  onChange: (input: FreeTextInput) => void;
};

export default function AdditionalInfoInput({ freeText, onChange }: Props) {
  const [text, setText] = useState(freeText.rawText);

  const handleBlur = () => {
    onChange({
      ...freeText,
      rawText: text,
      isStructured: false,
      structured: [],
      processing: false,
    });
  };

  const handleVoiceTranscript = (transcript: string) => {
    const newText = text ? `${text}\n${transcript}` : transcript;
    setText(newText);
    onChange({
      ...freeText,
      rawText: newText,
      isStructured: false,
      structured: [],
      processing: false,
    });
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold text-gray-700">追加情報（自由記述・任意）</h3>
        <VoiceInputButton onTranscript={handleVoiceTranscript} size="sm" />
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        placeholder="気になること、普段との違い、観察メモなどを自由に入力できます"
        rows={4}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
      />
      {freeText.processing && (
        <p className="text-sm text-blue-500">構造化処理中...</p>
      )}
      {freeText.isStructured && freeText.structured.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {freeText.structured.map((obs, i) => (
            <ObservationTag key={i} obs={obs} />
          ))}
        </div>
      )}
    </div>
  );
}
