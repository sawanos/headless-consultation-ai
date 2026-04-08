"use client";

import type { ConsultationCaseV6 } from "@/types/consult";
import PriorityBadge from "@/components/PriorityBadge";
import VitalsSummaryCard from "@/components/VitalsSummaryCard";
import { concernCategories } from "@/lib/categories";

type CaseDetailPanelProps = {
  caseData: ConsultationCaseV6;
};

export default function CaseDetailPanel({ caseData }: CaseDetailPanelProps) {
  const cat = concernCategories.find((c) => c.id === caseData.category);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        {caseData.triage && <PriorityBadge priority={caseData.triage.priority} size="sm" />}
        <h2 className="text-lg font-bold text-gray-800">
          {cat?.label || caseData.category}
        </h2>
      </div>

      {/* Frontline Guidance (v6) */}
      {caseData.frontlineGuidance && (
        <div className="bg-blue-50 rounded-xl p-4 space-y-2">
          <h3 className="text-sm font-bold text-blue-700">AI ガイダンス</h3>
          <p className="text-sm text-blue-800">{caseData.frontlineGuidance.urgencyLabel}</p>
          <p className="text-sm text-gray-700">{caseData.frontlineGuidance.actionMessage}</p>
          {caseData.frontlineGuidance.nextChecks.length > 0 && (
            <div className="mt-1">
              <p className="text-xs font-medium text-blue-600">次の確認事項:</p>
              <ul className="list-disc list-inside">
                {caseData.frontlineGuidance.nextChecks.map((check, i) => (
                  <li key={i} className="text-xs text-gray-600">{check}</li>
                ))}
              </ul>
            </div>
          )}
          {caseData.frontlineGuidance.safetyNotes.length > 0 && (
            <div className="mt-1">
              <p className="text-xs font-medium text-red-600">安全上の注意:</p>
              <ul className="list-disc list-inside">
                {caseData.frontlineGuidance.safetyNotes.map((note, i) => (
                  <li key={i} className="text-xs text-red-600">{note}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-gray-500">
            レビュー状態: {caseData.frontlineGuidance.reviewStatus}
          </p>
        </div>
      )}

      {/* 回答一覧 */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-2">問診回答</h3>
        <ul className="space-y-1">
          {caseData.answers.map((a, i) => (
            <li key={i} className="text-sm text-gray-600">
              <span className="text-gray-500">{a.question}:</span>{" "}
              <span className="font-medium">{a.answerLabel}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* バイタル */}
      {caseData.vitals && <VitalsSummaryCard vitals={caseData.vitals} />}

      {/* 構造化自由記述 */}
      {caseData.freeText && caseData.freeText.rawText && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-700 mb-2">追加観察メモ</h3>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{caseData.freeText.rawText}</p>
          {caseData.freeText.isStructured && caseData.freeText.structured.length > 0 && (
            <div className="mt-2 space-y-1">
              {caseData.freeText.structured.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s.type}</span>
                  <span className="text-sm text-gray-700">{s.content}</span>
                  {s.urgencyContribution === "high" && (
                    <span className="text-xs bg-red-100 text-red-600 px-1 rounded">高緊急</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Draft Primary Handoff (v6) */}
      {caseData.primaryHandoff && (
        <div className="bg-green-50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-green-700 mb-2">AI ドラフト主治医ハンドオフ</h3>
          <p className="text-sm text-gray-800 font-medium">{caseData.primaryHandoff.headline}</p>
          {caseData.primaryHandoff.concernPoints.map((cp, i) => (
            <p key={i} className="text-sm text-gray-600 mt-1">- {cp}</p>
          ))}
          {caseData.primaryHandoff.generalMedicalInfo.map((info, i) => (
            <p key={i} className="text-sm text-gray-600 mt-1">{info}</p>
          ))}
          {caseData.primaryHandoff.shareText && (
            <div className="mt-2 p-2 bg-white rounded-lg border border-green-200">
              <p className="text-xs text-green-600 font-medium mb-1">共有テキスト:</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{caseData.primaryHandoff.shareText}</p>
            </div>
          )}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-500">推奨チャネル:</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{caseData.primaryHandoff.recommendedChannel}</span>
          </div>
        </div>
      )}

      {/* 監査ログ */}
      {caseData.auditLogs.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">監査ログ</h3>
          <ul className="space-y-1">
            {caseData.auditLogs.map((log, i) => (
              <li key={i} className="text-xs text-gray-500">
                {new Date(log.at).toLocaleString("ja-JP")} [{log.actorType}] {log.summary}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
