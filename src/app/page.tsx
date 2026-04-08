"use client";

import { useRouter } from "next/navigation";
import { useConsultStore } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const startConsult = useConsultStore((s) => s.startConsult);

  const handleStart = () => {
    startConsult();
    router.push("/consult/start");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="text-center space-y-6 max-w-sm">
        <h1 className="text-3xl font-bold text-gray-800 leading-tight">
          からだの相談サポート
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          気になる変化を選ぶだけで
          <br />
          医師への相談文をつくれます
        </p>

        <button
          onClick={handleStart}
          className="w-full py-5 bg-blue-500 text-white text-2xl font-bold rounded-2xl shadow-lg hover:bg-blue-600 active:scale-[0.98] transition-all"
        >
          相談をはじめる
        </button>

        <div className="bg-yellow-50 rounded-xl p-4 text-left">
          <p className="text-sm text-yellow-700 leading-relaxed">
            このツールは医療診断を行うものではありません。
            観察した内容を医師に伝えるための相談文を作成するサポートツールです。
            緊急時はすぐに医師・救急に連絡してください。
          </p>
        </div>

        {/* 管理者・医師向け導線 */}
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <p className="text-xs text-gray-400">管理者・医師向けメニュー</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/admin/cases")}
              className="flex-1 py-2 text-sm text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
            >
              ケース管理
            </button>
            <button
              onClick={() => router.push("/clinician/queue")}
              className="flex-1 py-2 text-sm text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
            >
              遠隔医師キュー
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
