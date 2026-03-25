"use client";

type Props = {
  children: React.ReactNode;
};

export default function StickyFooter({ children }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
      <div className="max-w-lg mx-auto">{children}</div>
    </div>
  );
}
