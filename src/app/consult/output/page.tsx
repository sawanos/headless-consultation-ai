"use client";

import { useRouter } from "next/navigation";
import { useConsultStore } from "@/lib/store";
import { generateDummyOutput } from "@/lib/llm";
import PriorityBadge from "@/components/PriorityBadge";
import OutputCard from "@/components/OutputCard";
import StickyFooter from "@/components/StickyFooter";
import { useEffect, useState } from "react";

export default function OutputPage() {
  const router = useRouter();
  const category = useConsultStore((s) => s.category);
  const answers = useConsultStore((s) => s.answers);
  const assessment = useConsultStore((s) => s.assessment);
  const output = useConsultStore((s) => s.output);
  const setOutput = useConsultStore((s) => s.setOutput);
  const caseId = useConsultStore((s) => s.caseId);
  const startedAt = useConsultStore((s) => s.startedAt);
  const reset = useConsultStore((s) => s.reset);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!category || !assessment) {
      router.replace("/consult/start");
      return;
    }
    if (!output) {
      setGenerating(true);
      // API経由で生成を試みる
      fetch("/api/consult/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, answers, assessment }),
      })
        .then((res) => res.json())
        .then((data) => {
          setOutput(data);
          setGenerating(false);
        })
        .catch(() => {
          // フォールバック: ダミー出力
          const dummy = generateDummyOutput(category, answers, assessment);
          setOutput(dummy);
          setGenerating(false);
        });
    }
  }, [category, answers, assessment, output, setOutput, router]);

  const handleSend = async () => {
    if (!caseId || !startedAt) return;
    setSending(true);
    try {
      await fetch("/api/consult/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, startedAt, edited: false }),
      });
      setSent(true);
    } catch {
      alert("送信に失敗しました。もう一度お試しください。");
    } finally {
      setSending(false);
    }
  };

  const handleHold = () => {
    reset();
    router.push("/");
  };

  const handleNewConsult = () => {
    reset();
    router.push("/");
  };

  if (generating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-lg text-gray-500">相談文を作成中...</p>
        </div>
      </div>
    );
  }

  if (!output || !assessment) return null;

  if (sent) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl text-green-600">&#10003;</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">送信しました</h1>
          <p className="text-base text-gray-500">
            相談文が記録されました。
            <br />
            状態の変化があればすぐに医師へ連絡してください。
          </p>
          <button
            onClick={handleNewConsult}
            className="w-full py-4 bg-blue-500 text-white text-xl font-bold rounded-2xl hover:bg-blue-600 active:scale-[0.98] transition-all"
          >
            トップに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 pb-40">
      <div className="flex items-center gap-3 mb-6">
        <PriorityBadge priority={assessment.priority} size="sm" />
        <h1 className="text-xl font-bold text-gray-800">相談文</h1>
      </div>

      <div className="space-y-4">
        <OutputCard
          title="サマリー"
          content={output.summary}
          variant="highlight"
        />
        <OutputCard title="SBAR" content={output.sbar} />
        <OutputCard
          title="医師への相談メッセージ"
          content={output.doctorMessage}
          variant="highlight"
        />
        <OutputCard title="申し送り" content={output.handoverText} />

        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-sm text-gray-500">
            {assessment.safetyNote}
          </p>
        </div>
      </div>

      <StickyFooter>
        <div className="space-y-3">
          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full py-4 bg-blue-500 text-white text-xl font-bold rounded-2xl hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {sending ? "送信中..." : "この内容で送信する"}
          </button>
          <button
            onClick={handleHold}
            className="w-full py-3 text-base text-gray-400 hover:text-gray-600 transition-colors"
          >
            保留にする
          </button>
        </div>
      </StickyFooter>
    </div>
  );
}
