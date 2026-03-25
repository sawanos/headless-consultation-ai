"use client";

import { useRouter } from "next/navigation";
import { useConsultStore } from "@/lib/store";
import { assessRisk } from "@/lib/risk-engine";
import PriorityBadge from "@/components/PriorityBadge";
import ActionList from "@/components/ActionList";
import StickyFooter from "@/components/StickyFooter";
import { useEffect } from "react";

export default function AssessmentPage() {
  const router = useRouter();
  const category = useConsultStore((s) => s.category);
  const answers = useConsultStore((s) => s.answers);
  const assessment = useConsultStore((s) => s.assessment);
  const setAssessment = useConsultStore((s) => s.setAssessment);

  useEffect(() => {
    if (!category || answers.length === 0) {
      router.replace("/consult/start");
      return;
    }
    if (!assessment) {
      const result = assessRisk(category, answers);
      setAssessment(result);
    }
  }, [category, answers, assessment, setAssessment, router]);

  if (!assessment) return null;

  const targetLabel =
    assessment.target === "cardiology"
      ? "循環器科"
      : assessment.target === "internal"
      ? "内科"
      : "主治医（かかりつけ医）";

  return (
    <div className="px-4 py-8 pb-32">
      <div className="text-center mb-8">
        <PriorityBadge priority={assessment.priority} />
        <p className="text-lg text-gray-600 mt-4 leading-relaxed">
          {assessment.reason}
        </p>
      </div>

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
          相談文をつくる
        </button>
      </StickyFooter>
    </div>
  );
}
