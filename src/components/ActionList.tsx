"use client";

type Props = {
  actions: string[];
};

export default function ActionList({ actions }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-700 mb-4">今やること</h3>
      <ul className="space-y-3">
        {actions.map((action, i) => (
          <li
            key={i}
            className="flex items-start gap-3 text-lg text-gray-800"
          >
            <span className="mt-1 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
              {i + 1}
            </span>
            {action}
          </li>
        ))}
      </ul>
    </div>
  );
}
