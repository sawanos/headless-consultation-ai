"use client";

import type { ConsultationCaseV6 } from "@/types/consult";
import PriorityBadge from "@/components/PriorityBadge";
import EscalationBadge from "@/components/clinician/EscalationBadge";
import { concernCategories } from "@/lib/categories";

type InboxItemProps = {
  caseData: ConsultationCaseV6;
  onClick: () => void;
};

export default function InboxItem({ caseData, onClick }: InboxItemProps) {
  const cat = concernCategories.find((c) => c.id === caseData.category);
  const handoff = caseData.primaryHandoff;

  const time = new Date(caseData.updatedAt).toLocaleString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {caseData.triage && <PriorityBadge priority={caseData.triage.priority} size="sm" />}
          <span className="text-sm font-medium text-gray-800">
            {cat?.label || caseData.category}
          </span>
        </div>
        <span className="text-xs text-gray-400">{time}</span>
      </div>

      {handoff && (
        <>
          <p className="text-sm text-gray-700 font-medium">{handoff.headline}</p>
          <div className="flex items-center gap-2">
            <EscalationBadge level={handoff.recommendedEscalationLevel} />
            <span className="text-xs text-gray-500">
              {handoff.authoredBy === "AI" ? "AI による整理" : "遠隔医師確認済み"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
