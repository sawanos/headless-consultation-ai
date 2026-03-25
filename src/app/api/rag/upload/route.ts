import { NextRequest, NextResponse } from "next/server";
import { ingestPdf } from "@/lib/rag";
import { vectorStore } from "@/lib/rag/vector-store";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DOCUMENTS = 10;

export async function POST(request: NextRequest) {
  try {
    if (vectorStore.getDocumentCount() >= MAX_DOCUMENTS) {
      return NextResponse.json(
        { error: "max_documents", message: "最大10件まで登録できます" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "invalid_format", message: "ファイルが選択されていません" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "invalid_format", message: "PDFファイルのみ対応しています" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "too_large", message: "ファイルサイズは10MB以下にしてください" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const document = await ingestPdf(buffer, file.name);

    return NextResponse.json({
      document,
      message: `${file.name} を登録しました（${document.chunkCount}チャンク）`,
    });
  } catch (error) {
    console.error("[RAG] Upload error:", error);
    return NextResponse.json(
      { error: "parse_failed", message: "PDFの処理に失敗しました" },
      { status: 400 }
    );
  }
}
