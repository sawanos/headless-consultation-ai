"use client";

import { useRouter } from "next/navigation";
import { useConsultStore } from "@/lib/store";
import { getCategoryById } from "@/lib/categories";
import QuickGuideCard from "@/components/QuickGuideCard";
import StickyFooter from "@/components/StickyFooter";
import { useEffect } from "react";

export default function QuickGuidePage() {
  const router = useRouter();
  const category = useConsultStore((s) => s.category);
  const setQuickGuide = useConsultStore((s) => s.setQuickGuide);

  const cat = category ? getCategoryById(category) : null;

  useEffect(() => {
    if (!cat) {
      router.replace("/consult/start");
    } else {
      setQuickGuide(cat.quickGuide);
    }
  }, [cat, router, setQuickGuide]);

  if (!cat) return null;

  return (
    <div className="px-4 py-8 pb-32">
      <div className="mb-6">
        <p className="text-sm text-blue-500 font-medium mb-1">
          「{cat.label}」を選びました
        </p>
        <h1 className="text-2xl font-bold text-gray-800">
          まず確認してみましょう
        </h1>
        <p className="text-base text-gray-500 mt-2">
          できる範囲でOKです。わからなければそのまま進めます。
        </p>
      </div>

      <QuickGuideCard guide={cat.quickGuide} categoryLabel={cat.label} />

      <StickyFooter>
        <button
          onClick={() => router.push("/consult/interview")}
          className="w-full py-4 bg-blue-500 text-white text-xl font-bold rounded-2xl hover:bg-blue-600 active:scale-[0.98] transition-all"
        >
          聞き取りへ進む
        </button>
      </StickyFooter>
    </div>
  );
}
