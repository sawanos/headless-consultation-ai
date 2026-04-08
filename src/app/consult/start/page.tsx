"use client";

import { useRouter } from "next/navigation";
import { useConsultStore } from "@/lib/store";
import { concernCategories } from "@/lib/categories";
import CategoryCard from "@/components/CategoryCard";
import EmergencyBypassCard from "@/components/intake/EmergencyBypassCard";
import { ConcernCategory } from "@/types/consult";

export default function StartPage() {
  const router = useRouter();
  const setCategory = useConsultStore((s) => s.setCategory);
  const setEmergencyBypassed = useConsultStore((s) => s.setEmergencyBypassed);
  const startConsult = useConsultStore((s) => s.startConsult);

  const handleSelect = (id: string) => {
    setCategory(id as ConcernCategory);
    router.push("/consult/quick-guide");
  };

  const handleEmergencyBypass = () => {
    startConsult();
    setEmergencyBypassed(true);
    setCategory("unknown_worry" as ConcernCategory);
    router.push("/consult/assessment");
  };

  return (
    <div className="px-4 py-8 pb-24">
      <div className="mb-6">
        <EmergencyBypassCard onBypass={handleEmergencyBypass} />
      </div>

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
