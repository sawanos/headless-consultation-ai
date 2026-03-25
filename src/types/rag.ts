export type RagDocument = {
  id: string;
  filename: string;
  uploadedAt: string;
  chunkCount: number;
  sizeBytes: number;
};

export type TextChunk = {
  id: string;
  docId: string;
  text: string;
  pageNumber?: number;
};

export type EmbeddedChunk = TextChunk & {
  embedding: number[];
};

export type RetrievalResult = {
  chunk: TextChunk;
  score: number;
};
