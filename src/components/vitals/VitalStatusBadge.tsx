"use client";
type Props = { status: "normal" | "caution" | "abnormal" | "unknown"; size?: "sm" | "md" };
const config = {
  normal: { bg: "bg-green-100", text: "text-green-700", label: "正常" },
  caution: { bg: "bg-orange-100", text: "text-orange-700", label: "注意" },
  abnormal: { bg: "bg-red-100", text: "text-red-700", label: "異常" },
  unknown: { bg: "bg-gray-100", text: "text-gray-500", label: "—" },
};
export default function VitalStatusBadge({ status, size = "md" }: Props) {
  const c = config[status];
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return <span className={`inline-block rounded-full font-bold ${c.bg} ${c.text} ${sizeClass}`}>{c.label}</span>;
}
