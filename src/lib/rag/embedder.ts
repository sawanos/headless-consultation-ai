import { TextChunk, EmbeddedChunk } from "@/types/rag";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIM = 1536;
const BATCH_SIZE = 20;

function zeroVector(): number[] {
  return new Array(EMBEDDING_DIM).fill(0);
}

async function callEmbeddingAPI(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log("[RAG] No API key, returning zero vectors");
    return texts.map(() => zeroVector());
  }

  try {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: texts,
      }),
    });

    if (!response.ok) {
      console.error("[RAG] Embedding API error:", response.status);
      return texts.map(() => zeroVector());
    }

    const data = await response.json();
    return data.data
      .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
      .map((d: { embedding: number[] }) => d.embedding);
  } catch (error) {
    console.error("[RAG] Embedding error:", error);
    return texts.map(() => zeroVector());
  }
}

export async function embedChunks(chunks: TextChunk[]): Promise<EmbeddedChunk[]> {
  const results: EmbeddedChunk[] = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const texts = batch.map((c) => c.text);
    const embeddings = await callEmbeddingAPI(texts);

    for (let j = 0; j < batch.length; j++) {
      results.push({
        ...batch[j],
        embedding: embeddings[j],
      });
    }
  }

  return results;
}

export async function embedQuery(text: string): Promise<number[]> {
  const embeddings = await callEmbeddingAPI([text]);
  return embeddings[0];
}
