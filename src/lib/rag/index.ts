import { RagDocument } from "@/types/rag";
import { chunkText } from "./chunker";
import { embedChunks } from "./embedder";
import { vectorStore } from "./vector-store";
import { retrieve } from "./retriever";
import { v4 as uuidv4 } from "uuid";

const MAX_RAG_CONTEXT_CHARS = 500;

export async function ingestPdf(
  buffer: Buffer,
  filename: string
): Promise<RagDocument> {
  // pdf-parse はサーバーサイド限定
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>;
  const parsed = await pdfParse(buffer);
  const text = parsed.text;

  const docId = uuidv4();
  const chunks = chunkText(text, docId);

  console.log(`[RAG] Parsed "${filename}": ${text.length} chars → ${chunks.length} chunks`);

  const embeddedChunks = await embedChunks(chunks);
  vectorStore.add(embeddedChunks);

  const doc: RagDocument = {
    id: docId,
    filename,
    uploadedAt: new Date().toISOString(),
    chunkCount: chunks.length,
    sizeBytes: buffer.length,
  };

  vectorStore.addDocument(doc);
  console.log(`[RAG] Ingested "${filename}" (${doc.chunkCount} chunks)`);

  return doc;
}

export async function retrieveForConsult(
  categoryLabel: string,
  answers: { question: string; answer: string | null }[]
): Promise<string> {
  // 検索クエリ構築: カテゴリ + 回答を連結
  const answerTexts = answers
    .filter((a) => a.answer)
    .map((a) => `${a.question}: ${a.answer}`)
    .join(" ");

  const query = `${categoryLabel} ${answerTexts}`.trim();

  if (!query) return "";

  const results = await retrieve(query, 3, 0.3);

  if (results.length === 0) {
    console.log("[RAG] No relevant chunks found");
    return "";
  }

  // コンテキスト文字列を組み立て（最大500文字）
  let context = "";
  for (const r of results) {
    const entry = `[スコア${r.score.toFixed(2)}] ${r.chunk.text}\n\n`;
    if (context.length + entry.length > MAX_RAG_CONTEXT_CHARS) {
      // 残り文字数分だけ追加
      const remaining = MAX_RAG_CONTEXT_CHARS - context.length;
      if (remaining > 50) {
        context += entry.slice(0, remaining) + "...";
      }
      break;
    }
    context += entry;
  }

  return context.trim();
}
