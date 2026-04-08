"use client";

type EscalationBadgeProps = {
  level: "emergency" | "same_day" | "within_24h" | "observe";
};

const config = {
  emergency: { label: "緊急", color: "bg-red-100 text-red-700" },
  same_day: { label: "当日中", color: "bg-orange-100 text-orange-700" },
  within_24h: { label: "24時間以内", color: "bg-yellow-100 text-yellow-700" },
  observe: { label: "経過観察", color: "bg-blue-100 text-blue-700" },
};

export default function EscalationBadge({ level }: EscalationBadgeProps) {
  const c = config[level];
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${c.color}`}>
      {c.label}
    </span>
  );
}
