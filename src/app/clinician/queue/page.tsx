"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReviewQueueTable from "@/components/clinician/ReviewQueueTable";
import type { ConsultationCaseV6 } from "@/types/consult";

export default function ClinicianQueuePage() {
  const router = useRouter();
  const [cases, setCases] = useState<ConsultationCaseV6[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clinician/queue")
      .then((res) => res.json())
      .then((data) => {
        setCases(data.cases || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelect = (caseId: string) => {
    router.push(`/clinician/review/${caseId}`);
  };

  return (
    <div className="px-4 py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">レビューキュー</h1>
        <p className="text-sm text-gray-500 mt-1">
          遠隔医師確認待ちのケース一覧
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <ReviewQueueTable cases={cases} onSelect={handleSelect} />
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          トップに戻る
        </button>
      </div>
    </div>
  );
}
