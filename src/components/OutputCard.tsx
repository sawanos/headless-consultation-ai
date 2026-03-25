"use client";

type Props = {
  title: string;
  content: string;
  variant?: "default" | "highlight";
};

export default function OutputCard({ title, content, variant = "default" }: Props) {
  const bgClass = variant === "highlight" ? "bg-blue-50 border-blue-200" : "bg-white border-gray-100";

  return (
    <div className={`rounded-2xl p-6 border-2 ${bgClass}`}>
      <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">{title}</h3>
      <p className="text-lg text-gray-800 whitespace-pre-wrap leading-relaxed">{content}</p>
    </div>
  );
}
