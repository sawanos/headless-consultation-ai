"use client";

import type { PrimaryHandoffPackage } from "@/types/consult";
import EscalationBadge from "@/components/clinician/EscalationBadge";

type PrimarySummaryCardProps = {
  handoff: PrimaryHandoffPackage;
};

export default function PrimarySummaryCard({ handoff }: PrimarySummaryCardProps) {
  const authorLabel = handoff.authoredBy === "AI"
    ? "AI による整理"
    : "遠隔医師（循環器）による確認済み";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">{handoff.headline}</h2>
        <EscalationBadge level={handoff.recommendedEscalationLevel} />
      </div>

      <p className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded inline-block">
        {authorLabel}
      </p>

      {handoff.observationSummary.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">観察情報</h3>
          <ul className="space-y-1">
            {handoff.observationSummary.map((obs, i) => (
              <li key={i} className="text-sm text-gray-700">- {obs}</li>
            ))}
          </ul>
        </div>
      )}

      {handoff.vitalSummary.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">バイタル</h3>
          <ul className="space-y-1">
            {handoff.vitalSummary.map((v, i) => (
              <li key={i} className="text-sm text-gray-700">- {v}</li>
            ))}
          </ul>
        </div>
      )}

      {handoff.concernPoints.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">懸念点</h3>
          <ul className="space-y-1">
            {handoff.concernPoints.map((cp, i) => (
              <li key={i} className="text-sm text-gray-700">- {cp}</li>
            ))}
          </ul>
        </div>
      )}

      {handoff.generalMedicalInfo.length > 0 && (
        <div className="bg-blue-50 rounded-xl p-4">
          <h3 className="text-sm font-medium text-blue-700 mb-1">一般的医学情報（参考）</h3>
          <ul className="space-y-1">
            {handoff.generalMedicalInfo.map((info, i) => (
              <li key={i} className="text-sm text-blue-800">{info}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
