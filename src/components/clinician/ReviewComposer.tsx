"use client";

import { useState } from "react";
import type { ConsultationCaseV6, ClinicianDispositionV6, PrimaryHandoffPackage, ShareChannel, NotificationPolicy } from "@/types/consult";
import { getTemplatesByCluster, type ClinicianTemplate } from "@/lib/templates";
import EscalationBadge from "./EscalationBadge";

type ReviewComposerProps = {
  caseData: ConsultationCaseV6;
  onSubmit: (data: {
    disposition: ClinicianDispositionV6;
    clinicianComment: string;
    primaryHandoffOverride: PrimaryHandoffPackage;
  }) => void;
  submitting: boolean;
};

const DISPOSITION_OPTIONS: { value: ClinicianDispositionV6; label: string; description: string }[] = [
  { value: "send_to_primary_handoff", label: "主治医へ通知", description: "主治医へハンドオフパッケージを送信します" },
  { value: "ask_frontline_more", label: "現場へ追加情報依頼", description: "現場に追加確認を依頼します" },
  { value: "reroute_specialty", label: "別専門科へ転送", description: "別の専門科へ転送します" },
  { value: "emergency_bypass", label: "救急導線へ切替", description: "通常救急導線に切り替えます" },
];

const CHANNEL_OPTIONS: { value: ShareChannel; label: string }[] = [
  { value: "copy_text", label: "コピー共有" },
  { value: "email_placeholder", label: "メール" },
  { value: "fax_placeholder", label: "FAX" },
  { value: "manual_other", label: "手動・その他" },
];

export default function ReviewComposer({ caseData, onSubmit, submitting }: ReviewComposerProps) {
  const templates = caseData.triage
    ? getTemplatesByCluster(caseData.triage.syndrome)
    : getTemplatesByCluster("unknown");

  const baseHandoff: PrimaryHandoffPackage = caseData.primaryHandoff || {
    headline: "",
    observationSummary: [],
    vitalSummary: [],
    concernPoints: [],
    generalMedicalInfo: [],
    recommendedEscalationLevel: "observe",
    authoredBy: "remote_physician",
    recommendedChannel: "copy_text",
    shareText: "",
    notificationPolicy: {
      immediateEmailEligible: false,
      includeInDailyDigest: true,
      manualShareRecommended: false,
    },
  };

  const [disposition, setDisposition] = useState<ClinicianDispositionV6>("send_to_primary_handoff");
  const [clinicianComment, setClinicianComment] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ClinicianTemplate | null>(templates[0] || null);
  const [headline, setHeadline] = useState(baseHandoff.headline);
  const [concernPoints, setConcernPoints] = useState(baseHandoff.concernPoints.join("\n"));
  const [generalMedicalInfo, setGeneralMedicalInfo] = useState(baseHandoff.generalMedicalInfo.join("\n"));
  const [escalationLevel, setEscalationLevel] = useState(baseHandoff.recommendedEscalationLevel);
  const [shareText, setShareText] = useState(baseHandoff.shareText);
  const [recommendedChannel, setRecommendedChannel] = useState<ShareChannel>(baseHandoff.recommendedChannel);
  const [notificationPolicy, setNotificationPolicy] = useState<NotificationPolicy>(baseHandoff.notificationPolicy);

  const handleTemplateSelect = (template: ClinicianTemplate) => {
    setSelectedTemplate(template);
    setClinicianComment(template.commentPrefix + "\n");
    setGeneralMedicalInfo(template.generalMedicalInfoPrefix + "\n" + baseHandoff.generalMedicalInfo.join("\n"));
  };

  const handleSubmit = () => {
    const override: PrimaryHandoffPackage = {
      ...baseHandoff,
      headline,
      concernPoints: concernPoints.split("\n").filter((s) => s.trim()),
      generalMedicalInfo: generalMedicalInfo.split("\n").filter((s) => s.trim()),
      recommendedEscalationLevel: escalationLevel,
      authoredBy: "remote_physician",
      recommendedChannel,
      shareText,
      notificationPolicy,
    };

    onSubmit({
      disposition,
      clinicianComment,
      primaryHandoffOverride: override,
    });
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-bold text-gray-800">レビュー操作</h3>

      {/* Disposition */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">アクション選択</label>
        <div className="space-y-2">
          {DISPOSITION_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                disposition === opt.value
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="disposition"
                value={opt.value}
                checked={disposition === opt.value}
                onChange={() => setDisposition(opt.value)}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">{opt.label}</p>
                <p className="text-xs text-gray-500">{opt.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Template selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">テンプレート</label>
        <div className="flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => handleTemplateSelect(t)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                selectedTemplate?.id === t.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">コメント</label>
        <textarea
          value={clinicianComment}
          onChange={(e) => setClinicianComment(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-blue-400 focus:outline-none"
          placeholder="レビューコメントを入力..."
        />
      </div>

      {/* Primary Handoff Override */}
      <div className="space-y-3 bg-green-50 rounded-xl p-4">
        <h4 className="text-sm font-bold text-green-700">主治医向けハンドオフ編集</h4>

        <div>
          <label className="text-xs text-gray-600">要約</label>
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full rounded-lg border border-gray-200 p-2 text-sm mt-1"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600">懸念点（改行区切り）</label>
          <textarea
            value={concernPoints}
            onChange={(e) => setConcernPoints(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-200 p-2 text-sm mt-1"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600">一般的医学情報（改行区切り）</label>
          <textarea
            value={generalMedicalInfo}
            onChange={(e) => setGeneralMedicalInfo(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-200 p-2 text-sm mt-1"
          />
        </div>

        <div>
          <label className="text-xs text-gray-600">共有テキスト</label>
          <textarea
            value={shareText}
            onChange={(e) => setShareText(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-200 p-2 text-sm mt-1"
            placeholder="主治医に共有するテキストを入力..."
          />
        </div>

        <div>
          <label className="text-xs text-gray-600">推奨共有チャネル</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {CHANNEL_OPTIONS.map((ch) => (
              <button
                key={ch.value}
                onClick={() => setRecommendedChannel(ch.value)}
                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                  recommendedChannel === ch.value
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-600">通知ポリシー</label>
          <div className="space-y-1 mt-1">
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={notificationPolicy.immediateEmailEligible}
                onChange={(e) =>
                  setNotificationPolicy((prev) => ({
                    ...prev,
                    immediateEmailEligible: e.target.checked,
                  }))
                }
              />
              即時メール送信対象
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={notificationPolicy.includeInDailyDigest}
                onChange={(e) =>
                  setNotificationPolicy((prev) => ({
                    ...prev,
                    includeInDailyDigest: e.target.checked,
                  }))
                }
              />
              日次ダイジェストに含める
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-700">
              <input
                type="checkbox"
                checked={notificationPolicy.manualShareRecommended}
                onChange={(e) =>
                  setNotificationPolicy((prev) => ({
                    ...prev,
                    manualShareRecommended: e.target.checked,
                  }))
                }
              />
              手動共有推奨
            </label>
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-600">連絡優先度</label>
          <div className="flex gap-2 mt-1">
            {(["emergency", "same_day", "within_24h", "observe"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setEscalationLevel(lvl)}
                className={`transition-opacity ${escalationLevel === lvl ? "opacity-100" : "opacity-40"}`}
              >
                <EscalationBadge level={lvl} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting || !clinicianComment.trim()}
        className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {submitting ? "保存中..." : "保存して送信"}
      </button>
    </div>
  );
}
