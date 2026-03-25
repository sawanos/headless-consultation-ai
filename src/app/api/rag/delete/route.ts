import { NextRequest, NextResponse } from "next/server";
import { vectorStore } from "@/lib/rag/vector-store";
import { z } from "zod";

const DeleteSchema = z.object({
  docId: z.string(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = DeleteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  vectorStore.removeDocument(parsed.data.docId);
  console.log(`[RAG] Deleted document: ${parsed.data.docId}`);

  return NextResponse.json({ success: true });
}
