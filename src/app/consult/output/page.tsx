"use client";

import { useRouter } from "next/navigation";
import { useConsultStore } from "@/lib/store";
import { generateDummyOutput } from "@/lib/llm";
import PriorityBadge from "@/components/PriorityBadge";
import OutputCard from "@/components/OutputCard";
import StickyFooter from "@/components/StickyFooter";
import VitalsSummaryCard from "@/components/VitalsSummaryCard";
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
  const vitalSigns = useConsultStore((s) => s.vitalSigns);
  const freeTextInput = useConsultStore((s) => s.freeTextInput);
  const triageDecision = useConsultStore((s) => s.triageDecision);
  const frontlineGuidance = useConsultStore((s) => s.frontlineGuidance);
  const draftPrimaryHandoff = useConsultStore((s) => s.draftPrimaryHandoff);
  const setCaseStatus = useConsultStore((s) => s.setCaseStatus);

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [ragContext, setRagContext] = useState<string | null>(null);
  const [caseSaved, setCaseSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailResult, setEmailResult] = useState<
    | { success: true; to: string[]; messageId?: string }
    | { success: false; error: string }
    | null
  >(null);

  const bucket = triageDecision?.bucket;

  useEffect(() => {
    if (!category || !assessment) {
      router.replace("/consult/start");
      return;
    }
    if (!output) {
      setGenerating(true);
      fetch("/api/consult/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          answers,
          assessment,
          ...(vitalSigns ? { vitals: vitalSigns } : {}),
          ...(freeTextInput ? { freeText: freeTextInput } : {}),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          const { ragContext: ctx, ...outputData } = data;
          setOutput(outputData);
          setRagContext(ctx || null);
          setGenerating(false);
        })
        .catch(() => {
          const dummy = generateDummyOutput(category, answers, assessment);
          setOutput(dummy);
          setGenerating(false);
        });
    }
  }, [category, answers, assessment, output, setOutput, router]);

  // Save case to case-store (v6)
  useEffect(() => {
    if (caseSaved || !caseId || !category || !triageDecision) return;
    const status = bucket === "clinician_review" ? "awaiting_clinician_review" : "ai_completed";
    fetch("/api/consult/save-case", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId,
        category,
        answers,
        vitals: vitalSigns ?? null,
        freeText: freeTextInput ?? null,
        triage: triageDecision,
        frontlineGuidance: useConsultStore.getState().frontlineGuidance,
        primaryHandoff: draftPrimaryHandoff ?? null,
        primaryPhysicianEmail: useConsultStore.getState().primaryPhysicianEmail,
        status,
      }),
    })
      .then(() => {
        setCaseSaved(true);
        setCaseStatus(status);

        // 即時通知を試行
        if (draftPrimaryHandoff?.notificationPolicy.immediateEmailEligible) {
          fetch("/api/notifications/immediate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ caseId }),
          }).catch(() => {/* 失敗時は手動共有にフォールバック */});
        }
      })
      .catch(() => {
        // silent fail
      });
  }, [caseId, category, triageDecision, caseSaved]);

  const handleSend = async () => {
    if (!caseId || !startedAt) return;
    if (!draftPrimaryHandoff) {
      alert("Handoff が未生成です。もう一度お試しください。");
      return;
    }
    setSending(true);
    setEmailResult(null);
    try {
      // 1) レガシー記録（既存挙動の保持）
      await fetch("/api/consult/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, startedAt, edited: false }),
      }).catch(() => {/* legacy: 失敗しても無視 */});

      // 2) 主治医メール送信（payload を直接送ることで case-store 依存を回避）
      const emailTo =
        useConsultStore.getState().primaryPhysicianEmail || null;
      const res = await fetch("/api/notifications/send-handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          caseId,
          handoff: draftPrimaryHandoff,
          to: emailTo,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailResult({
          success: true,
          to: data.to || [],
          messageId: data.messageId,
        });
        setSent(true);
      } else {
        setEmailResult({
          success: false,
          error: data.error || `HTTP ${res.status}`,
        });
        // 送信失敗でも sent 画面には進ませず、エラーをそのまま表示
      }
    } catch (e) {
      setEmailResult({
        success: false,
        error: e instanceof Error ? e.message : "送信に失敗しました",
      });
    } finally {
      setSending(false);
    }
  };

  const handleCopyHandoff = async () => {
    if (!draftPrimaryHandoff) return;
    try {
      await navigator.clipboard.writeText(draftPrimaryHandoff.shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API 非対応時のフォールバック
      const textarea = document.createElement("textarea");
      textarea.value = draftPrimaryHandoff.shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (!draftPrimaryHandoff) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${draftPrimaryHandoff.headline}</title>
      <style>body{font-family:sans-serif;padding:2em;line-height:1.8}h1{font-size:1.2em}h2{font-size:1em;margin-top:1.5em;border-bottom:1px solid #ccc}ul{padding-left:1.5em}li{margin:0.3em 0}.footer{margin-top:2em;font-size:0.8em;color:#888}</style>
      </head><body>
      <h1>${draftPrimaryHandoff.headline}</h1>
      <h2>観察情報</h2><ul>${draftPrimaryHandoff.observationSummary.map((s) => `<li>${s}</li>`).join("")}</ul>
      <h2>バイタル</h2><ul>${draftPrimaryHandoff.vitalSummary.map((s) => `<li>${s}</li>`).join("")}</ul>
      <h2>懸念点</h2><ul>${draftPrimaryHandoff.concernPoints.map((s) => `<li>${s}</li>`).join("")}</ul>
      <h2>一般的医学情報</h2><ul>${draftPrimaryHandoff.generalMedicalInfo.map((s) => `<li>${s}</li>`).join("")}</ul>
      <h2>連絡優先度</h2><p>${draftPrimaryHandoff.recommendedEscalationLevel}</p>
      <p class="footer">${draftPrimaryHandoff.authoredBy === "AI" ? "AI による整理" : "遠隔医師確認済み"} / これは医療診断ではなく一般的医学情報に基づく参考情報です。</p>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
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
            {bucket === "clinician_review"
              ? "遠隔医師による確認が完了次第、主治医への通知が行われます。"
              : "状態の変化があればすぐに医師へ連絡してください。"}
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

  // 通知ステータス表示
  const notificationLabel = draftPrimaryHandoff?.notificationPolicy
    ? draftPrimaryHandoff.notificationPolicy.immediateEmailEligible
      ? "即時通知対象"
      : draftPrimaryHandoff.notificationPolicy.includeInDailyDigest
        ? "日次ダイジェスト対象"
        : "手動共有"
    : null;

  const escalationLabels: Record<string, string> = {
    emergency: "緊急",
    same_day: "当日中",
    within_24h: "24時間以内",
    observe: "経過観察",
  };

  return (
    <div className="px-4 py-8 pb-40">
      <div className="flex items-center gap-3 mb-6">
        <PriorityBadge priority={assessment.priority} size="sm" />
        <h1 className="text-xl font-bold text-gray-800">相談文と主治医 Handoff</h1>
      </div>

      {/* Clinician review status banner */}
      {bucket === "clinician_review" && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
          <p className="text-sm font-medium text-orange-700">
            遠隔医師確認待ち
          </p>
          <p className="text-xs text-orange-600 mt-1">
            このケースは遠隔医師による確認が行われます。現場向け行動は下記を参考にしてください。
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* 1. 現場向け guidance */}
        {frontlineGuidance && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-blue-700 mb-3">現場向けガイダンス</h3>
            <p className="text-lg font-medium text-blue-800 mb-2">{frontlineGuidance.urgencyLabel}</p>
            <p className="text-sm text-blue-700 mb-3">{frontlineGuidance.actionMessage}</p>
            {frontlineGuidance.nextChecks.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-blue-600 mb-1">追加確認項目:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  {frontlineGuidance.nextChecks.map((c, i) => (
                    <li key={i}>- {c}</li>
                  ))}
                </ul>
              </div>
            )}
            {frontlineGuidance.safetyNotes.map((n, i) => (
              <p key={i} className="text-xs text-blue-600 mt-1">{n}</p>
            ))}
          </div>
        )}

        {/* 2. 主治医向け handoff card */}
        {draftPrimaryHandoff && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-green-700">主治医向け Handoff</h3>
              <div className="flex items-center gap-2">
                {notificationLabel && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    draftPrimaryHandoff.notificationPolicy.immediateEmailEligible
                      ? "bg-red-100 text-red-700"
                      : draftPrimaryHandoff.notificationPolicy.includeInDailyDigest
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                  }`}>
                    {notificationLabel}
                  </span>
                )}
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                  {escalationLabels[draftPrimaryHandoff.recommendedEscalationLevel] || draftPrimaryHandoff.recommendedEscalationLevel}
                </span>
              </div>
            </div>
            <p className="text-base font-medium text-green-800 mb-2">{draftPrimaryHandoff.headline}</p>

            {draftPrimaryHandoff.concernPoints.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-green-600">懸念点:</p>
                <ul className="text-sm text-green-700">
                  {draftPrimaryHandoff.concernPoints.map((c, i) => (
                    <li key={i}>- {c}</li>
                  ))}
                </ul>
              </div>
            )}

            {draftPrimaryHandoff.generalMedicalInfo.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-green-600">一般的医学情報:</p>
                <ul className="text-sm text-green-700">
                  {draftPrimaryHandoff.generalMedicalInfo.map((g, i) => (
                    <li key={i}>- {g}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-green-500 mt-2">
              {draftPrimaryHandoff.authoredBy === "AI" ? "AI による整理" : "遠隔医師確認済み"}
            </p>

            {bucket === "clinician_review" && (
              <p className="text-xs text-orange-500 mt-1">
                遠隔医師確認後に最終版が作成されます
              </p>
            )}
          </div>
        )}

        {/* 3. Handoff actions */}
        {draftPrimaryHandoff && (
          <div className="flex gap-3">
            <button
              onClick={handleCopyHandoff}
              className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {copied ? "コピーしました" : "Handoff をコピー"}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 py-3 text-sm font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              印刷する
            </button>
          </div>
        )}

        {/* 4. 既存出力（SBAR等） */}
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

        {vitalSigns && <VitalsSummaryCard vitals={vitalSigns} />}

        {ragContext && (
          <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-100">
            <h3 className="text-sm font-bold text-purple-500 uppercase mb-2">
              参考資料（ガイドライン）
            </h3>
            <p className="text-sm text-purple-700 whitespace-pre-wrap leading-relaxed">
              {ragContext}
            </p>
          </div>
        )}

        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-sm text-gray-500">
            {assessment.safetyNote}
          </p>
        </div>
      </div>

      <StickyFooter>
        <div className="space-y-3">
          {emailResult && !emailResult.success && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p className="font-medium">メール送信に失敗しました</p>
              <p className="text-xs mt-1 break-words">{emailResult.error}</p>
            </div>
          )}
          {emailResult && emailResult.success && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              <p className="font-medium">主治医メールを送信しました</p>
              {emailResult.to.length > 0 && (
                <p className="text-xs mt-1 break-words">
                  宛先: {emailResult.to.join(", ")}
                </p>
              )}
            </div>
          )}
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
