"use client";

type EmergencyBypassCardProps = {
  onBypass: () => void;
};

export default function EmergencyBypassCard({ onBypass }: EmergencyBypassCardProps) {
  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5">
      <p className="text-sm text-red-700 mb-3 font-medium">
        緊急だと思う場合はこちら
      </p>
      <button
        onClick={onBypass}
        className="w-full py-3 bg-red-600 text-white text-lg font-bold rounded-xl hover:bg-red-700 active:scale-[0.98] transition-all"
      >
        すぐに救急対応が必要
      </button>
      <p className="text-xs text-red-500 mt-2">
        AI判定を待たずに、通常救急導線（119番・主治医直接連絡）へ案内します
      </p>
    </div>
  );
}
