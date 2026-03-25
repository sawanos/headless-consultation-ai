"use client";

import { useEffect, useState, useCallback } from "react";
import { EncounterLog } from "@/types/consult";
import Link from "next/link";

export default function AdminCasesPage() {
  const [logs, setLogs] = useState<EncounterLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/logs");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      // サーバーエラー時は空配列
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ケース一覧</h1>
        <div className="flex gap-3 text-sm">
          <Link
            href="/admin/docs"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            文書管理
          </Link>
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            トップへ
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-lg text-gray-400">まだケースがありません</p>
          <p className="text-sm text-gray-300 mt-2">
            相談を完了すると、ここに表示されます
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">
                  {new Date(log.startedAt).toLocaleString("ja-JP")}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    log.sent
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {log.sent ? "送信済" : "未送信"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>
                  所要時間: {log.durationSec ? `${log.durationSec}秒` : "-"}
                </span>
                {log.edited && (
                  <span className="text-orange-500">修正あり</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
