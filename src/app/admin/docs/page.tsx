"use client";

import { useEffect, useState, useCallback } from "react";
import { RagDocument } from "@/types/rag";
import Link from "next/link";

export default function AdminDocsPage() {
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    try {
      const res = await fetch("/api/rag/list");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.[0];

    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/rag/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        form.reset();
        await fetchDocs();
      } else {
        setMessage(data.message || "アップロードに失敗しました");
      }
    } catch {
      setMessage("アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await fetch("/api/rag/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ docId }),
      });
      await fetchDocs();
    } catch {
      // ignore
    }
  };

  const hasApiKey = true; // サーバー側で判定するため、UIでは常にtrue扱い

  return (
    <div className="px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">PDF管理</h1>
        <div className="flex gap-3 text-sm">
          <Link
            href="/admin/cases"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            ケース一覧
          </Link>
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            トップへ
          </Link>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-xl p-4 mb-6">
        <p className="text-sm text-yellow-700 leading-relaxed">
          ガイドライン・プロトコル文書を登録できます。
          <br />
          <strong>個人情報・患者固有情報は含めないでください。</strong>
          <br />
          <span className="text-yellow-500">
            サーバー再起動でデータはリセットされます（PoC）。
          </span>
        </p>
      </div>

      <form onSubmit={handleUpload} className="mb-6">
        <div className="flex gap-3">
          <input
            type="file"
            accept=".pdf"
            className="flex-1 text-sm text-gray-500 file:mr-3 file:py-3 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-600 file:font-medium file:cursor-pointer hover:file:bg-blue-100"
          />
          <button
            type="submit"
            disabled={uploading}
            className="py-3 px-6 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                処理中
              </span>
            ) : (
              "アップロード"
            )}
          </button>
        </div>
      </form>

      {message && (
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-700">{message}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-400">登録済みの文書はありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-gray-800 truncate">
                    {doc.filename}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                    <span>
                      {new Date(doc.uploadedAt).toLocaleString("ja-JP")}
                    </span>
                    <span>{doc.chunkCount}チャンク</span>
                    <span>{(doc.sizeBytes / 1024).toFixed(0)}KB</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="ml-3 text-sm text-red-400 hover:text-red-600 font-medium shrink-0"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 text-center text-sm text-gray-400">
        登録済み: {documents.length}件 / 最大: 10件（PoC制限）
      </div>
    </div>
  );
}
