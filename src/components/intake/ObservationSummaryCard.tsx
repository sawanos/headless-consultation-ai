"use client";

import type { PrimaryPhysicianSummary } from "@/types/consult";

type ObservationSummaryCardProps = {
  summary: PrimaryPhysicianSummary;
};

export default function ObservationSummaryCard({ summary }: ObservationSummaryCardProps) {
  const authorLabel = summary.authoredBy === "AI" ? "AI による整理" : "遠隔医師（循環器）による確認済み";

  const escalationLabel = {
    emergency: "緊急",
    same_day: "当日中",
    within_24h: "24時間以内",
    observe: "経過観察",
  }[summary.recommendedEscalationLevel];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">主治医向けサマリ</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {authorLabel}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-1">要約</h4>
          <p className="text-base text-gray-800 font-medium">{summary.headline}</p>
        </div>

        {summary.observationSummary.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">観察情報</h4>
            <ul className="space-y-1">
              {summary.observationSummary.map((obs, i) => (
                <li key={i} className="text-sm text-gray-700">- {obs}</li>
              ))}
            </ul>
          </div>
        )}

        {summary.vitalSummary.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">バイタル</h4>
            <ul className="space-y-1">
              {summary.vitalSummary.map((v, i) => (
                <li key={i} className="text-sm text-gray-700">- {v}</li>
              ))}
            </ul>
          </div>
        )}

        {summary.concernPoints.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">懸念点</h4>
            <ul className="space-y-1">
              {summary.concernPoints.map((cp, i) => (
                <li key={i} className="text-sm text-gray-700">- {cp}</li>
              ))}
            </ul>
          </div>
        )}

        {summary.generalMedicalInfo.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">一般的医学情報</h4>
            <ul className="space-y-1">
              {summary.generalMedicalInfo.map((info, i) => (
                <li key={i} className="text-sm text-gray-700">{info}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-500">連絡優先度:</span>
          <span className="text-sm font-medium text-gray-800">{escalationLabel}</span>
        </div>
      </div>
    </div>
  );
}
