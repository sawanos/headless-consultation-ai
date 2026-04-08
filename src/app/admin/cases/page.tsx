"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type {
  ConsultationCaseV6,
  CaseStatusV6,
  TriageBucket,
  ManagerClinicalReviewStatus,
} from "@/types/consult";

const STATUS_LABELS: Record<CaseStatusV6, string> = {
  draft: "下書き",
  submitted: "送信済",
  ai_structuring: "AI 処理中",
  ai_triaged: "AI 判定済",
  ai_completed: "AI 完結",
  emergency_bypass: "救急導線",
  awaiting_clinician_review: "医師レビュー待ち",
  clinician_reviewing: "レビュー中",
  handoff_ready: "Handoff 準備完了",
  handoff_shared: "共有済み",
  response_recorded: "反応記録済",
  closed: "クローズ",
};

const BUCKET_LABELS: Record<TriageBucket, string> = {
  ai_only: "AI 完結",
  clinician_review: "医師レビュー",
  emergency_bypass: "救急導線",
};

const ESCALATION_LABELS: Record<string, string> = {
  emergency: "緊急",
  same_day: "当日",
  within_24h: "24h以内",
  observe: "経過観察",
};

type FilterKey = "all" | CaseStatusV6 | "ai_only" | "clinician_review" | "emergency_bypass" | "handoff_pending";

