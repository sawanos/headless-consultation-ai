"use client";

import { QuickGuideSnapshot } from "@/types/consult";

type Props = {
  guide: QuickGuideSnapshot;
  categoryLabel: string;
};

export default function QuickGuideCard({ guide, categoryLabel }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-blue-800 mb-3">
          まず見てみること
        </h3>
        <ul className="space-y-2">
          {guide.checks.map((check, i) => (
            <li key={i} className="flex items-start gap-3 text-lg text-blue-700">
              <span className="mt-1 w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold shrink-0">
                {i + 1}
              </span>
              {check}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-red-50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-red-700 mb-3">
          すぐ共有を考えるサイン
        </h3>
        <ul className="space-y-2">
          {guide.redFlags.map((flag, i) => (
            <li key={i} className="flex items-start gap-3 text-lg text-red-600">
              <span className="mt-1 text-red-500 shrink-0">!</span>
              {flag}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-green-50 rounded-2xl p-6">
        <p className="text-lg text-green-700 font-medium">{guide.reassurance}</p>
      </div>
    </div>
  );
}
