"use client";

import { Priority } from "@/types/consult";

type Props = {
  priority: Priority;
  size?: "sm" | "lg";
};

const config: Record<Priority, { bg: string; text: string; label: string }> = {
  RED: { bg: "bg-red-500", text: "text-white", label: "緊急" },
  ORANGE: { bg: "bg-orange-400", text: "text-white", label: "注意" },
  YELLOW: { bg: "bg-yellow-300", text: "text-yellow-900", label: "経過観察" },
  BLUE: { bg: "bg-blue-400", text: "text-white", label: "低リスク" },
};

export default function PriorityBadge({ priority, size = "lg" }: Props) {
  const c = config[priority];
  const sizeClass = size === "lg" ? "px-6 py-3 text-2xl" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-block rounded-full font-bold ${c.bg} ${c.text} ${sizeClass}`}
    >
      {c.label}
    </span>
  );
}