export default function AdminCasesPage() {
  const [cases, setCases] = useState<ConsultationCaseV6[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedCase, setSelectedCase] = useState<ConsultationCaseV6 | null>(null);

  // Manager clinical review form
  const [reviewStatus, setReviewStatus] = useState<ManagerClinicalReviewStatus>("no_issue");
  const [reviewNote, setReviewNote] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Handoff share form
  const [shareSubmitting, setShareSubmitting] = useState(false);

  // Response form
  const [responseStatus, setResponseStatus] = useState<"accepted" | "held" | "declined" | "already_handled">("accepted");
  const [responseComment, setResponseComment] = useState("");
  const [responseSubmitting, setResponseSubmitting] = useState(false);

  const fetchCases = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cases");
      const data = await res.json();
      setCases(data.cases || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const filteredCases = cases.filter((c) => {
    if (filter === "all") return true;
    if (filter === "ai_only") return c.triage?.bucket === "ai_only";
    if (filter === "clinician_review") return c.triage?.bucket === "clinician_review";
    if (filter === "emergency_bypass") return c.triage?.bucket === "emergency_bypass" || c.status === "emergency_bypass";
    if (filter === "handoff_pending") return c.primaryHandoff && !c.handoffDelivery?.shared;
    return c.status === filter;
  });

  const counts = {
    all: cases.length,
    awaiting_clinician_review: cases.filter((c) => c.status === "awaiting_clinician_review").length,
    handoff_pending: cases.filter((c) => c.primaryHandoff && !c.handoffDelivery?.shared).length,
    emergency_bypass: cases.filter((c) => c.status === "emergency_bypass").length,
    ai_only: cases.filter((c) => c.triage?.bucket === "ai_only").length,
  };

  const handleClinicalReview = async () => {
    if (!selectedCase) return;
    setReviewSubmitting(true);
    try {
      await fetch("/api/admin/record-clinical-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedCase.id,
          status: reviewStatus,
          reviewerRole: "manager",
          reviewedBy: "manager-001",
          note: reviewNote || undefined,
        }),
      });
      await fetchCases();
      setSelectedCase(cases.find((c) => c.id === selectedCase.id) || null);
      setReviewNote("");
    } catch {
      alert("記録に失敗しました");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleMarkShared = async () => {
    if (!selectedCase) return;
    setShareSubmitting(true);
    try {
      await fetch("/api/handoff/mark-shared", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedCase.id,
          actorId: "manager-001",
          channel: "copy_text",
        }),
      });
      await fetchCases();
    } catch {
      alert("記録に失敗しました");
    } finally {
      setShareSubmitting(false);
    }
  };

  const handleRecordResponse = async () => {
    if (!selectedCase) return;
    setResponseSubmitting(true);
    try {
      await fetch("/api/handoff/record-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedCase.id,
          actorId: "manager-001",
          status: responseStatus,
          comment: responseComment || undefined,
          recordedBy: "manager",
        }),
      });
      await fetchCases();
      setResponseComment("");
    } catch {
      alert("記録に失敗しました");
    } finally {
      setResponseSubmitting(false);
    }
  };

  const handleCloseCase = async () => {
    if (!selectedCase) return;
    try {
      await fetch("/api/consult/save-case", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: selectedCase.id,
          category: selectedCase.category,
          answers: selectedCase.answers,
          status: "closed",
        }),
      });
      await fetchCases();
    } catch {
      alert("クローズに失敗しました");
    }
  };

  const filterButtons: { key: FilterKey; label: string; count?: number; highlight?: boolean }[] = [
    { key: "all", label: "すべて", count: counts.all },
    { key: "emergency_bypass", label: "救急", count: counts.emergency_bypass, highlight: counts.emergency_bypass > 0 },
    { key: "awaiting_clinician_review", label: "レビュー待ち", count: counts.awaiting_clinician_review, highlight: counts.awaiting_clinician_review > 0 },
    { key: "handoff_pending", label: "Handoff 未共有", count: counts.handoff_pending, highlight: counts.handoff_pending > 0 },
    { key: "ai_only", label: "AI 完結", count: counts.ai_only },
    { key: "closed", label: "クローズ" },
  ];

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ケース管理</h1>
        <div className="flex gap-3 text-sm">
          <Link href="/admin/docs" className="text-blue-500 hover:text-blue-600 font-medium">文書管理</Link>
          <Link href="/clinician/queue" className="text-orange-500 hover:text-orange-600 font-medium">医師キュー</Link>
          <Link href="/" className="text-blue-500 hover:text-blue-600 font-medium">トップへ</Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {counts.emergency_bypass > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{counts.emergency_bypass}</p>
            <p className="text-xs text-red-500">救急切替</p>
          </div>
        )}
        <div className={`${counts.awaiting_clinician_review > 0 ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"} border rounded-xl p-4 text-center`}>
          <p className="text-2xl font-bold text-gray-800">{counts.awaiting_clinician_review}</p>
          <p className="text-xs text-gray-500">レビュー待ち</p>
        </div>
        <div className={`${counts.handoff_pending > 0 ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200"} border rounded-xl p-4 text-center`}>
          <p className="text-2xl font-bold text-gray-800">{counts.handoff_pending}</p>
          <p className="text-xs text-gray-500">Handoff 未共有</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{counts.all}</p>
          <p className="text-xs text-gray-500">全ケース</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterButtons.map((fb) => (
          <button
            key={fb.key}
            onClick={() => { setFilter(fb.key); setSelectedCase(null); }}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              filter === fb.key
                ? "bg-blue-500 text-white"
                : fb.highlight
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {fb.label}{fb.count !== undefined ? ` (${fb.count})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Case list */}
          <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto">
            {filteredCases.length === 0 ? (
              <p className="text-center py-12 text-gray-400">該当するケースがありません</p>
            ) : (
              filteredCases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCase(c)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    selectedCase?.id === c.id
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">
                      {new Date(c.createdAt).toLocaleString("ja-JP")}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.status === "emergency_bypass" ? "bg-red-100 text-red-700"
                        : c.status === "awaiting_clinician_review" ? "bg-orange-100 text-orange-700"
                          : c.status === "ai_completed" ? "bg-blue-100 text-blue-700"
                            : c.status === "closed" ? "bg-gray-100 text-gray-500"
                              : "bg-green-100 text-green-700"
                    }`}>
                      {STATUS_LABELS[c.status] || c.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {c.primaryHandoff?.headline || c.triage?.syndrome || c.category}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {c.triage && (
                      <span className="text-xs text-gray-500">{BUCKET_LABELS[c.triage.bucket]}</span>
                    )}
                    {c.primaryHandoff && (
                      <span className="text-xs text-gray-500">
                        {ESCALATION_LABELS[c.primaryHandoff.recommendedEscalationLevel]}
                      </span>
                    )}
                    {c.handoffDelivery?.shared && (
                      <span className="text-xs text-green-600">共有済</span>
                    )}
                    {c.managerClinicalReview && (
                      <span className={`text-xs ${
                        c.managerClinicalReview.status === "follow_up_needed"
                          ? "text-orange-600" : "text-green-600"
                      }`}>
                        {c.managerClinicalReview.status === "no_issue" ? "問題なし"
                          : c.managerClinicalReview.status === "follow_up_needed" ? "要フォロー"
                            : "対応済み"}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Case detail */}
          <div className="lg:col-span-2">
            {selectedCase ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-800">ケース詳細</h2>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedCase.status === "emergency_bypass" ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {STATUS_LABELS[selectedCase.status]}
                  </span>
                </div>

                {/* Triage info */}
                {selectedCase.triage && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">トリアージ</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-gray-500">優先度:</span> {selectedCase.triage.priority}</div>
                      <div><span className="text-gray-500">分岐:</span> {BUCKET_LABELS[selectedCase.triage.bucket]}</div>
                      <div><span className="text-gray-500">症候群:</span> {selectedCase.triage.syndrome}</div>
                      <div><span className="text-gray-500">専門科:</span> {selectedCase.triage.candidateSpecialty}</div>
                    </div>
                    {selectedCase.triage.missingFields.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">不足情報:</p>
                        <ul className="text-xs text-gray-600">
                          {selectedCase.triage.missingFields.map((f, i) => <li key={i}>- {f}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Frontline guidance */}
                {selectedCase.frontlineGuidance && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-blue-700 mb-2">現場向けガイダンス</h3>
                    <p className="text-sm font-medium text-blue-800">{selectedCase.frontlineGuidance.urgencyLabel}</p>
                    <p className="text-sm text-blue-700">{selectedCase.frontlineGuidance.actionMessage}</p>
                  </div>
                )}

                {/* Handoff */}
                {selectedCase.primaryHandoff && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-green-700 mb-2">主治医向け Handoff</h3>
                    <p className="text-sm font-medium text-green-800">{selectedCase.primaryHandoff.headline}</p>
                    {selectedCase.primaryHandoff.concernPoints.map((cp, i) => (
                      <p key={i} className="text-sm text-green-700">- {cp}</p>
                    ))}
                    {selectedCase.primaryHandoff.generalMedicalInfo.map((g, i) => (
                      <p key={i} className="text-sm text-green-600">{g}</p>
                    ))}
                    <p className="text-xs text-green-500 mt-2">
                      優先度: {ESCALATION_LABELS[selectedCase.primaryHandoff.recommendedEscalationLevel]}
                      {" / "}
                      {selectedCase.primaryHandoff.authoredBy === "AI" ? "AI 整理" : "医師確認済"}
                    </p>
                  </div>
                )}

                {/* Remote review */}
                {selectedCase.remoteReview && (
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-purple-700 mb-2">遠隔医師レビュー</h3>
                    <p className="text-sm text-purple-700">Disposition: {selectedCase.remoteReview.disposition}</p>
                    <p className="text-sm text-purple-600">{selectedCase.remoteReview.clinicianComment}</p>
                  </div>
                )}

                {/* Handoff delivery */}
                {selectedCase.handoffDelivery && (
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-emerald-700 mb-2">共有状況</h3>
                    <p className="text-sm text-emerald-700">
                      {selectedCase.handoffDelivery.shared ? "共有済み" : "未共有"}
                      {selectedCase.handoffDelivery.sharedAt && ` (${new Date(selectedCase.handoffDelivery.sharedAt).toLocaleString("ja-JP")})`}
                      {selectedCase.handoffDelivery.channel && ` via ${selectedCase.handoffDelivery.channel}`}
                    </p>
                  </div>
                )}

                {/* Primary response */}
                {selectedCase.primaryResponse && (
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-indigo-700 mb-2">主治医反応</h3>
                    <p className="text-sm text-indigo-700">{selectedCase.primaryResponse.status}</p>
                    {selectedCase.primaryResponse.comment && (
                      <p className="text-sm text-indigo-600">{selectedCase.primaryResponse.comment}</p>
                    )}
                  </div>
                )}

                {/* Manager clinical review */}
                {selectedCase.managerClinicalReview && (
                  <div className="bg-amber-50 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-amber-700 mb-2">事後レビュー</h3>
                    <p className="text-sm text-amber-700">
                      {selectedCase.managerClinicalReview.status === "no_issue" ? "問題なし"
                        : selectedCase.managerClinicalReview.status === "follow_up_needed" ? "要フォロー"
                          : "対応済み"}
                    </p>
                    {selectedCase.managerClinicalReview.note && (
                      <p className="text-sm text-amber-600">{selectedCase.managerClinicalReview.note}</p>
                    )}
                  </div>
                )}

                {/* Audit logs */}
                {selectedCase.auditLogs.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-2">監査ログ</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {selectedCase.auditLogs.map((log, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="text-gray-400 whitespace-nowrap">
                            {new Date(log.at).toLocaleTimeString("ja-JP")}
                          </span>
                          <span className="text-gray-500">[{log.actorType}]</span>
                          <span className="text-gray-700">{log.summary}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <h3 className="text-sm font-bold text-gray-700">操作</h3>

                  {/* Mark as shared */}
                  {selectedCase.primaryHandoff && !selectedCase.handoffDelivery?.shared && (
                    <button
                      onClick={handleMarkShared}
                      disabled={shareSubmitting}
                      className="w-full py-2 text-sm bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50"
                    >
                      {shareSubmitting ? "処理中..." : "Handoff を共有済みにする"}
                    </button>
                  )}

                  {/* Record response */}
                  {selectedCase.handoffDelivery?.shared && !selectedCase.primaryResponse && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">主治医反応を記録:</p>
                      <div className="flex gap-2">
                        {(["accepted", "held", "declined", "already_handled"] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => setResponseStatus(s)}
                            className={`text-xs px-2 py-1 rounded-full ${
                              responseStatus === s ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {s === "accepted" ? "了承" : s === "held" ? "保留" : s === "declined" ? "不要" : "既対応"}
                          </button>
                        ))}
                      </div>
                      <input
                        value={responseComment}
                        onChange={(e) => setResponseComment(e.target.value)}
                        placeholder="コメント（任意）"
                        className="w-full text-sm border border-gray-200 rounded-lg p-2"
                      />
                      <button
                        onClick={handleRecordResponse}
                        disabled={responseSubmitting}
                        className="w-full py-2 text-sm bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50"
                      >
                        {responseSubmitting ? "記録中..." : "反応を記録"}
                      </button>
                    </div>
                  )}

                  {/* Clinical review */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">事後レビュー:</p>
                    <div className="flex gap-2">
                      {(["no_issue", "follow_up_needed", "handled"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setReviewStatus(s)}
                          className={`text-xs px-3 py-1.5 rounded-full ${
                            reviewStatus === s ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {s === "no_issue" ? "問題なし" : s === "follow_up_needed" ? "要フォロー" : "対応済み"}
                        </button>
                      ))}
                    </div>
                    <input
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      placeholder="メモ（任意）"
                      className="w-full text-sm border border-gray-200 rounded-lg p-2"
                    />
                    <button
                      onClick={handleClinicalReview}
                      disabled={reviewSubmitting}
                      className="w-full py-2 text-sm bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50"
                    >
                      {reviewSubmitting ? "記録中..." : "事後レビューを記録"}
                    </button>
                  </div>

                  {/* Close case */}
                  {selectedCase.status !== "closed" && (
                    <button
                      onClick={handleCloseCase}
                      className="w-full py-2 text-sm bg-gray-400 text-white rounded-xl hover:bg-gray-500"
                    >
                      ケースをクローズ
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                ケースを選択してください
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
