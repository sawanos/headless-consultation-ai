"use client";

import { useState } from "react";
import { VitalSigns, VitalReading } from "@/types/consult";
import VitalTabInput from "./VitalTabInput";
import { VITAL_KEYS_BY_CATEGORY } from "@/lib/vitalConfig";

function createEmptyReading(): VitalReading {
  return { value: null, inputMode: "tab", status: "unknown" };
}

export function createEmptyVitals(): VitalSigns {
  return {
    temperature: createEmptyReading(),
    spo2: createEmptyReading(),
    pulse: createEmptyReading(),
    bloodPressure: createEmptyReading(),
    respiratoryRate: createEmptyReading(),
  };
}

type Props = {
  vitals: VitalSigns;
  onChange: (vitals: VitalSigns) => void;
  categoryId?: string;
};

export default function VitalSignsPanel({ vitals, onChange, categoryId }: Props) {
  const [open, setOpen] = useState(false);

  const keys =
    categoryId && VITAL_KEYS_BY_CATEGORY[categoryId]
      ? VITAL_KEYS_BY_CATEGORY[categoryId]
      : (Object.keys(vitals) as (keyof VitalSigns)[]);

  const handleChange = (key: keyof VitalSigns, reading: VitalReading) => {
    onChange({ ...vitals, [key]: reading });
  };

  return (
    <div className="bg-gray-50 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 flex items-center justify-between text-left"
      >
        <span className="font-bold text-gray-700">バイタルサイン（任意）</span>
        <span className="text-gray-400 text-lg">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {keys.map((key) => (
            <VitalTabInput
              key={key}
              vitalKey={key}
              reading={vitals[key]}
              onChange={(r) => handleChange(key, r)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
