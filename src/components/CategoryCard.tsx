"use client";

import { CategoryDefinition } from "@/types/consult";

type Props = {
  category: CategoryDefinition;
  onSelect: (id: string) => void;
};

export default function CategoryCard({ category, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(category.id)}
      className="w-full p-6 bg-white rounded-2xl shadow-sm border-2 border-gray-100 hover:border-blue-400 hover:shadow-md transition-all text-left active:scale-[0.98]"
    >
      <p className="text-2xl font-bold text-gray-800 mb-2">{category.label}</p>
      <p className="text-base text-gray-500">{category.description}</p>
    </button>
  );
}
