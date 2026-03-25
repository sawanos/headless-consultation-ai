import { RetrievalResult } from "@/types/rag";
import { embedQuery } from "./embedder";
import { vectorStore } from "./vector-store";

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;

  return dot / denom;
}

export async function retrieve(
  query: string,
  k: number = 3,
  minScore: number = 0.3
): Promise<RetrievalResult[]> {
  const allChunks = vectorStore.getAll();
  if (allChunks.length === 0) {
    console.log("[RAG] No chunks in store, skipping retrieval");
    return [];
  }

  const queryEmbedding = await embedQuery(query);

  // ゼロベクトルチェック（APIキー未設定時）
  const isZero = queryEmbedding.every((v) => v === 0);
  if (isZero) {
    console.log("[RAG] Zero vector query, skipping semantic search");
    return [];
  }

  const scored: RetrievalResult[] = allChunks.map((chunk) => ({
    chunk: {
      id: chunk.id,
      docId: chunk.docId,
      text: chunk.text,
      pageNumber: chunk.pageNumber,
    },
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  const filtered = scored
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  for (const r of filtered) {
    console.log(`[RAG] Hit score=${r.score.toFixed(3)}, chunk=${r.chunk.id}`);
  }

  return filtered;
}
