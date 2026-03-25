"use client";

import { useRouter } from "next/navigation";
import { useConsultStore } from "@/lib/store";
import { concernCategories } from "@/lib/categories";
import CategoryCard from "@/components/CategoryCard";
import { ConcernCategory } from "@/types/consult";

export default function StartPage() {
  const router = useRouter();
  const setCategory = useConsultStore((s) => s.setCategory);

  const handleSelect = (id: string) => {
    setCategory(id as ConcernCategory);
    router.push("/consult/quick-guide");
  };

  return (
    <div className="px-4 py-8 pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          どんなことが気になりますか？
        </h1>
        <p className="text-base text-gray-500">
          一番近いものを選んでください。わからなくてもOKです。
        </p>
      </div>

      <div className="space-y-3">
        {concernCategories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  );
}
