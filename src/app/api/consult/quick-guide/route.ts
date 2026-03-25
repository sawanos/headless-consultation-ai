import { NextRequest, NextResponse } from "next/server";
import { getCategoryById } from "@/lib/categories";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { category } = body;

  if (!category) {
    return NextResponse.json({ error: "category is required" }, { status: 400 });
  }

  const cat = getCategoryById(category);
  if (!cat) {
    return NextResponse.json({ error: "unknown category" }, { status: 400 });
  }

  return NextResponse.json(cat.quickGuide);
}
