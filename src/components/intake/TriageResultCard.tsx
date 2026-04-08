"use client";

import type { TriageDecision, FrontlineGuidanceV6 } from "@/types/consult";
import PriorityBadge from "@/components/PriorityBadge";

type TriageResultCardProps = {
  triage: TriageDecision;
  guidance: FrontlineGuidanceV6;
};

export default function TriageResultCard({ triage, guidance }: TriageResultCardProps) {
  const bucketConfig = {
    emergency_bypass: {
      bg: "bg-red-50",
      border: "border-red-300",
      label: "緊急対応が必要です",
      description: "すぐに通常救急導線（119番・主治医直接連絡）を検討してください",
    },
    clinician_review: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      label: "遠隔医師による確認が行われます",
      description: "現場向け行動は下記を参考にしてください",
    },
    ai_only: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      label: "AI による整理が完了しました",
      description: "",
    },
  };

  const config = bucketConfig[triage.bucket];

  return (
    <div className={`${config.bg} border-2 ${config.border} rounded-2xl p-5 space-y-4`}>
      <div className="flex items-center gap-3">
        <PriorityBadge priority={triage.priority} size="sm" />
        <span className="text-base font-bold text-gray-800">{config.label}</span>
      </div>

      {config.description && (
        <p className="text-sm text-gray-600">{config.description}</p>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">{guidance.urgencyLabel}</p>
        <p className="text-base text-gray-800">{guidance.actionMessage}</p>
      </div>

      {guidance.nextChecks.length > 0 && guidance.nextChecks[0] && (
        <div className="bg-white/60 rounded-xl p-3">
          <h4 className="text-sm font-bold text-amber-700 mb-1">追加で確認</h4>
          {guidance.nextChecks.map((check, i) => (
            <p key={i} className="text-sm text-gray-700">{check}</p>
          ))}
        </div>
      )}

      {guidance.safetyNotes.map((note, i) => (
        <p key={i} className="text-xs text-gray-500">{note}</p>
      ))}
    </div>
  );
}
