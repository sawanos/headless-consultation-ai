"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PrimarySummaryCard from "@/components/primary/PrimarySummaryCard";
import ResponseActionButtons from "@/components/primary/ResponseActionButtons";
import VitalsSummaryCard from "@/components/VitalsSummaryCard";
import type { ConsultationCaseV6, PrimaryResponseStatus } from "@/types/consult";

export default function PrimaryReviewPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.caseId as string;
  const [caseData, setCaseData] = useState<ConsultationCaseV6 | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetch("/api/primary/inbox")
      .then((res) => res.json())
      .then((data) => {
        const found = (data.cases as ConsultationCaseV6[]).find((c) => c.id === caseId);
        setCaseData(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [caseId]);

  const handleRespond = async (status: PrimaryResponseStatus, comment: string) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/handoff/record-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, status, comment }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      alert("記録に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center space-y-4">
          <p className="text-lg text-gray-500">ケースが見つかりません</p>
          <button
            onClick={() => router.push("/primary/inbox")}
            className="text-blue-500 hover:text-blue-600"
          >
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl text-green-600">&#10003;</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">記録しました</h1>
          <button
            onClick={() => router.push("/primary/inbox")}
            className="py-3 px-8 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600"
          >
            一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-2xl mx-auto pb-32">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">ケース確認</h1>
        <button
          onClick={() => router.push("/primary/inbox")}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          一覧に戻る
        </button>
      </div>

      <div className="space-y-4">
        {/* Primary summary */}
        {caseData.primaryHandoff && (
          <PrimarySummaryCard handoff={caseData.primaryHandoff} />
        )}

        {/* Remote review info */}
        {caseData.remoteReview && (
          <div className="bg-purple-50 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-purple-700 mb-1">遠隔医師コメント</h3>
            <p className="text-sm text-purple-800">{caseData.remoteReview.clinicianComment}</p>
            <p className="text-xs text-purple-500 mt-1">
              {caseData.remoteReview.reviewerRole === "cardiology_first" ? "循環器" : "専門科"} |{" "}
              {new Date(caseData.remoteReview.createdAt).toLocaleString("ja-JP")}
            </p>
          </div>
        )}

        {/* Details toggle */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          {showDetails ? "詳細を隠す" : "詳細を表示"}
        </button>

        {showDetails && (
          <div className="space-y-4">
            {/* Answers */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="text-sm font-bold text-gray-700 mb-2">問診回答</h3>
              <ul className="space-y-1">
                {caseData.answers.map((a, i) => (
                  <li key={i} className="text-sm text-gray-600">
                    {a.question}: <span className="font-medium">{a.answerLabel}</span>
                  </li>
                ))}
              </ul>
            </div>

            {caseData.vitals && <VitalsSummaryCard vitals={caseData.vitals} />}

            {/* Audit logs */}
            {caseData.auditLogs.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-bold text-gray-700 mb-2">操作履歴</h3>
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
        )}

        {/* Response buttons */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">対応記録</h3>
          <ResponseActionButtons onRespond={handleRespond} submitting={submitting} />
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-500">
            これは医療診断ではありません。観察内容を基にした参考情報です。
          </p>
        </div>
      </div>
    </div>
  );
}
