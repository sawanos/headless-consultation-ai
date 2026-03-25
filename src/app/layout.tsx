import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "からだの相談サポート",
  description: "身体の気になる変化を、かんたんに医師へ相談できるサポートツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <div className="min-h-screen max-w-lg mx-auto">{children}</div>
      </body>
    </html>
  );
}
