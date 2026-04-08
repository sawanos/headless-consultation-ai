"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import InboxItem from "@/components/primary/InboxItem";
import type { ConsultationCaseV6 } from "@/types/consult";

export default function PrimaryInboxPage() {
  const router = useRouter();
  const [cases, setCases] = useState<ConsultationCaseV6[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/primary/inbox")
      .then((res) => res.json())
      .then((data) => {
        setCases(data.cases || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="px-4 py-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">通知一覧</h1>
        <p className="text-sm text-gray-500 mt-1">
          確認が必要なケース
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">通知はありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <InboxItem
              key={c.id}
              caseData={c}
              onClick={() => router.push(`/primary/review/${c.id}`)}
            />
          ))}
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
