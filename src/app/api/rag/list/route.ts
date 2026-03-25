import { NextResponse } from "next/server";
import { vectorStore } from "@/lib/rag/vector-store";

export async function GET() {
  const documents = vectorStore.getDocuments();
  return NextResponse.json({ documents });
}
