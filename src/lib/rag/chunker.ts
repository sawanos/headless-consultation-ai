import { TextChunk } from "@/types/rag";

const TARGET_CHUNK_SIZE = 400;
const MIN_CHUNK_SIZE = 50;
const OVERLAP_SIZE = 50;

export function chunkText(text: string, docId: string): TextChunk[] {
  // 段落で分割
  const paragraphs = text.split(/\n\n+/);
  const rawChunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (current.length + trimmed.length + 1 <= TARGET_CHUNK_SIZE) {
      current += (current ? "\n" : "") + trimmed;
    } else {
      if (current.length >= MIN_CHUNK_SIZE) {
        rawChunks.push(current);
      }
      // 段落自体が長すぎる場合は文単位で分割
      if (trimmed.length > TARGET_CHUNK_SIZE) {
        const sentences = trimmed.split(/(?<=[。．！？\n])/);
        let sentenceBuffer = "";
        for (const s of sentences) {
          if (sentenceBuffer.length + s.length <= TARGET_CHUNK_SIZE) {
            sentenceBuffer += s;
          } else {
            if (sentenceBuffer.length >= MIN_CHUNK_SIZE) {
              rawChunks.push(sentenceBuffer);
            }
            sentenceBuffer = s;
          }
        }
        current = sentenceBuffer;
      } else {
        current = trimmed;
      }
    }
  }

  if (current.length >= MIN_CHUNK_SIZE) {
    rawChunks.push(current);
  } else if (current.length > 0 && rawChunks.length > 0) {
    // 短すぎるものは前のチャンクにマージ
    rawChunks[rawChunks.length - 1] += "\n" + current;
  } else if (current.length > 0) {
    rawChunks.push(current);
  }

  // オーバーラップ付きでTextChunkに変換
  const chunks: TextChunk[] = rawChunks.map((text, index) => {
    let chunkText = text;
    if (index > 0 && rawChunks[index - 1].length >= OVERLAP_SIZE) {
      const overlap = rawChunks[index - 1].slice(-OVERLAP_SIZE);
      chunkText = overlap + chunkText;
    }

    return {
      id: `${docId}-chunk-${index}`,
      docId,
      text: chunkText,
    };
  });

  return chunks;
}
