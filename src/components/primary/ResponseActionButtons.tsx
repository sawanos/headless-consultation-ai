"use client";

import type { PrimaryResponseStatus } from "@/types/consult";

type ResponseActionButtonsProps = {
  onRespond: (status: PrimaryResponseStatus, comment: string) => void;
  submitting: boolean;
};

const RESPONSE_OPTIONS: { value: PrimaryResponseStatus; label: string; color: string }[] = [
  { value: "accepted", label: "了解・対応します", color: "bg-green-500 hover:bg-green-600" },
  { value: "held", label: "保留（検討中）", color: "bg-yellow-500 hover:bg-yellow-600" },
  { value: "declined", label: "対応不要と判断", color: "bg-gray-500 hover:bg-gray-600" },
  { value: "already_handled", label: "すでに対応済み", color: "bg-blue-500 hover:bg-blue-600" },
];

import { useState } from "react";

export default function ResponseActionButtons({ onRespond, submitting }: ResponseActionButtonsProps) {
  const [selected, setSelected] = useState<PrimaryResponseStatus | null>(null);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (!selected) return;
    onRespond(selected, comment);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {RESPONSE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            disabled={submitting}
            className={`w-full py-3 text-white font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 ${
              selected === opt.value
                ? `${opt.color} ring-2 ring-offset-2 ring-blue-400`
                : `${opt.color} opacity-70`
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div>
        <label className="text-sm text-gray-600">コメント（任意）</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          className="w-full rounded-xl border border-gray-200 p-3 text-sm mt-1 focus:border-blue-400 focus:outline-none"
          placeholder="コメントがあれば..."
        />
      </div>

      {selected && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          {submitting ? "記録中..." : "記録する"}
        </button>
      )}
    </div>
  );
}
