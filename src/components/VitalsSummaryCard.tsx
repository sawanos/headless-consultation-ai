"use client";

import { VitalSigns } from "@/types/consult";
import VitalStatusBadge from "./vitals/VitalStatusBadge";
import { VITAL_RANGES } from "./vitals/vitalRanges";

type Props = {
  vitals: VitalSigns;
};

export default function VitalsSummaryCard({ vitals }: Props) {
  const entries = Object.entries(vitals) as [keyof VitalSigns, VitalSigns[keyof VitalSigns]][];
  const measured = entries.filter(([, r]) => r.inputMode !== "not_measured" && r.value !== null);

  if (measured.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-700 mb-3">バイタルサイン</h3>
      <div className="space-y-2">
        {measured.map(([key, reading]) => {
          const range = VITAL_RANGES[key];
          if (!range) return null;
          return (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {range.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-gray-800">
                  {reading.value} {range.unit}
                </span>
                <VitalStatusBadge status={reading.status} size="sm" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
