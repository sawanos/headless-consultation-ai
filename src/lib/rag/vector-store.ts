import { EmbeddedChunk, RagDocument } from "@/types/rag";

class VectorStore {
  private chunks: Map<string, EmbeddedChunk> = new Map();
  private documents: Map<string, RagDocument> = new Map();

  add(chunks: EmbeddedChunk[]): void {
    for (const chunk of chunks) {
      this.chunks.set(chunk.id, chunk);
    }
  }

  remove(docId: string): void {
    for (const [id, chunk] of this.chunks) {
      if (chunk.docId === docId) {
        this.chunks.delete(id);
      }
    }
  }

  getAll(): EmbeddedChunk[] {
    return Array.from(this.chunks.values());
  }

  getDocuments(): RagDocument[] {
    return Array.from(this.documents.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  addDocument(doc: RagDocument): void {
    this.documents.set(doc.id, doc);
  }

  removeDocument(docId: string): void {
    this.documents.delete(docId);
    this.remove(docId);
  }

  getDocumentCount(): number {
    return this.documents.size;
  }
}

// グローバルシングルトン（Next.js hot reload対策）
const globalForVectorStore = globalThis as unknown as {
  vectorStore: VectorStore | undefined;
};

export const vectorStore =
  globalForVectorStore.vectorStore ?? new VectorStore();

globalForVectorStore.vectorStore = vectorStore;
