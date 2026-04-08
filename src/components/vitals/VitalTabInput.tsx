"use client";

import { useState } from "react";
import { VitalReading } from "@/types/consult";
import { VITAL_RANGES, evaluateStatus } from "./vitalRanges";
import VitalStatusBadge from "./VitalStatusBadge";
import VoiceInputButton from "@/components/VoiceInputButton";

type Props = {
  vitalKey: string;
  reading: VitalReading;
  onChange: (reading: VitalReading) => void;
};

export default function VitalTabInput({ vitalKey, reading, onChange }: Props) {
  const range = VITAL_RANGES[vitalKey];
  const [mode, setMode] = useState<VitalReading["inputMode"]>(reading.inputMode);

  if (!range) return null;

  const handleModeChange = (newMode: VitalReading["inputMode"]) => {
    setMode(newMode);
    if (newMode === "not_measured") {
      onChange({ value: null, inputMode: "not_measured", status: "unknown" });
    } else {
      onChange({ ...reading, inputMode: newMode });
    }
  };

  const handleValueChange = (val: string) => {
    const status = evaluateStatus(vitalKey, val);
    onChange({ value: val, inputMode: mode, status });
  };

  const handleVoiceTranscript = (transcript: string) => {
    // 既存値があれば半角スペースで追記、なければそのまま
    const current = reading.value || "";
    const newValue = current ? `${current} ${transcript}` : transcript;
    handleValueChange(newValue);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold text-gray-700">
          {range.label}
          <span className="text-sm text-gray-400 ml-1">({range.unit})</span>
        </span>
        <VitalStatusBadge status={reading.status} size="sm" />
      </div>

      <div className="flex gap-2 mb-3">
        {(["tab", "freetext", "not_measured"] as const).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${
              mode === m
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {m === "tab" ? "数値入力" : m === "freetext" ? "自由記述" : "未測定"}
          </button>
        ))}
      </div>

      {mode !== "not_measured" && (
        <div className="space-y-2">
          <input
            type={mode === "tab" ? "number" : "text"}
            inputMode={mode === "tab" ? "decimal" : "text"}
            value={reading.value || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            placeholder={range.placeholder}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <VoiceInputButton
            onTranscript={handleVoiceTranscript}
            size="sm"
            label="音声で入力"
          />
        </div>
      )}
    </div>
  );
}
