"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CaseDetailPanel from "@/components/clinician/CaseDetailPanel";
import ReviewComposer from "@/components/clinician/ReviewComposer";
import type { ConsultationCaseV6, ClinicianDispositionV6, PrimaryHandoffPackage } from "@/types/consult";

export default function ClinicianReviewPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.caseId as string;
  const [caseData, setCaseData] = useState<ConsultationCaseV6 | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/clinician/queue")
      .then((res) => res.json())
      .then((data) => {
        const found = (data.cases as ConsultationCaseV6[]).find((c) => c.id === caseId);
        setCaseData(found || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [caseId]);

  const handleSubmit = async (data: {
    disposition: ClinicianDispositionV6;
    clinicianComment: string;
    primaryHandoffOverride: PrimaryHandoffPackage;
  }) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/clinician/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          reviewerId: "clinician-001",
          reviewerRole: "cardiology_first",
          disposition: data.disposition,
          clinicianComment: data.clinicianComment,
          primaryHandoffOverride: data.primaryHandoffOverride,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
        // v6: status becomes handoff_ready on the server side.
        // No separate /api/primary/notify call needed.
      }
    } catch {
      alert("保存に失敗しました");
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
            onClick={() => router.push("/clinician/queue")}
            className="text-blue-500 hover:text-blue-600"
          >
            キューに戻る
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
          <h1 className="text-2xl font-bold text-gray-800">レビューを保存しました</h1>
          <button
            onClick={() => router.push("/clinician/queue")}
            className="py-3 px-8 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600"
          >
            キューに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">ケースレビュー</h1>
        <button
          onClick={() => router.push("/clinician/queue")}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          キューに戻る
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Case info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <CaseDetailPanel caseData={caseData} />
        </div>

        {/* Right: Review composer */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <ReviewComposer
            caseData={caseData}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        </div>
      </div>
    </div>
  );
}
