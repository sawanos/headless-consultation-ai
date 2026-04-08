"use client";

import type { ConsultationCaseV6 } from "@/types/consult";
import PriorityBadge from "@/components/PriorityBadge";
import { concernCategories } from "@/lib/categories";

type ReviewQueueTableProps = {
  cases: ConsultationCaseV6[];
  onSelect: (caseId: string) => void;
};

export default function ReviewQueueTable({ cases, onSelect }: ReviewQueueTableProps) {
  if (cases.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg">レビュー待ちのケースはありません</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-500">受付時刻</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">症状</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">優先度</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">症候群</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">不足情報</th>
            <th className="text-left py-3 px-4 font-medium text-gray-500">状態</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => {
            const cat = concernCategories.find((cc) => cc.id === c.category);
            const time = new Date(c.createdAt).toLocaleString("ja-JP", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <tr
                key={c.id}
                onClick={() => onSelect(c.id)}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="py-3 px-4 text-gray-600">{time}</td>
                <td className="py-3 px-4 font-medium text-gray-800">
                  {cat?.label || c.category}
                </td>
                <td className="py-3 px-4">
                  {c.triage && <PriorityBadge priority={c.triage.priority} size="sm" />}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {c.triage?.syndrome || "-"}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {c.triage?.missingFields.length || 0}件
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                    {c.status === "clinician_reviewing" ? "レビュー中" : "待機中"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
