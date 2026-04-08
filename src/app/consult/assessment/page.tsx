"use client";

import { useRouter } from "next/navigation";
import { useConsultStore } from "@/lib/store";
import { assessRisk } from "@/lib/risk-engine";
import PriorityBadge from "@/components/PriorityBadge";
import ActionList from "@/components/ActionList";
import StickyFooter from "@/components/StickyFooter";
import VitalStatusBadge from "@/components/vitals/VitalStatusBadge";
import TriageResultCard from "@/components/intake/TriageResultCard";
import { useEffect } from "react";

export default function AssessmentPage() {
  const router = useRouter();
  const category = useConsultStore((s) => s.category);
  const answers = useConsultStore((s) => s.answers);
  const assessment = useConsultStore((s) => s.assessment);
  const setAssessment = useConsultStore((s) => s.setAssessment);
  const vitalSigns = useConsultStore((s) => s.vitalSigns);
  const freeTextInput = useConsultStore((s) => s.freeTextInput);
  const triageDecision = useConsultStore((s) => s.triageDecision);
  const frontlineGuidance = useConsultStore((s) => s.frontlineGuidance);
  const emergencyBypassed = useConsultStore((s) => s.emergencyBypassed);

  useEffect(() => {
    if (!category) {
      router.replace("/consult/start");
      return;
    }
    // Emergency bypass: skip assessment, show emergency card
    if (emergencyBypassed) {
      return;
    }
    if (answers.length === 0) {
      router.replace("/consult/start");
      return;
    }
    if (!assessment) {
      const result = assessRisk(
        category,
        answers,
        vitalSigns ?? undefined,
        freeTextInput ?? undefined
      );
      setAssessment(result);
    }
  }, [category, answers, assessment, setAssessment, vitalSigns, freeTextInput, router, emergencyBypassed]);

  // Emergency bypass view
  if (emergencyBypassed) {
    return (
      <div className="px-4 py-8 pb-32">
        <div className="bg-red-100 border-2 border-red-400 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl text-white font-bold">!</span>
          </div>
          <h1 className="text-2xl font-bold text-red-800">緊急対応</h1>
          <p className="text-lg text-red-700 leading-relaxed">
            すぐに通常救急導線（119番・主治医直接連絡）を検討してください
          </p>
          <div className="bg-white/60 rounded-xl p-4">
            <ul className="text-left text-sm text-red-700 space-y-2">
              <li>- 安全確保（転倒・転落防止、気道確保）</li>
              <li>- 救急車要請を検討する</li>
              <li>- 主治医へ即連絡する</li>
            </ul>
          </div>
          <p className="text-xs text-red-500">
            これは医療診断ではありません。直ちに救急対応を優先してください。
          </p>
        </div>

        <StickyFooter>
          <button
            onClick={() => router.push("/")}
            className="w-full py-4 bg-gray-500 text-white text-xl font-bold rounded-2xl hover:bg-gray-600 active:scale-[0.98] transition-all"
          >
            トップに戻る
          </button>
        </StickyFooter>
      </div>
    );
  }

  if (!assessment) return null;

  // 3分岐表示: triageDecision があればそちらを優先表示
  const bucket = triageDecision?.bucket;

  // Emergency bypass from triage
  if (bucket === "emergency_bypass") {
    return (
      <div className="px-4 py-8 pb-32">
        {triageDecision && frontlineGuidance && (
          <TriageResultCard triage={triageDecision} guidance={frontlineGuidance} />
        )}

        <StickyFooter>
          <button
            onClick={() => router.push("/")}
            className="w-full py-4 bg-gray-500 text-white text-xl font-bold rounded-2xl hover:bg-gray-600 active:scale-[0.98] transition-all"
          >
            トップに戻る
          </button>
        </StickyFooter>
      </div>
    );
  }

  const targetLabel =
    assessment.target === "cardiology"
      ? "循環器科"
      : assessment.target === "internal"
      ? "内科"
      : "主治医（かかりつけ医）";

  // バイタル異常を収集
  const vitalAlerts: { label: string; value: string; status: "caution" | "abnormal" }[] = [];
  if (vitalSigns) {
    const labels: Record<string, string> = {
      temperature: "体温",
      spo2: "SpO2",
      pulse: "脈拍",
      bloodPressure: "血圧",
      respiratoryRate: "呼吸数",
    };
    for (const [key, reading] of Object.entries(vitalSigns)) {
      if (reading.status === "abnormal" || reading.status === "caution") {
        vitalAlerts.push({
          label: labels[key] || key,
          value: reading.value || "",
          status: reading.status,
        });
      }
    }
  }

  return (
    <div className="px-4 py-8 pb-32">
      {/* Triage result card if available */}
      {triageDecision && frontlineGuidance && (
        <div className="mb-6">
          <TriageResultCard triage={triageDecision} guidance={frontlineGuidance} />
        </div>
      )}

      <div className="text-center mb-8">
        <PriorityBadge priority={assessment.priority} />
        <p className="text-lg text-gray-600 mt-4 leading-relaxed">
          {assessment.reason}
        </p>
      </div>

      {vitalAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <h3 className="text-sm font-bold text-amber-700 mb-2">バイタル異常値</h3>
          <div className="space-y-1">
            {vitalAlerts.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <VitalStatusBadge status={a.status} size="sm" />
                <span className="text-sm text-gray-700">
                  {a.label}: {a.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <ActionList actions={assessment.actions} />

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-700 mb-2">相談先</h3>
          <p className="text-xl text-blue-600 font-medium">{targetLabel}</p>
        </div>

        {assessment.oneQuestion && (
          <div className="bg-amber-50 rounded-2xl p-6">
            <h3 className="text-base font-bold text-amber-700 mb-2">
              追加で1つだけ確認
            </h3>
            <p className="text-lg text-amber-800">{assessment.oneQuestion}</p>
          </div>
        )}

        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-sm text-gray-500">{assessment.safetyNote}</p>
        </div>
      </div>

      <StickyFooter>
        <button
          onClick={() => router.push("/consult/output")}
          className="w-full py-4 bg-blue-500 text-white text-xl font-bold rounded-2xl hover:bg-blue-600 active:scale-[0.98] transition-all"
        >
          {bucket === "clinician_review" ? "現場向け情報と相談文を見る" : "相談文をつくる"}
        </button>
      </StickyFooter>
    </div>
  );
}
